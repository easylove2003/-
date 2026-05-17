# 智能助手 (Data Copilot) 功能及实现细节文档

## 一、 模块核心功能详细呈现

智能助手（Data Copilot）是本数据分析平台的核心 AI 交互引擎，以“侧边栏对话 + 动态画布”为主要形态，提供以下核心功能：

1. **全局主动式伴随交互 (Proactive Copilot Chat)**
   * 系统初始化后主动问候，随时随地待命。支持基于自然语言（NL）的流畅对话、数据答疑和商业分析策略生成。
   * 支持多轮上下文对话管理，系统会自动记忆当前对话的语境。

2. **本地数据文件感知计算 (Local Data Ingestion & Context)**
   * **支持格式：** 用户可直接在聊天框点击附件图标，上传 `.csv`, `.xlsx`, `.xls` 和 `.txt` 格式的本地文件。
   * **隐私与解析：** 文件提取及解析**完全在浏览器本地端完成**（通过 `papaparse` 和 `xlsx` 库解析），没有任何数据会被擅自上传到后端数据库，极大保障业务数据隐私。
   * **智能上下文融合：** 数据加载后，系统会自动提取其中的**数据量级（行数）**和**前 5 行样本数据**作为示例注入到大语言模型（LLM）的系统提示词（System Prompt）中。这就使得模型在后续对话中具备“查阅并理解用户数据”的能力。

3. **流式大语言模型推理 (Streaming LLM Reasoning)**
   * 此功能对接基于 Gemini 架构的强大推理 API。
   * 支持 **流式文本输出 (Streaming)**，即模型思考和生成的每一个字段都会实时打印在屏幕上，大大缩短反馈时间并降低等待焦虑感。

4. **指令感知与画布联动 (Auto Dashboarding & Workspace Projection)**
   * 这是该助手的最大特色。“对话”不仅停留在左侧窗口：当用户的输入指令中包含“报告”、“看板”等触发词，或者模型返回判定文本中包含“画布”相关意图时；
   * 侧边栏助手会自动执行隐式路由切换，拉起一条 UI 交互指令（如：“智能匹配完成：我已将上述分析框架投射在右侧画布上…”），将左侧原本拥挤的长文本内容，提取并投射至右侧全屏宽阔的**动态智能画布 (Dynamic Canvas)** 中进行排版更优雅的长图文展示。

5. **API 密钥本地安全管理 (Local API Key Security)**
   * 提供专门的 Settings 设置面板，允许用户输入个人侧的 API Key。Key 通过浏览器的 `localStorage` 安全存储，实现离线记录与本地调用。

---

## 二、 界面具体展示元素 (UI Layout & Components)

界面整体采用 **黑白红“新粗野主义” (Neobrutalism)** 加上企业级数据控制台风格，双栏布局展示内容如下：

### 1. 左侧狭长工作区：数据伴随智能体侧边栏 (Copilot Sidebar)
* **头部控制区 (Header)：**
  * 左侧展示带有“大脑电路”符号的“Data Copilot”粗体标题。
  * 右侧展示一个具有闪烁/呼吸灯特效的 `[LLM Online]` 绿色徽章，暗示底层 AI 引擎连接状态正常。
* **消息展示区 (Message Feed)：**
  * **用户发言态：** 采用纯黑底色 (`#0F0F0F`) 、白色字体，配以灰色偏移硬阴影，右对齐。
  * **AI 回复态：** 纯白底色、黑色边框加刚硬的纯黑偏移阴影，左对齐；支持 Markdown 复杂块级素渲染（加粗、表格、代码块等）。若是系统触发的前端界面的操作行为，会在上方打上带闪电图标的 `[System Alert]` 红色子标签。
  * **输入运行状态：** 采用典型的 3 个黑白圆点进行错落跳跃的打字动效，代表引擎正在思考。
* **输入区 (Input Area)：**
  * 包含一个曲别针 📎 上传附件入口图标。一个支持多行的无边框文本域输入框。
  * 右侧内嵌黑底白字的 `Send` 发起/发送按钮。
  * 最底部外沿包含了一个配有齿轮图标的 API Key Settings 微型管理按钮。

### 2. 左半区浮层：密钥配置弹窗 (Settings Modal)
* 弹出后背景带有磨砂模糊 (`backdrop-blur`) 暗色蒙层。
* 中心是配置卡片：标题提示配置 Gemini API Key 并包含一段隐私安全说明，下方具备密码输入域，以及 `Cancel` (取消) 和黑底粗字的 `Save Key` （保存）两个交互按钮。

### 3. 右侧主工作区：交互画布 - 闲置态 (Interactive UI Canvas - Idle State)
在刚进入或闲置状态下，右侧展示宽屏的 **智能数据工作台 (Intelligence Workspace)**：
* **巨大问候语**："Data Intelligence Workspace" 以及 "Hello, I am your Data Copilot...".
* **Active Context（当前上下文展板）：**
  * 显示已加载的文件数量模块。
  * 若已上传数据，展示一条醒目的蓝色信息徽章（含文件名及 FileText 图标，右侧标出精确数据行数）。
  * 显示当前核心运行的模型引擎状态。
* **Agent Capabilities（智能体能力展板）：**
  * 纯黑底色的深色沉浸卡片，展示 4 项亮起的核心分析能力：Trend Analysis（趋势分析）, Auto Dashboard（自动看板）, SQL Generation（SQL 脚本生成）, RCA Diagnosis（根因异常诊断）。
* **Suggested Actions（建议快捷指令）：**
  * 包含 3 张白色悬浮卡片：生成销售报告(Generate Sales Report)、异常值侦测(Detect Anomalies)、数据清洗脚本编写(Code Interpreter)。每次鼠标悬停(Hover)时，图标与底色发生放大、变色的流畅动效响应。点击卡片可以直接一键向左侧发送相关 Prompt。

### 4. 右侧主工作区：动态报告画布 - 生成态 (Interactive Canvas - Report State)
* 当前大模型意图命中“生成研报”且响应完毕时，右侧闲置台会平滑过渡为一个类似实体白皮书或 PPT 的版面。
* 内容顶部包含一个粗体大标题（如：“动态交互战略看板”）。
* 主体区域提供大画幅的 Markdown Markdown 呈现以供深度阅读。
* 底部带有工程系统终端风格的虚线文字：“-- 局部重绘可用，请向智能体提供修改指令 --”。

---

## 三、 本模块的前端生成架构与技术实现

在底层，本页面 (`src/pages/AIAssistant.tsx`) 充分运用了现代前端最佳实践，将数据逻辑与交互反馈完美分离：

### 1. 响应式与状态隔离框架 (React Hooks)
* 整个侧边栏应用了 React 的 Function Component 模式，通过 `useState` 将用户输入值 (`input`)、聊天总记录栈 (`messages`)、上传的解析数据 (`uploadedData`) 和全屏画布挂载内容 (`canvasData`/`canvasMode`) 进行了严格隔离。

### 2. 本地文件纯客户端解析技术 (Client-Side Parsing)
* 通过引入原生的 `<input type="file" />` 与 `useRef`，接管了系统的文件浏览。
* 使用 `papaparse` 处理常规的 `.csv/.txt`，使用 `xlsx` 处理高密度的 Excel 文件 `.xlsx`。
* `arrayBuffer` 和 `FileReader` 在客户端瞬间切分百万级数据字节，提取前 5 行作为采样数据。这确保了平台绝不会有“上传到私有服务器进而泄漏”的安全风险，同时又巧妙为大模型提供了极高密度的“列结构”认知语境。

### 3. 流式 HTTP SSE 数据流对接 (Streaming Connections)
* 通过执行 `fetchChatStream` 工具库（封装于 `lib/api.ts`），采用了底层 `fetch` 的 `body.getReader()` 进行分块(chunk)读取。
* 在每读取到一个新的 Token（字词段）时，触发 React 的解构并覆写 `messages` 队尾数组元素。由此无需等待大段废话，产生真实的“流式呈现”。一旦捕获网络异常（`try...catch`），也能立即转化为系统的红色提醒字样。

### 4. 前端大模型意图拦截器 (Intent Interception)
* 这是模块“动态画布联通”的核心。不是依靠非常繁重的服务端 Function Calling，而是采用了敏捷且低成本的**大模型文字意图嗅探**。
* `sendMessage` 方法内编写了关键字雷达 (`if (val.includes("报告") || fullText.includes("画布"))`)。当满足条件且延时 1000 毫秒生成结束后，利用 `setCanvasMode('report')` 把聊天结果镜像(Mirror) 注入到全局 Canvas 的生命周期上。

### 5. CSS 原子化新粗野架构与交互编排
* 放弃传统的级联层叠样式表，全站使用 Tailwind CSS：通过灵活组装诸如 `border-2 border-[#0F0F0F]`, `shadow-[4px_4px_0_#0F0F0F]`，直接在标签层面构建出极为统一和富有张力的企业极客像素风。
* 对于“波浪形的 Typing 提示”、“对话框的滑入滑出”、“闲置画布态与工作画布态的丝滑过渡”，全部使用 `framer-motion` 库（即代码中的 `motion.div` 和 `AnimatePresence` 容器），通过简单的 `initial`, `animate`, `exit` 属性便实现了 60 帧级别的 GPU 硬件加速动画。
