import { fetchEventSource } from '@microsoft/fetch-event-source';
import { getLLMConfig, getEffectiveBaseUrl, getEffectiveModel } from './llm-config';
import { canMakeRequest, consumeRequest, getRemainingRequests } from './rate-limiter';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ChatStreamOptions {
  /**
   * 是否在 systemInstruction 末尾注入 Canvas 协议。
   * 仅 AIAssistant 等"双通道"场景应设为 true。
   * 默认 false：SmartReport / DataAnalysis / DataCompare 等纯 Markdown 输出场景不需要，
   * 避免诱导模型在非画布页面输出 canvas-directive 污染正文。
   */
  includeCanvasProtocol?: boolean;
}

const CANVAS_PROTOCOL = `

═══ CANVAS PROTOCOL（画布协议）═══

你的每次回答末尾必须追加一段 \`\`\`canvas-directive JSON 块，告诉前端如何动态编排右侧画布。

mode 取值：
- switch: 整体切换画布场景（保留 pinned blocks）
- append: 在画布尾部追加新 block，旧的保留
- update: 仅更新指定 block 的 data 字段（用于多轮深挖）
- focus:  把某 block 放大聚焦（如用户追问某细节）
- split:  从单栏切到左右双栏对比
- clear:  清空回 idle（仅用于纯概念问答）

智能编排原则：
1. 用户随便聊聊 → mode=clear，画布保持安静
2. 首次分析 → mode=switch + grid_2x2 多角度全景
3. 用户追问 → mode=update 在原 block 内深化，避免画布抖动
4. 用户切话题 → mode=switch，但保留 pinned 历史块在角落
5. 用户对比两个东西 → mode=split 双栏并排
6. 用户说"详细看这个" → mode=focus 把目标 block 聚焦放大

每个 block 必须包含 conversationAnchor 字段（留空字符串前端兜底）。

block 的 data 字段必须严格匹配该 template 的 schema（schema 见下方对照表）：

[StrategyBoard.data]
{ p0: Action[], p1: Action[], p2: Action[] }
Action = { id, title, owner, timeline, ice:{i,c,e}, impact, checklist?: ChecklistItem[] }

[AttributionWaterfall.data]
{ baseline: number, result: number, contributors: { name, delta, color }[] }

[DataHealth.data]
{ completeness, consistency, accuracy, uniqueness, timeliness: number,
  red_flags: string[], schema: { field, type, missing_pct, semantic }[] }

[FunnelDiagnosis.data]
{ stages: { name, value, drop_pct, is_critical?: boolean }[] }

[InsightCards.data]
{ cards: { id, title, description, severity:'info'|'warn'|'critical', metric_ref?, metric?, metric_label? }[] }
// 注：组件兼容 headline/detail 别名，但提示词输出请用 title/description 标准字段

[TrendDashboard.data]
{
  // 推荐主格式：
  chartData?: object[],         // 每行如 { date: '2024-01', gmv: 150, uv: 80 }
  lines?: { key: string, name: string, color?: string }[],  // key 必须与 chartData 字段名对齐
  xAxisKey?: string,            // chartData 中的 x 轴字段名，默认 'x'
  // 兼容备用格式：
  series?: { name: string, points: { x: any, y: number }[], color?: string }[],
  tableData?: object[]          // 可选：底部联动数据表
}

[CohortHeatmap.data]
{ rows: string[], cols: string[], matrix: number[][] }

[RfmQuadrant.data]
{ users: { id, r: number, f: number, m: number, segment: string }[] }

[CodeTerminal.data]
{ language: 'sql'|'python', code: string, runnable: boolean, expected_result?: string }

[ReportLongform.data]
{ markdown: string, toc?: { id, title, level }[] }

═══════════════════════════`;

export async function fetchChatStream(
  contents: ChatMessage[],
  systemInstructionText: string,
  onChunk: (text: string) => void,
  onError: (msg: string) => void,
  options: ChatStreamOptions = {}
) {
  // Rate limiting check
  if (!canMakeRequest()) {
    onError(`今日 AI 调用次数已用完（每日限额 50 次）。明天将自动重置，或在设置中配置自己的 API Key 解除限制。`);
    return;
  }
  consumeRequest();

  const { includeCanvasProtocol = false } = options;

  const cfg = getLLMConfig();
  const requestHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cfg.apiKey) requestHeaders['Authorization'] = `Bearer ${cfg.apiKey}`;
  requestHeaders['X-LLM-Provider'] = cfg.provider;
  requestHeaders['X-LLM-Model'] = getEffectiveModel(cfg);
  const baseUrl = getEffectiveBaseUrl(cfg);
  if (baseUrl) requestHeaders['X-LLM-Base-Url'] = baseUrl;
  if (cfg.temperature !== undefined) requestHeaders['X-LLM-Temperature'] = String(cfg.temperature);

  const finalSystemPrompt = includeCanvasProtocol
    ? systemInstructionText + CANVAS_PROTOCOL
    : systemInstructionText;

  try {
    await fetchEventSource('/api/chat', {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: finalSystemPrompt }] }
      }),
      async onopen(response) {
        if (!response.ok) {
          let errMessage = 'Internal Server Error';
          try { const errObj = await response.json(); errMessage = errObj.error || errMessage; } catch {}
          throw new Error(errMessage);
        }
      },
      onmessage(event) {
        if (event.data === '[DONE]') return;
        let data;
        try { data = JSON.parse(event.data); } catch { return; }
        if (data.type === 'token') onChunk(data.content);
        else if (data.type === 'error') throw new Error(data.error);
      },
      onerror(err) { throw err; }
    });
  } catch (err: any) {
    onError(err.message || 'Unknown error');
  }
}

/**
 * 带自动重试的 fetchChatStream
 * 网络错误或 5xx 错误时自动重试最多 2 次，间隔 2 秒
 */
export async function fetchChatStreamWithRetry(
  contents: ChatMessage[],
  systemInstructionText: string,
  onChunk: (text: string) => void,
  onError: (msg: string) => void,
  options: ChatStreamOptions = {},
  maxRetries: number = 2
) {
  let lastError = '';
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      // 等待 2 秒后重试
      await new Promise(r => setTimeout(r, 2000));
      onChunk(`\n\n⏳ 请求失败，正在第 ${attempt} 次重试...\n\n`);
    }

    let success = true;
    let errorMsg = '';

    await fetchChatStream(
      contents,
      systemInstructionText,
      onChunk,
      (msg) => {
        // 判断是否是可重试的错误（网络错误、服务不可用）
        const retryable = msg.includes('503') || msg.includes('暂不可用') ||
          msg.includes('timeout') || msg.includes('network') ||
          msg.includes('ECONNREFUSED') || msg.includes('稍后重试');
        
        if (retryable && attempt < maxRetries) {
          success = false;
          errorMsg = msg;
        } else {
          // 不可重试的错误（如 API Key 无效、次数用完），直接报错
          onError(msg);
          success = true; // 标记为"已处理"，不再重试
        }
      },
      options
    );

    if (success) return;
    lastError = errorMsg;
  }

  // 所有重试都失败
  onError(`${lastError}（已重试 ${maxRetries} 次仍失败）`);
}
