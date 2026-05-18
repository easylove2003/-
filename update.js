import * as fs from 'fs';

const interfaceTarget = `  difficulty: string;
  tags?: string[];
  summary: string;`;

const interfaceReplacement = `  difficulty: string;
  tags?: string[];
  prerequisites?: string[];
  sqlSketch?: string;
  summary: string;`;

let content = fs.readFileSync('src/data/cases.ts', 'utf8');

content = content.replace(interfaceTarget, interfaceReplacement);

const exportIndex = content.indexOf('export const caseStudies: CaseStudy[] = [');
if (exportIndex === -1) {
  console.error('Cannot find export const caseStudies');
  process.exit(1);
}

const newCaseStudies = `export const caseStudies: CaseStudy[] = [
  {
    id: 'c-mult-01',
    title: '乘法拆解定位 GMV 异动：从大盘 -32% 到 iOS 端单点失血',
    category: '基础模型',
    subcategory: '异动归因',
    industry: '快时尚女装电商',
    difficulty: '入门',
    tags: ['乘法拆解', 'GMV 公式', '维度下钻', '渠道归因'],
    prerequisites: ['GMV = UV × CVR × AOV 公式', '同比与环比的区别', '维度下钻的基本思路'],
    summary: '日均 GMV 250 万的女装电商出现单日 GMV 同比 -32% 异动。用 GMV = UV × CVR × AOV 三因子拆解后，CVR 与 AOV 基本持平，问题集中在 UV。继续按设备类型 + 渠道下钻，定位到 iOS 端付费流量 UV 同比 -62%，根因是 iOS 14.5+ 隐私新规导致广告平台归因数据缺失、自动减投。预算切换至安卓端 + iOS SKAN 归因迁移，第 7 天大盘 GMV 恢复至同比 +3%。',
    background: '某垂直快时尚女装电商，日均 UV 30 万左右，日均 GMV 稳定在 250-300 万区间，付费流量占比约 70%（其中 iOS 端约占付费流量 55%）。\\n2023 年 9 月 12 日的 BI 日报触发同比异动告警：前一日 GMV 190 万，同比上周同期 280 万下降 32%。距离季度大促两周，需要在当日内定位根因并给出可执行动作。\\n数据条件：订单宽表小时级更新，含设备 OS、UTM 来源、订单金额、用户 ID；广告平台数据 T+1 回传，含曝光、点击、消耗、归因转化。',
    fields: [
      { name: 'log_date', type: 'date', description: '业务日期，用于同环比对齐', example: '2023-09-12' },
      { name: 'device_os', type: 'string', description: '设备类型，本案例的关键下钻维度', example: 'iOS' },
      { name: 'utm_source', type: 'string', description: '渠道来源，配合 device_os 做交叉下钻', example: 'douyin_feed' },
      { name: 'uv', type: 'int', description: '当日去重访客数，三因子拆解的第一项', example: '124000' },
      { name: 'paid_users', type: 'int', description: '当日支付用户数，与 uv 配比得到 CVR', example: '3968' },
      { name: 'gmv', type: 'decimal', description: '当日支付金额合计，三因子拆解的目标变量', example: '627840.00' }
    ],
    sqlSketch: '-- 计算每一步漏斗节点的 UV，用窗口去重避免重复计数\\nWITH funnel AS (\\n  SELECT user_id,\\n         MAX(CASE WHEN event_name = \\'view_home\\'    THEN 1 ELSE 0 END) AS s1,\\n         MAX(CASE WHEN event_name = \\'view_list\\'    THEN 1 ELSE 0 END) AS s2,\\n         MAX(CASE WHEN event_name = \\'view_detail\\'  THEN 1 ELSE 0 END) AS s3,\\n         MAX(CASE WHEN event_name = \\'add_cart\\'     THEN 1 ELSE 0 END) AS s4,\\n         MAX(CASE WHEN event_name = \\'submit_order\\' THEN 1 ELSE 0 END) AS s5,\\n         MAX(CASE WHEN event_name = \\'pay_success\\'  THEN 1 ELSE 0 END) AS s6\\n  FROM events WHERE event_date BETWEEN \\'2024-03-01\\' AND \\'2024-03-09\\'\\n  GROUP BY user_id\\n)\\nSELECT SUM(s1) s1_uv, SUM(s2) s2_uv, SUM(s3) s3_uv,\\n       SUM(s4) s4_uv, SUM(s5) s5_uv, SUM(s6) s6_uv\\nFROM funnel;',
    analysisProcess: '数据准备：取 9/12 与上周同期 9/5 两日订单宽表，按 device_os × utm_source 双维度聚合。剔除测试订单（金额 < 1 元或 user_id 在白名单内）和爬虫流量（同 IP 单日 UV > 1000）。清洗后 9/12 有效记录 28.4 万条，9/5 有效 51.2 万条。\\n指标拆解：先做大盘三因子拆解。9/12 数据为 UV 30.5 万、CVR 3.2%、AOV 158 元；9/5 为 UV 55.1 万、CVR 3.1%、AOV 156 元。CVR 与 AOV 同比波动均在 ±2% 内（属于抽样波动），UV 同比下降 45%。结论：异动约 92% 来自 UV，仅 8% 来自其他因子，下钻焦点锁定 UV。\\n维度下钻：按 device_os 分组，Android UV 同比 +3%，iOS UV 同比 -62%。再按 utm_source 切 iOS 子集，发现 douyin_feed 与 wechat_mp 两条付费链路 UV 同比下降 78% 与 71%，自然搜索 UV 同比仅 -8%。差异集中在付费投放渠道。\\n根因定位：候选假设三条——(a) 投放预算被砍；(b) 素材被审核驳回；(c) 归因链路异常。检查广告后台：账户余额 150 万、当日实际消耗 6.8 万（vs 上周同期 38 万），曝光量保留 87%，点击量 -73%。账户未停投但系统自动降低出价。进一步对比 iOS 14.5+ 用户占比（76% → 81%）与 IDFA 授权率（不足 10%），结论：iOS 隐私新规导致广告平台归因回传数据稀疏，OCPA/oCPM 算法判断"无转化"自动降出价。排除假设 (a)(b)，确认 (c)。',
    coreFindings: [
      {
        finding: '异动 92% 来自 UV 维度，CVR/AOV 基本健康',
        evidence: 'GMV 同比 -32%，UV -45%，CVR 3.2% vs 3.1%（差值在抽样波动内），AOV 158 vs 156。',
        implication: '排除商品力、定价、用户购买力等供需端解释，问题在流量供应。'
      },
      {
        finding: 'iOS 付费渠道 UV 同比 -62%，安卓微增 +3%',
        evidence: '设备 × 渠道交叉表显示 iOS 付费流量 UV 14.2 万 → 5.4 万；安卓与 iOS 自然合计 +1.8 万。',
        implication: '问题是设备 + 渠道的耦合，不是大盘流量荒，可以通过结构调整定向止损。'
      },
      {
        finding: 'iOS 投放未被人为停投，是算法层减投',
        evidence: '账户余额 150 万、曝光仅 -13%、点击 -73%、消耗 -82%，oCPM 出价被系统下调约 60%。',
        implication: '问题在归因数据缺失而非投放策略本身，常规排查容易错把锅甩给运营团队。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '预算结构应急切换',
        action: '当日内将 iOS 端 60% 未消耗预算手动切至安卓信息流，并在 iOS 端切换为 SKAdNetwork 归因 + CPA 智能投放。',
        expectedOutcome: '24 小时内回补 UV 缺口的 50%-70%，对应 GMV 回升 45-60 万/日。置信度：高（预算迁移路径成熟）。',
        owner: '投放团队'
      },
      {
        strategy: 'iOS 老客回流唤醒',
        action: '从近 90 天有支付记录的 iOS 用户（约 50 万）中筛选 R≤30 / F≥2 的子集（约 12 万），通过 Push + 短信定向唤醒，绕开广告归因。',
        expectedOutcome: '预计召回 UV 1.5-2 万/日，CVR 高于新客约 3 倍，可贡献 GMV 8-12 万/日。',
        owner: '用户增长团队'
      },
      {
        strategy: '建立大盘异动自动告警',
        action: 'BI 平台对 UV/CVR/AOV 三个一级指标设置同比 ±15% 的小时级告警，按设备 × 渠道做 Top-N 自动归因，输出到飞书机器人。',
        expectedOutcome: '将类似异动的人工识别时间从 12 小时压缩到 1 小时内。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '动作执行后第 1 天 GMV 230 万（同比 -18%），第 3 天 250 万（同比 -10%），第 7 天 285 万（同比 +3%）。其中预算迁移贡献回补 65%，老客唤醒贡献 25%，iOS 自然恢复 10%。注意：第 7 天数据包含一次站内活动，剔除活动影响后真实回补率约同比 -5%，未完全修复，长期需要等 SKAN 归因模型稳定。',
    reflection: '复用边界：这套"乘法拆解 + 维度下钻"模板适用于"指标由多因子相乘构成"且"数据可按业务维度切片"的场景（GMV、ROI、付费转化等）。不适用于：(1) 指标由加法或复杂函数构成（如 NPS）；(2) 维度过细导致每格样本不足（< 30 不建议下钻）。\\n失败教训：iOS 14.5 隐私新规其实在半年前已有行业预警，团队没有提前演练，被动响应。后续在投放团队设立"政策雷达"角色，对苹果、Meta、抖音等平台政策更新做月度跟进。\\n下一步进阶：将单点异动检测升级为多指标联合检测，引入 STL 时序分解或 Prophet 模型识别趋势 + 季节性背景下的真实异常，避免大促/节假日的误报。'
  },

  {
    id: 'c-funnel-02',
    title: '转化漏斗诊断：从首页到支付的端到端拆解',
    category: '基础模型',
    subcategory: '漏斗分析',
    industry: '综合电商平台',
    difficulty: '入门',
    tags: ['漏斗分析', '端到端转化', '跳失率', '埋点'],
    prerequisites: ['漏斗模型基本概念', '事件埋点的基础', '同期对比方法'],
    summary: '某综合电商 7 日大盘下单转化率从 2.8% 跌至 1.9%。用六步漏斗（首页 → 列表 → 详情 → 加购 → 提单 → 支付）拆解每一步的环比留存率，定位到"详情页 → 加购"环节单点跌幅 -35%，远超其他环节。深入排查发现新版详情页将"加购按钮"折叠到第二屏。回滚后 3 天内整体转化率恢复至 2.7%。',
    background: '某综合电商日均 UV 80 万，下单转化率长期稳定在 2.7%-2.9%。2024 年 3 月 6 日产品上线了新版商品详情页（A/B 实验全量），3 天后大盘下单转化率从 2.8% 降至 1.9%。\\n业务方初步怀疑是流量结构变化或大促结束的自然回落。数据团队需要在 24 小时内确认是产品改版的问题，还是其他因素，并给出回滚或继续观察的建议。',
    fields: [
      { name: 'event_date', type: 'date', description: '事件发生日期', example: '2024-03-09' },
      { name: 'user_id', type: 'string', description: '用户唯一标识，用于跨步骤串联', example: 'U_8830012' },
      { name: 'event_name', type: 'string', description: '事件类型，对应漏斗的六个节点', example: 'view_detail' },
      { name: 'item_id', type: 'string', description: '商品 ID，用于品类分组', example: 'SPU_22045' },
      { name: 'session_id', type: 'string', description: '会话 ID，确保同一访问内的串联准确', example: 'SS_20240309_88300' }
    ],
    sqlSketch: '-- 计算每一步漏斗节点的 UV，用窗口去重避免重复计数\\nWITH funnel AS (\\n  SELECT user_id,\\n         MAX(CASE WHEN event_name = \\'view_home\\'    THEN 1 ELSE 0 END) AS s1,\\n         MAX(CASE WHEN event_name = \\'view_list\\'    THEN 1 ELSE 0 END) AS s2,\\n         MAX(CASE WHEN event_name = \\'view_detail\\'  THEN 1 ELSE 0 END) AS s3,\\n         MAX(CASE WHEN event_name = \\'add_cart\\'     THEN 1 ELSE 0 END) AS s4,\\n         MAX(CASE WHEN event_name = \\'submit_order\\' THEN 1 ELSE 0 END) AS s5,\\n         MAX(CASE WHEN event_name = \\'pay_success\\'  THEN 1 ELSE 0 END) AS s6\\n  FROM events WHERE event_date BETWEEN \\'2024-03-01\\' AND \\'2024-03-09\\'\\n  GROUP BY user_id\\n)\\nSELECT SUM(s1) s1_uv, SUM(s2) s2_uv, SUM(s3) s3_uv,\\n       SUM(s4) s4_uv, SUM(s5) s5_uv, SUM(s6) s6_uv\\nFROM funnel;',
    analysisProcess: '数据准备：取 3/1 至 3/9 共 9 天的事件流水，按 6 个核心事件聚合到用户日级。剔除内部测试账号（约 0.3%）。两组对照：3/1-3/5 改版前 5 天 vs 3/6-3/9 改版后 4 天。\\n漏斗对齐：每一步用 UV 计算节点留存率（本步 UV / 上一步 UV），同时记录绝对 UV，避免单看比率忽略量级。改版前后六步 UV 留存率分别为：100%/72%/58%/35%/82%/95% 与 100%/71%/57%/22%/82%/95%。\\n单点定位：对比每一步留存率的差值，发现"详情页 → 加购"从 35% 跌至 22%，单点跌幅 -37%，远超其他环节（其他环节波动均在 ±2% 内）。结论：问题不是大盘流量质量，而是详情页到加购的具体路径。\\n根因排查：候选假设——(a) 加购按钮位置变化；(b) 详情页加载变慢；(c) 加购弹窗出错。前端埋点显示新版按钮渲染正常、加载时长无显著变化（P95 1.2s vs 1.3s），加购点击事件触发正常。但热力图显示新版按钮出现在第二屏（首屏被推荐位占据），需要用户主动滚动才能看到。结合用户调研中"找不到加购按钮"的反馈，确认假设 (a)。',
    coreFindings: [
      {
        finding: '问题集中在"详情 → 加购"单一环节',
        evidence: '改版前后六步留存率仅"详情→加购"出现 -37% 的显著跌幅，其余环节稳定。',
        implication: '不是大盘流量质量或竞品冲击，是产品改版的局部问题，可以通过回滚定向修复。'
      },
      {
        finding: '加购按钮位置变化导致触达成本上升',
        evidence: '热力图显示新版加购按钮在屏幕下方折叠区，需滚动 1 屏才可见；用户调研定性反馈印证。',
        implication: '电商详情页的核心转化按钮不应该让用户主动找，首屏可见是基础体验。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '紧急回滚详情页改版',
        action: '产品当日内将详情页回滚至改版前版本，在 A/B 实验后台关闭新版流量。',
        expectedOutcome: '24-48 小时内"详情→加购"留存率恢复至 33% 以上，大盘转化率恢复至 2.7%。',
        owner: '产品 + 前端团队'
      },
      {
        strategy: '建立改版前转化路径检查清单',
        action: '所有涉及核心转化路径（加购、提单、支付）的产品改版，上线前必须通过埋点回归测试 + 灰度 5% 流量观察 7 天。',
        expectedOutcome: '类似回归 bug 在灰度阶段即可识别，避免全量影响。',
        owner: '产品 + 数据团队'
      },
      {
        strategy: '漏斗监控自动化',
        action: 'BI 平台对六步漏斗每一步的留存率设置环比 -10% 告警，发送至产品和数据负责人。',
        expectedOutcome: '类似单点异动的发现时间从 3 天压缩到当天。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '回滚后第 1 天大盘转化率回到 2.5%，第 3 天恢复至 2.7%。改版期间累计损失订单约 1.8 万单，对应 GMV 损失估算 360 万。后续详情页改版方案在灰度 5% 流量阶段被新版漏斗监控告警拦截，避免了二次事故。',
    reflection: '复用边界：漏斗分析适用于"路径明确、步骤可枚举、用户单向推进"的场景（注册、下单、支付等）。不适用于：(1) 用户行为高度非线性（内容消费、社交互动）；(2) 步骤之间没有强先后顺序的场景。\\n失败教训：本次改版没有先做小流量灰度直接全量，是产品流程的漏洞。后续把"核心路径改版必须灰度 7 天"写入产品发布规范。\\n下一步进阶：当漏斗有多条平行路径（如同时存在"加购→下单"和"立即购买"），需要把漏斗拆成多路径对比，可以引入桑基图或者用 SQL 标注用户走过的具体路径。'
  },

  {
    id: 'c-rfm-03',
    title: 'RFM 分层运营：把 200 万用户切成 8 个可执行的群组',
    category: '基础模型',
    subcategory: '用户分层',
    industry: '美妆个护电商',
    difficulty: '入门',
    tags: ['RFM 模型', '用户分层', '分层运营', '价值密度'],
    prerequisites: ['用户生命周期基本概念', '分位数（quantile）的理解', 'SQL 基础聚合'],
    summary: '某美妆电商 200 万活跃用户，营销资源平均铺开导致 ROI 持续走低。用 RFM 模型按 R / F / M 三维度做四分位切分，得到 8 个用户群组。识别出"重要价值客户"（占 12% 但贡献 41% GMV）和"重要挽留客户"（高潜回流群体）两个核心群体，分别匹配差异化触达策略。3 个月后整体短信触达 ROI 从 1:2.4 提升至 1:4.1，无效触达成本降低 38%。',
    background: '某美妆个护电商累计活跃用户 200 万，营销团队每月发送约 1500 万条触达消息（短信 + Push + 站内信），但触达 ROI 持续在 1:2.0-1:2.5 徘徊，远低于行业 1:4 的水平。投诉反馈量月均增长 12%，用户对"打折信息太多"的反感越来越强。\\n业务诉求：在不增加预算的前提下，将触达 ROI 提升至 1:4 以上，并降低用户打扰投诉。',
    fields: [
      { name: 'user_id', type: 'string', description: '用户唯一标识', example: 'U_8830012' },
      { name: 'last_pay_date', type: 'date', description: '最近一次成功支付日期，用于计算 R', example: '2024-02-18' },
      { name: 'pay_count_180d', type: 'int', description: '近 180 天支付订单数，用于计算 F', example: '5' },
      { name: 'pay_amount_180d', type: 'decimal', description: '近 180 天支付总金额，用于计算 M', example: '1486.50' },
      { name: 'is_complaint', type: 'bool', description: '历史是否有触达投诉记录，作为辅助过滤维度', example: 'false' }
    ],
    sqlSketch: '-- 计算 R/F/M 原始值并打分（四分位法）\\nWITH base AS (\\n  SELECT user_id,\\n         DATEDIFF(\\'2024-03-01\\', last_pay_date) AS r_days,\\n         pay_count_180d                       AS f_count,\\n         pay_amount_180d                      AS m_value\\n  FROM user_summary\\n  WHERE last_pay_date >= \\'2023-09-01\\'\\n),\\nscored AS (\\n  SELECT *,\\n         NTILE(4) OVER (ORDER BY r_days ASC)  AS r_score,  -- 越近越高\\n         NTILE(4) OVER (ORDER BY f_count DESC) AS f_score,\\n         NTILE(4) OVER (ORDER BY m_value DESC) AS m_score\\n  FROM base\\n)\\nSELECT user_id, r_score, f_score, m_score,\\n       CASE\\n         WHEN r_score >= 3 AND f_score >= 3 AND m_score >= 3 THEN \\'重要价值\\'\\n         WHEN r_score <= 2 AND f_score >= 3 AND m_score >= 3 THEN \\'重要挽留\\'\\n         WHEN r_score >= 3 AND f_score <= 2 AND m_score >= 3 THEN \\'重要发展\\'\\n         WHEN r_score <= 2 AND f_score <= 2 AND m_score >= 3 THEN \\'重要唤回\\'\\n         ELSE \\'一般用户\\'\\n       END AS segment\\nFROM scored;',
    analysisProcess: '数据准备：取近 180 天有过支付的活跃用户共 213 万，剔除内部账号、批量退款用户、客诉黑名单（约 1.5%）。R/F/M 三个原始指标分别为：最近一次支付距今天数、180 天内支付订单数、180 天内支付总金额。\\n分箱方法：每个维度独立做四分位（NTILE 4）打分，避免不同维度量纲冲突。R 是越小越好（最近）反向打分，F 和 M 是越大越好正向打分。每个用户得到一个三位数标签如 \\'4-3-3\\'。\\n群组合并：理论上有 4×4×4 = 64 个组合，但运营无法对 64 个群分别做策略。按业务可执行原则合并为 8 个群组：重要价值（高 R 高 F 高 M）、重要挽留（低 R 高 F 高 M）、重要发展（高 R 低 F 高 M）、重要唤回（低 R 低 F 高 M）、一般价值、一般保持、一般发展、流失。\\n群组画像与价值密度计算：对每个群组计算"用户占比 vs GMV 占比"。重要价值客户占 12% 用户、贡献 41% GMV，价值密度 3.4；重要挽留占 8% 用户、贡献 18% GMV（但近期下滑），是首要挽回对象；流失客占 35% 用户、贡献 4% GMV，价值密度 0.11，应大幅削减触达投入。',
    coreFindings: [
      {
        finding: '12% 的重要价值客户贡献了 41% 的 GMV',
        evidence: 'R≥3 且 F≥3 且 M≥3 的用户共 25.6 万人，180 天 GMV 占大盘 41.2%，价值密度 3.4。',
        implication: '资源应优先服务这部分客户，他们对触达频率敏感，但对个性化和品质敏感。'
      },
      {
        finding: '"重要挽留"群体是 ROI 最高的挽回对象',
        evidence: '该群占 8% 用户，过去 180 天累计支付金额 M≥3，但近 60-180 天未活跃（R 评分低）。回访测试转化率 8.5%，是新客触达转化率的 4.2 倍。',
        implication: '高 LTV 但近期沉睡的用户唤回成本远低于拉新，是营销资源应集中投入的核心战场。'
      },
      {
        finding: '占 35% 的流失客群仅贡献 4% GMV，但消耗 30% 触达资源',
        evidence: '流失客群（R≤2 且 F≤2）的触达 ROI 仅 0.6:1，是亏损投放，且投诉率是其他群组的 2.8 倍。',
        implication: '不是所有用户都值得留住，对低价值流失客的"无差别营销"是负 ROI 行为，应该砍掉。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '重要价值客户：低频高质触达',
        action: '将该群体的触达频次从月均 6 次降至 2 次，内容切换为新品首发预告、专属客服、生日礼遇。',
        expectedOutcome: '触达 ROI 从 1:3.0 提升至 1:5.5+，投诉率下降 50% 以上。',
        owner: '用户运营 + CRM 团队'
      },
      {
        strategy: '重要挽留客户：定向唤回',
        action: '设计"专属回归礼包"（基于用户历史品类偏好的样品 + 额度券），通过 1v1 短信 + 客服外呼组合触达。',
        expectedOutcome: '90 天内回流率从 4% 提升至 12%，唤回 GMV 月增 200 万级。',
        owner: '用户运营团队'
      },
      {
        strategy: '流失客群：触达削减',
        action: '将流失客群月触达频次从 8 次降至 1 次（仅大促节点），节省下来的资源转移到重要挽留客户。',
        expectedOutcome: '总触达成本下降 35%，整体投诉率下降 40%。',
        owner: '用户运营团队'
      }
    ],
    businessOutcome: '3 个月后整体触达 ROI 从 1:2.4 升至 1:4.1，月度营销投入未增加（实际降低 8%）。重要挽留客户群唤回贡献 GMV 580 万。投诉量月环比下降 42%。重要价值客户的 NPS 提升 11 分。',
    reflection: '复用边界：RFM 适用于"购买周期清晰、单次客单价不太低、有较丰富历史数据"的电商场景。不适用于：(1) 极低频高客单业务（如装修、家电，建议改用消费阶段模型）；(2) 内容平台的留存分析（更适合用 DAU/MAU + 行为序列）；(3) 数据时间窗口太短（< 90 天）的新业务。\\n失败教训：第一版 RFM 模型用了 12 个细分群，运营无法落地，最终被业务搁置 1 个月才回到 8 个群的可执行版本。模型设计必须考虑下游使用者的认知和操作成本。\\n下一步进阶：(1) 引入"品类偏好"作为第四维度变成 RFM-C 模型；(2) 用聚类算法（K-Means）替代固定阈值切分，让分群更符合数据本身的分布。'
  },

  {
    id: 'c-ab-04',
    title: 'A/B 实验解读：当显著性成立但业务负向时',
    category: '基础模型',
    subcategory: 'A/B 测试',
    industry: '在线教育电商',
    difficulty: '入门',
    tags: ['A/B 测试', '显著性检验', '辛普森悖论', '实验复盘'],
    prerequisites: ['假设检验和 p 值', '实验组/对照组的概念', '点击率与转化率的区别'],
    summary: '在线教育平台首页 A/B 测试新版推荐位，CTR（点击率）从 4.8% 显著提升至 5.6%（p < 0.01），但下单转化率却从 1.9% 降至 1.6%。深入按"用户来源渠道"切分发现辛普森悖论：实验组流量结构倾斜了，新增大量低质素材带来的点击党用户，CTR 提升的本质是用户结构变化，不是产品改版的真实增益。停推该改版，避免了潜在的 GMV 损失。',
    background: '某在线教育电商首页"今日推荐"模块改版，假设是新的卡片样式能让用户更容易识别课程价值，从而提升点击和最终下单。实验设计：50/50 分流，全量用户随机分配，跑 14 天。\\n实验结束初看：CTR 实验组 5.6% vs 对照组 4.8%，p = 0.003，显著提升 16.7%。但下单转化率 CVR 实验组 1.6% vs 对照组 1.9%，p = 0.012，显著下降 15.8%。两个指标方向相反，团队对是否上线产生了分歧。',
    fields: [
      { name: 'user_id', type: 'string', description: '用户唯一标识', example: 'U_8830012' },
      { name: 'experiment_group', type: 'string', description: '实验分组：A=对照, B=实验', example: 'B' },
      { name: 'source_channel', type: 'string', description: '用户进入页面前的最近一跳渠道', example: 'douyin_feed' },
      { name: 'is_click', type: 'bool', description: '是否点击了"今日推荐"任一卡片', example: 'true' },
      { name: 'is_pay', type: 'bool', description: '24 小时内是否完成支付', example: 'false' }
    ],
    sqlSketch: '-- 第一层：大盘指标对比\\nSELECT experiment_group,\\n       COUNT(DISTINCT user_id)                                AS uv,\\n       SUM(is_click)/COUNT(DISTINCT user_id)::float           AS ctr,\\n       SUM(is_pay)/NULLIF(SUM(is_click), 0)::float            AS click_to_pay,\\n       SUM(is_pay)/COUNT(DISTINCT user_id)::float             AS overall_cvr\\nFROM ab_log\\nWHERE event_date BETWEEN \\'2024-04-01\\' AND \\'2024-04-14\\'\\nGROUP BY experiment_group;\\n\\n-- 第二层：按渠道切分（关键步骤）\\nSELECT experiment_group, source_channel,\\n       COUNT(DISTINCT user_id) AS uv,\\n       SUM(is_click)/COUNT(DISTINCT user_id)::float AS ctr\\nFROM ab_log\\nWHERE event_date BETWEEN \\'2024-04-01\\' AND \\'2024-04-14\\'\\nGROUP BY 1, 2;',
    analysisProcess: '数据准备：取 14 天实验期数据共 240 万用户，剔除 SRM（Sample Ratio Mismatch）异常天 4/7（流量分配 47/53，触发流量倾斜告警）。剔除后 12 天有效数据，A 组 95 万 UV、B 组 95 万 UV，分流均衡。\\n大盘指标：CTR 5.6% vs 4.8%（p=0.003），CVR 1.6% vs 1.9%（p=0.012），点击后下单率 28.6% vs 39.6%（p<0.001）。三个指标都显著但方向矛盾，需要进一步拆解。\\n维度切分：按用户来源渠道切分两组的 UV 占比，对照组 A：自然搜索 35% / 抖音 28% / 微信 22% / 其他 15%；实验组 B：自然搜索 22% / 抖音 48% / 微信 18% / 其他 12%。**抖音渠道占比从 28% 飙至 48%**，原因是实验期间运营在抖音端追投了一波低成本素材（团队事先未知会数据组）。\\n分渠道复算：在每个渠道内单独算 CTR 和 CVR，自然搜索：CTR 6.8% vs 6.5%（无显著），CVR 3.5% vs 3.4%（无显著）；抖音：CTR 4.5% vs 4.4%（无显著），CVR 0.8% vs 0.8%（无显著）。**结论：在每个渠道内部，实验组与对照组没有显著差异。大盘 CTR 上升只是因为低 CTR 高占比的渠道（抖音）权重变化导致的辛普森悖论。**',
    coreFindings: [
      {
        finding: '大盘 CTR 提升是渠道结构变化的副产品，不是改版增益',
        evidence: '抖音流量占比 A 组 28% → B 组 48%，但抖音用户的 CTR 本身就低于其他渠道。分渠道看，B 组在每个渠道内的 CTR 与 A 组无显著差异（p > 0.1）。',
        implication: '直接看大盘指标会被流量结构骗。A/B 实验必须验证 SRM 和关键维度的同质性，否则结论失真。'
      },
      {
        finding: 'CVR 下降是真实的，但不是改版导致的',
        evidence: '抖音渠道用户的 CVR 长期低于自然搜索（0.8% vs 3.5%），抖音占比上升必然拉低大盘 CVR。',
        implication: '"显著"不等于"业务有用"。实验期间的外部变量（如同期投放策略变化）必须纳入解读。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '本次实验判定为"无效结论"，停推改版',
        action: '不上线新版推荐位，等待外部变量稳定后重做实验。结论同步给产品和投放团队，避免用错误数据决策。',
        expectedOutcome: '避免基于污染数据做的产品决策，规避潜在的 GMV 下行风险。',
        owner: '数据 + 产品团队'
      },
      {
        strategy: '建立实验前 SRM 与同质性自动检查',
        action: '所有 A/B 实验上线前 24 小时跑 SRM 检查（卡方检验 p > 0.05），实验期间每日检查关键维度（渠道、设备、新老用户）的分布同质性。',
        expectedOutcome: '类似辛普森悖论被自动拦截，假阳性结论从约 15% 降至 5% 以下。',
        owner: '数据团队'
      },
      {
        strategy: '建立投放与产品实验的协同机制',
        action: '投放团队的渠道策略调整（预算 ±20% 或新素材上线）需提前 3 天同步给数据团队，正在进行的实验自动暂停或标记污染。',
        expectedOutcome: '减少跨部门变量污染，实验有效性提升。',
        owner: '运营 + 数据团队'
      }
    ],
    businessOutcome: '本次实验未上线节省了潜在的回滚成本和数据修复工作。3 个月内基于新机制的 A/B 实验共 12 个，其中 2 个被 SRM 自动拦截、1 个被同质性检查标记为污染数据，避免了至少 2 次错误决策。',
    reflection: '复用边界：A/B 实验适用于"可分流、可量化、有清晰单一目标指标"的场景。不适用于：(1) 极低频高客单业务（实验跑不出量）；(2) 强网络效应业务（实验组之间会互相影响，违反 SUTVA 假设）；(3) 短期与长期效应矛盾的场景（如收益类实验需要看 LTV）。\\n失败教训：本次实验最大的教训是"显著性不等于真实增益"。p 值只回答"差异是否随机"，不回答"差异是否由实验本身导致"。在因果上一定要排除外部混淆。\\n下一步进阶：(1) 引入 CUPED（用历史数据做预测残差）减小方差，提升实验灵敏度；(2) 学习互斥实验组与正交实验组的设计，避免多个实验互相污染。'
  },

  {
    id: 'c-cohort-05',
    title: '同期群分析：找出哪一批用户在第几周开始流失',
    category: '基础模型',
    subcategory: '留存分析',
    industry: '生鲜电商',
    difficulty: '入门',
    tags: ['同期群分析', '留存矩阵', '复购率', '生命周期'],
    prerequisites: ['留存率与复购率的区别', '日期函数的基本用法', '透视表（pivot）思维'],
    summary: '某生鲜电商 90 天复购率从 38% 降至 26%。用同期群分析（按"首单月份"分组追踪后续每月复购率）发现：2024 年 1 月之后注册的用户，第 30 天留存率从 32% 跌至 18%，是 2023 年 12 月之前用户的一半。结合 1 月上线的"自动续单"产品改版分析，发现新机制反而让用户在第 30 天集中收到大额账单产生抗拒。调整续单提醒节奏后，新增用户第 30 天留存率回升至 28%。',
    background: '某生鲜电商运营 3 年，2024 年 1 月起大盘 90 天复购率持续下滑，从 38% 降至 26%。常规分析（看大盘指标）无法定位是哪一批用户、在哪个时点开始流失。\\n业务方需要回答两个问题：(1) 是新用户质量下降还是老用户流失加速？(2) 流失发生在生命周期的第几周？\\n数据条件：用户注册时间、每次支付时间、订单金额、品类等基础宽表。',
    fields: [
      { name: 'user_id', type: 'string', description: '用户唯一标识', example: 'U_20240118_002' },
      { name: 'first_pay_date', type: 'date', description: '首次成功支付日期，作为同期群的分组依据', example: '2024-01-18' },
      { name: 'pay_date', type: 'date', description: '本次支付日期', example: '2024-02-22' },
      { name: 'days_since_first', type: 'int', description: '本次支付距离首单的天数，用于按生命周期对齐', example: '35' },
      { name: 'pay_amount', type: 'decimal', description: '本次支付金额', example: '128.50' }
    ],
    sqlSketch: '-- 构造同期群留存矩阵：行=首单月份，列=生命周期周数\\nWITH base AS (\\n  SELECT user_id,\\n         DATE_TRUNC(\\'month\\', MIN(pay_date)) AS cohort_month,\\n         pay_date\\n  FROM orders\\n  WHERE pay_date >= \\'2023-09-01\\'\\n  GROUP BY user_id, pay_date\\n),\\nlifecycle AS (\\n  SELECT b.user_id, b.cohort_month,\\n         FLOOR(DATEDIFF(b.pay_date, c.first_date) / 7) AS week_num\\n  FROM base b\\n  JOIN (SELECT user_id, MIN(pay_date) AS first_date FROM orders GROUP BY user_id) c\\n    ON b.user_id = c.user_id\\n)\\nSELECT cohort_month,\\n       COUNT(DISTINCT user_id) AS cohort_size,\\n       SUM(CASE WHEN week_num = 1 THEN 1 ELSE 0 END) AS w1_active,\\n       SUM(CASE WHEN week_num = 4 THEN 1 ELSE 0 END) AS w4_active,\\n       SUM(CASE WHEN week_num = 8 THEN 1 ELSE 0 END) AS w8_active\\nFROM lifecycle\\nGROUP BY cohort_month;',
    analysisProcess: '数据准备：取 2023 年 9 月至 2024 年 4 月共 8 个月的支付数据，按用户首单月份分组（cohort），追踪每个 cohort 在生命周期第 1-12 周的复购率。剔除企业账号、批发用户（约 0.8%）。\\n构建留存矩阵：纵轴 8 个月份 cohort，横轴生命周期 12 周，每格填该 cohort 在对应周的活跃用户数 / cohort_size。得到 8×12 的矩阵。\\n横向对比定位异常：2023-09 至 2023-12 cohort 第 4 周（约第 30 天）留存率稳定在 30%-34%。2024-01 cohort 第 4 周留存率 22%，2024-02 进一步降至 19%，2024-03 为 18%。**新用户第 30 天留存率半年内腰斩，是大盘复购率下滑的直接原因。** 老用户群体的留存率没有显著变化。\\n纵向对齐排查：每个 cohort 的"第 30 天"对应不同自然日期，但留存率断崖时点都对齐在该 cohort 的第 4 周，说明触发因素是用户生命周期事件（不是某个固定自然日的外部冲击）。\\n关联事件排查：2024 年 1 月 8 日上线"自动续单"功能（首单后系统自动按上次商品 + 周期帮用户下次单，需用户主动取消）。新机制导致用户在首单后第 28-30 天首次收到自动续单的支付通知，且金额是首单的 1.2-1.5 倍（系统按"推荐补货量"计算）。用户访谈反馈"突然被扣大额钱""感觉被绑架"，集中在第 30 天爆发取消和差评。',
    coreFindings: [
      {
        finding: '复购率下滑只发生在 2024 年 1 月之后的新用户',
        evidence: '同期群矩阵显示 2023 年 12 月之前 cohort 第 30 天留存率稳定 30%-34%；2024 年 1 月起暴跌至 18%-22%。老用户群体留存率无变化。',
        implication: '不是大盘流量质量问题，是 1 月份某个新机制对新用户的负向影响。'
      },
      {
        finding: '流失节点精准对齐在第 30 天，与"自动续单"上线时间和触发节奏吻合',
        evidence: '不同 cohort 的第 30 天对应不同自然日，但跌幅都集中在该位点，与自然事件（节假日、促销等）无关。结合自动续单 28-30 天首次触发的产品逻辑可对齐。',
        implication: '产品改版的负向效应在按自然日看大盘时被掩盖了，必须用同期群按生命周期对齐才能发现。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '调整自动续单的提醒节奏与金额上限',
        action: '续单触发前 7 天和前 1 天发送两次提醒（含一键取消），金额超过首单 1.2 倍时强制等待用户主动确认。',
        expectedOutcome: '第 30 天留存率从 18% 回升至 28%+，差评率下降 50%。',
        owner: '产品 + 用户运营团队'
      },
      {
        strategy: '建立新用户生命周期看板',
        action: 'BI 平台对每个 cohort 在第 7、30、90 天的留存率自动监控，环比 -10% 触发告警。',
        expectedOutcome: '类似产品改版导致的留存断崖在 2 周内可定位，避免持续 3 个月才发现。',
        owner: '数据团队'
      },
      {
        strategy: '产品改版后增加 30 天观察期',
        action: '所有涉及计费、自动扣款、订阅的产品改版上线后 30 天内必须做新用户 cohort 留存分析，确认无负向影响才能扩量。',
        expectedOutcome: '产品改版的隐性副作用可被提前识别。',
        owner: '产品 + 数据团队'
      }
    ],
    businessOutcome: '调整后 2024 年 4 月 cohort 第 30 天留存率回升至 28%，5 月进一步达到 31%，接近原水平。整体 90 天复购率从 26% 回升至 33%。续单功能差评率从 18% 降至 7%。',
    reflection: '复用边界：同期群分析适用于"用户有清晰首次行为时间点、且后续行为可追踪"的场景（电商、SaaS、订阅服务）。不适用于：(1) 单次性消费（如机票，没有真正的"复购"）；(2) cohort_size 太小（< 200）的情况，留存率波动会很大没法读。\\n失败教训：自动续单上线时只看了短期 GMV 提升（7 天 +12%），没看 30 天 cohort 留存。短期增益掩盖了长期流失，是订阅类产品最常见的陷阱。\\n下一步进阶：(1) 把单纯的留存率扩展为"加权 GMV 留存"（考虑每个留存用户贡献的金额）；(2) 引入 LTV 预测，让产品决策能看到 6 个月 / 12 个月的影响，而不是只看 30 天。'
  },

  {
    id: 'c-abc-06',
    title: 'ABC 分类法：从 5000 个 SKU 中识别真正的 80/20',
    category: '基础模型',
    subcategory: '商品分析',
    industry: '家居用品电商',
    difficulty: '入门',
    tags: ['ABC 分类', '帕累托法则', 'SKU 管理', '库存优化'],
    prerequisites: ['累计百分比的概念', '排序与分组的 SQL', '帕累托 80/20 原则'],
    summary: '某家居电商有 5000 个 SKU，库存周转天数 95 天（行业均值 45 天），库存压资严重。用 ABC 分类法对 SKU 按销售额贡献排序，发现：A 类 380 个 SKU 贡献 78% 销售额，B 类 720 个贡献 17%，C 类 3900 个仅贡献 5%。对 C 类做精简：220 个 SKU 砍至 0 库存只接预订，580 个降级到长尾仓。3 个月后整体周转天数从 95 天降至 52 天，仓储成本下降 31%。',
    background: '某家居电商累计上架 SKU 5000 个，2024 年初财务核算发现库存周转天数从 60 天恶化至 95 天（行业均值 45 天），库存账面 4800 万，其中 1600 万属于 6 个月未动销的呆滞库存。\\n业务诉求：在不影响营收的前提下，将周转天数压回 60 天以内，释放仓储和现金流。',
    fields: [
      { name: 'sku_id', type: 'string', description: 'SKU 唯一标识', example: 'SKU_J20245' },
      { name: 'category', type: 'string', description: '商品一级类目', example: '收纳整理' },
      { name: 'sales_amount_180d', type: 'decimal', description: '近 180 天销售额', example: '1268000.00' },
      { name: 'stock_qty', type: 'int', description: '当前库存数量', example: '380' },
      { name: 'last_sale_date', type: 'date', description: '最近一次售出日期', example: '2024-04-22' }
    ],
    sqlSketch: '-- ABC 分类：按销售额降序，计算累计占比\\nWITH ranked AS (\\n  SELECT sku_id, category, sales_amount_180d,\\n         SUM(sales_amount_180d) OVER ()                                AS total_sales,\\n         SUM(sales_amount_180d) OVER (ORDER BY sales_amount_180d DESC) AS cum_sales\\n  FROM sku_summary\\n  WHERE sales_amount_180d IS NOT NULL\\n)\\nSELECT sku_id, category, sales_amount_180d,\\n       cum_sales / total_sales AS cum_pct,\\n       CASE\\n         WHEN cum_sales / total_sales <= 0.80 THEN \\'A\\'\\n         WHEN cum_sales / total_sales <= 0.95 THEN \\'B\\'\\n         ELSE \\'C\\'\\n       END AS abc_class\\nFROM ranked\\nORDER BY sales_amount_180d DESC;',
    analysisProcess: '数据准备：取近 180 天有销售记录的 4980 个 SKU（剔除新上架 < 30 天和已下架，保留 4710 个）。每个 SKU 取销售额、订单数、库存数量、最近售出日期、所属品类。\\nABC 分类：按 180 天销售额降序排列，计算累计占比。累计 ≤ 80% 划为 A 类，80%-95% 为 B 类，> 95% 为 C 类。结果：A 类 380 个（占 SKU 数 8.1%、销售额 78%），B 类 720 个（占 15.3%、17%），C 类 3610 个（占 76.6%、5%）。基本符合帕累托 80/20 法则。\\nC 类细分：3610 个 C 类 SKU 中，220 个近 90 天 0 销售（纯库存呆滞），580 个销售额 < 1000 元/180 天（极低周转），其余 2810 个销售额 1000-5000 元/180 天（低但可接受）。结合库存数据交叉看：呆滞 220 个占用 480 万库存（占总库存 10%），低周转 580 个占用 720 万（15%），合计 1200 万。\\n业务可行性验证：调取 220 个呆滞 SKU 的退换货率、品类、关联订单（看是否是其他商品的搭配品）。其中 38 个虽然 0 销售但是 A 类商品的核心配件（如灯具底座配套的灯泡），不能砍；其余 182 个无业务依赖，可以砍至 0 库存只接预订。',
    coreFindings: [
      {
        finding: '8% 的 SKU 贡献了 78% 的销售额（标准帕累托）',
        evidence: 'ABC 分类显示 A 类 380 个 SKU（8.1%）贡献销售额 78%，C 类 3610 个 SKU（76.6%）仅贡献 5%。',
        implication: '资源应优先给 A 类（库存深度、首页位、客服优先级），C 类不应该和 A 类享受同等待遇。'
      },
      {
        finding: 'C 类中 220 个 SKU 是纯呆滞库存，占用 480 万资金',
        evidence: '220 个 SKU 近 90 天 0 销售但仍有库存，平均每个 SKU 占资 2.2 万。',
        implication: '呆滞库存不仅占用现金，还产生持续仓储费。识别后需要明确处理动作（清仓、退厂、报废）。'
      },
      {
        finding: '38 个 0 销售 SKU 是 A 类商品的核心配件，不能砍',
        evidence: '关联订单分析显示这些 SKU 在 60% 以上的订单中作为配套品出现，砍掉会影响 A 类销售。',
        implication: 'ABC 分类要结合业务关联性看，不能只看单 SKU 的销售额。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '182 个无关联呆滞 SKU 转预订模式',
        action: '清仓销售（折扣 30%-50%），出清后库存归 0，前台保留可下单但标注"7 天发货"。',
        expectedOutcome: '释放 360 万现金流，节省年仓储费约 18 万。',
        owner: '商品 + 仓储团队'
      },
      {
        strategy: 'B/C 类 SKU 库存深度调整',
        action: 'B 类备货从 60 天降至 30 天，C 类（除呆滞）从 30 天降至 15 天。A 类备货深度保持 45 天。',
        expectedOutcome: '整体周转天数从 95 天降至 55 天左右，缺货率仅小幅上升 1-2 个百分点。',
        owner: '采购 + 仓储团队'
      },
      {
        strategy: 'ABC 分类自动化与按月更新',
        action: '商品中台每月跑一次 ABC 重分类，将变化（A→B、B→A 等）推送给商品和采购团队。',
        expectedOutcome: '采购计划与商品热度对齐，避免下一波呆滞累积。',
        owner: '数据 + 商品团队'
      }
    ],
    businessOutcome: '3 个月后整体周转天数从 95 天降至 52 天（接近行业均值），库存账面从 4800 万降至 3300 万，释放现金流 1500 万。仓储成本下降 31%。营收未受显著影响（同比 -1.8%，主要来自呆滞品出清后的下架商品本身就在自然衰退）。',
    reflection: '复用边界：ABC 分类法适用于"商品/客户/项目数量较多、贡献分布不均"的场景，包括 SKU、客户、供应商、广告 keyword 等。不适用于：(1) 数量很少（< 50）的场景，分类意义不大；(2) 商品有强搭配/主次关系（如套装），需要先做商品聚类再 ABC。\\n失败教训：第一版直接砍掉了 220 个呆滞 SKU，结果发现 38 个是关键配件，导致 A 类商品的差评增加。后续所有 SKU 砍单决策必须经过"关联订单分析"二次校验。\\n下一步进阶：(1) 把 ABC 升级为 ABC × XYZ 双维分类，X/Y/Z 衡量销售稳定性（用销售额变异系数 CV），得到 9 宫格分类，能更精细指导库存策略；(2) 引入"商品生命周期阶段"作为第三维度，区分新品爬坡期与成熟期衰退期，避免误杀新品。'
  }
];`

content = content.substring(0, exportIndex) + newCaseStudies;
fs.writeFileSync('src/data/cases.ts', content);
console.log('Successfully updated src/data/cases.ts');
