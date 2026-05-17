import { fetchEventSource } from '@microsoft/fetch-event-source';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export async function fetchChatStream(
  contents: ChatMessage[],
  systemInstructionText: string,
  onChunk: (text: string) => void,
  onError: (msg: string) => void
) {
  const apiKey = localStorage.getItem('gemini_api_key') || '';
  const requestHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) requestHeaders['Authorization'] = `Bearer ${apiKey}`;

  const canvasProtocol = `

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
{ cards: { id, headline, detail, severity:'info'|'warn'|'critical', metric_ref? }[] }

[TrendDashboard.data]
{ series: { name, points: {x, y}[] }[], annotations?: { x, label, color }[] }

[CohortHeatmap.data]
{ rows: string[], cols: string[], matrix: number[][] }

[RfmQuadrant.data]
{ users: { id, r: number, f: number, m: number, segment: string }[] }

[CodeTerminal.data]
{ language: 'sql'|'python', code: string, runnable: boolean, expected_result?: string }

[ReportLongform.data]
{ markdown: string, toc?: { id, title, level }[] }

═══════════════════════════`;

  try {
    await fetchEventSource('/api/chat', {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemInstructionText + canvasProtocol }] }
      }),
      async onopen(response) {
        if (!response.ok) {
           let errMessage = 'Internal Server Error';
           try { const errObj = await response.json(); errMessage = errObj.error || errMessage; } catch(e){}
           throw new Error(errMessage);
        }
      },
      onmessage(event) {
        if (event.data === '[DONE]') return;
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          console.error('Failed to parse SSE data', e);
          return;
        }
        
        if (data.type === 'token') {
          onChunk(data.content);
        } else if (data.type === 'error') {
           throw new Error(data.error);
        }
      },
      onerror(err) {
        throw err;
      }
    });
  } catch (err: any) {
    onError(err.message || 'Unknown error');
  }
}
