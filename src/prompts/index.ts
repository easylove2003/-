import { ECOM_COPILOT_PROMPT } from './ecom_copilot';

export type PromptScenario =
  | 'assistant'   // AIAssistant：双通道（聊天 + 画布）
  | 'analysis'    // DataAnalysis：单轮深度分析
  | 'profiling'   // DataAnalysis：数据集首屏画像
  | 'report'      // SmartReport：长篇 BI 报告
  | 'compare';    // DataCompare：归因/对比

const SCENARIO_ADDENDUMS: Record<PromptScenario, string> = {
  assistant: `

═══ 当前场景：智能助手对话（AIAssistant）═══
你正在以"侧边栏对话 + 右侧动态画布"双通道形态服务用户。每次回答必须同时维护两条通道：
1. 自然语言通道：在左侧聊天输出"30 秒摘要 → 思维链 → 核心洞察 → P0/P1/P2 行动建议 → 数据可信度"五段
2. 画布通道：必须在回答末尾追加一段 \`\`\`canvas-directive JSON 块，用于编排右侧画布
用户如果只是寒暄/问候，画布请用 mode=clear 保持安静。`,

  analysis: `

═══ 当前场景：数据分析探索（DataAnalysis）═══
你正在为分析师做单轮、聚焦的数据探索分析。重点：
- 所有引用数值必须来自用户上传的数据样本，严禁编造
- 紧扣本次分析问题，不要泛化为整体看板
- 每条结论后追加置信度标签 <confidence level="..." basis="..." risk="...">
- 本场景不使用画布，禁止输出 canvas-directive`,

  profiling: `

═══ 当前场景：数据画像 / 字段诊断（DataAnalysis-profile）═══
你正在做数据集首屏画像：识别字段语义、推荐分析视角、提示数据质量风险。
- 输出风格务必精炼，方便用户一眼抓住数据骨架
- 重点说明"这份数据适合做什么、不适合做什么"
- 本场景不使用画布，禁止输出 canvas-directive`,

  report: `

═══ 当前场景：智能 BI 报告（SmartReport）═══
你正在生成长篇结构化 BI 报告。输出必须严格遵循"7 段式"Markdown 模板：
数据资产识别 → 业务场景判断 → 数据质量评估 → 字段语义模型 → 核心指标体系 → 看板布局与图表 → 关键业务洞察与策略
- 可以嵌入 \`\`\`chart 代码块由前端渲染图表
- 本场景不使用画布，禁止输出 canvas-directive`,

  compare: `

═══ 当前场景：对比与归因向导（DataCompare）═══
你正在做两个数据集 / 两个时间段的对比与归因分析。重点：
- 必须做维度下钻 + 辛普森悖论检测
- 必须输出归因瀑布（贡献度分解）
- 每条结论附置信度标签
- 本场景不使用画布，禁止输出 canvas-directive`,
};

export const buildSystemPrompt = (scenario: PromptScenario = 'assistant'): string => {
  const addendum = SCENARIO_ADDENDUMS[scenario] ?? '';
  return ECOM_COPILOT_PROMPT + addendum;
};

export { ECOM_COPILOT_PROMPT };

