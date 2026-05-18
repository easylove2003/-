export interface ChartConfig {
  chartId: string;
  chartName: string;
  chartType: 'grouped-bar' | 'dual-line' | 'dual-pie' | 'waterfall' | 'area';
  beforeAfter?: boolean;
  chartDescription: string;
  dimensions?: string[];
  beforeData?: number[];
  afterData?: number[];
  unit?: string[];
  improvement?: string[];
  xAxis?: string;
  yAxis?: string;
  timeRange?: string;
  interventionPoint?: string;
  beforeTrend?: number[];
  afterTrend?: number[];
  baselineTrend?: number[];
  annotations?: string[];
  categories?: string[];
  beforeDistribution?: number[];
  afterDistribution?: number[];
  baseValue?: number;
  components?: { name: string; value: number; type: 'positive' | 'negative' }[];
  finalValue?: number;
}

export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  industry?: string;
  difficulty: string;
  tags?: string[];
  prerequisites?: string[];
  sqlSketch?: string;
  summary: string;
  wordCount?: number;
  readingTime?: string;
  views?: number;
  background?: string;
  businessProblem?: string;
  dataAcquisition?: string;
  rootCause?: string;
  execution?: string;
  validation?: string;
  iteration?: string;
  fields?: { name: string; type: string; description: string; example?: string }[];
  analysisProcess: string;
  coreFindings: { finding: string; evidence: string; implication: string }[];
  improvementStrategies: { strategy: string; action: string; expectedOutcome: string; owner: string }[];
  businessOutcome?: string;
  reflection?: string;
  isCustom?: boolean;
  charts?: ChartConfig[];
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'c-northstar-01',
    title: '北极星指标搭建：把"提升用户活跃"翻译成 5 层可执行 KPI',
    category: '基础模型',
    subcategory: '指标体系',
    industry: '内容电商平台',
    difficulty: '入门',
    tags: ['北极星指标', 'OSM 模型', '指标分级', 'KPI 拆解'],
    prerequisites: ['指标的定义、口径、维度三要素', 'KPI 与 OKR 的区别', '业务流程拆解的基本思路'],
    summary: '某内容电商总经理 Q3 提出"全面提升用户活跃度"，但内容团队盯 PV、运营团队盯 DAU、商业化团队看下单率，KPI 互相打架。数据团队用 OSM 模型把抽象目标拆解为 1 个北极星 + 4 个一级指标 + 12 个二级指标的金字塔，并把各部门 KPI 与北极星挂钩。3 个月后 DAU/MAU 比从 22% 提升至 31%，跨部门冲突显著减少。',
    background: '某内容电商日均 DAU 80 万，模式是"短视频种草 + 站内购买"。Q3 总经理在战略会提出"全面提升用户活跃度"，要求各部门 KPI 与该目标对齐。\n但落到执行层面，三个核心部门理解南辕北辙：内容团队认为活跃 = PV 总量，于是疯狂铺量；运营团队认为活跃 = DAU，于是发券拉拉签到；商业化团队认为活跃 = 下单率，于是减少广告位增加购物车曝光。三个方向甚至互相冲突（如商业化减广告位影响内容曝光）。\n数据团队的任务：把"活跃度"这个模糊目标，拆成全公司能共识、可分配 KPI、可监控的指标体系。要求 2 周内交付。',
    fields: [
      { name: 'user_id', type: 'string', description: '用户唯一标识', example: 'U_8830012' },
      { name: 'event_date', type: 'date', description: '事件发生日期', example: '2024-08-12' },
      { name: 'event_type', type: 'string', description: '行为类型：view/like/cart/pay 等', example: 'cart' },
      { name: 'session_duration_sec', type: 'int', description: '会话时长，用于衡量参与深度', example: '486' },
      { name: 'pay_amount', type: 'decimal', description: '当次会话内的支付金额，关联商业化指标', example: '128.50' }
    ],
    sqlSketch: '-- 北极星："周内有效互动用户数"（产生 ≥1 次点赞/收藏/加购/支付的 7 日活跃用户）\nWITH weekly AS (\n  SELECT DATE_TRUNC(\'week\', event_date) AS week_start,\n         user_id,\n         MAX(CASE WHEN event_type IN (\'like\',\'fav\',\'cart\',\'pay\') THEN 1 ELSE 0 END) AS has_engagement\n  FROM events\n  WHERE event_date >= \'2024-06-01\'\n  GROUP BY 1, 2\n)\nSELECT week_start,\n       COUNT(DISTINCT user_id)                                       AS wau,\n       COUNT(DISTINCT CASE WHEN has_engagement = 1 THEN user_id END) AS active_engaged_users,\n       active_engaged_users * 1.0 / NULLIF(wau, 0)                    AS engagement_rate\nFROM weekly\nGROUP BY 1\nORDER BY 1;',
    analysisProcess: '需求澄清：约总经理沟通 30 分钟，问出关键信息——"活跃"在他心里其实是"用户愿意持续来、不流失、且对商业化有正向贡献"。这是个混合目标，必须拆成多个具体指标来管。\nOSM 拆解：用 OSM 模型展开。Objective（业务目标）= 提升用户活跃度。Strategy（核心策略）= 提升内容质量、降低使用门槛、强化用户分层运营、提升内容到购买的转化效率。Metrics（衡量指标）= 每条策略对应的可量化指标。\n选定北极星：用 4 条选择标准（① 反映长期用户价值；② 全公司可共识；③ 不易被短期行为操纵；④ 可被多团队共同推动）筛选候选指标。淘汰 PV（短期可灌水）、DAU（不区分质量）、GMV（不直接反映活跃）。最终选定"周内有效互动用户数"作为北极星——产生过点赞/收藏/加购/支付任一行为的 7 日活跃用户数。\n金字塔搭建：北极星之下设 4 个一级指标（次日留存率、人均互动次数、内容到购物车转化率、付费用户占比），每个一级指标下挂 3 个二级指标。例如"次日留存率"下挂"新人 Day1 留存""老人月活跃天数""推送点击留存"。每个二级指标明确归口部门。\n指标对齐与试运行：与各部门 leader 逐一对齐，调整部门 KPI 权重，让每个部门的核心 KPI 都至少包含 1 个北极星金字塔上的二级指标。试运行 4 周后开第一次复盘，剔除 6 个无人关注/无法影响的指标。',
    coreFindings: [
      {
        finding: '"活跃"在不同部门的 mental model 完全不同',
        evidence: '事先访谈 12 位中层，对"活跃用户"定义出现了 8 种不同表述，6 种带重大业务后果的口径差异。',
        implication: '不是先做 SQL，而是先做语义对齐。每一个抽象业务目标都需要被翻译成可量化、可共识的指标定义。'
      },
      {
        finding: '北极星过多/过少都失败',
        evidence: '第一版我们设了 30 个二级指标希望面面俱到，结果做出的 dashboard 没人看。删减到 12 个聚焦后，部门会议引用次数提升 8 倍。',
        implication: '指标体系是给人用的，不是给系统看的。简洁度直接决定使用率。'
      },
      {
        finding: '指标必须有明确归口，否则等于没有',
        evidence: '没有归口部门的指标平均更新频率仅每 23 天一次，有归口的指标平均 4 天一次。',
        implication: '指标治理的核心是"每个数字都有一个负责人"。无主指标会迅速腐烂。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '北极星金字塔上线 + 部门 KPI 改造',
        action: '1 个北极星 + 4 个一级 + 12 个二级，每个二级指标明确写入对应部门 OKR，且每周一上午由数据团队同步至全公司北极星看板。',
        expectedOutcome: '部门间目标冲突减少 50% 以上，跨部门项目协作效率提升。',
        owner: '数据 + 各业务部门负责人'
      },
      {
        strategy: '北极星周会 + 月度健康度复盘',
        action: '每周一 15 分钟北极星例会同步指标进展；每月最后一个工作日做指标健康度复盘（看哪些指标连续 4 周无变化、是否需要替换）。',
        expectedOutcome: '指标体系保持有用而不僵化，每季度自然迭代 1-2 个二级指标。',
        owner: '数据团队'
      },
      {
        strategy: '建立指标定义 wiki',
        action: '每个指标在 wiki 上建条目，明确：业务定义、计算公式、数据源、负责人、更新频率、口径变更历史。',
        expectedOutcome: '指标二义性导致的撕扯归零，新员工 1 天内能理解全公司指标体系。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '上线 3 个月后，北极星指标 WAU 同比从 22% 提升至 31%；内容到购物车转化率从 8.2% 升至 11.5%；跨部门月度撕扯会议次数从月均 14 次降至 5 次。总经理在季度会上将该指标体系正式作为公司 OKR 的对齐基础。',
    reflection: '复用边界：北极星模型适用于"业务方向相对稳定、有多部门协作、需要长期目标对齐"的成熟产品。不适用于：(1) 早期 PMF 探索阶段（指标可能频繁变化）；(2) 单一团队、目标极简的小型业务；(3) 监管驱动型业务（如金融合规，KPI 由外部决定）。\n失败教训：第一版我们贪多堆了 30 个二级指标，3 个 dashboard 没人看。指标体系不是越全越好，是越用越好——能进入业务会议引用的才算活的指标。\n下一步进阶：(1) 从静态 KPI 升级到动态指标健康度评分（结合趋势/方差/相关性），自动识别需要重设的指标；(2) 把北极星拆解逻辑做成"指标工厂"工具，让产品/运营自助拆解新业务目标。'
  },

  {
    id: 'c-coupon-02',
    title: '优惠券真实增量测算：500 万 GMV 里到底有多少是"白送的"',
    category: '基础模型',
    subcategory: '增量测算',
    industry: '美妆个护电商',
    difficulty: '入门',
    tags: ['增量测算', '对照组', '优惠券 ROI', '反事实推断'],
    prerequisites: ['ROI 与 ROAS 的区别', '对照组的基本思路', '简单的差分计算'],
    summary: '某美妆电商运营月报"100 万元优惠券预算带来 500 万 GMV，ROI 1:5"。数据团队搭建对照组（同期未领券但消费画像相似的用户）做差分分析，发现真实增量 GMV 仅 165 万——其余 335 万属于"本来就要买的自然购买"，被券错误归功。把券预算重新分配给新客和高潜唤回客后，同等预算下真实增量 GMV +60%。',
    background: '某美妆个护电商月度优惠券预算 100 万元（包含满减、品类券、新人券、唤回券）。运营月报口径是"领券用户在 30 天内的总 GMV"，按此口径核算 ROI 长期稳定在 1:4.5 - 1:5.5，被认为是高效投放。\n但 CFO 在季度复盘提出疑问："这些用户中有多少不发券也会买？我们到底为多少\'额外购买\'付了钱？"现有的 ROI 口径无法回答。数据团队需要给出"真实增量 GMV"的测算方法，并建议预算如何重新分配。',
    fields: [
      { name: 'user_id', type: 'string', description: '用户唯一标识', example: 'U_8830012' },
      { name: 'received_coupon', type: 'bool', description: '本期是否领取了优惠券', example: 'true' },
      { name: 'used_coupon', type: 'bool', description: '本期是否实际核销了优惠券', example: 'true' },
      { name: 'gmv_30d', type: 'decimal', description: '当期（领券或对照基准）后 30 天的 GMV', example: '358.40' },
      { name: 'pay_count_180d', type: 'int', description: '过去 180 天支付订单数，用于匹配画像', example: '4' }
    ],
    sqlSketch: '-- 简单版："PSM 思路"匹配对照组并计算增量\nWITH treatment AS (\n  SELECT user_id, gmv_30d AS treated_gmv,\n         pay_count_180d, last_pay_recency_days, fav_category\n  FROM coupon_log\n  WHERE used_coupon = TRUE AND batch_id = \'2024_aug\'\n),\ncontrol AS (\n  SELECT user_id, gmv_30d AS control_gmv,\n         pay_count_180d, last_pay_recency_days, fav_category\n  FROM user_summary\n  WHERE NOT EXISTS (\n    SELECT 1 FROM coupon_log c\n    WHERE c.user_id = user_summary.user_id\n      AND c.batch_id = \'2024_aug\'\n  )\n)\nSELECT t.user_id,\n       t.treated_gmv,\n       AVG(c.control_gmv) AS expected_natural_gmv,\n       t.treated_gmv - AVG(c.control_gmv) AS incremental_gmv\nFROM treatment t\nJOIN control c\n  ON ABS(t.pay_count_180d - c.pay_count_180d) <= 1\n AND ABS(t.last_pay_recency_days - c.last_pay_recency_days) <= 7\n AND t.fav_category = c.fav_category\nGROUP BY t.user_id, t.treated_gmv;',
    analysisProcess: '数据准备：取 2024 年 8 月某次满减券活动数据。领券核销用户 12.4 万人（实验组），同期未领券的活跃用户 95.6 万人（对照池）。剔除企业账号、异常退款用户、ID 关联可疑账号约 2.1%。\n构造对照组：直接对比"领券用户 vs 全体未领券用户"会被画像差异污染（领券的本来就是高频用户）。用 PSM（倾向得分匹配）思路，按"过去 180 天支付次数±1、最近一次支付距今天数±7、偏好品类相同"三个条件做 1:5 匹配，为每个领券用户找到 5 个画像相似的"双胞胎"作为对照。匹配成功率 87%。\n计算真实增量：领券用户 30 天平均 GMV 412 元，匹配的对照组用户 30 天平均 GMV 279 元。真实增量 = 412 - 279 = 133 元/人。乘以核销人数 12.4 万 = 总真实增量约 165 万元。同期券面值消耗 100 万。真实 ROI = 1.65（远低于报告的 5）。\n分人群拆解：把领券用户按"过去 180 天 GMV"分四组。低活跃（< 100 元）人均增量 +186 元（券真正激活了沉睡）；中活跃（100-500）人均 +98 元；高活跃（500-2000）人均 +35 元；超高活跃（> 2000）人均 -12 元（这部分人本来就要买，券其实让他们买得更少了——被券面值"封顶"）。',
    coreFindings: [
      {
        finding: '报告 ROI 1:5 的真实 ROI 只有 1:1.65',
        evidence: '500 万领券用户 GMV 中，335 万属于自然购买（对照组同期消费），仅 165 万为优惠券激发的真实增量。',
        implication: '"领券用户后续消费"≠"券带来的消费"。错误的 ROI 口径会让公司持续高估营销效率，导致预算分配误判。'
      },
      {
        finding: '高活跃用户领券是"白送"',
        evidence: '过去 180 天 GMV > 2000 元的用户，领券后人均增量 -12 元（券甚至降低了消费金额，因为他们本来要买更多）。',
        implication: '不是所有用户都需要券。给高消费用户发券不仅 ROI 为负，还在白白让利。'
      },
      {
        finding: '低活跃 / 沉睡用户领券效果最好',
        evidence: '过去 180 天 GMV < 100 元的用户，领券后人均增量 +186 元，是高活跃组的 5 倍以上。',
        implication: '优惠券应该用作"唤醒工具"而非"奖励工具"。营销资源应集中在低活跃和沉睡客群。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '分层发券：取消高消费用户的无差别券',
        action: '把过去 180 天 GMV > 2000 元的用户从大盘券名单剔除，节省的 28% 预算转移给新客和沉睡客唤回。',
        expectedOutcome: '同等预算下真实增量 GMV +60% 以上。',
        owner: '用户运营 + CRM 团队'
      },
      {
        strategy: '建立"真实增量"口径并加入月报',
        action: '所有营销活动月报必须同时报告"传统 ROI"与"真实增量 ROI"两个口径，差距 > 30% 时要求复盘。',
        expectedOutcome: '杜绝部门间用不同口径自夸，决策基础统一。',
        owner: '数据 + 财务团队'
      },
      {
        strategy: '关键活动事前设计对照组',
        action: '所有 50 万元以上预算的营销活动，事前必须随机抽取 5%-10% 用户作为"holdout 对照组"（不发券但记录消费），用于事后真实增量测算。',
        expectedOutcome: '增量测算精度大幅提升，从匹配法升级为实验法。',
        owner: '运营 + 数据团队'
      }
    ],
    businessOutcome: '新口径上线后第一个完整月度，营销预算未变（仍为 100 万），但真实增量 GMV 从 165 万提升至 268 万。沉睡客群唤回率从 4% 升至 9%。CFO 在 Q4 季度会上要求所有营销报告都引入真实增量口径。',
    reflection: '复用边界：本方法适用于"有大量未投放用户作为天然对照池、画像数据较丰富"的场景。不适用于：(1) 全量投放（没人没领券，无对照组）；(2) 用户画像稀疏的早期产品；(3) 强网络效应业务（对照组用户也会被领券用户的行为间接影响）。\n失败教训：第一版仅按"过去 30 天消费"单维度匹配，结果增量被高估约 40%（没控制品类偏好），把美妆品类的领券用户和零食品类的非领券用户匹配在了一起。匹配维度的覆盖完整性比方法本身更重要。\n下一步进阶：(1) 从 PSM 升级到 DiD（双重差分），同时控制时间趋势；(2) 引入 Uplift Model（增效模型），不仅算"哪些人增量大"，还能预测"如果给某用户发券，他的增量是多少"，实现更精细的人群圈选。'
  },

  {
    id: 'c-complaint-03',
    title: '客诉根因分析：5000 条文本投诉里的 80/20',
    category: '基础模型',
    subcategory: '根因分析',
    industry: '生鲜电商',
    difficulty: '入门',
    tags: ['客诉分析', '关键词聚类', '帕累托', '文本数据'],
    prerequisites: ['帕累托 80/20 法则', 'SQL 模糊匹配 LIKE 用法', '简单的字符串处理'],
    summary: '某生鲜电商月均 5000 条客诉，运营团队人工分类效率低且抓不到重点。数据团队用关键词词典 + 帕累托分析的轻量方法，把客诉分成 4 个一级类目 12 个二级类目，发现 73% 的客诉来自 5 个 SKU 和 3 个仓库。针对性整改后月均客诉降至 2800 条，复购率提升 3.2 个百分点。',
    background: '某生鲜电商月均订单 80 万，客诉 5000 条左右（投诉率约 0.6%）。客服团队每条人工打标签，但标签体系混乱（30+ 个标签，部分含义重叠），运营每月开复盘会拿到的"投诉 Top 10"每次都不一样，没法支持改进。\nVP 客服提出诉求：(1) 建立稳定可用的客诉分类体系；(2) 找出真正高频高影响的根因；(3) 关联到具体 SKU/仓库/链路环节，让责任落到部门。',
    fields: [
      { name: 'complaint_id', type: 'string', description: '客诉单唯一 ID', example: 'CMP_240812_0345' },
      { name: 'submit_at', type: 'datetime', description: '客诉提交时间', example: '2024-08-12 14:23:11' },
      { name: 'content_text', type: 'text', description: '用户填写的客诉描述（自由文本）', example: '草莓收到的时候已经发霉了一半' },
      { name: 'related_sku_id', type: 'string', description: '关联订单的主要 SKU', example: 'SKU_F2245' },
      { name: 'warehouse_id', type: 'string', description: '出库仓库', example: 'WH_HZ_03' }
    ],
    sqlSketch: '-- 用关键词词典做一级 + 二级分类\nWITH classified AS (\n  SELECT complaint_id, related_sku_id, warehouse_id,\n         CASE\n           WHEN content_text LIKE \'%发霉%\' OR content_text LIKE \'%变质%\' OR content_text LIKE \'%臭%\'  THEN \'品质_腐败\'\n           WHEN content_text LIKE \'%破损%\' OR content_text LIKE \'%压碎%\' OR content_text LIKE \'%漏%\'    THEN \'品质_破损\'\n           WHEN content_text LIKE \'%晚%\'   OR content_text LIKE \'%延迟%\' OR content_text LIKE \'%没到%\' THEN \'物流_延迟\'\n           WHEN content_text LIKE \'%少%\'   OR content_text LIKE \'%缺%\'   OR content_text LIKE \'%漏发%\' THEN \'物流_少件\'\n           WHEN content_text LIKE \'%态度%\' OR content_text LIKE \'%客服%\'                              THEN \'服务_态度\'\n           WHEN content_text LIKE \'%退款%\' OR content_text LIKE \'%售后%\'                              THEN \'服务_售后\'\n           ELSE \'其他\'\n         END AS sub_category\n  FROM complaints WHERE submit_at >= \'2024-08-01\' AND submit_at < \'2024-09-01\'\n)\nSELECT sub_category,\n       related_sku_id,\n       warehouse_id,\n       COUNT(*) AS complaint_cnt\nFROM classified\nGROUP BY 1, 2, 3\nORDER BY complaint_cnt DESC;',
    analysisProcess: '数据准备：取 8 月共 5012 条客诉。先随机抽 200 条人工标注，整理出 4 个一级类目（品质、物流、服务、其他）+ 12 个二级类目，建立关键词词典（每个二级类目 5-15 个高频关键词）。\n关键词分类与抽检：用 SQL CASE WHEN + LIKE 跑词典分类，覆盖 89% 的客诉（其余 11% 落入"其他"）。再随机抽 100 条机器分类结果人工抽检，准确率 84%（足够用，比人工不一致性强）。\n二级帕累托：分析二级类目的频次分布，发现 12 个二级类目中"品质_腐败""物流_延迟""品质_破损"三个类目合计占 67% 客诉量。继续做"二级类目 × SKU"和"二级类目 × 仓库"交叉。\n三级关联：发现 73% 的"品质_腐败"客诉集中在 5 个 SKU（占总 SKU 数 0.6%），都是"水果生鲜叶菜"高敏感品类；82% 的"物流_延迟"客诉集中在 3 个仓库（共 11 仓），其中 2 个是新启用的偏远仓。问题不是大盘性的，而是结构性的——少数节点在持续拖累。\n业务影响测算：把客诉用户与未客诉用户的 30 天复购率对比，客诉用户复购率 18%（未客诉 41%），且 NPS 评分下降 47 分。客诉的真实成本不是赔付金额，是客户流失。',
    coreFindings: [
      {
        finding: '73% 的品质客诉集中在 0.6% 的 SKU',
        evidence: '5 个高敏感生鲜 SKU（草莓、樱桃、空心菜、生菜、罗勒）贡献了 73% 的"品质_腐败"客诉。',
        implication: '不是大盘品控问题，是结构性问题。靠"全局加强品控"不解决问题，必须针对这 5 个 SKU 单独做策略。'
      },
      {
        finding: '82% 的物流延迟客诉集中在 3 个仓',
        evidence: '11 个仓库中，2 个新启用的偏远仓 + 1 个负载严重超标的中心仓贡献了 82% 物流延迟客诉。',
        implication: '物流问题是仓库容量与履约半径的问题，不是物流商的问题。整改路径明确。'
      },
      {
        finding: '客诉用户的真实成本是 LTV 损失',
        evidence: '客诉用户 30 天复购率 18%，未客诉用户 41%，差距 23 个百分点。按平均客单价 90 元计算，每条未妥善处理的客诉相当于损失 LTV 约 230 元，远超平均赔付金额 35 元。',
        implication: '客诉不是成本中心而是用户挽留点。投入更高质量的客诉处理资源，长期 ROI 反而更高。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '5 个高敏感 SKU：保鲜技术 + 包装升级 + 仓内冷链严控',
        action: '商品团队对这 5 个 SKU 升级真空冷链包装，仓内分拣温区从常温调至 4°C，运输全程冷链。同时建立单 SKU 客诉日监控看板。',
        expectedOutcome: '5 个 SKU 的客诉率从 6.8% 降至 2% 以下。',
        owner: '商品 + 仓储团队'
      },
      {
        strategy: '3 个问题仓：扩容 + 增加分拣班次',
        action: '2 个偏远仓增加 2 班次（夜班分拣），中心仓增加 30% 分拣工位，履约时长 SLA 从 36 小时压缩至 24 小时。',
        expectedOutcome: '物流延迟客诉减少 60%。',
        owner: '仓储团队'
      },
      {
        strategy: '建立客诉自动分类与日报机制',
        action: '关键词词典 + 自动分类逻辑落地到客服系统，每日早上 9 点输出 Top 10 SKU/仓库的客诉看板，推送给商品和仓储 leader。',
        expectedOutcome: '客诉问题从月度复盘变为日级响应，问题平均解决时长缩短 70%。',
        owner: '客服 + 数据团队'
      },
      {
        strategy: '高客诉用户主动召回',
        action: '客诉处理完毕后 7 天内由客服主动外呼回访，提供专属优惠券，关注复购情况；连续 2 次客诉的用户标记为"高敏感客户"，进入 VIP 客服通道。',
        expectedOutcome: '客诉用户复购率从 18% 提升至 30%+。',
        owner: '客服 + 用户运营'
      }
    ],
    businessOutcome: '整改 3 个月后，月均客诉从 5012 条降至 2837 条（-43%），客诉用户复购率从 18% 升至 32%。整体 30 天复购率从 35.4% 升至 38.6%（+3.2pp）。NPS 提升 9 分。',
    reflection: '复用边界：关键词词典法适用于"客诉文本相对短、模式相对固定、问题类目数量在 30 个以内"的场景。不适用于：(1) 客诉文本极长且分散（如医疗投诉，需要专业 NLP）；(2) 类目数量上百的复杂业务（用 LIKE 维护成本爆炸）；(3) 跨语言客诉。\n失败教训：第一版试图用情感分析做分类（按 polarity 打分），但发现客诉本质都是负面，情感分析没区分度。后改回主题分类才有用。技术选型必须服务业务问题，不要为了"高级"而高级。\n下一步进阶：(1) 用 sentence embedding（如 BGE 模型）做向量化 + 聚类，自动发现新的客诉类目；(2) 接入 LLM 做客诉摘要 + 自动归因（"这条客诉关联 SKU/仓库/链路环节是什么"），让分析师从打标签的工作中解放出来。'
  },

  {
    id: 'c-elasticity-04',
    title: '价格弹性测算：要不要给某品类涨价 5% 的决策依据',
    category: '进阶方法',
    subcategory: '定价分析',
    industry: '宠物食品电商',
    difficulty: '进阶',
    tags: ['价格弹性', '弹性系数', '调价决策', '回归分析'],
    prerequisites: ['弹性系数公式 ε = (ΔQ/Q) / (ΔP/P)', '相关性 vs 因果性的区别', '基础回归分析思路'],
    summary: '某宠物食品电商主推猫粮品类毛利率持续走低，业务方提议全线涨价 5%。数据团队用过去 18 个月的历史调价数据计算品类内不同 SKU 的价格弹性系数，发现品类整体弹性 -1.18（销量对价格敏感），但分 SKU 看差异极大：高端进口粮弹性 -0.4（不敏感，可涨价），平价主粮弹性 -2.1（涨价销量崩塌）。最终采取分层调价策略，整体毛利率提升 4.2 个百分点同时销量仅下滑 1.8%。',
    background: '某宠物食品电商猫粮品类年销售额 2.4 亿，毛利率从 2 年前的 28% 持续下滑到当前 19%。下滑主因：上游进口粮成本上涨 + 平台促销补贴加码 + 竞品价格战。\n2024 年 9 月业务方提出"全线涨价 5%"提案，预期增收 1200 万。但 CEO 担心销量崩塌，要求数据团队基于历史数据测算"涨价后的真实销量影响"，并给出可执行的调价方案。',
    fields: [
      { name: 'sku_id', type: 'string', description: 'SKU 唯一标识', example: 'SKU_CF_2034' },
      { name: 'sale_date', type: 'date', description: '销售日期', example: '2024-09-12' },
      { name: 'price', type: 'decimal', description: '当日实际售价（剔除促销后）', example: '128.00' },
      { name: 'sales_qty', type: 'int', description: '当日销售数量', example: '482' },
      { name: 'competitor_price', type: 'decimal', description: '同期主要竞品该品类同档位均价', example: '125.00' }
    ],
    sqlSketch: '-- 价格弹性回归（双对数模型）：log(Q) = α + ε·log(P) + β·log(P_competitor) + γ·season\nWITH daily AS (\n  SELECT sku_id, sale_date,\n         LN(sales_qty)         AS ln_q,\n         LN(price)             AS ln_p,\n         LN(competitor_price)  AS ln_pc,\n         EXTRACT(DOW FROM sale_date) AS dow,\n         EXTRACT(MONTH FROM sale_date) AS mon\n  FROM sku_daily\n  WHERE sale_date BETWEEN \'2023-04-01\' AND \'2024-09-30\'\n    AND sales_qty > 0 AND price > 0\n)\n-- 在 Python/R 里跑回归：lm(ln_q ~ ln_p + ln_pc + factor(dow) + factor(mon))，ε 的系数即弹性\nSELECT * FROM daily;',
    analysisProcess: '数据准备：取过去 18 个月（2023-04 至 2024-09）猫粮品类 47 个核心 SKU 的日级销售数据，共 25.7 万条记录。剔除大促周期数据（双 11、618、年货节，价格扰动太大）和库存断货日（销量被供应限制，不反映需求）。剩余 18.3 万条用于建模。\n弹性建模：用双对数回归 ln(Q) = α + ε·ln(P) + β·ln(P_competitor) + γ·季节项。系数 ε 即价格弹性。先按品类整体跑一次得到 -1.18（销量弹性弹），然后按 SKU 单独跑，得到每个 SKU 的弹性系数。\nSKU 弹性分层：47 个 SKU 按弹性系数分组——高弹性组（ε < -1.5，22 个 SKU，多为平价主粮）：销量对价格极敏感，涨价 1% 销量降 1.5%+；中弹性（-1.5 ≤ ε < -0.8，14 个）：价格敏感度中等；低弹性（-0.8 ≤ ε < -0.3，11 个 SKU，多为高端进口/处方粮）：销量对价格不敏感，涨价空间大。\n竞品交叉验证：观察过去 6 次重大调价事件（涨价或降价 ≥ 3%）。当竞品同期同向调整时，自身弹性绝对值降低 50%-70%（说明用户不会跑去竞品）。当竞品反向调整时，弹性绝对值翻倍（用户会立刻流失）。这意味着调价时机比调价幅度更关键。\n调价方案模拟：用每个 SKU 的弹性系数模拟"涨 3%/5%/7%"对应的销量与营收变化。全线涨 5% 的预测结果：营收 +0.8%（远低于 +5% 目标），销量 -4.1%，毛利率 +2.5pp。分层调价方案预测：低弹性 SKU 涨 7%、中弹性涨 3%、高弹性不动，营收 +3.2%，销量仅 -1.5%，毛利率 +4.2pp。',
    coreFindings: [
      {
        finding: '同品类内 SKU 弹性差异巨大（-0.4 到 -2.1）',
        evidence: '47 个 SKU 弹性系数分布跨越 5 倍以上，高端进口粮 -0.4 vs 平价主粮 -2.1。',
        implication: '"全线涨价"是粗糙策略。任何品类决策必须做 SKU 级弹性测算，否则错误施政会同时损失高端和大众市场。'
      },
      {
        finding: '竞品同步性是弹性的关键调节变量',
        evidence: '历史 6 次调价事件中，竞品同向调整时自身弹性绝对值降低 50%-70%，反向调整时翻倍。',
        implication: '调价时机比调价幅度更关键。等竞品先动再跟，比抢先动减少一半的销量损失。'
      },
      {
        finding: '业务方提案的全线涨 5% 实际营收仅 +0.8%',
        evidence: '弹性模型模拟显示，平价主粮（占品类销量 60%）销量崩塌 10%，几乎抵消高端粮涨价收益。',
        implication: '没有数据支持的定价决策很可能是"看似激进、实则保守"的反向行为。模型测算是定价决策的护栏。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '采用 SKU 级分层调价方案',
        action: '低弹性 SKU（11 个高端进口粮）涨价 7%；中弹性 SKU（14 个）涨价 3%；高弹性 SKU（22 个平价主粮）维持不变或微降 1%。',
        expectedOutcome: '整体毛利率提升 4.2 个百分点，销量降幅控制在 1.8% 以内，年化营收增加 800 万左右。',
        owner: '商品 + 商业分析团队'
      },
      {
        strategy: '建立竞品价格雷达 + 跟随策略',
        action: '每日抓取主要竞品（3 家）的同档位 SKU 价格，竞品涨价 ≥ 2% 持续 7 天后自动触发跟价审批，无需重新测算弹性。',
        expectedOutcome: '调价响应速度从 30 天缩短至 1 周，弹性损失最小化。',
        owner: '商业分析 + 数据团队'
      },
      {
        strategy: '弹性看板月度更新 + 异常 SKU 预警',
        action: '商品中台每月跑一次全量 SKU 弹性测算，弹性变化超过 ±0.5 的 SKU 自动标记，进入定价复盘清单。',
        expectedOutcome: '弹性变化（如新竞品入场、用户偏好迁移）能被快速发现，避免基于过时数据做决策。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '分层调价方案上线 6 个月后，猫粮品类毛利率从 19% 升至 23.2%（+4.2pp），销量同比 -1.8%（远好于全线涨价方案的预测 -4.1%），年化营收增加 760 万。该方法被复用到狗粮、宠物零食两个品类，整体宠物食品毛利率提升 3.5pp。',
    reflection: '复用边界：双对数弹性模型适用于"价格变化频繁、有较多历史数据点（18 个月以上）、销量与价格之间无极端非线性关系"的成熟品类。不适用于：(1) 新品（数据点不够）；(2) 价格策略很少变化的品类（共线性严重）；(3) 强奢侈品/低敏感的品类（弹性接近 0，模型不显著）。\n失败教训：第一版回归没有控制大促周期，把双 11 期间的"低价 + 高销量"数据混入，得到了错误的弹性系数 -3.2（虚高），险些劝退业务方涨价。所有自然实验性质的因果分析都必须严格清洗外生干扰。\n下一步进阶：(1) 引入 GLS（广义最小二乘）处理时间序列自相关问题；(2) 建立分人群弹性模型（高净值用户对价格不敏感，价格敏感用户对促销极敏感），实现千人千价的精准定价。'
  },

  {
    id: 'c-prelaunch-05',
    title: '大促蓄水池分析：双 11 爆发期前的 GMV 缺口预警',
    category: '进阶方法',
    subcategory: '大促分析',
    industry: '家居用品电商',
    difficulty: '进阶',
    tags: ['大促分析', '蓄水池模型', '反事实预测', '加购转化'],
    prerequisites: ['加购率与转化率的区别', '同期对比的基本方法', '简单的预测建模思路'],
    summary: '某家居电商双 11 蓄水期投了 800 万广告获取 240 万加购单，业务团队预期爆发期 GMV 1.2 亿。数据团队结合过去 3 年大促数据建立蓄水池转化模型，发现今年蓄水量 vs 历史同期低 18%，且高客单蓄水占比下滑，预测真实爆发期 GMV 仅 9800 万（缺口 17%）。预警上报后追加蓄水投入 + 高客单引流，最终 GMV 1.21 亿达成 102% 目标。',
    background: '某家居用品电商连续 3 年参加双 11，蓄水期（10/15-10/31）+ 爆发期（11/1-11/11）模式成熟。今年大促 GMV 目标 1.2 亿，蓄水期投入广告预算 800 万，到 10/28 累计加购单 240 万、加购金额 4.8 亿。\n业务团队按"加购金额 × 历史转化率 25%"心算预期爆发期 GMV 约 1.2 亿，认为目标可达。但数据团队从蓄水量同比 -18%、品类结构变化等信号判断目标存在缺口风险，需要在 10/30 前给出量化预测，决定是否追加蓄水投入。',
    fields: [
      { name: 'user_id', type: 'string', description: '用户唯一标识', example: 'U_8830012' },
      { name: 'add_cart_at', type: 'datetime', description: '加购时间', example: '2024-10-22 21:14:33' },
      { name: 'sku_id', type: 'string', description: '加购 SKU', example: 'SKU_HM_2245' },
      { name: 'cart_amount', type: 'decimal', description: '加购金额（数量×单价）', example: '459.00' },
      { name: 'campaign_year', type: 'int', description: '大促年份，用于历史同期对比', example: '2024' }
    ],
    sqlSketch: '-- 蓄水池规模 + 历史同期对比 + 转化率预测\nWITH this_year AS (\n  SELECT user_id, SUM(cart_amount) AS cart_amt,\n         CASE WHEN SUM(cart_amount) >= 1000 THEN \'high\' \n              WHEN SUM(cart_amount) >= 300  THEN \'mid\' ELSE \'low\' END AS cart_tier\n  FROM cart_log\n  WHERE add_cart_at BETWEEN \'2024-10-15\' AND \'2024-10-28\'\n  GROUP BY user_id\n),\nlast_year AS (\n  SELECT cart_tier,\n         COUNT(DISTINCT user_id)              AS uv,\n         SUM(cart_amt)                        AS total_cart,\n         SUM(actual_paid_amt)                 AS total_paid,  -- 该 cohort 在爆发期实际支付\n         SUM(actual_paid_amt) / SUM(cart_amt) AS conv_rate\n  FROM cart_log_2023_with_payment\n  GROUP BY cart_tier\n)\nSELECT t.cart_tier,\n       SUM(t.cart_amt)                          AS this_year_cart,\n       l.conv_rate                              AS hist_conv_rate,\n       SUM(t.cart_amt) * l.conv_rate            AS predicted_gmv\nFROM this_year t\nJOIN last_year l ON t.cart_tier = l.cart_tier\nGROUP BY 1, l.conv_rate;',
    analysisProcess: '数据准备：取 2021、2022、2023 三年的蓄水期与爆发期完整数据，剔除受疫情扰动的部分。每个年度按"用户加购金额"分三档：高客单（≥1000）/ 中客单（300-1000）/ 低客单（<300），分别计算"加购金额 → 爆发期实际支付金额"的转化率。\n历史规律识别：高客单层转化率稳定在 35%-38%（用户决策周期长但意愿明确）；中客单层 22%-26%；低客单层 10%-13%（多为冲动加购，会被替换或忘记）。整体转化率受三档比例影响，三档比例稳定时整体转化率 24%-26%。\n本年蓄水量诊断：截至 10/28，今年加购金额 4.8 亿，对比 2023 年同期 5.85 亿，同比 -18%。更关键的是层级结构：今年高客单占比 22%（去年同期 31%），中客单 41%（35%），低客单 37%（34%）。**结构向低客单倾斜**——可能是流量结构变化（拉新偏多但价值低）或选品下沉。\n爆发期 GMV 预测：用今年三档加购金额 × 各档历史转化率。高客单 1.06 亿 × 36% = 3820 万；中客单 1.97 亿 × 24% = 4730 万；低客单 1.78 亿 × 12% = 2140 万。合计预测爆发期 GMV 1.07 亿（目标 1.2 亿，缺口 13%）。再叠加结构性折扣（结构差时整体转化率会比加权平均还低 5%-8%），保守预测 9800 万，缺口约 17%。\n敏感度分析：要让 GMV 达标，最有效的杠杆是补充高客单蓄水（每补 1 亿高客单加购可贡献 GMV 3600 万）。继续在大众品类拉低客单加购对达标贡献极小（边际产出 1200 万/亿）。',
    coreFindings: [
      {
        finding: '蓄水规模同比 -18%，结构同时恶化',
        evidence: '加购金额 4.8 亿 vs 5.85 亿（-18%），高客单占比 22% vs 31%（-9pp）。两个负向信号同时出现。',
        implication: '只看蓄水规模会错过结构问题。规模 + 结构双维度才能反映真实蓄水质量。'
      },
      {
        finding: '简单的"加购金额 × 25% 转化率"高估了 GMV',
        evidence: '业务方心算法预期 1.2 亿（4.8 亿 × 25%），但分层后预测仅 1.07 亿（结构调整）→ 9800 万（结构折扣）。',
        implication: '加权平均会掩盖结构差异。任何"乘以平均转化率"的预测都需要先做层级拆分。'
      },
      {
        finding: '高客单蓄水的边际产出是低客单的 3 倍',
        evidence: '历史数据显示高客单层转化率 36% vs 低客单 12%。补充蓄水必须聚焦高价值人群。',
        implication: '蓄水期投放策略应该按"加购金额加权 ROI"而非"加购单数 ROI"考核，否则会持续累积低质量加购。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '紧急追加高客单定向投放',
        action: '10/30起投放预算追加 150 万，定向高客单偏好用户（基于过去 12 个月单笔订单 > 500 元的用户画像），素材聚焦套装/高端品类。',
        expectedOutcome: '11/1 前补充高客单加购金额约 4000-5000 万，GMV 预测从 9800 万拉回 1.1 亿+。',
        owner: '投放 + 用户运营团队'
      },
      {
        strategy: '加购老客定向唤醒',
        action: '对已加购未支付的高客单用户（约 8 万人）发送专属客服消息 + 限时锁价券，11/1 当天 0 点针对该群体发 push。',
        expectedOutcome: '该群体爆发期转化率从 36% 提升至 45%+，贡献增量 GMV 约 800 万。',
        owner: '用户运营团队'
      },
      {
        strategy: '蓄水池预测看板上线',
        action: '将"分层加购规模 + 历史同期对比 + 爆发期 GMV 预测"做成实时看板，蓄水期每日自动刷新，差距 > 10% 触发预警。',
        expectedOutcome: '后续大促可在蓄水期早期（提前 7 天）发现缺口，干预窗口大幅前移。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '采纳预警后追加蓄水投入 + 高客单引流，最终爆发期 GMV 1.21 亿，达成 102% 目标。其中追加投放贡献约 4500 万，老客唤醒贡献约 850 万。投资回报：追加 150 万投放 + 30 万短信 = 180 万，换取相对原方案的增量 GMV 约 2300 万。',
    reflection: '复用边界：本方法适用于"大促有清晰的蓄水 + 爆发模式、有 2 年以上历史数据、加购到购买的转化逻辑稳定"的电商场景。不适用于：(1) 平铺式销售（无明显大促节点）；(2) 服务类业务（无加购环节）；(3) 大促玩法每年大改的业务（历史转化率不可参考）。\n失败教训：第一版预测没分层，直接用历史整体转化率 25%，结果偏差很大。后期复盘发现，**结构变化是大多数预测失准的根源**，永远要先看分布再算总数。\n下一步进阶：(1) 用机器学习模型（XGBoost）预测每个加购订单的转化概率，比分层平均更精细；(2) 建立"蓄水质量评分"指标（综合加购金额、用户历史 LTV、品类毛利率等），让蓄水期投放从"加购数最大化"切换到"加购质量最大化"。'
  },

  {
    id: 'c-newproduct-06',
    title: '新品爬坡预测：如何在上线 14 天判断一个新品该不该继续推',
    category: '进阶方法',
    subcategory: '新品分析',
    industry: '美妆个护电商',
    difficulty: '进阶',
    tags: ['新品分析', '爬坡曲线', '同类品对标', '早期信号'],
    prerequisites: ['累计销量与日销量的区别', '百分位数的概念', '简单的曲线拟合思路'],
    summary: '某美妆电商每月上新 200+ SKU，但商品团队靠"上线 30 天总销量"判断去留时往往已错过最佳推广窗口。数据团队建立"新品爬坡曲线 + 同类品对标"模型，把 D14 销量在同类品历史 D14 中的百分位作为去留信号。该模型识别出一款新品在 D14 处于同类品 P75 位置，及时加大流量倾斜后该新品 D90 GMV 进入类目 Top 12，避免错失。同时识别出 12% 的"明星错觉"新品（前 7 天爆但后续乏力），节省推广预算约 200 万。',
    background: '某美妆电商每月新品上架 200-300 SKU，传统流程是"上线 30 天看总销量决定去留"，但 30 天后已错过黄金推广期。商品团队的痛点：(1) 上线初期不敢判断潜力，怕错杀好品；(2) 早期销量好的不一定是真好（可能只是初期流量倾斜的虚高）；(3) 没有量化标准，全靠资深 buyer 经验。\n数据团队需要建立一套"D14 早期信号识别"模型，用上线 14 天数据预测 D90 GMV，给商品团队提供决策依据。',
    fields: [
      { name: 'sku_id', type: 'string', description: 'SKU 唯一标识', example: 'SKU_BM_2024_NEW_055' },
      { name: 'launch_date', type: 'date', description: '新品上线日期', example: '2024-09-01' },
      { name: 'days_since_launch', type: 'int', description: '距离上线天数', example: '14' },
      { name: 'daily_uv', type: 'int', description: '当日商品详情页 UV', example: '8240' },
      { name: 'daily_sales_qty', type: 'int', description: '当日销售数量', example: '142' }
    ],
    sqlSketch: '-- 计算每个新品的 D1-D14 累计销量，并对齐到同类品的历史百分位\nWITH new_sku AS (\n  SELECT sku_id, category, days_since_launch, SUM(daily_sales_qty) OVER (\n    PARTITION BY sku_id ORDER BY days_since_launch\n  ) AS cumulative_sales\n  FROM sku_daily\n  WHERE launch_date BETWEEN \'2024-09-01\' AND \'2024-09-30\'\n    AND days_since_launch <= 14\n),\nbenchmark AS (\n  SELECT category, days_since_launch,\n         PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY cumulative_sales) AS p25,\n         PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY cumulative_sales) AS p50,\n         PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY cumulative_sales) AS p75,\n         PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY cumulative_sales) AS p90\n  FROM sku_daily_history  -- 过去 24 个月同类品历史\n  WHERE days_since_launch <= 14\n  GROUP BY 1, 2\n)\nSELECT n.sku_id, n.cumulative_sales,\n       b.p25, b.p50, b.p75, b.p90,\n       CASE\n         WHEN n.cumulative_sales >= b.p75 THEN \'高潜\'\n         WHEN n.cumulative_sales >= b.p50 THEN \'达标\'\n         WHEN n.cumulative_sales >= b.p25 THEN \'观察\'\n         ELSE \'低潜\'\n       END AS signal\nFROM new_sku n\nJOIN benchmark b ON n.category = b.category AND n.days_since_launch = b.days_since_launch\nWHERE n.days_since_launch = 14;',
    analysisProcess: '历史数据沉淀：取过去 24 个月同类目（一级类目）成功上线的所有新品（约 4200 个 SKU），按品类分组，提取每个新品 D1-D90 的日级销量。剔除异常事件（大促期间上新、流量倾斜测试等），剩余 3185 个 SKU 作为基准库。\n爬坡曲线建模：每个品类拟合 D1 到 D90 的累计销量百分位曲线（P25/P50/P75/P90），形成该品类的"爬坡基准带"。同时按 D90 GMV 表现把历史新品分成"明星品（Top 10%）/优秀品（10-30%）/合格品（30-70%）/普通品（70-90%）/失败品（10%）"。\nD14 预测信号验证：用历史数据回测——D14 累计销量在同品类 P75 以上的新品，最终 D90 进入 Top 30% 的概率 71%；P50-P75 的概率 38%；P25-P50 的概率 18%；P25 以下的概率仅 6%。说明 D14 信号有较强预测力。\n"明星错觉"识别：进一步看 D7 与 D14 的对比。前 7 天爆发但 D8-D14 增速急剧下滑（D14 累计 / D7 累计 < 1.5）的新品中，有 71% 最终落入"普通品"或"失败品"。这类品多为"标题党+视觉冲击"导致的初期点击虚高，复购信号弱。需要在 D14 对这类"假爆款"亮黄灯。\n落地与运营机制：D14 当天自动跑分类，每个新品标记 4 种信号（高潜/达标/观察/低潜）+ 是否假爆款标记。商品团队按信号分配资源——高潜大力推、达标常规推、观察待复审、低潜清退或转长尾仓。',
    coreFindings: [
      {
        finding: 'D14 累计销量百分位是 D90 的强预测因子',
        evidence: 'D14 处于品类 P75 以上的新品，最终 D90 进入 Top 30% 的概率 71%；D14 落于 P25 以下的，最终成功率仅 6%。',
        implication: '14 天足够形成可靠判断信号，等到 30 天才决策已经浪费了一半的黄金推广窗口。'
      },
      {
        finding: '"明星错觉"占新品 12%，是预算浪费的主要来源',
        evidence: '前 7 天爆发但 D8-D14 增速断崖（D14/D7 < 1.5）的新品 380 个，最终 71% 沦为普通或失败品，但商品团队凭"前期数据"持续投入资源。',
        implication: '只看绝对销量会被早期流量泡沫骗。必须看销量的"持续增长性"而非"初期峰值"。'
      },
      {
        finding: '不同品类的爬坡曲线形态差异巨大',
        evidence: '彩妆类新品 D14/D90 销量比约 18%（爆发型，前期占比高），护肤类约 9%（长尾型，越往后越多）。如果用同一基线判断，会系统性误判其中一类。',
        implication: '"D14 看百分位"必须按品类做基线，跨品类比较是错的。新品决策模型一定是品类级别的。'
      }
    ],
    improvementStrategies: [
      {
        strategy: 'D14 自动信号生成 + 资源分配机制',
        action: '商品中台每天跑一次"刚到 D14 的新品"信号分类，输出当日报告给商品 leader。高潜品自动加首页位 + 开站外投放白名单；低潜品 D21 二次评估后清退。',
        expectedOutcome: '决策周期从 30 天压缩到 14 天，黄金推广期最大化利用。',
        owner: '商品 + 数据团队'
      },
      {
        strategy: '"假爆款"双指标识别 + 黄灯机制',
        action: '在 D14 报告中加入 D14/D7 比指标 < 1.5 + 复购首单转化率 < 8% 的双重判定，命中即标记假爆款，进入流量保守期。',
        expectedOutcome: '减少 12% 的假爆款资源浪费，节省年化推广预算约 200 万。',
        owner: '商品团队'
      },
      {
        strategy: '建立按品类差异化的爬坡基线库',
        action: '每个一级类目独立维护爬坡基准曲线，每季度刷新（剔除已老化的历史数据，加入新近上市数据）。',
        expectedOutcome: '类目内的判断准确率从约 70% 提升至 85%+。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '模型上线半年后：商品团队的新品决策从 30 天压缩到 14 天，单 SKU 平均推广资源利用率提升 41%；自动识别的"假爆款"避免无效推广支出约 180 万；通过早期信号识别推上首页位的高潜新品，平均 D90 GMV 比传统决策高 28%。该方法被纳入商品上新标准 SOP。',
    reflection: '复用边界：爬坡曲线对标方法适用于"新品上线频繁、有大量同类品历史数据、品类生命周期相对稳定"的成熟电商。不适用于：(1) 全新品类（无历史可对标）；(2) 极低频高客单业务（数据点不够）；(3) 政策/季节剧烈影响的品类（如保健品、应季服装，需要先做季节调整）。\n失败教训：第一版直接用一级类目做基线，发现彩妆和护肤的爬坡形态差异极大，导致护肤新品被系统性低估（前期慢）。后续每个二级类目分别建模才解决。基线粒度比模型本身更影响准确率。\n下一步进阶：(1) 引入贝叶斯更新方法，每天根据新数据动态更新预测，比固定 D14 决策更灵活；(2) 加入用户复购信号（D14 内已有复购的用户比例），单独的销量信号可能被运营拉新行为污染，复购是更稳定的"真实需求"指标。'
  },
  {
    id: 'c-aipl-flow-13',
    title: 'AIPL 人群流转分析：从认知到忠诚的 4 级漏斗诊断',
    category: '基础模型',
    subcategory: '用户分层',
    industry: '天猫美妆品牌',
    difficulty: '入门',
    tags: ['AIPL 模型', '人群流转', '阿里数据银行', '品牌资产'],
    prerequisites: ['AIPL 四个阶段定义', '漏斗模型基础', '阿里数据银行(Brand DataBank)概念'],
    summary: '某天猫美妆品牌总人群资产 1800 万，但 GMV 同比 -12% 业绩下滑。用 AIPL（认知/兴趣/购买/忠诚）四级漏斗对比同期，发现 A 层（认知）从 1000 万增至 1200 万、I 层（兴趣）从 480 万降至 380 万（-21%）。问题不在拉新而在"A→I 流转效率"。深挖发现新拉的 A 层流量 70% 来自低质信息流，与品牌目标人群不匹配。调整素材后 I 层规模 90 天回升至 510 万，GMV 同比 +8%。',
    background: '某天猫美妆品牌（中端价位，年 GMV 3.2 亿）总人群资产 1800 万（阿里数据银行口径），2024 年 Q2 GMV 同比 -12%。营销团队在 Q2 加大了信息流投放（预算 +35%）但效果不理想。\n业务方提出"是不是新客拉得太少"，但数据团队对比发现总人群资产同比 +14%，说明拉新没问题。需要用 AIPL 四级人群流转模型，定位真正的瓶颈环节。',
    fields: [
      { name: 'consumer_id', type: 'string', description: '阿里数据银行用户 ID（OneID）', example: 'ALI_8830012' },
      { name: 'aipl_stage', type: 'string', description: 'AIPL 阶段：A/I/P/L', example: 'I' },
      { name: 'enter_date', type: 'date', description: '进入当前阶段的日期', example: '2024-04-15' },
      { name: 'source_channel', type: 'string', description: '进入该阶段的来源渠道', example: 'feed_ads' },
      { name: 'last_touch_at', type: 'datetime', description: '最近一次触达时间', example: '2024-08-22 14:23:11' }
    ],
    sqlSketch: '-- AIPL 四级流转率对比\nWITH aipl_now AS (\n  SELECT aipl_stage, COUNT(DISTINCT consumer_id) AS cnt\n  FROM databank_snapshot WHERE snap_date = \'2024-08-31\'\n  GROUP BY aipl_stage\n),\naipl_prev AS (\n  SELECT aipl_stage, COUNT(DISTINCT consumer_id) AS cnt\n  FROM databank_snapshot WHERE snap_date = \'2024-05-31\'\n  GROUP BY aipl_stage\n)\nSELECT n.aipl_stage,\n       n.cnt                                       AS now_cnt,\n       p.cnt                                       AS prev_cnt,\n       (n.cnt - p.cnt) * 1.0 / p.cnt              AS change_rate\nFROM aipl_now n JOIN aipl_prev p ON n.aipl_stage = p.aipl_stage\nORDER BY n.aipl_stage;\n\n-- A→I 流转率：90 天内从 A 进入 I 的用户占 A 总数比例\nSELECT COUNT(DISTINCT CASE WHEN moved_to_i_within_90d THEN consumer_id END) * 1.0\n       / COUNT(DISTINCT consumer_id) AS a_to_i_rate\nFROM aipl_a_users WHERE entered_a_date BETWEEN \'2024-05-01\' AND \'2024-05-31\';',
    analysisProcess: '数据准备：从阿里数据银行拉取 Q1（基期）和 Q2（当期）月末 AIPL 快照，对每位 OneID 用户标记当前阶段及来源渠道。剔除测试账号、雇员账号约 0.5%。\n四级规模对比：A（认知）从 1000 万增至 1200 万（+20%）、I（兴趣）从 480 万降至 380 万（-21%）、P（购买）从 220 万降至 195 万（-11%）、L（忠诚）从 100 万微降至 95 万（-5%）。**问题集中在 I 层骤减**。\n流转率诊断：算每个阶段间的 90 天流转率。Q1 → Q2 对比，A→I 流转率从 14% 降至 8%（-43%）；I→P 从 18% 升至 22%（健康）；P→L 从 35% 降至 32%（轻微下降）。**A→I 是真正的瓶颈**，意味着新拉的 A 层用户对品牌兴趣度极低。\nA 层来源结构：把 Q2 新增 A 层用户按来源拆分，信息流广告占 70%（Q1 占 45%）、内容种草占 15%、自然 15%。Q2 大幅追加的信息流投放把 A 层规模拉起来了，但质量差。\n素材与人群匹配：进一步看信息流广告的素材类型——70% 是"9.9 元秒杀爆款"类钓鱼素材吸引点击党，但落地后看到正价 200-400 元商品产生预期落差，无后续兴趣转化。20% 是品牌力宣导素材，A→I 流转率 22%（健康）。10% 是品类教育素材，A→I 流转率 18%。\nA→I 整体复盘：钓鱼素材带来的 A 层 90 天 A→I 流转率仅 4%，远低于品牌力素材的 22%。70% 的低质流量拖累了整体流转率，导致 I 层骤减。',
    coreFindings: [
      {
        finding: '业绩下滑的瓶颈不在拉新，在 A→I 流转',
        evidence: 'A 层 +20% 但 I 层 -21%，A→I 流转率从 14% 降至 8%。',
        implication: '人群资产分析必须看分层规模 + 层间流转率两个维度。只看总规模会被"虚假增长"误导。'
      },
      {
        finding: '70% 信息流广告是钓鱼素材，A→I 流转仅 4%',
        evidence: '钓鱼素材"9.9 元秒杀"占信息流投放 70%，但带来的 A 层 90 天 A→I 仅 4%；品牌力素材占 20% 但流转率 22%。',
        implication: '素材类型直接决定人群质量。钓鱼素材短期看 CTR 高但没有品牌资产沉淀价值。'
      },
      {
        finding: 'I→P 流转率反而健康（+22%）',
        evidence: 'I→P 流转率 Q2 比 Q1 升 4pp，说明品牌的转化能力没问题，只是兴趣层断粮。',
        implication: '排查链路问题时，找到"瓶颈环节"比"普遍优化"重要 100 倍。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '信息流素材结构调整',
        action: '钓鱼素材占比从 70% 压至 20% 以下，品牌力素材 + 品类教育素材从 30% 提至 70%。素材投放前增加"A→I 预测分"评估。',
        expectedOutcome: 'A→I 流转率从 8% 回升至 14%+，I 层规模 90 天恢复至 480 万+。',
        owner: '品牌投放 + 数据团队'
      },
      {
        strategy: '建立 AIPL 四级看板月度对齐',
        action: 'BI 平台对每个层级规模 + 流转率每月输出报表，连续 2 个月某流转率下降 ≥ 10% 自动预警。',
        expectedOutcome: '人群资产健康度从被动观察变为主动管理。',
        owner: '数据团队'
      },
      {
        strategy: 'I 层定向种草',
        action: '对 I 层（兴趣未购买）用户在小红书、抖音种草内容定向投放 + 站内私信触达，加速 I→P 转化。',
        expectedOutcome: 'I→P 流转率从 22% 进一步提升至 28%+。',
        owner: '内容运营 + 投放团队'
      }
    ],
    businessOutcome: '调整 90 天后 I 层规模回升至 510 万（vs 目标 480 万），P 层规模回升至 230 万。整体 GMV 同比从 -12% 转正至 +8%。AIPL 四级看板被纳入品牌月度经营会标准议题。',
    reflection: '复用边界：AIPL 模型适用于"天猫/淘宝品牌商家、有数据银行账号、年 GMV ≥ 5000 万"的场景，京东用 4A 模型（Aware/Appeal/Ask/Act）逻辑相似。不适用于：(1) 抖音电商（用 5A 模型 Awareness/Appeal/Ask/Action/Advocacy 替代）；(2) 私域为主的店铺（数据银行覆盖不全）；(3) 极小规模品牌（人群规模 < 50 万统计意义不足）。\n失败教训：第一版只盯总规模看到 +14%，向上汇报"人群资产健康"，差点错过 I 层下滑的真问题。**任何金字塔型指标都必须看每一层独立健康度，不能用加权平均掩盖局部恶化。**\n下一步进阶：(1) 把 AIPL 升级为 AIPLR（增加 Repurchase 复购层），让模型更贴合电商业务；(2) 引入"流转质量"指标——不仅看转化率，还看流转后用户的 GMV 贡献，区分"高质量流转"与"低质量流转"。'
  },
  {
    id: 'c-churn-warn-14',
    title: '流失预警与召回：用 30 天行为信号识别 70% 即将流失用户',
    category: '基础模型',
    subcategory: '流失管理',
    industry: '综合电商平台',
    difficulty: '入门',
    tags: ['流失预警', 'MA 自动化', '召回策略', '生命周期'],
    prerequisites: ['流失定义与口径', '行为埋点基础', '简单的逻辑判断'],
    summary: '某综合电商月活付费用户 280 万，月流失率 9%（行业均值 5-6%）。基于"近 30 天登录天数 + 加购数 + 推送打开率"三个简单信号建立流失预警规则（不用机器学习，纯 SQL），覆盖 70% 即将流失用户。配合 MA 营销自动化做分层召回，3 个月后月流失率从 9% 降至 5.8%，年化挽回 ARR 约 2800 万。',
    background: '某综合电商付费用户 280 万，月流失率 9%（流失定义：连续 30 天 0 登录且 0 付费），年化流失率高达 65%。运营团队此前的召回方式是"全量给 60 天未消费用户发券"，效果不佳——很多人不流失也领券（白送）、很多即将流失的用户在领券前已经卸载。\nVP 用户运营提出诉求：(1) 用简单可解释的规则识别"高流失风险"用户；(2) 接入 MA（营销自动化）平台做分层召回；(3) 不依赖机器学习模型（团队没有 ML 工程师），用 SQL能跑的方法即可。',
    fields: [
      { name: 'user_id', type: 'string', description: '用户唯一标识', example: 'U_8830012' },
      { name: 'login_days_30d', type: 'int', description: '近 30 天登录天数', example: '4' },
      { name: 'add_cart_30d', type: 'int', description: '近 30 天加购次数', example: '2' },
      { name: 'push_open_rate_14d', type: 'float', description: '近 14 天推送打开率', example: '0.05' },
      { name: 'last_pay_days_ago', type: 'int', description: '距上次付费天数', example: '38' },
      { name: 'is_churn_60d_later', type: 'bool', description: '60 天后是否流失（标签）', example: 'true' }
    ],
    sqlSketch: '-- 简单三因子流失预警规则（不依赖 ML）\nWITH risk_score AS (\n  SELECT user_id,\n         CASE WHEN login_days_30d <= 3 THEN 3 WHEN login_days_30d <= 7 THEN 2 ELSE 0 END   AS login_score,\n         CASE WHEN add_cart_30d  = 0 THEN 2 WHEN add_cart_30d  <= 2 THEN 1 ELSE 0 END     AS cart_score,\n         CASE WHEN push_open_rate_14d < 0.05 THEN 2\n              WHEN push_open_rate_14d < 0.15 THEN 1 ELSE 0 END                            AS push_score,\n         CASE WHEN last_pay_days_ago > 60 THEN 2\n              WHEN last_pay_days_ago > 30 THEN 1 ELSE 0 END                               AS recency_score\n  FROM user_features_30d\n)\nSELECT user_id,\n       login_score + cart_score + push_score + recency_score AS total_risk,\n       CASE\n         WHEN login_score + cart_score + push_score + recency_score >= 7 THEN \'极高\'\n         WHEN login_score + cart_score + push_score + recency_score >= 5 THEN \'高\'\n         WHEN login_score + cart_score + push_score + recency_score >= 3 THEN \'中\'\n         ELSE \'低\'\n       END AS risk_level\nFROM risk_score;',
    analysisProcess: '数据准备：取过去 60 天的活跃用户 280 万，回看每个用户 30 天前的状态作为特征 X，30 天后是否流失作为标签 y。剔除新注册 < 30 天用户（数据稀疏）。\n候选信号识别：基于运营经验列出 12 个候选信号（登录、加购、浏览、客诉、推送、券领取等）。计算每个信号在"流失用户"和"未流失用户"两组的差异。Top 3 区分度信号——登录天数（流失组均值 2.4 天 vs 未流失组 12.3 天）、加购次数（流失组 0.8 vs 未流失 6.2）、推送打开率（流失组 4% vs 未流失 18%）。\n阈值标定：用过去 60 天历史数据回测，对三个信号按业务可解释的阈值打分（0/1/2/3）。总分 ≥ 7 视为"极高风险"，覆盖了 70% 真实流失用户，假阳性率 18%（不流失被误判极高的比例）。已经比"60 天未消费"单一规则的 45% 召回率好很多。\n召回策略 A/B：对极高风险用户随机分两组——A 组（对照）维持现有"群发促销券"，B 组（实验）按主因差异化召回：登录天数低用户发"专属新功能解锁"邮件 + 站内 push，加购少用户推关联推荐 + 个性化合集，推送打开率低用户暂停推送 14 天后重新激活。30 天后 A 组流失率 31%，B 组 19%（差距非常显著），证明定向召回 ROI 远超群发。\n业务推广：把规则刷入 MA 平台（Salesforce / 销售易等），用户每日打分自动进入对应召回队列。运营团队不再需要每月人工拉名单。',
    coreFindings: [
      {
        finding: '简单三因子规则覆盖 70% 真实流失用户',
        evidence: '登录 + 加购 + 推送打开率三个信号的复合打分，召回率 70%、假阳性 18%。比单一规则"60 天未购"召回 45%、假阳性 28% 显著好。',
        implication: '不一定要用机器学习。规则模型在初中级团队 + 业务沟通成本场景下，往往是更好的选择。'
      },
      {
        finding: '推送打开率比加购数据更早预警',
        evidence: '推送打开率连续 14 天 < 5% 的用户，提前 30-45 天即可识别 60% 最终流失用户；加购数据需用近 7-14 天但提前期短。',
        implication: '互动信号比交易信号反应更快。流失预警应先看"心理疏远"再看"行为停滞"。'
      },
      {
        finding: '群发促销对高风险用户挽留效果差',
        evidence: 'A/B 实验对照组（群发券）30 天流失率 31%，定向召回组 19%。',
        implication: '高风险用户已经心理疏远，需要的是问题解决（找回新功能价值、个性化推荐），而不是再打折。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '高风险用户分主因差异化召回',
        action: '总分 ≥ 7 用户进入召回通道，按 Top 信号匹配三种方案——登录低发"新功能解锁"、加购低发"个性化合集"、推送低暂停 14 天再激活。',
        expectedOutcome: '高风险用户 30 天流失率从 31% 降至 19%；整体大盘月流失率从 9% 降至 6%。',
        owner: '用户运营 + MA 团队'
      },
      {
        strategy: 'MA 自动化打通',
        action: '规则刷入 Salesforce / 销售易等 MA 平台，用户每日打分自动进入对应召回队列。运营每周看汇总报表，不再人工拉名单。',
        expectedOutcome: '召回响应从月级变为日级，人力投入降低 70%。',
        owner: '数据 + IT + 用户运营'
      },
      {
        strategy: '规则月度评估与调优',
        action: '每月评估规则的召回率和假阳性率，业务变化（如新功能上线、大促）时及时调整阈值。',
        expectedOutcome: '规则保持有效不衰减。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '上线 6 个月后月流失率从 9% 降至 5.8%，年化挽回 ARR 约 2800 万。MA 召回流程上线后运营人力从 3 人/月降至 0.5 人/月。规则模型作为 MVP 跑通后，第二年再升级到 ML 模型，AUC 进一步提升至 0.88。',
    reflection: '复用边界：规则化流失预警适用于"流失定义清晰、有基础行为数据、流失率在 3%-15% 区间"的业务。不适用于：(1) 流失率极低（< 1%）的奢侈品 / 政企业务；(2) 流失定义模糊（如内容平台的"低活跃但偶尔回来"）；(3) 数据不足 6 个月的新业务。\n失败教训：第一版选了 12 个信号一起打分，规则又长又复杂，运营不知道为什么某用户被预警。简化到 3 个核心信号 + 4 档总分后，可解释性大幅提升。**业务协作场景下可解释性比 AUC 更重要。**\n下一步进阶：(1) 升级为 ML 模型（XGBoost/LightGBM），把可用特征扩展到 50+，AUC 从 0.78 提升到 0.88+；(2) 引入 Uplift 模型，从"预测谁流失"升级到"预测对谁做召回最有用"，进一步提升召回 ROI。'
  },
  {
    id: 'c-attribution-model-15',
    title: '渠道归因模型对比：首末线性三种归因下渠道排名翻转',
    category: '基础模型',
    subcategory: '渠道归因',
    industry: '综合电商平台',
    difficulty: '入门',
    tags: ['渠道归因', '首次点击', '末次点击', '线性归因', 'ROAS'],
    prerequisites: ['渠道归因基本概念', '用户路径数据', '简单的归因逻辑'],
    summary: '某电商月度投放 800 万，按"末次点击"归因下投放团队报告各渠道 ROAS 排名：搜索 5.2 / 信息流 3.8 / 内容种草 1.4。但用首次点击归因后种草冲到 4.6，搜索降至 2.8。线性归因下三个渠道接近 3.0-3.5。同一份数据三种归因下排名截然不同，CMO 据此重新分配预算（种草 +25%，搜索 -10%，信息流 -15%），整体 ROAS 提升 22%。',
    background: '某综合电商月度营销预算 800 万人民币，覆盖搜索（百度 SEM、淘宝直通车）、信息流（巨量、腾讯系）、内容种草（小红书、知乎）三大渠道。投放报表按"末次点击归因"统一口径，长期看搜索渠道 ROAS 最高（5.2），种草渠道 ROAS 最低（1.4），团队自然把预算重押在搜索。\n但 CMO 注意到一个现象：缩减种草预算后，搜索渠道的 ROAS 也在下滑。怀疑是归因模型只看了用户最后一跳，掩盖了种草渠道的真实贡献。需要数据团队对比不同归因模型下的渠道排名差异。',
    fields: [
      { name: 'user_id', type: 'string', description: '用户唯一标识', example: 'U_8830012' },
      { name: 'touchpoint_seq', type: 'string', description: '转化前 30 天触点序列', example: 'xhs > sem > feed > xhs > sem' },
      { name: 'is_converted', type: 'bool', description: '是否在 30 天内付费', example: 'true' },
      { name: 'pay_amount', type: 'decimal', description: '付费金额', example: '286.50' },
      { name: 'channel_spend', type: 'json', description: '该用户在各渠道上归集的曝光成本', example: '{"sem": 18, "feed": 12, "xhs": 5}' }
    ],
    sqlSketch: '-- 首次/末次/线性三种归因\nWITH user_path AS (\n  SELECT user_id, pay_amount, touchpoint_seq,\n         SPLIT(touchpoint_seq, \' > \') AS path_array\n  FROM converted_users\n)\nSELECT \n  -- 末次归因：每次转化全归功给最后一个触点\n  ARRAY_LAST(path_array)                                AS last_touch_channel,\n  -- 首次归因：归功给第一个触点\n  ARRAY_FIRST(path_array)                               AS first_touch_channel,\n  -- 线性归因：转化金额平均分给路径上每个触点\n  pay_amount / ARRAY_LENGTH(path_array, 1)              AS linear_share,\n  pay_amount, touchpoint_seq\nFROM user_path;\n\n-- 各渠道在三种归因下的总贡献（pseudo code）\n-- last_touch_revenue[ch]   += pay_amount  IF ch == last\n-- first_touch_revenue[ch]  += pay_amount  IF ch == first\n-- linear_revenue[ch]       += pay_amount * (ch_count / path_length)',
    analysisProcess: '数据准备：取过去 90 天所有付费转化用户 18.4 万，每个用户回溯转化前 30 天的渠道触点序列（device_id + 内部 SDK 拼接）。剔除单触点订单（91% 是多触点）。\n三种归因计算：(1) 末次归因：转化金额 100% 归给最后一个触点。(2) 首次归因：100% 归给第一个触点。(3) 线性归因：金额按路径触点数平均分配（如 5 跳的路径每个触点分 20%）。\n渠道排名差异：\n| 渠道 | 末次 ROAS | 首次 ROAS | 线性 ROAS | 差异分析 |\n| 搜索（SEM）| 5.2 | 2.8 | 3.4 | 末次归因严重高估 |\n| 信息流（feed）| 3.8 | 2.2 | 3.0 | 较稳定 |\n| 内容种草（XHS）| 1.4 | 4.6 | 3.5 | 末次归因严重低估 |\n\n触点位置分析：种草渠道平均位置 4.8（最早接触），SEM 平均位置 1.6（最末），feed 平均位置 2.5（中段）。明确符合"种草 → 搜索 → 收割"的电商决策路径。\n实际验证：调取 2024 年 3-6 月种草预算被砍 25% 的真实数据。同期搜索 ROAS 从 5.2 降至 4.4（-15%），种草用户进店量降 30%。说明缩减种草损害了下游搜索效率，证实种草的真实贡献被低估。\n业务推荐：CMO 不能用"首次归因"做决策（会过度神化种草），但末次归因的偏差太大也不行。线性归因虽然简单但更能反映多触点真实贡献。建议作为决策口径。',
    coreFindings: [
      {
        finding: '不同归因模型下渠道 ROAS 排名截然不同',
        evidence: '末次归因 SEM 5.2 / XHS 1.4，首次归因 SEM 2.8 / XHS 4.6，差距是 2-3 倍倍数级别。',
        implication: '归因模型是预算分配的"度量衡"。如果度量衡有偏差，所有依赖它的决策都会错。'
      },
      {
        finding: '种草渠道是"上游种子型流量"被严重低估',
        evidence: '种草平均触点位置 4.8（最早），首次归因下 ROAS 4.6（高），但末次归因仅 1.4（低）。',
        implication: '末次归因下"看似无效"的渠道往往才是真正的增长来源。完全砍掉它们会让大盘下行。'
      },
      {
        finding: '搜索是"下游收割型流量"被严重高估',
        evidence: '搜索平均位置 1.6（最末），末次归因 ROAS 5.2（虚高），首次归因仅 2.8。',
        implication: '搜索更像"漏斗末端阀门"而非"增长引擎"。预算扩大有自然天花板，因为受限于上游种草规模。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '归因口径切换为线性归因',
        action: '所有投放报表 ROAS 按线性归因口径输出，作为预算讨论的核心依据。同时备注末次归因数据用于对比。',
        expectedOutcome: '预算决策回归数据真实，种草渠道得到应有重视。',
        owner: '数据 + 投放团队'
      },
      {
        strategy: '预算重新分配',
        action: '种草渠道 +25%（从 80 万增至 100 万）；信息流 -15%（550 万 → 470 万）；搜索 -10%（170 万 → 153 万）。',
        expectedOutcome: '同等总预算下整体 ROAS 提升 20%+。',
        owner: '投放 + 数据团队'
      },
      {
        strategy: '建立月度归因模型对比报表',
        action: '每月输出三种归因模型下的渠道排名对比，差距 > 50% 的渠道额外分析触点路径，避免被单一口径误导。',
        expectedOutcome: '归因决策常态化，避免业务波动后归因失真。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '调整 3 个月后整体 ROAS 从 3.6 提升至 4.4（+22%）；种草渠道扩大投放后小红书品牌词搜索量增 38%（种草到搜索的下游传导明显）；搜索预算缩减后 ROAS 反而升至 4.8（去除掉了被种草浪费部分）。该归因方法被纳入年度预算规划标准流程。',
    reflection: '复用边界：三种归因对比适用于"多渠道触点丰富、有跨渠道用户串联（device_id/SSO）"的业务。不适用于：(1) 单渠道为主的小品牌；(2) 触点跟踪稀疏（无 SDK）；(3) iOS 14.5 后受隐私限制无法跨渠道串联的环境。\n失败教训：第一版用了"时间衰减归因"（U 型），结果业务方理解不了"为什么相邻渠道分配不一样的权重"，落地受阻。改用线性归因虽然不够精细但业务好懂，得以推行。**简单可懂的模型胜过精细但难解释的模型。**\n下一步进阶：(1) 升级到 Shapley Value 多触点归因（更科学的边际贡献计算）；(2) 引入 Markov Chain 归因（考虑触点时序）；(3) 跨设备归因（解决用户在手机+电脑+iPad 多设备触点问题）。'
  },
  {
    id: 'c-creative-ab-16',
    title: '投放素材 A/B 测试：从 200 条素材中找到提升 CTR 38% 的 5 个赢家',
    category: '基础模型',
    subcategory: '投放优化',
    industry: '抖音电商（女装类目）',
    difficulty: '入门',
    tags: ['素材 A/B', '创意优化', 'CTR 提升', '抖音投放'],
    prerequisites: ['CTR 与 CVR 的区别', '统计显著性概念', '简单的对比方法'],
    summary: '某抖音女装店铺月投巨量千川 350 万元，团队每月做 200+ 条素材但 CTR 长期在 2.8% 徘徊。建立"素材 A/B 测试 + 元素拆解"机制，从 5 个维度（开头钩子/真人出镜/价格信息/字幕风格/BGM）做正交测试，识别出"开头 3 秒 + 真人试穿 + 字幕大字突出价格"三要素组合 CTR 5.4%（+93%）。批量复刻这套素材逻辑后，整体 CTR 从 2.8% 升至 3.9%（+38%），ROAS 从 2.4 升至 3.2。',
    background: '某抖音女装店铺，年 GMV 1.8 亿，月投放预算 350 万（巨量千川），月度产出素材 200-300 条（自营拍摄 + 达人混剪）。整体素材 CTR 长期在 2.8%-3.0% 徘徊，ROAS 2.4。\n投放团队的痛点：(1) 200+ 条素材的好坏全靠主管经验"看着选"；(2) 没有方法论沉淀，新员工没法快速学习；(3) 素材消耗快（抖音平均 7 天衰减），需要大量素材但没法保证产出质量稳定。',
    fields: [
      { name: 'creative_id', type: 'string', description: '素材唯一 ID', example: 'CR_240812_0345' },
      { name: 'has_real_model', type: 'bool', description: '是否真人出镜', example: 'true' },
      { name: 'has_price_text', type: 'bool', description: '是否字幕中突出价格', example: 'true' },
      { name: 'opening_hook_type', type: 'string', description: '开头 3 秒钩子类型', example: 'before_after' },
      { name: 'impressions_7d', type: 'int', description: '7 日曝光', example: '128400' },
      { name: 'clicks_7d', type: 'int', description: '7 日点击', example: '6940' }
    ],
    sqlSketch: '-- 多元素正交分析素材效果\nSELECT \n  has_real_model,\n  has_price_text,\n  opening_hook_type,\n  COUNT(*)                                       AS creative_cnt,\n  SUM(impressions_7d)                            AS total_impr,\n  SUM(clicks_7d) * 1.0 / SUM(impressions_7d)     AS ctr,\n  SUM(orders_7d) * 1.0 / SUM(clicks_7d)          AS cvr,\n  SUM(gmv_7d) * 1.0 / SUM(spend_7d)              AS roas\nFROM creative_perf_7d\nWHERE impressions_7d >= 5000  -- 过滤数据不足的素材\nGROUP BY 1, 2, 3\nHAVING COUNT(*) >= 10  -- 每组至少 10 条素材保证可比性\nORDER BY ctr DESC;',
    analysisProcess: '数据准备：取过去 60 天累计上线的 412 条素材，每条素材标注 5 维度元素——开头钩子（场景/价格/对比/痛点/直接展示）、真人出镜（是/否）、价格信息（强调/不强调）、字幕风格（大字/普通）、BGM 节奏（快/慢）。剔除曝光 < 5000 的低数据素材。\n单维度对比：每个元素独立看 CTR 差异。结果——真人出镜素材 CTR 4.1% vs 无真人 2.6%（+58%）；字幕突出价格 3.8% vs 不突出 2.7%（+41%）；开头钩子"对比"型 4.5% vs "直接展示"型 2.4%（+88%）；BGM 节奏与字幕风格差异不显著。\n组合维度对比：3 个有显著差异的元素正交看 8 个组合的 CTR 表现：\n- 真人 + 强价格 + 对比开头：CTR 5.4%（最高）\n- 真人 + 强价格 + 痛点开头：CTR 4.6%\n- 真人 + 不强价格 + 对比开头：CTR 4.1%\n- 无真人 + 强价格 + 直接展示：CTR 2.0%（最低）\n表明三要素的组合效应大于单要素累加，是真正的"素材公式"。\n显著性检验：每个组合至少 10 条素材、累计曝光 5 万+，对比 CTR 差异用卡方检验，p < 0.001 确认非偶然差异。\n业务复盘：把"真人 + 强价格 + 对比开头"的 5 条 CTR 5.4% 头部素材作为模板，要求素材团队按此公式批量产出。同时停拍"无真人 + 直接展示"等低效模板。\n素材衰减分析：再检查头部素材的衰减曲线，CTR 5.4% 模板平均生命周期 9 天，远长于全库平均 5.5 天。说明高 CTR 素材不仅起点高，衰减也慢。',
    coreFindings: [
      {
        finding: '"真人 + 强价格 + 对比开头"三要素组合 CTR 5.4%',
        evidence: '5 条素材累计 28 万曝光，CTR 5.4% vs 全库平均 2.8%。p < 0.001 显著。',
        implication: '素材效果不是凭"灵感"，是有规律可循的元素组合。沉淀公式后可批量复制。'
      },
      {
        finding: '开头 3 秒钩子是最强单一影响因子',
        evidence: '"对比"型钩子（before/after）CTR 4.5% vs "直接展示"2.4%，差距 +88%。',
        implication: '抖音算法的"前 3 秒留存率"决定了素材是否被推荐到下个流量池。开头不抓人，后续再好也无用。'
      },
      {
        finding: '高 CTR 素材的生命周期更长',
        evidence: '头部素材平均 9 天 vs 全库 5.5 天衰减。',
        implication: '不仅 CTR 高，衰减慢的素材"性价比"双倍。素材生产投入应该集中在高 CTR 模板上。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '素材生产模板化',
        action: '素材团队按"真人 + 强价格 + 对比开头"模板批量产出，目标月度 70% 素材符合该公式。停拍纯展示型低效素材。',
        expectedOutcome: '整体素材 CTR 从 2.8% 提升至 3.9%+，ROAS 从 2.4 升至 3.2+。',
        owner: '素材生产团队 + 投放'
      },
      {
        strategy: '素材 A/B 测试制度化',
        action: '每月固定 10% 预算用于"探索性素材"（新元素组合），探索新公式。其余 90% 用于"复制 + 微调"已验证的高效模板。',
        expectedOutcome: '保持模板新鲜度，避免单一公式失效后无后续储备。',
        owner: '投放团队'
      },
      {
        strategy: '素材标签库 + 数据看板',
        action: '建立每条素材的多维度标签（开头/真人/价格/字幕/BGM），BI 看板按标签组合自动跑 CTR/CVR 对比，运营周会必看。',
        expectedOutcome: '素材效果分析从主观评判变为数据驱动。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '机制上线 3 个月后：素材 CTR 从 2.8% 升至 3.9%（+38%）；ROAS 从 2.4 升至 3.2；素材消耗效率提升后月投放预算可承载月度 GMV 增长 28%；素材生产新人成长周期从 3 个月缩短到 1 个月（有公式可学）。',
    reflection: '复用边界：素材元素 A/B 拆解适用于"短视频 / 信息流投放、月素材量 ≥ 100 条、有完整投放数据回流"的场景。抖音/视频号/快手/Reels 都适用。不适用于：(1) 月素材量极少（< 30 条）的早期店铺（统计意义不足）；(2) 高客单严格品牌调性的奢侈品；(3) 素材形式多样且难以标签化（如纯创意叙事类）。\n失败教训：第一版只看单维度 CTR，把"真人出镜"与"对比开头"分别推为重要元素，但实操中发现单独用每个元素效果一般。后期做了正交组合分析才发现"组合效应 > 单维度累加"。**多元素决策必须做正交分析。**\n下一步进阶：(1) 引入计算机视觉自动提取素材元素标签（出镜人数、画面色彩、商品出现时长等），扩展可分析维度；(2) 建立"素材效果预测模型"，新素材投放前预测 CTR，避免低效素材消耗预算。'
  },
  {
    id: 'c-sku-vitality-17',
    title: '商品爆旺平滞分类：从 2300 个 SKU 中找出 47 个真正的爆款',
    category: '基础模型',
    subcategory: '商品诊断',
    industry: '综合电商（家居家纺）',
    difficulty: '入门',
    tags: ['爆款分析', '商品分级', '动销率', '商品健康度'],
    prerequisites: ['SKU 与 SPU 概念', '动销率公式', '商品生命周期'],
    summary: '某家居家纺电商 2300 个 SKU，运营团队每周用"销量 Top 50"做主推但效果不稳定。基于"流量 × 转化"双维度建立爆/旺/平/滞四象限分级，发现真正的"爆款"（高流量高转化）仅 47 个（占 2%），但贡献 38% GMV；"旺款"（中流量高转化）有 320 个是被低估的潜力品。重新分配主推位资源后整体 GMV 月增 19%，滞销品占比从 31% 降至 18%。',
    background: '某综合电商家居家纺类目 SKU 2300 个，月度营收 3800 万。运营团队每周根据"上周销量 Top 50"决定首页主推位的商品，但效果不稳定——有时主推效果好，有时主推位 ROI 还不如自然流量。\n商品总监提出："我们怎么定义爆款？是销量高就是爆款吗？还是需要看流量利用率？" 需要数据团队建立科学的商品健康度分级方法。',
    fields: [
      { name: 'sku_id', type: 'string', description: 'SKU 唯一标识', example: 'SKU_HM_2245' },
      { name: 'category_l2', type: 'string', description: '二级类目', example: '床品四件套' },
      { name: 'sessions_30d', type: 'int', description: '近 30 天 sessions', example: '12480' },
      { name: 'orders_30d', type: 'int', description: '近 30 天订单数', example: '486' },
      { name: 'cvr_30d', type: 'float', description: '近 30 天转化率（orders/sessions）', example: '0.039' },
      { name: 'gmv_30d', type: 'decimal', description: '近 30 天 GMV', example: '128640.00' }
    ],
    sqlSketch: '-- 流量 × 转化双维四象限分类\nWITH category_baseline AS (\n  -- 每个二级类目算流量和转化的中位数作为分界线\n  SELECT category_l2,\n         PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY sessions_30d) AS median_sessions,\n         PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY cvr_30d)      AS median_cvr\n  FROM sku_summary\n  WHERE sessions_30d >= 100\n  GROUP BY category_l2\n)\nSELECT s.sku_id, s.category_l2, s.sessions_30d, s.cvr_30d, s.gmv_30d,\n       CASE\n         WHEN s.sessions_30d >= b.median_sessions AND s.cvr_30d >= b.median_cvr THEN \'爆款\'\n         WHEN s.sessions_30d <  b.median_sessions AND s.cvr_30d >= b.median_cvr THEN \'旺款\'\n         WHEN s.sessions_30d >= b.median_sessions AND s.cvr_30d <  b.median_cvr THEN \'引流款\'\n         ELSE \'滞销款\'\n       END AS sku_grade\nFROM sku_summary s\nJOIN category_baseline b ON s.category_l2 = b.category_l2;',
    analysisProcess: '数据准备：取过去 30 天每个 SKU 的 sessions、订单数、CVR、GMV、库存周转。剔除新上架 < 14 天和已下架 SKU，剩余 2284 个有效 SKU。\n类目内分级：直接全店比较会让"高流量类目"（如床品）SKU 总是占爆款，"小众类目"（如香薰）总是滞销。改为类目内中位数分界——每个二级类目的中位数 sessions 和中位数 CVR 作为分界线。\n四象限统计：爆款（高流量高转化）47 个（占 2%）但贡献 GMV 38%；旺款（低流量高转化）320 个（14%）贡献 GMV 24%；引流款（高流量低转化）228 个（10%）贡献 GMV 23%；滞销款（低流量低转化）1689 个（74%）仅贡献 GMV 15%。\n旺款深挖：320 个旺款本身转化率高（中位数 5.2% vs 全店 2.8%）但流量少。这意味着只要给它们曝光机会，能很快变成爆款。从中筛出 80 个"高潜旺款"（CVR > 6%、库存充足、毛利率 > 30%）作为下一波主推候选。\n引流款评估：228 个引流款 CVR 低但 sessions 高，多为价格敏感的低毛利品。其角色是"承接首页流量"，不该追求转化率而该追求"引流后用户对店铺的留存"。验证发现引流款进店用户对其他 SKU 的浏览深度比直接进店用户高 2.4 倍。**引流款不能用 CVR 评估，要看店铺整体加购贡献**。\n滞销款问题：1689 个滞销款占 SKU 数 74% 但仅贡献 15% GMV。其中 320 个 30 天 0 销量、580 个销量 < 5 单。这部分应砍 SKU 数量节省运营成本。',
    coreFindings: [
      {
        finding: '真正的"爆款"仅占 2% 但贡献 38% GMV',
        evidence: '47 个爆款 GMV 1450 万 vs 大盘 3800 万。',
        implication: '爆款定义必须看"流量利用率（CVR）"而非单纯销量。销量高可能是因为流量大，未必反映商品本身实力。'
      },
      {
        finding: '320 个"旺款"是被低估的潜力品',
        evidence: '低流量高转化 SKU 中位数 CVR 5.2% vs 全店 2.8%。一旦给到主推位，预期能贡献额外 600+ 万 GMV。',
        implication: '主推位资源应优先分配给爆款 + 高潜旺款，而非简单按销量 Top 50。'
      },
      {
        finding: '引流款不该用 CVR 评估',
        evidence: '引流款进店用户对其他 SKU 的浏览深度比直接进店高 2.4 倍。引流价值不在自身转化，在带流量。',
        implication: '不同角色的 SKU 用不同指标考核。一刀切按 CVR 排序会误杀引流款。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '主推位资源重分配',
        action: '首页 / 类目页主推位 70% 给爆款（47 个）+ 25% 给高潜旺款（80 个）+ 5% 留给新品测试。停止按"周销量 Top 50"机械分配。',
        expectedOutcome: '主推位 ROI 提升 40%，月度 GMV 增 18%-20%。',
        owner: '运营 + 商品团队'
      },
      {
        strategy: '高潜旺款流量扶持',
        action: '80 个高潜旺款进入"流量扶持池"，PPC 广告 + 站内 push + 直播带货组合扶持，目标 60 天内升级为爆款。',
        expectedOutcome: '60 天后高潜旺款中 30% 升级为爆款，新增爆款带来月度 GMV 300+ 万。',
        owner: '商品 + 投放团队'
      },
      {
        strategy: '滞销品 SKU 精简',
        action: '320 个 30 天 0 销量的 SKU 停止补货 + 折扣清仓，580 个销量 < 5 单的 SKU 进入"二次评估"队列，无明显回升的下架。',
        expectedOutcome: 'SKU 数从 2300 砍至 1700 左右，运营效率提升，仓储成本降 15%。',
        owner: '商品 + 仓储团队'
      },
      {
        strategy: '商品健康度日报',
        action: 'BI 平台每日跑爆/旺/平/滞分级，新增"爆款"或"滞销款"自动通知商品 leader。',
        expectedOutcome: '商品状态变化的发现时间从月度变为日级。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '资源调整 90 天后：主推位 ROI 提升 42%；月度 GMV 同比 +19%；爆款数量从 47 个增至 89 个（+90%）；滞销品 SKU 数从 31% 降至 18%；仓储成本同期降 14%。商品健康度日报成为运营周会标准议题。',
    reflection: '复用边界：流量 × 转化双维分级适用于"SKU 数量较多（> 200）、有完整流量与转化数据"的电商。亚马逊/Shopify/淘宝/京东都适用。不适用于：(1) 极少 SKU 的精品店；(2) 季节性极强的品类（如圣诞树，需考虑季节性调整）；(3) 主要靠社媒引流不依赖站内流量的店铺（流量数据不足）。\n失败教训：第一版没区分类目，导致家纺大类目 SKU 几乎全部进入"爆款"，小众香薰类目几乎全是"滞销"。后期改为类目内中位数分界才合理。**横向对比必须考虑"基线公平性"，不能跨类目直接比。**\n下一步进阶：(1) 增加"动销率（30 天有销量的 SKU 占比）"和"库存周转天数"作为第三、第四维度，构建更全面的商品健康度评分；(2) 引入"商品生命周期阶段"（新品爬坡/成熟/衰退）作为分级辅助维度，避免误杀新品。'
  },
  {
    id: 'c-inventory-health-18',
    title: '库存健康度诊断：用周转天数 + 动销率联合预警断货 / 积压',
    category: '基础模型',
    subcategory: '库存管理',
    industry: '跨境快消电商',
    difficulty: '入门',
    tags: ['库存周转', '动销率', '断货预警', '积压预警'],
    prerequisites: ['周转天数公式', '动销率定义', 'SKU 维度数据'],
    summary: '某跨境快消电商 1800 个 SKU，库存账面 2400 万 USD。同时存在两个对立问题：26% 的 SKU 6 个月动销率 < 5% 形成积压；同时 12% 的 SKU 频繁断货错失订单。建立"周转天数 + 动销率"双维矩阵每周打分预警，配合分级补货策略。3 个月后整体周转天数从 75 天降至 48 天，断货 SKU 减半，积压库存清出 800 万 USD。',
    background: '某跨境快消电商主营保健品 + 食品冲调，1800 个 SKU 分布美国 / 英国 / 加拿大 / 澳大利亚 4 个海外仓。库存账面 2400 万 USD，整体周转天数 75 天（行业健康水平 30-50 天）。\nCFO 在季度复盘指出库存效率问题——同时存在积压（资金占用 + 仓储费）和断货（错失订单 + 排名下滑）两个对立问题。诉求：建立每周自动跑的库存健康度系统，识别问题 SKU 并给出补货 / 清仓建议。',
    fields: [
      { name: 'sku_id', type: 'string', description: 'SKU 唯一标识', example: 'SKU_HF_2245' },
      { name: 'warehouse_id', type: 'string', description: '海外仓代码', example: 'WH_US_LA' },
      { name: 'stock_qty', type: 'int', description: '当前库存数量', example: '486' },
      { name: 'avg_daily_sold', type: 'float', description: '近 30 天日均销量', example: '6.4' },
      { name: 'turnover_days', type: 'int', description: '当前库存周转天数（stock_qty / avg_daily_sold）', example: '76' },
      { name: 'sell_through_180d', type: 'float', description: '近 180 天动销率（销量 / 进货量）', example: '0.58' }
    ],
    sqlSketch: '-- 周转天数 × 动销率双维分级\nSELECT sku_id, warehouse_id, stock_qty, avg_daily_sold,\n       stock_qty * 1.0 / NULLIF(avg_daily_sold, 0)   AS turnover_days,\n       sell_through_180d,\n       CASE\n         WHEN stock_qty * 1.0 / NULLIF(avg_daily_sold, 0) <= 14 AND sell_through_180d >= 0.6  THEN \'断货风险\'\n         WHEN stock_qty * 1.0 / NULLIF(avg_daily_sold, 0) BETWEEN 14 AND 60                    THEN \'健康\'\n         WHEN stock_qty * 1.0 / NULLIF(avg_daily_sold, 0) > 60 AND sell_through_180d >= 0.4    THEN \'轻度积压\'\n         WHEN stock_qty * 1.0 / NULLIF(avg_daily_sold, 0) > 60 AND sell_through_180d <  0.4    THEN \'重度积压\'\n         ELSE \'其他\'\n       END AS health_status\nFROM sku_inventory_daily\nWHERE event_date = CURRENT_DATE;',
    analysisProcess: '数据准备：每周一从仓储 ERP 抽取每个 SKU × 仓库的库存快照、近 30 天日均销量、近 180 天动销率（销量 / 进货量）、上次进货日期。剔除已下架 SKU 和无销售历史 SKU 共 7%。\n双维分级：周转天数（stock / 日销）和动销率（180 天销量 / 进货量）联合分级。健康区间：周转 14-60 天、动销 ≥ 50%。问题区间——断货风险（周转 < 14 天 + 动销 ≥ 60%，必须紧急补货）；轻度积压（周转 > 60 天 + 动销 ≥ 40%，需要降价促销）；重度积压（周转 > 60 天 + 动销 < 40%，需要清仓 / 转长尾仓 / 报废）。\n诊断结果：1800 个 SKU 中健康 1086 个（60%）、断货风险 215 个（12%）、轻度积压 230 个（13%）、重度积压 252 个（14%）、其他 17 个。**积压（27%）比断货（12%）更严重**。\n分仓库看：US 仓断货风险占比 18%（最高，因为美国市场体量大销量波动也大），AU 仓积压占比 35%（最高，澳洲销量预测难且补货链路长）。问题在不同市场表现不同。\n积压根因：抽样 50 个重度积压 SKU 看，60% 是因为去年大促备货过多没卖完；25% 是新品上线后市场反应不及预期；15% 是季节性产品过季。\n断货根因：抽样 50 个断货风险 SKU 看，70% 是销量突增（如某网红推荐导致流量爆发但补货周期跟不上）；20% 是供应链延误；10% 是预测模型本身偏低。',
    coreFindings: [
      {
        finding: '积压（27%）比断货（12%）更严重',
        evidence: '252 个重度积压 + 230 个轻度积压共 482 个 SKU 占资金约 720 万 USD。断货风险 215 个 SKU 但占资金少。',
        implication: '库存优化的优先级应该是"先清积压再补断货"。积压的资金一旦释放，可以反哺断货品的补货。'
      },
      {
        finding: '不同仓库的库存问题特征不同',
        evidence: 'US 仓断货风险占比 18%（最高），AU 仓积压占比 35%（最高）。',
        implication: '库存策略不能"一刀切跨仓库统一"。需要按仓库的销量波动 + 补货链路时长定制安全库存阈值。'
      },
      {
        finding: '60% 重度积压源自大促备货过多',
        evidence: '抽样 50 个重度积压 SKU 中 30 个是去年大促备货剩余。',
        implication: '大促备货决策需要更严格的"卖不完处理预案"。备货前就应该规划好"如果只卖出 60% 怎么办"。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '断货风险 SKU 紧急补货',
        action: '215 个断货风险 SKU 立即触发供应链紧急补货流程，可空运的（高毛利 SKU）走空运，运费成本与失订损失对比后决策。',
        expectedOutcome: '30 天内断货风险 SKU 减半，挽回月度订单约 8 万单。',
        owner: '供应链 + 商品团队'
      },
      {
        strategy: '重度积压 SKU 阶梯式清仓',
        action: '252 个重度积压 SKU 按"过季程度"分档清仓——临期 / 当季尾声品 5-7 折，去年款 4-6 折，前年款 3-5 折 + 站外引流。清不掉的转长尾仓或公益捐赠（享税收抵免）。',
        expectedOutcome: '90 天清出库存 800 万 USD，节省年仓储费约 60 万。',
        owner: '商品 + 仓储 + 财务'
      },
      {
        strategy: '建立分仓 SKU 安全库存动态阈值',
        action: '按仓库 × SKU 单独计算安全库存——公式为"日均销量 × 补货周期天数 × 安全系数（1.2-1.8 视波动率而定）"。每周自动更新。',
        expectedOutcome: '断货发生率降低 50%，同时不引入新积压。',
        owner: '数据 + 供应链团队'
      },
      {
        strategy: '大促备货决策升级',
        action: '所有大促备货必须做"乐观/中性/悲观"三档预测，按悲观档备货 70% + 中性档 20% + 乐观档 10%。同时签订供应商紧急加单协议（72 小时补货）。',
        expectedOutcome: '大促备货过剩造成的积压减少 60%。',
        owner: '商品 + 供应链团队'
      }
    ],
    businessOutcome: '3 个月后整体库存周转天数从 75 天降至 48 天（接近行业健康水平）；断货 SKU 数减半（从 215 降至 96）；重度积压库存出清 720 万 USD（释放现金流）；年仓储费节省约 65 万 USD。该看板被纳入供应链月度经营会标准议题。',
    reflection: '复用边界：双维库存健康度适用于"SKU 数量 > 200、有完整销量 + 库存数据、补货周期可预测"的电商。亚马逊 FBA / 海外仓自营模式都适用。不适用于：(1) 完全代发模式（无自有库存）；(2) 极少 SKU 的精品店；(3) 高度个性化定制业务（无标准库存概念）。\n失败教训：第一版只看周转天数单维度，把"周转 80 天但动销率 70%"的高潜畅销品也判为积压。后期增加动销率作为第二维度才区分出"卖得快但备货过多"和"根本没人买"两种本质不同的积压。**单维度库存判断必然误伤。**\n下一步进阶：(1) 引入需求预测模型（ARIMA / Prophet / LSTM）替代历史均值预测，提升补货精度；(2) 库存与营销联动——积压品自动触发清仓促销，断货品暂停广告投放避免无效曝光。'
  },
  {
    id: 'c-coupon-fraud-19',
    title: '优惠券羊毛党识别：从 12 万核销订单中查出 8% 套利账号',
    category: '基础模型',
    subcategory: '风控分析',
    industry: '综合电商平台',
    difficulty: '进阶',
    tags: ['优惠券风控', '羊毛党识别', '关联账号', '设备指纹'],
    prerequisites: ['UV 与 PV 概念', '关联规则思路', '简单的图思维'],
    summary: '某电商月度优惠券核销订单 12 万单（券面值合计 480 万），财务核账时怀疑有羊毛党套利。基于"设备 ID / 收货地址 / 支付账户 / IP 段"四维关联识别异常账号，发现 9600 个账号（占 8%）属于"账号矩阵套利"——一人控制 5-50 个号专门刷新人券。封禁后券真实增量 ROI 从 1:1.4 升至 1:2.6，年化挽回券面值约 580 万。',
    background: '某综合电商月度营销预算 800 万，其中优惠券 480 万（含新人券、复购券、节日券）。财务在月度核账时发现券核销率高达 95%（行业均值 70%），且新人券核销订单中 60% 用户首单后就再无后续行为，强烈怀疑有羊毛党。\n但风控团队此前没有体系化方法识别——通常是发现"明显异常"（如同一收货地址 100 个号）才封禁，绝大部分套利账号能逍遥法外。',
    fields: [
      { name: 'order_id', type: 'string', description: '订单 ID', example: 'ORD_220845' },
      { name: 'user_id', type: 'string', description: '下单用户 ID', example: 'U_8830012' },
      { name: 'device_id', type: 'string', description: '设备指纹（综合 IDFA / IMEI / 设备指纹算法）', example: 'DEV_4f8b2c1d' },
      { name: 'ship_address_hash', type: 'string', description: '收货地址哈希（去除门牌号后哈希）', example: 'ADR_9k8j7h6g' },
      { name: 'pay_account', type: 'string', description: '支付账户哈希', example: 'PAY_j8k9l0m1' },
      { name: 'ip_subnet', type: 'string', description: 'IP /24 子网段', example: '180.169.45.0/24' }
    ],
    sqlSketch: '-- 四维关联识别羊毛党账号矩阵\nWITH suspicious AS (\n  -- 同设备 ID 关联多账号\n  SELECT device_id, COUNT(DISTINCT user_id) AS account_cnt\n  FROM orders_with_coupon WHERE pay_date >= \'2024-08-01\'\n  GROUP BY device_id HAVING COUNT(DISTINCT user_id) >= 3\n),\nsame_addr AS (\n  -- 同收货地址关联多账号\n  SELECT ship_address_hash, COUNT(DISTINCT user_id) AS account_cnt\n  FROM orders_with_coupon WHERE pay_date >= \'2024-08-01\'\n  GROUP BY ship_address_hash HAVING COUNT(DISTINCT user_id) >= 3\n),\nsame_pay AS (\n  -- 同支付账户关联多账号\n  SELECT pay_account, COUNT(DISTINCT user_id) AS account_cnt\n  FROM orders_with_coupon WHERE pay_date >= \'2024-08-01\'\n  GROUP BY pay_account HAVING COUNT(DISTINCT user_id) >= 2\n)\n-- 命中任一规则即标记为可疑\nSELECT DISTINCT o.user_id\nFROM orders_with_coupon o\nLEFT JOIN suspicious s1  ON o.device_id = s1.device_id\nLEFT JOIN same_addr  s2  ON o.ship_address_hash = s2.ship_address_hash\nLEFT JOIN same_pay   s3  ON o.pay_account = s3.pay_account\nWHERE s1.device_id IS NOT NULL OR s2.ship_address_hash IS NOT NULL OR s3.pay_account IS NOT NULL;',
    analysisProcess: '数据准备：取过去 3 个月新人券核销订单 12 万单，每单关联 user_id、device_id（设备指纹算法计算）、收货地址哈希、支付账户哈希、IP 段。\n四维关联检测：(1) 同设备 ID 下注册 ≥ 3 个账号——发现 6840 个设备关联 22 万个账号；(2) 同收货地址哈希下 ≥ 3 个账号——发现 1280 个地址关联 4.8 万账号；(3) 同支付账户下 ≥ 2 个账号——发现 4220 个支付账户关联 1.4 万账号；(4) 同 IP /24 段 24 小时内注册 ≥ 10 个账号——发现 380 个 IP 段关联 8500 账号。\n图关联拓展：用图算法（连通分量）把上面四维关联做并集，识别出"账号矩阵"——一个连通分量内的账号视为同一控制人。结果共识别 9600 个账号属于 1820 个矩阵，每个矩阵平均 5.3 个账号（最大的矩阵控制 87 个账号）。\n行为特征验证：抽样 200 个矩阵中的账号查行为特征，确认 90%+ 符合羊毛党特征——账号注册当天即下单领新人券；首单后 0 复购；首单商品高度集中在"新人券满减后差价最大"的 3-5 个 SKU；收货地址多为快递柜、菜鸟驿站；多数账号在 30 天内仅活跃过一次。\n损失测算：9600 个羊毛党账号月度核销新人券价值约 96 万 RMB（占新人券总核销 30%）。一年损失约 580 万。封禁后新人券核销率从 95% 降至 72%（接近行业均值），首单后复购率从 18% 升至 31%（真实新客质量提升）。',
    coreFindings: [
      {
        finding: '8% 账号是套利羊毛党，吃掉 30% 新人券预算',
        evidence: '12 万核销账号中 9600 个（8%）被识别为账号矩阵控制；月度套利约 96 万 RMB。',
        implication: '羊毛党 ROI 极高（投入低、回报快），不重点防控会持续被薅。'
      },
      {
        finding: '设备指纹是最有效的单一识别维度',
        evidence: '6840 个设备关联 22 万账号，覆盖了 75% 的羊毛党样本。地址 / 支付 / IP 各覆盖 30%-50%。',
        implication: '设备指纹是反羊毛党的"第一道闸门"。即使羊毛党换号、换地址，换设备成本最高。'
      },
      {
        finding: '羊毛党行为有强模式',
        evidence: '90%+ 账号当天注册当天下单 0 复购、首单商品集中在 3-5 个高差价 SKU、地址为驿站。',
        implication: '羊毛党不是分散个体，是组织化"工作室"。只要识别一个矩阵的关联账号，能成批扫除。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '羊毛党自动识别 + 阶梯封禁',
        action: '风控系统每日跑四维关联 + 图算法，识别新增可疑矩阵。轻度（账号矩阵 < 10 个）发警告 + 限制券领取，重度（≥ 10 个）直接封禁。',
        expectedOutcome: '羊毛党月度套利从 96 万降至 25 万以下，年化挽回 580 万。',
        owner: '风控 + 数据团队'
      },
      {
        strategy: '新人券领取风控前置',
        action: '用户领新人券前实时跑设备指纹 + 支付账户关联检查，命中可疑特征的账号需通过短信验证 + 实人认证。',
        expectedOutcome: '羊毛党注册新账号成本提高，矩阵规模增长被抑制。',
        owner: '风控 + 产品团队'
      },
      {
        strategy: '券真实 ROI 月度复盘',
        action: '财务月报增加"扣除疑似羊毛党后的真实券 ROI"指标，与"表面券 ROI"并列展示。',
        expectedOutcome: '管理层决策不被表面 ROI 误导，券预算分配更科学。',
        owner: '财务 + 数据团队'
      }
    ],
    businessOutcome: '风控系统上线 6 个月：识别并封禁 1.4 万羊毛党账号；新人券核销率从 95% 降至 72%（接近行业均值）；券真实 ROI 从 1:1.4 提升至 1:2.6；首单后复购率从 18% 升至 31%（真实新客质量明显提升）；年化挽回券面值约 580 万 RMB。',
    reflection: '复用边界：四维关联反羊毛适用于"有用户基数、营销预算 ≥ 100 万/月、有设备指纹技术能力"的电商。淘宝/京东/拼多多/Shopee/Lazada 都适用。不适用于：(1) 极小流量店铺（基数不足无法识别图模式）；(2) 设备指纹技术受限的市场（如欧盟严格 GDPR 限制）；(3) B2B 业务（同公司多账号是正常的）。\n失败教训：第一版风控规则太严，把"住学校宿舍同设备的几个学生"也识别为羊毛党，引发用户投诉。后续增加"账号活跃度多样性"作为辅助判断——真实多账号同设备用户的浏览品类 / 时段差异大，羊毛党则高度同质。**风控规则必须有"误伤兜底"机制。**\n下一步进阶：(1) 用图神经网络（GNN）建模账号关联，比规则更精细识别复杂矩阵；(2) 引入"行为序列异常检测"，识别"行为太完美整齐"的账号（真人会有自然的犹豫和回退）；(3) 与同业反欺诈联盟共享黑名单，提升行业整体防控水平。'
  },
  {
    id: 'c-livestream-funnel-20',
    title: '直播间漏斗分析：5 场不同 GPM 主播的真相拆解',
    category: '进阶方法',
    subcategory: '直播分析',
    industry: '抖音电商（女装类目）',
    difficulty: '进阶',
    tags: ['直播分析', 'GPM', '漏斗诊断', '主播评估'],
    prerequisites: ['GPM = GMV/千次观看', '直播间漏斗节点', '基础统计'],
    summary: '某抖音女装店铺 5 个主播月 GMV 差距巨大（顶部 280 万 vs 底部 32 万）。运营初步判断"顶部主播能力强"，但 GPM（千次观看 GMV）+ 6 节点漏斗拆解后发现顶部主播 GPM 320 仅居第 3，第 1 名是个新人主播 GPM 480。各主播在"互动→点击"环节差异最大（10pp）。重新优化排品节奏 + 互动话术 SOP 后整体 GPM 提升 28%，月度大盘 GMV 增 55%。',
    background: '某抖音女装店铺月度直播 GMV 720 万，5 个主播分别每天直播 6-8 小时。月度 GMV 排名：A 主播 280 万 / B 200 万 / C 120 万 / D 90 万 / E 32 万。运营判断 A 主播最优秀，资源（流量扶持、福利款）持续向 A 倾斜。\n但商品总监注意到一个反直觉现象——A 主播 GMV 高但需要的福利款也最多（毛利率仅 18%），而 D 主播 GMV 低但毛利率 45%。GMV 排名是否反映了真实主播能力？需要数据团队拆解每个主播的真实贡献。',
    fields: [
      { name: 'session_id', type: 'string', description: '直播场次 ID', example: 'LIVE_240812_A' },
      { name: 'host_id', type: 'string', description: '主播 ID', example: 'HOST_A' },
      { name: 'product_id', type: 'string', description: '上架商品 ID', example: 'SKU_DR_2245' },
      { name: 'live_time_min', type: 'int', description: '直播时长（分钟）', example: '420' },
      { name: 'recommend_view', type: 'int', description: '推荐曝光次数', example: '480000' },
      { name: 'enter_count', type: 'int', description: '进入直播间人次', example: '38400' },
      { name: 'avg_stay_sec', type: 'int', description: '平均停留时长（秒）', example: '52' },
      { name: 'interaction_cnt', type: 'int', description: '互动数（评论+点赞+加粉）', example: '12480' },
      { name: 'gmv', type: 'decimal', description: '场次 GMV', example: '38600.00' }
    ],
    sqlSketch: '-- 主播 6 节点漏斗 + GPM 双指标\nSELECT host_id,\n       COUNT(DISTINCT session_id)                                  AS session_cnt,\n       SUM(recommend_view)                                          AS total_views,\n       SUM(enter_count) * 1.0 / SUM(recommend_view)                 AS enter_rate,\n       AVG(avg_stay_sec)                                            AS avg_stay,\n       SUM(interaction_cnt) * 1.0 / SUM(enter_count)                AS interact_rate,\n       SUM(product_click) * 1.0 / SUM(interaction_cnt)              AS click_per_interact,\n       SUM(orders) * 1.0 / SUM(product_click)                       AS click_to_pay,\n       SUM(gmv),\n       SUM(gmv) * 1000.0 / SUM(recommend_view)                      AS gpm,  -- 千次曝光 GMV\n       SUM(gross_profit)                                            AS gross_profit\nFROM live_session_log\nWHERE event_date BETWEEN \'2024-08-01\' AND \'2024-08-31\'\nGROUP BY host_id\nORDER BY gpm DESC;',
    analysisProcess: '数据准备：取 8 月 5 个主播共 142 场直播数据，每场记录 6 节点漏斗（推荐曝光 → 进入 → 停留 → 互动 → 商品点击 → 成交）+ 上架商品（福利款 / 利润款 / 爆款）+ 直播时段。剔除异常场次（断流 / 设备问题），剩余 136 场有效数据。\nGPM 视角颠覆 GMV 排名：把 GMV 除以推荐曝光得到 GPM（千次观看 GMV）：E 主播 GPM 480（最高）、A 主播 GPM 320（第 3）、B 240、C 280、D 380（第 2）。E 主播 GMV 低（32 万）的真相是直播时长仅 80 小时（其他主播 200+ 小时），但每千次曝光的产出最高。**A 主播 GMV 高但是靠时长堆出来的，效率不是最优。**\n6 节点漏斗对比：5 个主播在每一步的留存率——\n- 进入率（曝光→进入）：5 个主播差异在 6.5%-9.2%，相对稳定\n- 平均停留时长：A 65 秒 / B 48 秒 / C 52 秒 / D 78 秒 / E 92 秒（差异显著）\n- 互动率（进入→互动）：A 28% / B 22% / C 18% / D 35% / E 40%\n- 互动后点击率：A 35% / B 32% / C 30% / D 42% / E 48%\n- 点击转化率：A 8% / B 7% / C 6% / D 11% / E 13%\nE 主播在每一步漏斗上都领先，说明她的能力是全链路最强，只是直播时长不够。\n互动 → 点击差异分析：D / E 主播互动后点击率明显高（42%-48% vs A/B/C 的 30%-35%）。复盘录像看到 D / E 在互动后会立即"指引到商品链接"（"点小黄车看款"），而 A / B / C 互动后通常继续聊天 30-60 秒才回到商品。\n排品节奏分析：A 主播福利款占比 35%（最高），E 主播 12%（最低）。A 主播靠低毛利福利款冲流量，E 主播靠纯能力转化利润款。从毛利贡献看 D 主播实际利润最高（27 万 vs A 主播 18 万）。',
    coreFindings: [
      {
        finding: 'GMV 排名严重高估 A 主播能力，低估 E 主播',
        evidence: 'GMV 排名 A 第 1，但 GPM 排名 A 第 3、E 第 1。A 是靠"时长 + 福利款"堆 GMV，效率不如 E。',
        implication: '主播评估必须用 GPM 而非 GMV。GMV 受直播时长影响大，无法反映"单位流量利用效率"。'
      },
      {
        finding: '"互动 → 商品点击"是主播能力最大差异点',
        evidence: '5 个主播在该节点差异 13pp（30%-48%）。优秀主播会在互动后立即引导到商品链接。',
        implication: '主播能力的关键不在"会聊天"，在"会把聊天导向成交动作"。这个能力是可培训的 SOP。'
      },
      {
        finding: '毛利贡献排名又翻转：D 主播是真正的利润王',
        evidence: '从 GMV 看 A > B > C > D > E，从毛利看 D > A > E > B > C。D 主播福利款占比低 + 单价高。',
        implication: '主播评估要看 GMV / GPM / 毛利贡献三套指标，不同视角会得出不同优秀主播，需要综合权衡。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '主播考核切换为"GPM + 毛利"双指标',
        action: '主播月度绩效从单一 GMV 改为 70% GPM + 30% 毛利贡献。配合调整时长安排——E 主播延长至 200 小时 / 月。',
        expectedOutcome: 'E 主播 GMV 从 32 万翻倍至 80+ 万；整体大盘 GPM 提升 25%+。',
        owner: '直播运营 + 数据团队'
      },
      {
        strategy: '互动 → 点击 SOP 培训',
        action: '把 D / E 主播的"互动后即引导话术"录像 + 文档化，要求 A / B / C 在每次互动后必须 10 秒内引导到商品链接。',
        expectedOutcome: 'A/B/C 主播互动后点击率从 30%-35% 提升至 40%+。',
        owner: '主播培训团队'
      },
      {
        strategy: '排品节奏优化',
        action: '所有主播参考 D 主播的"福利款 15% 打头 + 利润款 70% 主销 + 爆款 15% 收尾"节奏。福利款占比上限统一 20%。',
        expectedOutcome: '整体毛利率从 32% 提升至 38%+。',
        owner: '商品 + 直播运营'
      },
      {
        strategy: '直播 6 节点漏斗看板',
        action: 'BI 平台每场直播结束后自动跑漏斗 + GPM 对比，主播个人 + 团队都看得到自己每个节点的差距。',
        expectedOutcome: '主播每周明确知道改进方向，自我提升速度提升 3 倍。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '调整 3 个月后：整体 GPM 从 280 提升至 358（+28%）；月度大盘 GMV 从 720 万增至 1116 万（+55%）；毛利率从 32% 升至 39%；E 主播月 GMV 从 32 万升至 95 万（成为高效新主力）；A 主播因 GMV 排名虚高被纠偏，但绩效未实质受损（毛利不变）；主播培训体系成型，新主播成长周期从 6 个月缩到 3 个月。',
    reflection: '复用边界：6 节点漏斗 + GPM 评估适用于"直播 GMV 月规模 ≥ 100 万、有完整流量回传数据"的店铺。抖音 / 视频号 / 淘宝直播 / 快手 / TikTok Shop 直播都适用。不适用于：(1) 极小直播规模店铺（数据不足以拆解漏斗）；(2) 内容种草直播（不主推商品的）；(3) 大牌品牌方直播（受品牌策略约束，不能纯按效率优化）。\n失败教训：第一版直接公开个人漏斗对比，引起 A 主播强烈不满（"你说我不行？"）。后期改为按"团队漏斗均值 vs 个人漏斗"匿名对比，每个主播看到自己 vs 团队差距但不显示其他主播姓名，接受度大幅提升。**数据透明度需要兼顾激励效果与团队和谐。**\n下一步进阶：(1) 加入"用户停留时长曲线"分析，识别哪些时间段流失最严重；(2) 引入"千次观看互动数（IPM）"作为补充指标，更早识别主播能力；(3) 用机器学习模型预测每场直播的 GPM，主播开播前给"预期 GPM"和优化建议。'
  },
  {
    id: 'c-content-lag-21',
    title: '内容种草滞后效应：小红书笔记发布后 30 天的进店成交曲线',
    category: '进阶方法',
    subcategory: '内容电商',
    industry: '美妆品牌（小红书 + 天猫）',
    difficulty: '进阶',
    tags: ['内容种草', '滞后效应', '小红书', '内容电商归因'],
    prerequisites: ['内容平台与电商平台数据打通', '时间序列基础', '滞后效应概念'],
    summary: '某美妆品牌月度小红书种草投入 80 万，运营报表按"笔记当天进店数"评估效果，结论是"小红书 ROI 仅 0.8 不划算"。建立"30 天滞后曲线"分析后发现，笔记发布当天进店仅占总进店量 12%，T+7 累计 38%、T+14 累计 65%、T+30 累计 92%。真实滞后 ROI 是 3.2，远超账面。重做投放评估口径后小红书预算扩大 60%，整体品牌进店增长 45%。',
    background: '某中端美妆品牌月度小红书种草投入 80 万（KOC 种草 + 信息流），同时在天猫旗舰店做转化收口。营销总监按"笔记发布当天进店天猫数"评估，结论是当天 ROI 仅 0.8（远低于信息流 ROAS 3.5），多次提议砍掉小红书预算。\n但 CMO 注意到一个反常现象——每次砍小红书预算后 1-2 个月天猫品牌词搜索量明显下降。怀疑评估口径有问题，没考虑种草到购买的滞后期。需要数据团队建立科学的滞后效应分析。',
    fields: [
      { name: 'note_id', type: 'string', description: '小红书笔记 ID', example: 'NOTE_240812_002' },
      { name: 'publish_date', type: 'date', description: '笔记发布日期', example: '2024-08-12' },
      { name: 'tmall_visit_date', type: 'date', description: '用户进入天猫日期', example: '2024-08-25' },
      { name: 'days_lag', type: 'int', description: '从笔记发布到进店天数', example: '13' },
      { name: 'has_paid', type: 'bool', description: '是否在 T+30 内成交', example: 'true' },
      { name: 'attribution_source', type: 'string', description: '进店渠道（搜索/直达）', example: 'tmall_search_brand' }
    ],
    sqlSketch: '-- 笔记发布后 1-30 天的累计进店转化曲线\nWITH note_to_visit AS (\n  SELECT n.note_id, n.publish_date,\n         v.tmall_visit_date,\n         DATEDIFF(v.tmall_visit_date, n.publish_date) AS days_lag,\n         v.has_paid, v.pay_amount\n  FROM xhs_notes n\n  JOIN tmall_visits v\n    ON v.from_xhs_note_id = n.note_id\n   AND v.tmall_visit_date BETWEEN n.publish_date AND DATE_ADD(n.publish_date, INTERVAL 30 DAY)\n  WHERE n.publish_date BETWEEN \'2024-06-01\' AND \'2024-07-31\'\n)\nSELECT days_lag,\n       COUNT(*)                                                     AS visit_cnt,\n       SUM(COUNT(*)) OVER (ORDER BY days_lag)                       AS cum_visit_cnt,\n       SUM(COUNT(*)) OVER (ORDER BY days_lag) * 100.0 / SUM(COUNT(*)) OVER ()  AS cum_pct\nFROM note_to_visit\nGROUP BY days_lag\nORDER BY days_lag;',
    analysisProcess: '数据打通：通过阿里数据银行的"小红书 → 天猫 OneID 串联"能力，把每个看过指定笔记的用户与天猫 OneID 关联。建立"笔记发布日 → 用户首次进店 → 是否成交"完整数据链。打通覆盖率约 65%（部分用户跨平台 ID 无法关联）。\n滞后曲线绘制：取 6-7 月发布的 380 篇种草笔记，每篇笔记追踪 30 天内带来的天猫进店数。汇总 30 天累计进店曲线——T+0 当天进店 12%，T+3 累计 22%，T+7 累计 38%，T+14 累计 65%，T+21 累计 82%，T+30 累计 92%。**当天进店仅占总量 12%，远低于运营报表口径**。\n滞后曲线分类：按笔记类型（KOC 体验型 / 教程型 / 对比测评型 / 信息流软广）分别画曲线，发现差异——教程型当天进店 8% / T+30 累计 88%，滞后效应最强；信息流软广当天进店 22% / T+30 累计 95%，滞后较短但仍长于运营当天口径。\n转化率与客单价：滞后进店用户的转化率（5.8%）显著高于"立即进店"用户（2.4%），且客单价高 38%（268 元 vs 194 元）。说明种草内容会"教育"用户，让其后续主动进店时更具消费意愿。\n真实 ROI 重算：用 T+30 累计成交 GMV 评估。80 万投入 → 进店 9.2 万人 → 成交 5800 单 × 268 元客单 = 156 万 GMV → ROI 1.95（按 GMV）。再扣除 35% 真实增量调整（其中部分用户即使没看小红书也会买）= 净增量 ROI 约 1.5（仍远高于报表 0.8）。考虑品牌力沉淀的长期效应，真实 ROI 接近 3.2。\n品牌词搜索验证：小红书种草投入与 30 天后天猫品牌词搜索量呈强正相关（r = 0.76）。每万元小红书投入约带来 280 次品牌词搜索量提升。',
    coreFindings: [
      {
        finding: '种草内容当天进店仅占总进店 12%',
        evidence: '380 篇笔记 30 天追踪显示当天进店 12%、T+7 累计 38%、T+30 累计 92%。',
        implication: '"当天 ROI"评估口径系统性低估种草效果约 8 倍。任何种草渠道都需要用 T+30 累计口径评估。'
      },
      {
        finding: '种草进店用户转化率 + 客单价双高',
        evidence: '滞后进店用户 CVR 5.8% vs 立即进店 2.4%，客单 268 vs 194。',
        implication: '种草不仅带流量还提升流量质量。这部分价值在传统投放分析中完全没被记录。'
      },
      {
        finding: '不同类型笔记滞后曲线显著不同',
        evidence: '教程型笔记 T+0 仅 8%，信息流软广 T+0 22%。',
        implication: '内容类型决定了用户决策周期。深度教程培养信任，软广刺激即时点击。两者作用互补，不可替代。'
      }
    ],
    improvementStrategies: [
      {
        strategy: 'ROI 评估口径切换为 T+30 累计',
        action: '所有种草内容评估必须用 T+30 累计成交 GMV / 投入计算。报表同时呈现"当天 ROI"和"T+30 ROI"两个口径。',
        expectedOutcome: '种草渠道得到客观评估，预算决策回归真实价值。',
        owner: '数据 + 投放团队'
      },
      {
        strategy: '小红书预算扩大 + 内容结构优化',
        action: '小红书月预算从 80 万增至 130 万；内容结构调整为"教程深度内容 50% + 对比测评 30% + 信息流软广 20%"。',
        expectedOutcome: '整体品牌进店增长 40%+，T+30 累计 GMV 从 156 万增至 240 万+。',
        owner: 'CMO 办公室 + 投放'
      },
      {
        strategy: '建立滞后归因数据看板',
        action: 'BI 平台每月跑一次内容渠道 T+30 累计转化曲线，跟踪笔记发布后 30 天的进店与成交。',
        expectedOutcome: '种草决策从主观感觉变为数据驱动，避免短期口径误判。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '调整 6 个月后：小红书 T+30 累计 ROI 从账面 0.8 修正为真实 3.2；月度品牌进店从 18 万增至 26 万（+45%）；天猫品牌词搜索量同比 +52%；CMO 在管理层用滞后归因口径汇报，预算决策回归数据驱动。该方法被复制到抖音种草、知乎等其他内容渠道。',
    reflection: '复用边界：滞后效应分析适用于"内容种草渠道 + 电商平台数据可打通"的场景。天猫数据银行 / 京东数据银行 / 抖音云图都支持。不适用于：(1) 跨境独立站（部分国内内容平台数据无法打通）；(2) 极少种草投入（数据点不足无法绘制曲线）；(3) 高客单极长决策周期业务（如装修，30 天滞后期不够）。\n失败教训：第一版滞后期只看 T+7，得到 ROI 1.4 的结论，建议小红书预算只增 15%，错过更大机会。后期延长到 T+30 才看到真实曲线。**滞后期长度必须超过用户决策周期，否则仍会低估。**\n下一步进阶：(1) 把 T+30 延长至 T+90，看是否有"二次种草 + 复购"效应；(2) 引入因果推断（DID）严格测算种草的因果增益，剔除自然增长部分；(3) 建立内容质量分预测模型，根据笔记发布后前 7 天数据预测 T+30 表现，更早决策是否扩量加投。'
  },
  {
    id: 'c-cs-conversion-22',
    title: '客服询单转化分析：72% 漏单背后的话术 / 响应时长 / 排班真相',
    category: '基础模型',
    subcategory: '客服分析',
    industry: '综合电商（家电类目）',
    difficulty: '入门',
    tags: ['询单转化', '客服漏单', '响应时长', '话术分析'],
    prerequisites: ['漏斗模型基础', '客服会话数据', '简单文本分析'],
    summary: '某家电电商月度客服询单 4.8 万次，但客服团队只看"已咨询订单数"不看转化效果。建立"询单 → 报价 → 加购 → 支付"四步漏斗后发现整体询单转化率仅 28%（72% 漏单）。深查 3 个核心问题：(1) 首次响应 > 60 秒漏单率从 22% 升至 45%；(2) 17 点至 22 点高峰期客服人手不足；(3) Top 3 资深客服的话术模板复用率仅 12%。整改后询单转化率从 28% 升至 41%，月度增量 GMV 320 万。',
    background: '某综合电商家电类目月度客服询单 4.8 万次（询单是指"用户在商品详情页点击客服咨询"），客服团队 35 人三班倒。当前 KPI 是"已咨询订单数 + 客户满意度评分"，没有转化率追踪。\n商品总监在月度会议提出："家电客单高（均 1850 元），用户在咨询后犹豫不决很正常，但我们到底有多少询单流失了？" 需要数据团队建立询单全链路转化分析，识别问题环节。',
    fields: [
      { name: 'session_id', type: 'string', description: '客服会话 ID', example: 'CS_240812_345' },
      { name: 'user_id', type: 'string', description: '咨询用户', example: 'U_8830012' },
      { name: 'cs_id', type: 'string', description: '客服 ID', example: 'CS_AGENT_22' },
      { name: 'first_response_sec', type: 'int', description: '客服首次响应时长（秒）', example: '38' },
      { name: 'session_duration_min', type: 'int', description: '会话总时长（分钟）', example: '12' },
      { name: 'has_quoted_price', type: 'bool', description: '会话中是否已报价', example: 'true' },
      { name: 'has_paid_within_3d', type: 'bool', description: '咨询后 72 小时内是否成交', example: 'false' }
    ],
    sqlSketch: '-- 询单四步漏斗 + 影响因子分析\nSELECT \n  COUNT(*)                                                    AS total_inquiry,\n  SUM(CASE WHEN has_quoted_price THEN 1 ELSE 0 END)            AS quoted,\n  SUM(CASE WHEN added_cart_within_3d THEN 1 ELSE 0 END)        AS added_cart,\n  SUM(CASE WHEN has_paid_within_3d THEN 1 ELSE 0 END)          AS paid,\n  SUM(CASE WHEN has_paid_within_3d THEN 1 ELSE 0 END) * 100.0\n      / COUNT(*)                                              AS conv_rate\nFROM cs_sessions\nWHERE session_date BETWEEN \'2024-08-01\' AND \'2024-08-31\';\n\n-- 按响应时长分桶看漏单率\nSELECT \n  CASE\n    WHEN first_response_sec <= 30  THEN \'≤30s\'\n    WHEN first_response_sec <= 60  THEN \'31-60s\'\n    WHEN first_response_sec <= 180 THEN \'1-3min\'\n    ELSE \'>3min\'\n  END AS response_bucket,\n  COUNT(*) AS sessions,\n  AVG(CASE WHEN has_paid_within_3d THEN 1.0 ELSE 0.0 END) AS conv_rate\nFROM cs_sessions\nGROUP BY response_bucket;',
    analysisProcess: '数据准备：取 8 月共 4.83 万条客服会话记录，每条关联 user_id、客服 ID、首次响应时长、会话时长、报价信息、72 小时内成交状态。剔除测试会话和恶意刷量会话约 0.6%。\n四步漏斗：询单 4.83 万 → 已报价 4.21 万（87%）→ 加购 1.95 万（46% 报价的）→ 支付 1.35 万（69% 加购的）→ 整体询单转化率 28%（1.35 万 / 4.83 万）。**72% 漏单**。\n响应时长影响：按首次响应时长分桶看转化率——≤30 秒 41%、31-60 秒 35%、1-3 分钟 22%、> 3 分钟 12%。**响应时长每多 30 秒转化率下降约 6pp**，影响显著。当前平均首次响应 78 秒（合格但不优秀）。\n时段分布：按小时看询单密度——10-12 点 8%、12-14 点 12%、14-17 点 22%、17-22 点 38%（高峰）、22-24 点 12%、其他 8%。但客服排班是 9-21 点平均分布，**17-22 点高峰期人手不足**，平均响应时长拉到 142 秒，转化率仅 19%（远低于其他时段 31%）。\n客服个体差异：35 个客服转化率从 18% 到 48% 不等，差距 2.7 倍。Top 3 客服转化率 45%+，其会话特征：(1) 平均首次响应 22 秒；(2) 主动报价占比 88%（其他客服 35%）；(3) 用关联推荐话术（"这款搭配 XX 一起用更好"）占比 65%。但 Top 3 的优秀话术没有被沉淀为团队 SOP，复用率仅 12%。\n人群与商品差异：高客单商品（> 3000 元）询单转化率 22%（更低），需要更多专业话术；低客单（< 800 元）转化率 38%（较高），更多是简单价格 / 库存问题。客服技能与商品复杂度的匹配度对转化影响明显。',
    coreFindings: [
      {
        finding: '整体询单 72% 漏单，响应时长是首要影响因素',
        evidence: '4.83 万询单仅 1.35 万成交，转化率 28%。响应时长 ≤30 秒转化 41% vs > 3 分钟 12%。',
        implication: '客服响应速度直接决定转化效率。"等几分钟没事"在电商场景是错觉，每多 30 秒漏单 6pp。'
      },
      {
        finding: '17-22 点高峰期客服人手不足',
        evidence: '17-22 点占询单总量 38% 但客服排班平均，导致该时段平均响应 142 秒，转化率仅 19%。',
        implication: '客服排班必须按询单密度而非时长平均。错峰排班是高 ROI 的简单优化。'
      },
      {
        finding: 'Top 3 客服与全员差距是话术，不是天赋',
        evidence: 'Top 3 主动报价占比 88% / 关联推荐占比 65%，远高于团队平均 35% / 18%。但其话术没被 SOP 化复用。',
        implication: '客服能力的提升路径是"经验沉淀为 SOP"。最优秀员工的方法不应该只属于个人，应成为团队资产。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '高峰期客服增员 + 错峰排班',
        action: '17-22 点时段增加 8 名客服（其他时段减员），目标该时段平均响应 ≤ 45 秒。同时高客单咨询自动转资深客服。',
        expectedOutcome: '高峰期转化率从 19% 提升至 30%+，月度增量 GMV 约 200 万。',
        owner: '客服团队 + HR'
      },
      {
        strategy: 'Top 3 话术沉淀为 SOP + 培训',
        action: '把 Top 3 客服的高转化话术录像 + 文档化，整理成"询单标准 SOP"——主动报价 / 关联推荐 / 客户痛点引导。要求全员每周培训 + 月度考核。',
        expectedOutcome: '团队平均转化率从 28% 提升至 36%+，Top 3 与团队差距缩小。',
        owner: '客服培训 + 数据团队'
      },
      {
        strategy: '响应时长强 KPI',
        action: '客服 KPI 从"已咨询订单数"改为"首次响应时长（权重 30%） + 询单转化率（50%） + 客户满意度（20%）"。响应 > 60 秒扣分。',
        expectedOutcome: '团队平均响应时长从 78 秒压缩至 50 秒以内。',
        owner: '客服管理'
      },
      {
        strategy: '建立客服漏斗实时看板',
        action: 'BI 平台每日跑客服漏斗 + 个体表现 + 时段密度，客服主管周会必看。',
        expectedOutcome: '客服管理从月度复盘变为日级响应。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '改进 90 天后：整体询单转化率从 28% 升至 41%（+13pp）；客服平均首次响应从 78 秒降至 42 秒；高峰期响应从 142 秒降至 38 秒；月度增量成交 6300 单 × 1850 元客单 = 1170 万 GMV，扣除增员 + 培训成本约 60 万，净增 1110 万；客服满意度评分提升 0.5 分。该方法被推广到家具、装饰等其他高客单类目。',
    reflection: '复用边界：询单转化漏斗适用于"客服会话占 GMV 比例 ≥ 15% 的高客单类目"——家电、家具、装修、保健品、奢侈品都适用。不适用于：(1) 极低客单标准化品（用户不咨询直接下单）；(2) 客服月会话量 < 1 万（数据点不足）；(3) 完全自动化机器人客服（缺人工话术变量）。\n失败教训：第一版只追响应时长强 KPI，结果客服为追快速度回复机械话术（"亲，请问需要什么"）反而拉低转化率。后期改为"响应时长 + 转化率"双 KPI 才平衡。**单一 KPI 很容易被钻空子，多目标平衡是好的设计。**\n下一步进阶：(1) 用 NLP 分析高转化与低转化对话的语义差异，自动提炼"高转化话术模板"；(2) 引入智能客服 + 人工协作模式，机器人处理简单咨询（库存 / 物流），人工集中处理高价值咨询；(3) 建立"客户意图识别"模型，根据用户咨询前 3 句话判断购买意愿，分级匹配资深 vs 普通客服。'
  },
  {
    id: 'c-dau-def-23',
    title: 'DAU 到底是哪个 DAU：5 种活跃定义下用户规模差 3 倍',
    category: '基础模型',
    subcategory: '指标定义',
    industry: '综合电商平台',
    difficulty: '入门',
    tags: ['指标口径', 'DAU 定义', '活跃用户', '指标治理'],
    prerequisites: ['活跃用户的基本概念', '事件埋点基础', '指标口径意识'],
    summary: '某电商内部对"日活用户 DAU"长期 5 个部门用 5 种定义打架——产品看登录、运营看页面浏览、商业化看加购、CFO 看支付、市场看综合。同样口径下"DAU 380 万"和"DAU 120 万"都说得通。建立"活跃强度阶梯"重新定义并统一口径后，发现表面 380 万 DAU 中只有 95 万属于"高质量活跃"（有商业行为），CMO 据此调整新客获取成本核算从 18 元降至 7 元，避免预算误判。',
    background: '某综合电商月度高层经营会上，5 个部门给出的 DAU 数字差异巨大——产品部门 380 万（登录定义）、运营部门 245 万（浏览 ≥ 1 页）、商业化 95 万（加购或浏览商品 ≥ 3 个）、CFO 65 万（当日支付）、市场 180 万（综合活跃指数）。CEO 在会上表达不满："到底哪个数是对的？"\n问题的本质：每个部门基于自己的业务诉求定义"活跃"，没有统一口径，导致跨部门讨论时鸡同鸭讲。CMO 的"新客 CAC"计算用的是产品部口径（380 万），按总营销支出 / 380 万 = 18 元/人。但其中绝大部分是"打开 APP 看了一眼就走"的低质用户，按"有商业行为的活跃用户"计算 CAC 应为 7 元/人。完全不同的数字将导致完全不同的预算决策。',
    fields: [
      { name: 'user_id', type: 'string', description: '用户唯一标识', example: 'U_8830012' },
      { name: 'event_date', type: 'date', description: '事件日期', example: '2024-08-12' },
      { name: 'login_flag', type: 'bool', description: '当日是否登录 APP', example: 'true' },
      { name: 'page_view_cnt', type: 'int', description: '当日页面浏览数', example: '8' },
      { name: 'add_cart_cnt', type: 'int', description: '当日加购次数', example: '2' },
      { name: 'pay_cnt', type: 'int', description: '当日支付订单数', example: '1' },
      { name: 'session_duration_min', type: 'int', description: '当日累计停留时长（分钟）', example: '14' }
    ],
    sqlSketch: '-- 5 种 DAU 定义同时跑，看口径差异\nWITH user_daily AS (\n  SELECT user_id,\n         MAX(login_flag)              AS logged_in,\n         SUM(page_view_cnt)           AS pv,\n         SUM(add_cart_cnt)            AS carts,\n         SUM(pay_cnt)                 AS payments,\n         SUM(session_duration_min)    AS stay_min\n  FROM events\n  WHERE event_date = \'2024-08-12\'\n  GROUP BY user_id\n)\nSELECT \n  -- 5 种口径并排\n  COUNT(DISTINCT CASE WHEN logged_in            THEN user_id END) AS dau_login_only,\n  COUNT(DISTINCT CASE WHEN pv >= 1              THEN user_id END) AS dau_pv,\n  COUNT(DISTINCT CASE WHEN pv >= 3 OR carts >=1 THEN user_id END) AS dau_engaged,\n  COUNT(DISTINCT CASE WHEN payments >= 1        THEN user_id END) AS dau_paid,\n  COUNT(DISTINCT CASE WHEN stay_min >= 5 AND pv >= 3 AND (carts >= 1 OR payments >= 1)\n                                                THEN user_id END) AS dau_quality\nFROM user_daily;',
    analysisProcess: '问题诊断：把 5 个部门的 DAU 定义并排跑一天数据，得到差异——登录 DAU 380 万、浏览 DAU 245 万、加购 DAU 95 万、支付 DAU 65 万、综合质量 DAU 95 万。**最大与最小差 5.8 倍**。\n根因分析：定义之差不是技术问题，是各部门思维差异。产品看"用户来不来"（看登录就够），运营看"用户看不看"（看页面浏览），商业化看"用户买不买的意向"（看加购），CFO 看"用户付不付钱"（看支付）。每个口径在自己部门视角是合理的，但跨部门讨论必须统一。\n活跃强度阶梯设计：建立 5 级活跃阶梯——L1 登录（仅打开 APP）/ L2 浏览（看了 ≥ 1 页）/ L3 深度浏览（看了 ≥ 3 页且停留 ≥ 5 分钟）/ L4 加购或商品深度互动 / L5 支付。每级都包含上一级（L5 用户必然也是 L1-L4），形成嵌套漏斗。同一日 L1=380 万 / L2=245 万 / L3=178 万 / L4=95 万 / L5=65 万。\n业务侧匹配：每个部门的核心 DAU 应该匹配其业务责任——产品体验看 L2（用户进来后是否愿意逛）、运营看 L3（深度活跃）、商业化看 L4（购买意向）、CFO 看 L5（变现）。**禁止任何部门拿 L1 当 KPI**——这只反映"用户是否打开 APP"，与价值无关。\nCAC 重算：按用户运营部要求统一用 L4 作为新客 DAU 主指标。新客 CAC 从 18 元（按 L1 口径）调整为 7 元（按 L4 口径，因为分母从 380 万变成 95 万，但分子不变？错！分子也变。新客 CAC = 新客获取成本 / 真正进入 L4 的新客数）。重算后新客 CAC 真实约 28 元（远高于报告 18 元），CMO 据此调整投放预算分配。\n指标 wiki 治理：把 L1-L5 五级口径写入公司指标 wiki，明确每个指标的定义 / 计算 / 适用场景。所有部门会议引用 DAU 时必须明确"是 L 几"。',
    coreFindings: [
      {
        finding: '同一时点 5 种 DAU 口径差异最大 5.8 倍',
        evidence: '当日 L1 登录 380 万、L5 支付 65 万，相差 5.8 倍。中间 L2/L3/L4 也各不相同。',
        implication: '没有统一口径的"DAU"是制造跨部门冲突的根源。任何"用户量"指标都必须有明确的活跃定义。'
      },
      {
        finding: '常用的"用户量除以营销支出"算 CAC 严重失真',
        evidence: '按 L1 口径 CAC 18 元，按 L4 口径真实 CAC 接近 28 元，被低估约 35%。',
        implication: '低质量分母会让 CAC 看起来过低，导致管理层对营销效率盲目乐观，做出错误的扩量决策。'
      },
      {
        finding: 'L1 登录 DAU 是"虚荣指标"',
        evidence: 'L1 仅反映"用户打开了 APP"，与商业价值无关。但产品部因此长期在 KPI 中追求 L1 增长。',
        implication: '虚荣指标（Vanity Metric）让团队朝错误方向努力。必须用"行动指标"（Actionable Metric）替代。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '建立活跃强度 L1-L5 阶梯并写入指标 wiki',
        action: 'L1-L5 五级嵌套口径文档化，定义每级用户的判定条件、SQL 实现、适用场景。所有部门会议引用 DAU 时必须明确"是 L 几"。',
        expectedOutcome: '跨部门"DAU 之争"消除，决策基于统一语义。',
        owner: '数据 + 各业务部门负责人'
      },
      {
        strategy: '部门 KPI 与活跃强度匹配',
        action: '产品 KPI 用 L2、运营用 L3、商业化用 L4、CFO/财务用 L5。禁止任何部门用 L1 当核心 KPI。',
        expectedOutcome: '部门激励与业务真实价值对齐，杜绝"刷登录数"等虚假行为。',
        owner: '人力 + CEO 办公室'
      },
      {
        strategy: 'CAC / LTV 等核心商业指标统一用 L4 口径',
        action: '新客 CAC、新客 LTV、留存率等核心商业指标分母统一为 L4（加购或互动）用户。月报增加"指标口径备注"，避免读者误解。',
        expectedOutcome: '商业决策基于真实用户价值，避免预算被虚高数字误导。',
        owner: 'CFO 办公室 + 数据团队'
      }
    ],
    businessOutcome: '指标治理上线 6 个月后：跨部门"DAU 之争"会议时间减少 70%；新客 CAC 真实数据修正后 CMO 调整投放分配，全年营销预算节省约 1200 万；指标 wiki 累计沉淀 80+ 核心指标定义，新员工上手速度提升明显；CFO 在董事会的指标口径 100% 统一为 L4/L5 级别，决策可信度大幅提升。',
    reflection: '复用边界：活跃强度阶梯方法适用于所有有"用户活跃"概念的产品，电商 / 内容 / 社交 / SaaS 都适用。不适用于：(1) 极简 MVP 阶段（用户行为单一无需分级）；(2) 单次性使用产品（如机票，不需要日活概念）；(3) B2B 大单业务（用户决策周期长，"日活"无意义）。\n失败教训：第一版直接定 L4 为公司北极星指标，结果产品部门强烈反对（"我做产品体验改进，怎么能用商业化指标考核我？"）。后期改为"每个部门用与其业务匹配的强度级别"才落地。**指标治理不是数学问题，是组织设计问题，必须考虑各部门能为之负责什么。**\n下一步进阶：(1) 把"活跃强度"扩展到"活跃质量评分"，加入留存系数 + 互动深度 + 商业贡献，用机器学习预测每个用户的潜在 L 级别；(2) 建立"部门指标依赖图"，识别哪些指标是"领先指标"哪些是"滞后指标"，让数据团队提前预警业务风险。'
  },
  {
    id: 'c-cvr-paradox-24',
    title: '转化率涨了 18% 但 GMV 反而跌：高 CVR 背后的客单流失陷阱',
    category: '基础模型',
    subcategory: '指标解读',
    industry: '快时尚电商',
    difficulty: '入门',
    tags: ['指标解读', '转化率陷阱', '客单价', '指标联动'],
    prerequisites: ['转化率与客单价的关系', 'GMV 拆解公式', '指标联动思维'],
    summary: '某快时尚电商运营团队报告"3 月份首页改版后转化率 +18%"，准备申请奖金。但同期 GMV 反而 -3%。深查发现首页将低价款（< 50 元）置顶后短期高频带动转化，但用户只买便宜的不再看高客单（150 元+）的款，AOV 从 168 跌至 132（-21%），转化率提升被客单价下滑完全抵消。揭穿"转化率为王"的常见误区，重建多指标联动评估机制后整体 GMV 半年回升至原水平 + 8%。',
    background: '某快时尚女装电商，3 月初首页改版（产品团队提议），把 100-200 元价位的精选款置顶改为 30-100 元的低价款置顶。改版后 1 个月数据：转化率从 2.4% 升至 2.83%（+18%），运营团队据此报告"改版成功"，请求奖金。\n但 CMO 注意到一个不对称——同期 GMV 同比 -3%，订单数 +14%。改版"赢了转化输了客单"的迹象明显。需要数据团队拆解清楚：转化率提升的真实代价是什么？',
    fields: [
      { name: 'session_id', type: 'string', description: '会话 ID', example: 'SS_240312_002' },
      { name: 'user_id', type: 'string', description: '用户 ID', example: 'U_8830012' },
      { name: 'first_clicked_sku_price', type: 'decimal', description: '该会话首次点击的 SKU 价格档', example: '49.00' },
      { name: 'session_pv', type: 'int', description: '会话内浏览页面数', example: '8' },
      { name: 'is_paid', type: 'bool', description: '会话是否产生支付', example: 'true' },
      { name: 'pay_amount', type: 'decimal', description: '支付金额', example: '49.00' }
    ],
    sqlSketch: '-- GMV 拆解 + 价格段交叉看转化率与客单贡献\nWITH session_metrics AS (\n  SELECT \n    DATE_TRUNC(\'month\', event_date) AS month,\n    CASE \n      WHEN first_clicked_sku_price < 50  THEN \'low\'\n      WHEN first_clicked_sku_price < 150 THEN \'mid\'\n      ELSE \'high\'\n    END AS price_tier,\n    COUNT(DISTINCT session_id)                            AS sessions,\n    COUNT(DISTINCT CASE WHEN is_paid THEN session_id END) AS paid_sessions,\n    SUM(pay_amount)                                       AS gmv,\n    AVG(CASE WHEN is_paid THEN pay_amount END)            AS aov\n  FROM session_log\n  WHERE event_date BETWEEN \'2024-02-01\' AND \'2024-03-31\'\n  GROUP BY 1, 2\n)\nSELECT *,\n       paid_sessions * 1.0 / sessions AS cvr_in_tier\nFROM session_metrics\nORDER BY month, price_tier;',
    analysisProcess: '初步拆解：用 GMV = UV × CVR × AOV 公式拆。3 月 vs 2 月：UV +2%、CVR +18%、AOV -21%。**AOV 跌幅最大**，吃掉了 CVR 提升的全部增益还多出来 3pp。问题不在转化率而在客单。\n按价格段拆 UV 流向：把会话按"首次点击 SKU 价格档"分低（<50）/ 中（50-150）/ 高（>150）三档。2 月分布——低 28% / 中 52% / 高 20%；3 月分布——低 58% / 中 32% / 高 10%。**用户的注意力被首页置顶大幅引导到低价区**，从中高客单流失。\n按价格段拆转化率：低价段转化率从 5.6% 升至 5.4%（基本不变）；中价段从 1.8% 升至 1.7%（基本不变）；高价段从 0.9% 升至 0.7%（小幅下滑）。**每个价格段内的转化率几乎没变**，整体转化率上升完全来自"高 CVR 价格段占比变大"——典型的辛普森悖论。\n根因诊断：3 月新版首页占首屏 80% 是低价款，用户被引导到低价区下单，看似转化高但用户不再去看高客单的款。整体 AOV 从 168 跌至 132（-21%）。计算：CVR 提升 18% × AOV 下跌 21% × UV 不变 = GMV 下跌约 6%（与实际 -3% 接近，差异是因为 UV 微涨 2%）。\n用户行为深查：把 3 月新客与老客分开看。新客 AOV 跌 28%（被首页低价款锁定），老客 AOV 跌 14%（部分老客原本就习惯看高客单款，惯性较强）。新客是低价陷阱的最大受害者。\n长期影响：跟踪 3 月新客的 60 天复购情况——他们的 60 天复购率 22% vs 1-2 月新客的 31%（-9pp）。**低价款"首单"无法形成有效复购**，因为用户的品牌印象被锚定为"便宜货平台"。这是更隐蔽的长期损失。',
    coreFindings: [
      {
        finding: '转化率 +18% 是流量结构变化，不是转化能力提升',
        evidence: '低 / 中 / 高三个价格段内的 CVR 几乎不变，整体 CVR 上升完全来自"高 CVR 段（低价）占比变大"。',
        implication: '看大盘转化率会被流量结构骗。指标分析必须做维度切分，否则错把"分布变化"当成"能力提升"。'
      },
      {
        finding: 'AOV 是被忽视的"GMV 隐形杀手"',
        evidence: 'AOV 从 168 跌至 132（-21%），跌幅完全抵消了 CVR 涨 18% 的增益。',
        implication: 'CVR 与 AOV 是 trade-off 关系，单独追求一个会损害另一个。所有改版必须同时看两个指标的联动。'
      },
      {
        finding: '低价款首单的新客复购率显著低（-9pp）',
        evidence: '3 月低价首页带来的新客 60 天复购率 22% vs 正常 31%。',
        implication: '低价款首单不仅是当期客单低，还会拉低后续 LTV，对品牌价值有持续侵蚀。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '首页改回"中客单引领 + 低价款引流"组合',
        action: '首页首屏 70% 中价段（80-180 元）+ 20% 高价段 + 10% 低价段引流。低价款不能占主导。',
        expectedOutcome: 'AOV 回升至 160+，整体 GMV 月度恢复至同比 +5%。',
        owner: '产品 + 运营团队'
      },
      {
        strategy: '运营 KPI 增加 AOV + 复购率',
        action: '运营 KPI 从单一"GMV"扩展到"GMV + AOV + 60 天复购率"三维考核。任何短期 GMV 提升必须保证 AOV 与复购率不显著下滑。',
        expectedOutcome: '杜绝"短期冲量牺牲长期价值"的策略偏移。',
        owner: '运营管理 + HR'
      },
      {
        strategy: '建立改版前指标影响预测',
        action: '所有涉及首页 / 流量分配 / 推荐策略的改版，上线前必须先做小流量 A/B 测试，同时跑 CVR + AOV + 60 天复购率三指标。任一指标显著下降则不推全量。',
        expectedOutcome: '类似"高 CVR 低 AOV"陷阱的改版从全量推送变为灰度拦截。',
        owner: '产品 + 数据团队'
      }
    ],
    businessOutcome: '改回首页结构 + 多指标考核上线 6 个月后：AOV 回升至 174（高于改版前 168）；整体 GMV 同比 +8%；新客 60 天复购率回升至 33%；运营团队的 KPI 体系沉淀为"GMV + AOV + 复购率"三角，不再单看 GMV。该方法论被推广到详情页改版、推荐位改版等多个场景。',
    reflection: '复用边界：本案例的"指标联动思维"适用于所有有 GMV 拆解逻辑的电商业务。不适用于：(1) 极低 SKU 数的精品店（价格段差异不大）；(2) 单一价格的标准品业务；(3) 流量来源单一无可调节空间的店铺。\n失败教训：第一版仅看 CVR 上涨就报告"改版成功"，运营团队差点拿到奖金。如果不是 CMO 注意到 GMV 反向下滑，整个公司将基于错误结论持续推广低价首页策略，半年内可能让 AOV 永久下滑 30%+。**单指标决策永远是高风险的，无论这个指标多核心。**\n下一步进阶：(1) 引入"指标联动监控仪表盘"，所有改版自动跑 CVR / AOV / 复购率 / NPS 四指标对比，任一显著恶化触发警报；(2) 用因果推断（DID）严格测算改版的因果增量，剔除自然波动 + 流量结构变化的混淆；(3) 建立"改版长期效应跟踪"机制，所有改版上线后追踪 90 天的复购率与 LTV 变化，识别"短期赢长期亏"的隐性风险。'
  },
  {
    id: 'c-gmv-decomp-25',
    title: 'GMV 二阶贡献度分解：从 -8% 异动找到 5 个真正的"罪魁祸首"',
    category: '基础模型',
    subcategory: '异动归因',
    industry: '综合电商平台',
    difficulty: '入门',
    tags: ['贡献度分解', 'GMV 异动', '维度交叉', '加法+乘法混合拆解'],
    prerequisites: ['GMV 拆解公式', '同比与环比', '加法分解 vs 乘法分解'],
    summary: '某电商月度 GMV 同比 -8%。常规乘法拆解（GMV = UV × CVR × AOV）只能告诉你"哪个因子在跌"，无法回答"具体哪个细分组合贡献了多少跌幅"。用二阶贡献度分解法（先拆三因子、再拆每个因子内部的细分维度），最终定位 5 个具体组合贡献了 -8% 跌幅的 87%——iOS 新客 UV 跌 -2.1pp、低价段 CVR 跌 -1.4pp、家居类 AOV 跌 -1.2pp 等。问题从"模糊的全盘下滑"变为"5 个具体可整改的组合"，整改后 60 天 GMV 恢复至同比 +2%。',
    background: '某综合电商月度 GMV 11.4 亿，同比 -8%（去年同期 12.4 亿）。CEO 要求 7 天内定位下滑根因。常规分析"GMV = UV × CVR × AOV"得到 UV -3% / CVR -2% / AOV -3%，三个因子都在轻微下滑——但这等于没说，运营团队不知道具体该改什么。\n需要数据团队做更精细的二阶分解，把 -8% 的 GMV 跌幅按"维度组合"拆到 ≤ 5 个可行动的具体组合上。',
    fields: [
      { name: 'segment', type: 'string', description: '维度组合（如 iOS_新客 / Android_老客）', example: 'iOS_new' },
      { name: 'category', type: 'string', description: '一级类目', example: '家居家纺' },
      { name: 'price_tier', type: 'string', description: '价格段', example: 'mid' },
      { name: 'uv_curr', type: 'int', description: '当期 UV', example: '124000' },
      { name: 'cvr_curr', type: 'float', description: '当期转化率', example: '0.024' },
      { name: 'aov_curr', type: 'decimal', description: '当期 AOV', example: '186.50' }
    ],
    sqlSketch: '-- 二阶分解：先按 device_os × user_type × category × price_tier 切分\n-- 对每个组合算 GMV 同比贡献度\nWITH curr AS (\n  SELECT device_os, user_type, category, price_tier,\n         COUNT(DISTINCT user_id)                AS uv,\n         SUM(pay_amount) / SUM(sessions) * 1000 AS gmv_per_1k_session,\n         SUM(pay_amount)                        AS gmv\n  FROM orders\n  WHERE month = \'2024-08\'\n  GROUP BY 1, 2, 3, 4\n),\nprev AS (\n  SELECT device_os, user_type, category, price_tier,\n         SUM(pay_amount) AS gmv\n  FROM orders\n  WHERE month = \'2023-08\'\n  GROUP BY 1, 2, 3, 4\n)\nSELECT c.device_os, c.user_type, c.category, c.price_tier,\n       c.gmv                              AS curr_gmv,\n       p.gmv                              AS prev_gmv,\n       (c.gmv - p.gmv)                    AS gmv_delta,\n       (c.gmv - p.gmv) / SUM(p.gmv) OVER () AS contribution_pct\nFROM curr c\nJOIN prev p USING (device_os, user_type, category, price_tier)\nORDER BY ABS(gmv_delta) DESC\nLIMIT 20;',
    analysisProcess: '第一阶分解（乘法）：GMV = UV × CVR × AOV。当期 vs 同期得 UV -3% / CVR -2% / AOV -3%。三个因子都跌但都不剧烈，无法定位具体问题。\n第二阶分解（加法 × 维度交叉）：把每个一阶因子按业务维度展开。UV 按 device_os × user_type 切分（iOS/Android × 新/老客），CVR 按 user_type × price_tier，AOV 按 category × price_tier。每个组合的 GMV 当期 vs 同期，算出贡献到 -8% 的具体分量。\n关键技术点——贡献度公式：每个组合对总 GMV 跌幅的贡献度 = (该组合当期 GMV - 该组合同期 GMV) / 同期总 GMV。这样所有组合的贡献度加总等于 -8%（精确分解）。\n排序找 Top：按"绝对值贡献度"降序，取 Top 20 看。结果发现 5 个组合贡献了 -8% 的 87%——\n1. iOS 新客 UV 下滑（-2.1pp）：苹果隐私政策影响付费投放归因\n2. 低价段 CVR 下滑（-1.4pp）：低价竞品进入挤压价格敏感人群\n3. 家居类 AOV 下滑（-1.2pp）：清仓促销过多拉低件均\n4. 老客复购 UV 下滑（-1.1pp）：3 个月前会员积分政策改革后老客流失\n5. 高价段（>500 元）CVR 下滑（-1.2pp）：竞品发起高客单促销战\n剩余 13% 是 200+ 个小组合零散贡献。\n反向验证：把这 5 个组合上"如果它们没跌"的反事实场景算一遍，得到反事实 GMV 11.95 亿，与去年 12.4 亿差距仅 -3.6%（剩余的"系统性下滑"），证明这 5 个组合是真正的根因，不是巧合。\n业务可行性：跟运营团队确认这 5 个组合的可整改性——iOS 归因可切 SKAN（可改）、低价段 CVR 通过加价格保障可救（可改）、家居 AOV 控制清仓节奏可救（可改）、老客积分新政可调整（可改）、高客单促销战需要差异化定位（较难）。整体 4/5 可主动整改。',
    coreFindings: [
      {
        finding: '一阶乘法拆解只能定方向，无法定具体动作',
        evidence: '"UV -3% / CVR -2% / AOV -3%"看起来都跌但程度近似，运营无从下手。必须二阶交叉到具体组合。',
        implication: '指标拆解必须深入到"可行动的最细颗粒度"。停在一阶就是"伪分析"，给不了真正的决策建议。'
      },
      {
        finding: '5 个组合贡献了 -8% 的 87%，符合帕累托分布',
        evidence: '200+ 维度组合中 5 个贡献了 87% 的跌幅，剩余 13% 由 200+ 个小组合零散贡献。',
        implication: '异动归因不是"全面排查"，是"找到关键少数"。把精力放在 Top 5 比平均用力效率高 40 倍。'
      },
      {
        finding: '不同组合的整改难度差异极大',
        evidence: 'iOS 归因 / AOV 控制 / 老客政策属于内部可控因素，高客单促销战属于外部竞争格局。整改优先级应不同。',
        implication: '贡献度大不等于优先级高。必须用"贡献度 × 整改可行性"双维度判断动作顺序。'
      }
    ],
    improvementStrategies: [
      {
        strategy: 'iOS 归因切 SKAN + 投放预算结构调整',
        action: '苹果生态从 IDFA 全切到 SKAdNetwork 归因，同步给广告平台一周稳定期。',
        expectedOutcome: '30 天内 iOS 新客 UV 恢复 70%+，对应 GMV 回升 1.4pp。',
        owner: '投放 + 数据团队'
      },
      {
        strategy: '低价段加价格保障 + 老客积分政策回调',
        action: '低价段商品全面对齐竞品价格 + 7 天保价；老客积分政策回到改版前阈值。',
        expectedOutcome: '低价 CVR 恢复 + 老客复购 UV 回升，合计回补 GMV 2pp。',
        owner: '商品 + 用户运营'
      },
      {
        strategy: '建立"GMV 异动二阶分解"自动看板',
        action: 'BI 平台对每月 GMV 同比 / 环比变化自动跑二阶分解，输出 Top 10 贡献度组合给业务团队。',
        expectedOutcome: '异动归因时间从 7 天压缩到 1 天，整改窗口前移。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '整改 60 天后 GMV 同比从 -8% 回升至 +2%（净改善 10pp）。其中 iOS 新客修复贡献 +1.4pp、价格保障贡献 +0.8pp、家居 AOV 控制贡献 +0.6pp、老客政策回调贡献 +0.9pp、其他自然修复 +6.3pp。二阶分解看板上线后类似异动归因时间从 7 天降至 1 天，业务响应速度大幅提升。',
    reflection: '复用边界：二阶贡献度分解适用于"业务体量大、维度数据丰富、有明确同期对照"的场景。不适用于：(1) 业务体量小（每个组合样本不足，分解出来都是噪声）；(2) 季节性极强且周期短的业务；(3) 数据维度稀缺无法交叉的场景。\n失败教训：第一版分解时把所有维度（device × user_type × category × price × channel × city）全部 6 维交叉，得到 4000+ 个组合，根本看不过来。后期收敛到 4 维交叉 + 200 组合 + Top 20 排序才有效。**维度过细的分解是噪声，必须按业务可行动颗粒度收敛。**\n下一步进阶：(1) 引入 Shapley Value 思路精确计算每个维度的真实边际贡献，比加法分解更科学；(2) 用机器学习（决策树）自动识别"重要的细分组合"，避免人工选择维度的偏差；(3) 建立"异动归因知识库"，把历史异动的根因 + 整改方案沉淀，新异动出现时优先匹配历史模式。'
  },
  {
    id: 'c-d7-repurchase-26',
    title: '7 日复购率：用 7 天数据预测 12 个月用户价值的早期信号',
    category: '基础模型',
    subcategory: 'LTV 预测',
    industry: '生鲜电商',
    difficulty: '入门',
    tags: ['7 日复购', '早期信号', 'LTV 预测', '获客质量'],
    prerequisites: ['复购率定义', 'LTV 概念', '相关性分析'],
    summary: '某生鲜电商月度新客 18 万，传统按"30 日 LTV"评估渠道质量但反馈周期太长（决策延迟 30 天）。基于"7 日复购率与 12 个月 LTV 相关性"分析发现两者相关系数 0.79，远高于"30 日 GMV 与 LTV"的 0.61。建立"7 日复购率"作为新客质量早期信号，渠道质量评估周期从 30 天压缩到 7 天，月度获客 ROI 提升 32%，劣质渠道 7 天内即可识别并止损。',
    background: '某生鲜电商月度新客 18 万，月度获客投入 580 万，主要看"30 日 LTV / CAC"评估渠道质量。但 30 天反馈周期意味着每个渠道的优劣要等 1 个月才能看到，期间已经投入了大量预算到劣质渠道。\n业务方诉求：能否用更早期（7 天甚至 3 天）的数据，预测一个新客的 12 个月 LTV，从而在 7 天内识别渠道质量？这是行业内顶级电商团队都在研究的"早期信号"问题。',
    fields: [
      { name: 'user_id', type: 'string', description: '用户唯一标识', example: 'U_8830012' },
      { name: 'first_pay_date', type: 'date', description: '首次付费日期', example: '2023-08-12' },
      { name: 'd7_repurchase', type: 'bool', description: '首单后 7 天内是否有第二次付费', example: 'true' },
      { name: 'd30_gmv', type: 'decimal', description: '首单后 30 天 GMV', example: '186.50' },
      { name: 'ltv_365d', type: 'decimal', description: '12 个月真实 LTV（事后回填）', example: '845.00' },
      { name: 'source_channel', type: 'string', description: '获客渠道', example: 'douyin_feed' }
    ],
    sqlSketch: '-- 计算各早期信号与 12 个月 LTV 的相关性\nWITH user_signals AS (\n  SELECT user_id, source_channel,\n         d7_repurchase,                              -- 7 日复购（布尔）\n         d7_pay_count,                               -- 7 日付费次数\n         d7_gmv,                                     -- 7 日 GMV\n         d30_gmv,                                    -- 30 日 GMV（对照基线）\n         ltv_365d                                    -- 真实 12 月 LTV（标签）\n  FROM new_user_metrics\n  WHERE first_pay_date BETWEEN \'2023-01-01\' AND \'2023-12-31\'\n)\n-- 用 SQL 算相关系数\nSELECT \n  CORR(CAST(d7_repurchase AS INT), ltv_365d)  AS corr_d7_rep_ltv,\n  CORR(d7_pay_count,                ltv_365d) AS corr_d7_cnt_ltv,\n  CORR(d7_gmv,                      ltv_365d) AS corr_d7_gmv_ltv,\n  CORR(d30_gmv,                     ltv_365d) AS corr_d30_gmv_ltv\nFROM user_signals;',
    analysisProcess: '数据沉淀：取 2023 年首单的全量新客 21 万人，每个用户拼接 D7 / D30 / D90 / D365 各时点指标。要求每用户必须有完整 12 月数据（剔除注册时间不够长 + 异常账号约 1.5%）。\n候选信号识别：列出 8 个候选早期信号——D3 / D7 / D14 复购（布尔）、D7 / D30 GMV、D7 加购次数、D7 浏览深度、D7 客服互动。算每个信号与 D365 LTV 的相关系数。\n相关性结果：D7 复购（布尔）与 LTV 相关系数 0.79（最高），D30 GMV 0.61、D7 GMV 0.47、D7 加购 0.38、D14 复购 0.71、D3 复购 0.54。**D7 复购布尔指标是最强早期信号**——一个简单的"是否在 7 天内来买第二次"比 D30 GMV 更能预测 12 月价值。\n反直觉解读：D7 GMV（连续值）相关性 0.47 反而低于 D7 复购（布尔）0.79。原因——某些用户首单买大额商品 D7 GMV 高但 D7 不来复购，他们 12 月 LTV 反而低；某些用户首单小额但 D7 内频繁复购，12 月 LTV 极高。**复购的"行为信号"比"金额信号"更能反映用户黏性**。\n7 日复购率渠道分布：把当期 18 万新客按渠道拆，看每个渠道的 7 日复购率——自然渠道 38%、抖音 18%、信息流 12%、小红书种草 32%、KOL 28%、地推 8%。**自然 + 种草 + KOL 是高质量渠道**，抖音 + 信息流 + 地推质量明显较差。\nLTV 预测公式：基于 D7 复购率构建简单 LTV 预测模型——D7 复购的用户 12 月 LTV 中位数 720 元，未复购的中位数 180 元，加权平均 LTV ≈ 720 × 复购率 + 180 × (1 - 复购率)。该公式在新数据上回测精度 ±9%，已经可用于实时决策。\n业务应用：把 D7 复购率作为渠道质量评估的核心指标，渠道月度评估窗口从 30 天压缩至 7 天。劣质渠道（D7 复购率 < 12%）在第 7 天即可识别，触发投放调整。',
    coreFindings: [
      {
        finding: 'D7 复购（布尔）是最强 LTV 早期信号',
        evidence: 'D7 复购与 D365 LTV 相关系数 0.79，远高于 D7 GMV（0.47）和 D30 GMV（0.61）。',
        implication: '"复购行为"比"消费金额"更能反映用户黏性。用户是否回来买第二次，比第一次买多少更预示长期价值。'
      },
      {
        finding: '渠道间 D7 复购率差异最大达 4.75 倍',
        evidence: '自然 38% / 种草 32% / KOL 28% / 抖音 18% / 信息流 12% / 地推 8%。',
        implication: '渠道质量差异在 7 天内就能精准显现，不需要等 30 天 LTV 才能判断。'
      },
      {
        finding: 'D7 复购率作为投放质量评估的"领先指标"',
        evidence: '渠道质量评估周期从 30 天压缩到 7 天，月度获客 ROI 提升 32%。',
        implication: '在数据团队工作中，"早期信号"挖掘是产生最大杠杆价值的方向。把决策窗口前移 1 周，往往等价于把整体效率提升 30%+。'
      }
    ],
    improvementStrategies: [
      {
        strategy: 'D7 复购率作为渠道质量核心指标',
        action: '所有渠道月度评估必须报告"D7 复购率"，目标 ≥ 25%。低于 12% 的渠道在第 7 天触发投放降权 50%，第 14 天仍未恢复触发暂停。',
        expectedOutcome: '渠道质量识别从 30 天压到 7 天，劣质渠道止损时间提前 23 天。',
        owner: '投放 + 数据团队'
      },
      {
        strategy: '基于 D7 复购概率的差异化新客运营',
        action: 'D7 内已复购用户进入"高潜会员"通道（专属客服 + 升级券）；D7 内未复购用户进入"7-14 天唤醒通道"（个性化推荐 + 限时引流券）。',
        expectedOutcome: '高潜会员的 90 天 ARPU 提升 25%；低潜用户唤回率从 18% 提升至 32%。',
        owner: '用户运营团队'
      },
      {
        strategy: '建立 D7 复购率每日看板',
        action: 'BI 平台对每个渠道的 D7 复购率每日更新，连续 3 天 < 历史均值 -10pp 触发预警，运营团队当天介入。',
        expectedOutcome: '新客质量异动从月度发现压缩到日级。',
        owner: '数据团队'
      }
    ],
    businessOutcome: 'D7 复购率指标上线 6 个月后：月度获客 ROI 从 1:2.4 提升至 1:3.2（+33%）；劣质渠道平均止损时间从 28 天压到 7 天，单次止损节省预算约 80 万；高潜用户 90 天 ARPU 提升 25%；该信号被纳入投放团队季度考核 KPI。',
    reflection: '复用边界：D7 复购率信号适用于"高频消费品类（生鲜、快消、餐饮、内容订阅）、用户决策周期短、首单后预期 7 天内能产生再消费"的场景。不适用于：(1) 低频高客单业务（如家电、家具，复购周期 6-12 月）；(2) 政企 B2B 业务（决策周期数月）；(3) 月新客 < 1000 的早期产品（统计噪声大）。\n失败教训：第一版直接用 D7 GMV 作为信号（认为消费多 = 用户好），结果发现首单买高客单的用户 D7 复购率反而低，相关性差。后期才意识到"复购的行为信号 > 消费的金额信号"。**早期信号的设计需要试错验证，主观直觉常常错。**\n下一步进阶：(1) 把 D7 单一信号扩展到"D3 + D7 + D14 多时点联合"信号，预测精度可从 ±9% 提升到 ±5%；(2) 引入机器学习模型（XGBoost）用 30+ 早期特征预测 LTV，从规则升级到 ML；(3) 把 LTV 预测与 Uplift 模型结合，不仅预测"用户值多少钱"，还预测"对该用户做什么动作（券 / 推送 / 客服）能让其 LTV 提升最多"。'
  },
  {
    id: 'c-shipping-threshold-27',
    title: '包邮门槛优化：99 / 199 / 299 哪个让用户凑单最积极',
    category: '基础模型',
    subcategory: '行为经济学',
    industry: '美妆个护电商',
    difficulty: '入门',
    tags: ['包邮门槛', '凑单行为', 'AOV 提升', '行为经济学'],
    prerequisites: ['AOV 概念', 'A/B 测试基础', '行为经济学锚定效应'],
    summary: '某美妆电商当前包邮门槛 99 元 5 年未变，AOV 长期 88 元。用 A/B 测试 3 档包邮门槛（99 / 159 / 199），发现 159 元档最优——AOV 从 88 升至 134 元（+52%），订单量仅下降 7%（vs 199 档下降 23%），整体 GMV 增长 41%。深挖原因——159 与原 AOV 的"距离"恰好是凑单经济学的甜蜜点（凑单成本 < 凑单获益 × 0.7）。',
    background: '某美妆个护电商当前包邮门槛 99 元已沿用 5 年，AOV 长期稳定在 88 元（即多数用户买不到包邮）。商品总监提议涨包邮门槛逼用户凑单提 AOV，但运营总监担心"逼太狠用户直接走人"。\n双方僵持不下。需要数据团队设计 A/B 测试找到"最优包邮门槛"——在不流失用户的前提下，最大化提升 AOV。',
    fields: [
      { name: 'experiment_group', type: 'string', description: '实验分组：A=99 / B=159 / C=199', example: 'B' },
      { name: 'session_id', type: 'string', description: '会话 ID', example: 'SS_240812_002' },
      { name: 'cart_amount', type: 'decimal', description: '加购金额', example: '142.50' },
      { name: 'is_paid', type: 'bool', description: '是否最终支付', example: 'true' },
      { name: 'pay_amount', type: 'decimal', description: '支付金额', example: '162.00' },
      { name: 'is_abandon', type: 'bool', description: '是否放弃购买', example: 'false' }
    ],
    sqlSketch: '-- A/B 测试分析 + AOV 分布对比\nWITH ab_metrics AS (\n  SELECT experiment_group,\n         COUNT(DISTINCT session_id)                           AS sessions,\n         SUM(CASE WHEN is_paid THEN 1 ELSE 0 END)              AS orders,\n         SUM(pay_amount)                                       AS gmv,\n         AVG(CASE WHEN is_paid THEN pay_amount END)            AS aov,\n         SUM(CASE WHEN is_abandon THEN 1 ELSE 0 END) * 1.0\n           / COUNT(*)                                          AS abandon_rate\n  FROM cart_log\n  WHERE event_date BETWEEN \'2024-08-01\' AND \'2024-08-21\'\n  GROUP BY experiment_group\n)\nSELECT *,\n       gmv / sessions AS gmv_per_session,\n       orders * 1.0 / sessions AS cvr\nFROM ab_metrics;',
    analysisProcess: '实验设计：将用户随机分 3 组——A 组维持 99 元（对照）/ B 组 159 元 / C 组 199 元。每组覆盖 30 万 sessions，跑 21 天确保统计显著。其余产品体验完全一致。\n核心指标对比：\n- A 组：AOV 88 元、CVR 3.2%、GMV/session 2.81 元、放弃率 8%\n- B 组：AOV 134 元（+52%）、CVR 3.0%（-6%）、GMV/session 4.02 元（+43%）、放弃率 9%（+1pp）\n- C 组：AOV 156 元（+77%）、CVR 2.5%（-22%）、GMV/session 3.90 元（+39%）、放弃率 14%（+6pp）\n**B 组（159 元）是最优——AOV 大幅提升但 CVR 几乎不降，整体 GMV 最高**。C 组（199 元）虽 AOV 更高但放弃率上升过多，整体 GMV 反而低于 B。\n凑单行为深查：把 B 组用户按"加购金额"分布画图。原本 70% 用户加购 60-100 元，B 组实施后 60% 用户加购 130-170 元（向 159 元锚点收拢）。其中——35% 用户的加购金额恰好落在 155-165 元区间（紧贴包邮线），25% 用户加购 170-200 元（凑单加冒险买更贵的），仅 15% 用户加购 < 130 元（放弃凑单）。\n凑单经济学解读：用户凑单是"凑单成本 vs 凑单获益"的心理博弈。包邮 = 节省 12 元运费；凑单需多付 = 159 - 当前购物车金额。当凑单需多付 ≤ 50 元时（即购物车 ≥ 109），用户大多会凑单（凑单成本 50 元，约价值 50 × 0.4 心理折扣 = 20 元，仍小于运费 12 元 + 满足感约 30 元）。当凑单需多付 > 80 元时，用户多会放弃。\n甜蜜点公式：最优包邮门槛 ≈ 当前 AOV × 1.7-1.9。本案例当前 AOV 88，最优门槛 156-167，与实测最优 159 高度吻合。**这个公式可以推广到其他业务场景做初始设定。**\n用户分层影响：把 B 组用户按"过去 90 天 AOV"分层。原 AOV ≥ 100 用户（30%）受影响最小（CVR 持平、AOV +18%），原 AOV < 70 用户（25%）受影响最大（CVR -12%、AOV +75%）。**包邮门槛主要"教育"中低消费用户提单价**，对高消费用户影响有限。',
    coreFindings: [
      {
        finding: '159 元包邮（AOV 1.8 倍）是凑单经济学的甜蜜点',
        evidence: 'B 组 GMV/session 4.02 元最高，AOV +52% 同时 CVR 仅 -6%。99（保守）和 199（激进）都不如 159 优。',
        implication: '包邮门槛不是越高越好，存在最优值。凑单需多付与凑单获益的心理平衡决定甜蜜点。'
      },
      {
        finding: '"最优门槛 ≈ 当前 AOV × 1.7-1.9"经验公式',
        evidence: '当前 AOV 88 × 1.8 = 158，与实测最优 159 高度吻合。该公式来自凑单经济学的心理阈值。',
        implication: '初始包邮门槛设计可以用该公式快速得到候选值，再做 A/B 微调，节省试错成本。'
      },
      {
        finding: '包邮门槛主要影响中低消费用户',
        evidence: '原 AOV ≥ 100 用户受影响小，原 AOV < 70 用户受影响大（CVR -12%、AOV +75%）。',
        implication: '包邮门槛是给中低消费用户的"行为引导工具"，对已经高消费的用户效果有限。优化时要看分层影响。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '全量上线 159 元包邮门槛',
        action: 'A/B 验证后第 22 天全量上线 159 元包邮，配合详情页 + 购物车页清晰提示"再购 X 元包邮"。',
        expectedOutcome: 'AOV 从 88 升至 130+，整体 GMV +35-40%。',
        owner: '产品 + 运营团队'
      },
      {
        strategy: '凑单推荐位上线',
        action: '购物车页"再购 X 元包邮"区域智能推荐 30-50 元的高毛利配套商品（如小样、补充装），降低凑单心理成本。',
        expectedOutcome: '凑单转化率提升 15%-20%，配套高毛利商品销量增加。',
        owner: '产品 + 商品团队'
      },
      {
        strategy: '包邮门槛年度复审机制',
        action: '每 6 个月跟踪一次 AOV 演化，当 AOV 长期稳定（变动 < 10% 持续 12 个月）后重新做 A/B 测试，调整包邮门槛维持 1.7-1.9 倍。',
        expectedOutcome: '包邮门槛与 AOV 的甜蜜点关系长期保持，避免门槛 5 年不变错失提价空间。',
        owner: '商品 + 数据团队'
      }
    ],
    businessOutcome: '上线 6 个月后：AOV 从 88 升至 142；整体 GMV 同比 +38%；CVR 仅小幅下降 4%；用户复购率不降反升 3pp（凑单时尝试新品类带来副作用回购）；包邮门槛策略被复制到母站其他类目，整体年化 GMV 增量约 1.2 亿。',
    reflection: '复用边界：包邮门槛 A/B 适用于"用户对运费敏感、运费占订单金额比 ≥ 5%、订单单价 < 500 元"的电商。不适用于：(1) 高客单（单价 > 500，运费占比小，包邮门槛影响不大）；(2) 全免运费业务模式（无门槛优化空间）；(3) 跨境电商（运费极高，包邮门槛通常会被设到 100% 满足时才包邮）。\n失败教训：第一版只测了 99 / 199 两档，得到"199 比 99 好"的结论后差点全量上线。后期增加 159 中间档才发现真正的最优值。**包邮门槛的最优值通常在 1.5-2 倍 AOV 之间，必须测多档才能发现"凑单经济学甜蜜点"。**\n下一步进阶：(1) 引入"分品类差异化包邮"——不同品类毛利差异大，可设不同门槛；(2) 个性化包邮门槛——基于用户历史 AOV 动态调整，高消费用户门槛设高、低消费用户门槛设低；(3) 把"包邮"扩展为"梯度免邮"——39 元省 5 元运费、99 元包邮、159 元包邮 + 赠品，三级阶梯进一步刺激凑单。'
  },
  {
    id: 'c-repurchase-cycle-28',
    title: '复购周期预测：为什么不能用平均值（中位数才是真相）',
    category: '基础模型',
    subcategory: '复购分析',
    industry: '生鲜电商',
    difficulty: '入门',
    tags: ['复购周期', '中位数', '分布形态', '指标选择'],
    prerequisites: ['平均值与中位数的区别', '正偏分布概念', '分布的可视化'],
    summary: '某生鲜电商运营团队按"平均复购间隔 18 天"做唤醒推送（每 18 天推一次），效果不佳。深查发现复购间隔分布严重右偏——70% 用户复购间隔 ≤ 8 天，但 5% 用户超 90 天的极端值把均值拉高到 18 天。改用中位数 7 天作为推送节奏，且按用户分位数分群差异化推送后，唤醒成功率从 12% 升至 28%，整体复购率提升 4.5pp。',
    background: '某生鲜电商月度活跃用户 280 万，运营团队按"用户平均复购间隔 18 天"作为唤醒推送的核心节奏——用户首单后第 18 天发促销 push 提醒回购。但实际唤醒成功率长期在 12% 左右徘徊（行业头部水平 25%+）。\n用户运营总监怀疑节奏不对——"18 天会不会等太久了？" 需要数据团队重新看复购周期到底应该用什么指标。',
    fields: [
      { name: 'user_id', type: 'string', description: '用户唯一标识', example: 'U_8830012' },
      { name: 'order_seq', type: 'int', description: '该用户第几次订单', example: '3' },
      { name: 'pay_date', type: 'date', description: '支付日期', example: '2024-08-12' },
      { name: 'days_from_prev', type: 'int', description: '距上次订单天数（即复购间隔）', example: '6' },
      { name: 'category_main', type: 'string', description: '该订单主要品类', example: '生鲜蔬果' }
    ],
    sqlSketch: '-- 计算复购间隔的多种统计量\nWITH repurchase_gaps AS (\n  SELECT user_id,\n         pay_date - LAG(pay_date) OVER (PARTITION BY user_id ORDER BY pay_date) AS days_from_prev\n  FROM orders\n  WHERE pay_date BETWEEN \'2024-01-01\' AND \'2024-08-31\'\n)\nSELECT \n  COUNT(*)                                                            AS total_pairs,\n  AVG(days_from_prev)                                                  AS mean_gap,\n  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY days_from_prev)         AS median_gap,\n  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY days_from_prev)         AS p25_gap,\n  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY days_from_prev)         AS p75_gap,\n  PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY days_from_prev)         AS p90_gap,\n  STDDEV(days_from_prev)                                               AS stddev_gap,\n  -- 偏度系数（>0 表示右偏）\n  (AVG(days_from_prev) - PERCENTILE_CONT(0.50) WITHIN GROUP\n     (ORDER BY days_from_prev)) / STDDEV(days_from_prev)                AS skewness\nFROM repurchase_gaps\nWHERE days_from_prev IS NOT NULL AND days_from_prev <= 365;',
    analysisProcess: '指标重算：取过去 8 个月用户的所有复购间隔数据，得到 320 万对(用户, 复购间隔) 数据点。\n关键统计量：均值 18.4 天、中位数 7 天、P25 = 4 天、P75 = 14 天、P90 = 38 天、标准差 32.6、偏度 +2.4（严重右偏）。\n**均值 18.4 与中位数 7 差距 2.6 倍，证明分布严重右偏**。少数用户的极端长复购间隔（> 90 天的占 5%）拉高了均值。如果用均值做决策，相当于按少数极端用户的节奏推送给大多数主流用户。\n分布可视化：画出复购间隔的频次直方图。0-3 天 25%、4-7 天 35%、8-14 天 22%、15-30 天 11%、31-60 天 4%、60+ 天 3%。**60% 用户在 7 天内复购**，超 30 天复购的用户已属"极少数"。\n按主流用户复购周期推送：把"18 天推送"改为"7 天推送"。但这有个新问题——25% 在 0-3 天就复购的用户被推送时已经买过了（无效推送）。所以单一节奏依然不够，需要分群推送。\n按用户分位数分群推送：把用户按其"过去 3 次平均复购间隔"分四档——超高频（间隔 ≤ 3 天，占 22%）、高频（4-7 天，占 38%）、中频（8-14 天，占 25%）、低频（≥ 15 天，占 15%）。每群按其 P50 节奏推送。超高频用户 D2 推、高频 D5 推、中频 D10 推、低频 D20 推。\n品类差异：不同品类复购周期差异极大——生鲜蔬果中位数 4 天、肉禽蛋奶 5 天、米面粮油 12 天、休闲食品 7 天。**单一推送节奏无法适配多品类**。最优方案是"按用户主营品类的复购周期推送"。\n效果对比：原方案（D18 推送，全用户）唤醒成功率 12%；新方案（按用户分位数 + 品类）唤醒率 28%（+133%）。新方案的关键不是"更频繁推送"，而是"在用户即将自然复购的时刻"推送。',
    coreFindings: [
      {
        finding: '复购间隔均值与中位数差 2.6 倍，证明分布严重右偏',
        evidence: '均值 18.4 天 vs 中位数 7 天，偏度 +2.4。5% 极端用户拉高了均值。',
        implication: '用均值做决策会被极端值误导。所有"右偏分布"的指标必须用中位数 / 分位数描述。'
      },
      {
        finding: '"按平均复购周期推送"是错误的运营策略',
        evidence: '原 D18 推送在 60% 用户已复购后才送达，已无效；对剩余 40% 用户推送早于自然复购，转化率低。',
        implication: '运营节奏不能基于均值。必须基于用户分布形态做差异化推送。'
      },
      {
        finding: '用户主营品类决定复购节奏',
        evidence: '生鲜蔬果中位数 4 天、肉禽蛋奶 5 天、米面粮油 12 天，差异 3 倍。',
        implication: '运营触达节奏必须按"用户的主营品类"做差异化，单一节奏一定无法适配多元业务。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '按用户分位数 + 品类的差异化推送',
        action: '按用户过去 3 次平均复购间隔分四档（超高/高/中/低频），每档按 P50 节奏推送（D2/D5/D10/D20）。同一用户按主营品类微调（生鲜类 -1 天，米面类 +3 天）。',
        expectedOutcome: '唤醒成功率从 12% 提升至 28%；推送总量减少 35%（精准推送替代群发）；用户因过度推送而退订率降 50%。',
        owner: '用户运营 + 数据团队'
      },
      {
        strategy: '指标 wiki 增加"分布形态"说明',
        action: '所有指标在 wiki 上必须标注分布形态（正态 / 右偏 / 双峰等）和适用统计量（均值 / 中位数 / 分位数）。规定凡偏度 > 1 的指标禁用均值。',
        expectedOutcome: '杜绝"用错统计量"导致决策失真，从源头规避此类陷阱。',
        owner: '数据团队'
      },
      {
        strategy: '建立复购预测模型',
        action: '用机器学习模型预测每个用户的"下次复购概率随天数变化"曲线（生存分析），在概率最高时点推送。',
        expectedOutcome: '推送精准度进一步提升，唤醒率从 28% 升至 35%+。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '差异化推送 + 复购预测上线 6 个月后：唤醒成功率从 12% 升至 35%（实际超过初始预期）；整体复购率提升 4.8pp；推送总量减少 38%（同时退订率降 52%）；用户对推送的满意度评分提升 14%。该方法被推广到所有触达场景（短信、Push、邮件）。',
    reflection: '复用边界：分布形态 + 中位数方法适用于"右偏分布"的所有指标——复购间隔、客单价、停留时长、点击间隔等。不适用于：(1) 严格正态分布的指标（如身高、考试分数等极少数情况）；(2) 极小样本（< 100）情况，分位数本身有较大噪声。\n失败教训：第一版没看分布直接用 SQL 算 AVG(days)，习惯性以为"平均复购间隔 18 天"是合理数字。直到运营反馈推送效果差，才回头看分布。**任何"算出来"的指标都要先画分布图看形态，再决定用什么统计量描述。**\n下一步进阶：(1) 用生存分析（Survival Analysis）替代分位数，建模"用户随时间复购概率"完整曲线，触达精度可再提升 30%；(2) 引入序列模型（LSTM）预测每个用户下次复购的具体日期；(3) 把"复购周期"扩展为"复购金额预测"，不仅预测何时买，还预测会买多少。'
  },
  {
    id: 'c-traffic-quality-29',
    title: '流量结构健康度指数：UV 涨 30% 但 GMV 没涨的低质流量陷阱',
    category: '进阶方法',
    subcategory: '流量诊断',
    industry: '综合电商平台',
    difficulty: '进阶',
    tags: ['流量质量', '健康度指数', '流量结构', '复合指标'],
    prerequisites: ['流量分类基础', '加权指数概念', '流量质量评估意识'],
    summary: '某电商月度 UV 同比 +30% 但 GMV 仅 +3%。常规分析"UV 涨了 GMV 应该涨"无法解释。建立"流量结构健康度指数"——按渠道质量分（自然 100 / 种草 80 / 搜索 70 / 信息流 50 / 联盟 30 / 其他 20）加权计算"质量调整 UV"，发现质量调整 UV 同比仅 +5%（与 GMV +3% 高度吻合）。揭示：UV 增长来自低质渠道扩张，结构在恶化。CMO 据此调整渠道预算，6 个月后流量健康度指数从 58 升至 72，GMV 同比转正至 +24%。',
    background: '某综合电商月度 UV 从去年 580 万涨至 750 万（+30%），按"流量增长一定带来 GMV 增长"的常识，预期 GMV 至少 +20%。但实际 GMV 仅 +3%。CFO 在月度会上质疑："多花了那么多钱拉流量，钱去哪了？"\n投放团队的解释是"流量质量越来越差"，但说不清楚到底差到什么程度，也没法量化。需要数据团队建立可量化的"流量质量"指标，回答"UV 增长但 GMV 不增长"的根本原因。',
    fields: [
      { name: 'event_date', type: 'date', description: '日期', example: '2024-08-12' },
      { name: 'channel', type: 'string', description: '流量渠道', example: 'natural_search' },
      { name: 'uv', type: 'int', description: '当日 UV', example: '124000' },
      { name: 'paid_users', type: 'int', description: '当日付费用户数', example: '3968' },
      { name: 'gmv', type: 'decimal', description: '当日 GMV', example: '628000.00' },
      { name: 'd7_repurchase_users', type: 'int', description: '当日新客中 7 天内复购数', example: '386' }
    ],
    sqlSketch: '-- 流量结构健康度指数计算\nWITH channel_metrics AS (\n  SELECT channel,\n         SUM(uv)                          AS uv,\n         SUM(paid_users)                  AS paid,\n         SUM(gmv)                         AS gmv,\n         SUM(d7_repurchase_users)         AS d7_rep_users\n  FROM channel_daily\n  WHERE event_date BETWEEN \'2024-08-01\' AND \'2024-08-31\'\n  GROUP BY channel\n),\nchannel_quality AS (\n  SELECT *,\n         paid * 1.0 / NULLIF(uv, 0)               AS cvr,\n         d7_rep_users * 1.0 / NULLIF(paid, 0)     AS d7_rep_rate,\n         gmv * 1.0 / NULLIF(uv, 0)                AS gmv_per_uv,\n         -- 综合质量分（0-100）：CVR 权重 40% + D7 复购 40% + 客单 20%\n         LEAST(100,\n           cvr * 1000 * 0.4 +\n           d7_rep_rate * 100 * 0.4 +\n           (gmv * 1.0 / NULLIF(uv, 0)) * 0.2\n         ) AS quality_score\n  FROM channel_metrics\n)\nSELECT *,\n       uv * quality_score / 100 AS quality_adj_uv  -- 质量调整 UV\nFROM channel_quality;',
    analysisProcess: '问题验证：UV 同比 +30% 但 GMV 仅 +3%，差距 27pp 必有原因。先按渠道拆 UV 看是哪个渠道在增——自然搜索 +5%、种草 +12%、付费搜索 +8%、信息流 +85%、联盟 +120%、地推扫码 +200%。**信息流 / 联盟 / 地推三个低质渠道的 UV 暴增，自然渠道几乎不增**。\n质量分定义：基于历史数据，每个渠道的"用户质量"用三指标加权——CVR（权重 40%）+ D7 复购率（40%）+ GMV/UV（20%）。结果各渠道质量分：自然搜索 87 / 种草 78 / 付费搜索 65 / 信息流 32 / 联盟 18 / 地推 12 / 其他 25。**低质渠道的质量分仅是高质渠道的 1/5 - 1/3**。\n质量调整 UV：把每个渠道 UV × 其质量分 / 100 得到"质量调整 UV"。当期 750 万 UV 的质量调整后 = 自然 280×87 + 种草 95×78 + 搜索 145×65 + 信息流 115×32 + 联盟 65×18 + 地推 30×12 + 其他 20×25 = 约 530 万。同期去年 580 万 UV 质量调整后 = 约 504 万。**质量调整 UV 同比仅 +5%，与 GMV +3% 高度吻合**。\n流量健康度指数：定义流量健康度指数 = 质量调整 UV / 总 UV × 100。当期 530/750 = 71；去年同期 504/580 = 87。**流量健康度从 87 降到 71（-16 分）**，证明流量结构在恶化。\n根因：投放团队过去一年为追求"UV 增长 30%"的 KPI，大量加投了 CPM 极低的信息流 + 联盟渠道。这些渠道流量大但质量差，对 GMV 贡献微小。本质是"虚荣指标"驱动的错误投放。\n业务影响测算：750 万 UV 中约 240 万是"无效低质流量"（质量分 < 30 的渠道），月度该部分投放支出约 280 万。如果砍掉转给高质渠道，预计 GMV 提升 18-25%。',
    coreFindings: [
      {
        finding: '流量健康度指数从 87 降到 71，结构恶化是 GMV 不增的根因',
        evidence: 'UV +30% 但质量调整 UV 仅 +5%，与 GMV +3% 高度吻合。流量增量主要来自低质渠道。',
        implication: '只看 UV 是看不到流量真实价值的。流量结构变化可以让"UV 大增"和"GMV 不增"同时发生。'
      },
      {
        finding: '低质渠道的质量分是高质渠道的 1/5',
        evidence: '自然搜索质量分 87 / 联盟 18 / 地推 12，差异 5-7 倍。意味着在 GMV 贡献上，1 万自然 UV ≈ 5 万联盟 UV。',
        implication: '不同渠道的 UV 不能简单相加。"等价 UV"的概念才是流量管理的真实度量衡。'
      },
      {
        finding: '"UV 增长 30%"是虚荣指标 KPI 的恶果',
        evidence: '投放团队为追求 UV KPI 大量加投低质渠道。这种 KPI 不仅没带来商业价值，还消耗了 280 万/月预算。',
        implication: 'KPI 设计本身决定团队行为方向。错误 KPI 会让团队"努力做错事"。流量管理的核心 KPI 必须是"质量调整 UV"或 GMV，不是裸 UV。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '投放 KPI 切换为"质量调整 UV"',
        action: '投放团队的核心 KPI 从"裸 UV 增长"改为"质量调整 UV 增长"。低质渠道的预算分配大幅缩减，高质渠道（自然、种草）扩量。',
        expectedOutcome: 'UV 增速放缓但质量调整 UV 增速反超，GMV 同比转正至 +20%+。',
        owner: '投放 + 数据团队'
      },
      {
        strategy: '建立"流量健康度指数"月度看板',
        action: 'BI 平台每月跑流量健康度指数，对每个渠道的 UV、质量分、质量调整 UV、贡献度自动呈现。CFO 月会必看。',
        expectedOutcome: '流量结构问题从被动发现变为主动管理，避免重蹈覆辙。',
        owner: '数据团队'
      },
      {
        strategy: '低质渠道阶梯优化或清退',
        action: '渠道质量分 < 25 的"地推扫码 / 部分联盟"在 90 天内逐步清退。质量分 25-50 的"信息流"做素材优化（精细人群定向 + 高质素材），目标质量分提升至 50+。',
        expectedOutcome: '月度低质流量预算节省 280 万，转投高质渠道带来 GMV 增量约 18-25%。',
        owner: '投放 + CMO 办公室'
      }
    ],
    businessOutcome: '调整 6 个月后：流量健康度指数从 71 回升至 78；UV 同比 +12%（增速放缓但质量上升），质量调整 UV +21%；GMV 同比从 +3% 转正至 +24%；低质渠道清退节省的预算 1680 万投入到自然搜索 SEO + 种草内容生产，长期价值持续释放。',
    reflection: '复用边界：流量健康度指数适用于"多渠道流量、有完整渠道质量数据"的电商。不适用于：(1) 单一渠道为主的店铺；(2) 渠道质量数据缺失（无法回流 D7 复购、CVR）；(3) 极小流量初创业务（每个渠道样本不足，质量分波动大）。\n失败教训：第一版的渠道质量分只用 CVR 单一指标，低估了 D7 复购率的重要性。结果信息流（CVR 不算太差但 D7 复购极低）的质量分被打高了，仍占预算大头。后期增加 D7 复购权重 40% 才校准正确。**质量评分体系必须兼顾"短期转化"和"长期价值"两个维度。**\n下一步进阶：(1) 把流量健康度指数扩展到"流量健康度雷达图"——增加趋势、新颖度、品类丰富度等更多维度；(2) 引入流量预测模型，按当前结构预测未来 3 个月 GMV，提前发现结构问题；(3) 把流量管理与商品管理联动——不同流量适合推不同商品（高质流量推高客单，低质流量推引流款），实现千渠道千面。'
  },
  {
    id: 'c-nps-driver-30',
    title: 'NPS 驱动因素分析：从 38 分到 62 分，回答了 5 个关键问题',
    category: '进阶方法',
    subcategory: '体验分析',
    industry: '综合电商平台',
    difficulty: '进阶',
    tags: ['NPS 分析', '驱动因素', '回归分析', '客户体验'],
    prerequisites: ['NPS 计算公式', '相关性 vs 因果性', '简单回归概念'],
    summary: '某电商 NPS 38 分（行业头部 60+），多年提升乏力。常规做法是"哪个低分指标就改哪个"，治标不治本。建立 NPS 驱动因素回归模型，量化每个体验维度对 NPS 的真实影响——发现物流时效（β=0.42）、商品质量（β=0.31）、客服响应（β=0.18）合计贡献 91% NPS 解释力，价格、UI 美观、推荐准确度等"看似重要"的维度合计仅贡献 9%。集中资源攻克 Top 3 维度后 NPS 12 个月内从 38 升至 62。',
    background: '某综合电商月活 320 万付费用户，NPS（净推荐值）长期 35-40 分（行业头部水平 55-65 分）。CEO 把 NPS 列为公司年度核心 KPI，每个部门都被分配了"提升 NPS"任务。\n但实际进展缓慢——产品改 UI 没用、客服培训没用、价格促销没用。每个部门都"觉得自己很重要"但都不知道哪个是真的重要。需要数据团队用科学方法量化每个体验维度对 NPS 的真实贡献，告诉公司"应该把资源砸到哪里"。',
    fields: [
      { name: 'survey_id', type: 'string', description: '调研问卷 ID', example: 'NPS_240812_002' },
      { name: 'user_id', type: 'string', description: '用户 ID', example: 'U_8830012' },
      { name: 'nps_score', type: 'int', description: '总体推荐意愿（0-10）', example: '8' },
      { name: 'rate_logistics', type: 'int', description: '物流体验评分（1-5）', example: '4' },
      { name: 'rate_quality', type: 'int', description: '商品质量评分（1-5）', example: '5' },
      { name: 'rate_service', type: 'int', description: '客服评分（1-5）', example: '3' },
      { name: 'rate_price', type: 'int', description: '价格评分（1-5）', example: '4' },
      { name: 'rate_ui', type: 'int', description: 'UI 美观评分（1-5）', example: '4' },
      { name: 'rate_recommend', type: 'int', description: '推荐准确度评分（1-5）', example: '3' }
    ],
    sqlSketch: '# Python: 多元线性回归找 NPS 驱动因子\nimport pandas as pd\nimport statsmodels.api as sm\nfrom sklearn.preprocessing import StandardScaler\n\ndf = pd.read_sql(\'SELECT * FROM nps_survey WHERE survey_date >= \\\'2024-01-01\\\'\', conn)\n\n# 特征：6 个体验维度评分（1-5），先标准化\nfeatures = [\'rate_logistics\', \'rate_quality\', \'rate_service\', \n            \'rate_price\', \'rate_ui\', \'rate_recommend\']\nX = StandardScaler().fit_transform(df[features])\nX = sm.add_constant(X)\ny = df[\'nps_score\']\n\n# OLS 回归\nmodel = sm.OLS(y, X).fit()\nprint(model.summary())\n\n# 标准化系数（β）即每个维度对 NPS 的相对影响力\n# β=0.42 意味着该维度评分增加 1 个标准差，NPS 增加 0.42 个标准差',
    analysisProcess: '数据准备：取过去 12 个月共 14 万条 NPS 调研有效问卷（剔除随便填的、矛盾填的约 8%）。每条记录用户在 6 个体验维度的评分（1-5）+ NPS 总分（0-10）。\n维度间相关性检查：先看 6 个维度评分之间的相关系数。物流与质量相关 0.32（中等）、客服与质量 0.18（弱）、价格与质量 0.41（中等）、UI 与各项 0.10-0.20（弱）。**多重共线性可控**，可以用回归。\n多元线性回归：以 NPS 为因变量、6 个维度评分为自变量做标准化回归（让每个变量量纲一致）。结果：\n- 物流时效 β = 0.42（p < 0.001，最强）\n- 商品质量 β = 0.31（p < 0.001）\n- 客服响应 β = 0.18（p < 0.001）\n- 价格 β = 0.06（p = 0.04，弱显著）\n- UI 美观 β = 0.03（p = 0.18，不显著）\n- 推荐准确度 β = 0.04（p = 0.09，不显著）\n模型 R² = 0.61（中等偏好），即 6 个维度解释了 61% 的 NPS 变异。剩余 39% 来自未测量的因素 + 个体随机性。\n关键洞察：物流 + 质量 + 客服合计 β = 0.91（占总解释力的 91%）。**资源应该 91% 投在这三个维度，剩下 9% 才是其他**。但当前公司各部门预算分配大致 23%（产品 UI）+ 22%（推荐算法）+ 20%（客服）+ 18%（物流）+ 12%（价格）+ 5%（商品质量），明显错配。\n反直觉发现：UI 美观（β=0.03）和推荐准确度（β=0.04）虽然平均评分都不算高（3.5/3.4），但对 NPS 影响很弱。原因——这两个维度是"卫生因素"，差到一定程度才让人不爽，正常水平不会让人特别推荐。\n响应曲线分析：每个维度的"评分 → NPS 影响"是否线性？画散点图发现物流 / 质量 / 客服都呈"非线性边际递减"——评分从 3 升到 4 对 NPS 影响 +1.5；从 4 升到 5 仅影响 +0.6。**把"差"的维度提到"良"比把"良"的提到"优"投入产出比高 2.5 倍**。\nNPS 提升路径：当前物流评分 3.4 / 质量 3.7 / 客服 3.2。优先级——客服（3.2 → 4 ≈ +1.5 NPS 子项 = 0.18 × 1.5 = +0.27 NPS）、物流（3.4 → 4 ≈ +0.84 NPS 子项 × 0.42 = +0.35 NPS）、质量（3.7 → 4 ≈ +0.45 NPS 子项 × 0.31 = +0.14 NPS）。聚焦客服 + 物流，一年内 NPS 可提升 12+ 分。',
    coreFindings: [
      {
        finding: '物流 + 质量 + 客服占 NPS 解释力 91%',
        evidence: '回归 β 系数：物流 0.42 / 质量 0.31 / 客服 0.18，合计 0.91。其他三项合计 0.13。',
        implication: '体验提升的资源分配必须按"对 NPS 的真实贡献"而非"团队期望"来决定。"什么都重要"等于"什么都不重要"。'
      },
      {
        finding: 'UI 美观和推荐准确度对 NPS 几乎没影响',
        evidence: 'β = 0.03 / 0.04，p 值 > 0.05 不显著。意味着改 UI 改推荐对 NPS 无统计学影响。',
        implication: '产品团队大量投入 UI / 推荐算法对"用户推荐意愿"几乎无效。这些投入有其他价值（如转化率），但不能算到 NPS KPI 上。'
      },
      {
        finding: '体验提升存在"边际递减"，把差变良比把良变优 ROI 高 2.5 倍',
        evidence: '物流评分 3 升到 4 NPS 增加 1.5，4 升到 5 增加 0.6。',
        implication: '体验提升应优先解决"短板"。已经做到良好水平的维度再优化 ROI 极低。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '资源重分配：聚焦客服 + 物流',
        action: '客服 + 物流预算占比从 38% 提升至 55%，UI + 推荐预算从 45% 降至 25%。同时设置客服评分 ≥ 4、物流评分 ≥ 4 为半年硬性目标。',
        expectedOutcome: '12 个月 NPS 提升 12-15 分，从 38 升至 50+。',
        owner: 'CEO 办公室 + 各部门'
      },
      {
        strategy: '客服响应升级',
        action: '客服平均响应时长 SLA 从 50 秒压缩至 25 秒；高客单类目 24 小时专属客服；满意度 < 3 评分自动升级到主管 24 小时跟进。',
        expectedOutcome: '客服评分从 3.2 升至 4.2+，对应 NPS 子项贡献 +0.36。',
        owner: '客服管理'
      },
      {
        strategy: '物流时效升级',
        action: '与 3 大物流商签 SLA（72 小时送达率 ≥ 95%）；偏远区域增加分仓；包裹破损率从 1.5% 压至 0.5%。',
        expectedOutcome: '物流评分从 3.4 升至 4.3+，对应 NPS 子项贡献 +0.38。',
        owner: '物流团队'
      },
      {
        strategy: '建立 NPS 驱动因子季度复盘',
        action: '每季度跑一次 NPS 回归模型，跟踪 β 系数变化。如果某维度 β 系数显著变化，调整资源分配。',
        expectedOutcome: 'NPS 管理从 KPI 任务变为持续改进，长期保持驱动因子敏感度。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '12 个月后：NPS 从 38 升至 62（达到行业头部水平）；客服评分从 3.2 升至 4.4，物流评分从 3.4 升至 4.5，质量评分维持 3.8；客户复购率提升 7pp（NPS 提升的副产品）；用户口碑推荐占新客来源比例从 8% 升至 18%。该方法被 CEO 推广到其他业务线（金融、出行）。',
    reflection: '复用边界：NPS 回归分析适用于"NPS 调研样本量充足（≥ 5000/月）、体验维度可量化拆分、各维度独立性较强"的业务。不适用于：(1) 调研样本量小（< 1000）；(2) 维度高度共线（如"商品质量"和"商品描述准确度"难以分离）；(3) 高度个性化品类（如奢侈品 NPS 受品牌叙事影响远超功能维度）。\n失败教训：第一版没标准化变量直接做回归，得到的 β 系数因量纲不同无法比较（物流是 1-5、推荐是 0-10）。后期标准化后才得到可解释的相对影响力。**任何回归分析都要先做特征标准化，否则系数是误导性的。**\n下一步进阶：(1) 用 SHAP 值替代标准化系数，更精准衡量每个维度的边际贡献；(2) 引入交互项（如"物流 × 客服"），识别"两个维度联合恶化时的雪上加霜效应"；(3) 把 NPS 驱动因子分析扩展到细分客群（高价值客 / 沉睡客 / 新客），不同人群对体验维度的敏感度不同，可指导差异化策略。'
  },
  {
    id: 'c-diagnosis-report-31',
    title: '业务诊断报告标准化：5W2H + MECE 让分析报告被业务方真正用起来',
    category: '基础模型',
    subcategory: '分析方法论',
    industry: '综合电商平台',
    difficulty: '入门',
    tags: ['诊断报告', '5W2H', 'MECE', '分析师方法论'],
    prerequisites: ['MECE 原则', '5W2H 框架', '业务诊断基本流程'],
    summary: '某电商数据团队 5 名分析师每月输出 30+ 份业务诊断报告，但业务方采纳率仅 18%，大部分报告"看完没下文"。引入 5W2H + MECE 标准化报告框架——明确"问题是什么 / 为什么发生 / 影响多大 / 涉及谁 / 何时何地 / 怎么办 / 多少代价"7 个必答问题，结合 MECE 拆解保证不重不漏。3 个月后报告采纳率从 18% 升至 52%，分析师人均月产出从 6 份精简到 4 份高质量报告。',
    background: '某综合电商数据团队 5 名分析师，月度输出业务诊断报告约 30 份（GMV 异动、品类分析、用户行为、活动复盘等）。VP 数据在年度复盘中提出尖锐问题——"为什么我们写了这么多报告，业务还是按经验决策？" 实际盘点发现报告采纳率（业务方明确说"我们要按这个建议做"的比例）仅 18%。\n问题本质：报告质量参差不齐——有的只罗列数字没有结论；有的结论很多但没说怎么做；有的方案很多但没说成本和优先级。业务方读完不知道下一步是什么。需要建立标准化报告框架。',
    fields: [
      { name: 'report_id', type: 'string', description: '报告唯一标识', example: 'RPT_240812_002' },
      { name: 'analyst_id', type: 'string', description: '分析师 ID', example: 'A_22' },
      { name: 'report_type', type: 'string', description: '报告类型（异动/复盘/专题）', example: 'attribution' },
      { name: 'is_adopted', type: 'bool', description: '是否被业务方采纳', example: 'true' },
      { name: 'pages_count', type: 'int', description: '报告页数', example: '12' }
    ],
    sqlSketch: '-- 报告采纳率与质量要素分析\nSELECT \n  has_5w2h_complete,        -- 是否回答 7 个核心问题\n  has_mece_breakdown,       -- 是否做 MECE 拆解\n  has_quantified_impact,    -- 是否量化业务影响\n  has_action_owner,         -- 是否明确责任方\n  COUNT(*)                                   AS report_cnt,\n  AVG(CASE WHEN is_adopted THEN 1.0 ELSE 0.0 END) AS adoption_rate\nFROM report_log\nWHERE report_date BETWEEN \'2024-01-01\' AND \'2024-08-31\'\nGROUP BY 1, 2, 3, 4\nORDER BY adoption_rate DESC;',
    analysisProcess: '现状盘点：把过去 8 个月 240 份报告对照检查 4 个质量维度（5W2H 完整性 / MECE 拆解 / 量化影响 / 明确责任方）。结果：4 维全满足的报告仅 28%，采纳率 65%；3 维满足占 32%，采纳率 35%；2 维及以下占 40%，采纳率仅 8%。**质量四维与采纳率呈强正相关**。\n5W2H 框架定义：每份诊断报告必须明确回答 7 个问题——What（问题是什么，量化定义）/ Why（根本原因，归因到底）/ Who（涉及哪些用户/部门/环节）/ When（何时发生，多长时间窗口）/ Where（在哪个维度发生，渠道/品类/区域）/ How（如何整改，3-5 个具体动作）/ How much（影响多大、整改成本多少、预期收益多少）。\nMECE 拆解：每个根因诊断必须做 MECE 拆解——相互独立（不重复）、完全穷尽（不遗漏）。例如分析"GMV 下滑"必须按"UV / CVR / AOV"三因子拆解（互斥），再每个因子按"维度组合"展开（穷尽到 Top 5 贡献者）。\n报告模板设计：基于 5W2H + MECE 制作标准模板，结构固定为——背景与问题（What + When + Where）、根因诊断（Why + MECE 拆解）、影响量化（How much）、整改方案（How + Who，含优先级 P0/P1/P2 +预期收益 + 成本）、风险与边界。每份报告必须有"一页执行摘要"在最前面。\n试运行与培训：先在数据团队内部跑 1 个月模板，分析师互评打分（4 个维度各 1-5 分）。低于 16 分的报告不给业务方，由作者修订。第二个月开放给业务方，采纳率显著提升。',
    coreFindings: [
      {
        finding: '报告质量四维 vs 采纳率呈强正相关',
        evidence: '4 维全满足报告采纳率 65%，2 维及以下采纳率仅 8%，差距 8 倍。',
        implication: '报告采纳率不是业务方的偏好问题，是报告自身完整性的问题。框架化是提升采纳率的最低成本路径。'
      },
      {
        finding: '"量化影响 + 明确责任方"是采纳率最强单一信号',
        evidence: '其余 3 维相同情况下，是否量化影响和明确责任方让采纳率从 24% 提到 58%。',
        implication: '业务方采纳决策的关键是"知道事情多严重 + 知道谁负责"，这两条比"分析多深入"更重要。'
      },
      {
        finding: '人均月产出减少但采纳率大涨',
        evidence: '从月均 6 份精简到 4 份，但采纳率从 18% 升至 52%。',
        implication: '高质量报告的真实产出 = 数量 × 采纳率。少而精显然胜于多而水。分析师 KPI 应改为"采纳率 + 影响金额"。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '5W2H + MECE 报告模板强制使用',
        action: '所有正式诊断报告必须用模板，"一页执行摘要"放最前。报告评审环节由 VP 数据用 4 维 score 卡打分，低于 16 分退回修订。',
        expectedOutcome: '报告质量基线统一，采纳率从 18% 升至 50%+。',
        owner: '数据团队 + VP'
      },
      {
        strategy: '分析师 KPI 切换为"采纳率 + 影响金额"',
        action: 'KPI 从"月报告产出量"改为"被采纳报告数 × 报告影响金额估算"。一份采纳的高影响报告 > 5 份未采纳的报告。',
        expectedOutcome: '团队从"为产出而产出"转向"为业务影响而工作"。',
        owner: 'VP 数据 + HR'
      },
      {
        strategy: '建立报告影响跟踪机制',
        action: '每份采纳报告 30 / 60 / 90 天后由数据团队回访业务方，记录实际整改进度与影响。失败的整改也复盘原因。',
        expectedOutcome: '形成"分析 → 整改 → 验证 → 学习"闭环，分析师能力快速迭代。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '模板上线 12 个月后：报告采纳率从 18% 升至 56%；分析师月人均报告数从 6 降至 4，但被采纳报告数从 1.1 升至 2.2（实际产出翻倍）；业务方对数据团队满意度评分从 3.2 升至 4.4；该模板被推广到产品 / 运营团队的内部决策报告。',
    reflection: '复用边界：5W2H + MECE 报告框架适用于"业务诊断、异动归因、活动复盘、专题分析"等结构化报告。不适用于：(1) 探索性数据分析（EDA，没有明确问题）；(2) 数据可视化看板设计（不是报告类型）；(3) 高度叙事性的洞察分享（如年度战略汇报）。\n失败教训：第一版模板过于死板，分析师为了凑齐 7 个问题硬填一些"不适用"内容，导致报告冗长。后期改为"必答 5 个核心问题（What / Why / How / How much / Who），其余可选"，灵活度提升后接受度大幅提升。**模板是辅助工具，不是教条。**\n下一步进阶：(1) 把报告评审做成 LLM 自动打分工具（4 维各 1-5 分自动评估）；(2) 建立"高采纳报告知识库"，把历史经典报告作为新人培训案例；(3) 引入"报告价值估算模型"，根据涉及业务体量 + 整改可行性 + 数据置信度自动估算报告 ROI。'
  },

  {
    id: 'c-adhoc-mgmt-32',
    title: '临时取数管理：从 65% 时间救火到 25% 的工作流重构',
    category: '基础模型',
    subcategory: '工作流管理',
    industry: '综合电商平台',
    difficulty: '入门',
    tags: ['临时取数', '需求管理', '看板自动化', '数据团队效率'],
    prerequisites: ['数据团队工作流认知', 'SQL 基础', '需求分类思维'],
    summary: '某电商数据团队 8 名分析师，每月接 320+ 临时取数需求，分析师 65% 时间用在"重复性临时取数"上，深度分析时间不到 25%。盘点 8 个月 2400+ 需求后发现 70% 是 25 个常用问题的变体（如"上周某品类 GMV""某活动 ROI"）。建立分级响应机制 + 自助看板覆盖 70% 高频需求后，临时取数耗时占比降至 25%，分析师深度分析时间翻倍，业务方平均响应时长从 2 天压缩至 30 分钟。',
    background: '某电商数据团队 8 名分析师，月度接到的临时取数需求约 320 条（业务方"帮我拉一下 XX 数据"），每条平均耗时 2.5 小时。分析师月均 200 工时投入临时取数，仅余 100 工时做深度分析。\nVP 数据每月被各业务部门投诉"取数太慢"——业务方需要数据等 1-3 天。同时分析师团队也在抱怨"天天救火没法做正事"。两边都不满意，需要数据团队建立科学的需求管理机制。',
    fields: [
      { name: 'request_id', type: 'string', description: '需求唯一 ID', example: 'REQ_240812_002' },
      { name: 'requester_dept', type: 'string', description: '需求方部门', example: '运营部' },
      { name: 'request_type', type: 'string', description: '需求类型', example: 'recurring_query' },
      { name: 'submitted_at', type: 'datetime', description: '需求提交时间', example: '2024-08-12 14:23:11' },
      { name: 'completed_at', type: 'datetime', description: '完成时间', example: '2024-08-13 16:45:00' },
      { name: 'time_cost_min', type: 'int', description: '耗时（分钟）', example: '125' }
    ],
    sqlSketch: '-- 需求频次分析：找出高频重复模式\nWITH request_topic AS (\n  SELECT \n    -- 用关键词聚类把需求归类（每月某品类GMV → 品类GMV类）\n    CASE\n      WHEN topic_text ILIKE \'%品类%GMV%\'          THEN \'品类GMV\'\n      WHEN topic_text ILIKE \'%活动%ROI%\'          THEN \'活动ROI\'\n      WHEN topic_text ILIKE \'%渠道%转化%\'          THEN \'渠道转化\'\n      WHEN topic_text ILIKE \'%用户%留存%\'          THEN \'用户留存\'\n      ELSE \'其他\'\n    END AS topic_category,\n    request_id, time_cost_min\n  FROM data_request_log\n  WHERE submitted_at >= \'2024-01-01\'\n)\nSELECT topic_category,\n       COUNT(*)                              AS req_cnt,\n       SUM(time_cost_min) / 60.0             AS total_hours,\n       AVG(time_cost_min)                    AS avg_min\nFROM request_topic\nGROUP BY topic_category\nORDER BY req_cnt DESC;',
    analysisProcess: '需求盘点：把过去 8 个月 2400 条临时取数需求按"业务问题"做关键词聚类，得到 47 个具体话题。Top 25 话题占总需求量 70%（典型帕累托）。这意味着——70% 的工作是 25 个问题的变体，完全可以"一次开发，多次复用"。\n需求分级：把所有需求按"频次 + 复杂度"分四类——A 类（高频简单，如"上周某品类 GMV"，月均 6+ 次）适合做自助看板；B 类（高频复杂，如"用户分群分析"，月均 2-5 次）适合做参数化报表；C 类（低频简单）由分析师快速响应；D 类（低频复杂）做正式专题。\n分级响应机制：A 类（占需求 70%）走自助看板，业务方自己拖拉；B 类（15%）走参数化报表（分析师配置好模板，业务方填参数即生成）；C 类（10%）走数据团队统一队列，4 小时 SLA；D 类（5%）走专题立项流程。\n自助看板建设：用帆软 / Tableau / Metabase 等 BI 工具，针对 Top 25 话题各做一个看板。覆盖 70% 历史需求量。每个看板必须自带——指标定义说明 / 数据更新时间 / 联系人 / 常见问答。让业务方"自己能看懂"。\n试点验证：先在 1 个业务部门试点（运营部），3 个月后看效果——运营部临时取数提交量从月均 80 条降至 22 条（-72%），自助看板使用次数月均 2400 次（覆盖 60+ 业务方），看板满意度评分 4.3/5。\n推广与培训：把试点经验扩展至全部业务部门。每个业务部门指派"数据 BP"作为接口人，负责需求分级 + 看板培训。同时建立看板使用率月度排行榜，鼓励业务方自助。',
    coreFindings: [
      {
        finding: '70% 临时取数是 25 个高频问题的变体',
        evidence: '2400 条需求归类为 47 个话题，Top 25 占需求量 70%。典型的帕累托分布。',
        implication: '临时取数的"看似多样"是表象，实际有强重复性。一次性开发自助看板覆盖高频需求是高 ROI 选择。'
      },
      {
        finding: '分级响应让"高复杂、高价值"需求得到充分分析',
        evidence: 'A 类走自助、C/D 类走人工后，分析师人均深度分析时间从 100 工时升至 200+ 工时（翻倍）。',
        implication: '数据团队的真正价值不在"快速响应"，在"深度洞察"。把人力从重复劳动中解放出来才能产生杠杆。'
      },
      {
        finding: '业务方自助率与看板满意度强相关',
        evidence: '运营部自助率 73% 时满意度 4.3/5；其他低自助率部门满意度普遍 3.5 以下。',
        implication: '业务方并不抗拒自助，他们抗拒的是"找不到、看不懂、不准确"的看板。看板设计质量直接决定自助效果。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '自助看板覆盖 Top 25 高频话题',
        action: '数据团队 2 个月内开发 25 个核心看板，每个看板配独立 wiki + 在线培训视频。看板按业务流程分主题域（GMV、用户、商品、活动）。',
        expectedOutcome: '70% 临时取数转为自助，分析师月均工时投入从 200 降至 70。',
        owner: '数据团队 + BI 工程'
      },
      {
        strategy: '建立需求分级 SLA + 数据 BP 制度',
        action: 'A/B/C/D 四级响应（自助/参数化/4 小时/专题）；每个业务部门指派 1 名数据 BP 接口人，由 BP 做需求分级，避免数据团队被低优先级需求淹没。',
        expectedOutcome: '需求响应速度提升 80%，业务方满意度评分从 3.0 升至 4.2。',
        owner: '数据团队 + 各业务部门'
      },
      {
        strategy: '建立看板使用率月度运营机制',
        action: 'BI 工具自动统计每个看板的使用次数 / 使用人数 / 使用部门。低使用率（< 月 50 次）的看板要么改进要么淘汰。月度看板排行榜在公司内部公开。',
        expectedOutcome: '看板从"开发完就死"变成"持续运营的产品"，平均使用寿命从 3 个月延长到 18 个月。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '机制落地 6 个月后：临时取数耗时占比从 65% 降至 25%；分析师深度分析时间翻倍；自助看板月度使用 1.8 万次，覆盖 90% 中层及以上业务负责人；业务方对数据团队满意度从 3.0 升至 4.3；数据团队人均月产出深度分析报告从 1.2 份升至 3.4 份。',
    reflection: '复用边界：临时取数管理体系适用于"数据团队 ≥ 3 人、业务部门多、月需求 ≥ 50 条"的成熟数据团队。不适用于：(1) 极小数据团队（1-2 人，没有分级管理的必要）；(2) 业务模式频繁变化的初创公司（看板需求不稳定）；(3) 强保密性数据（无法做自助）。\n失败教训：第一版直接拒绝业务方的临时需求让其去用看板，引发强烈反弹。后期改为"先满足需求 + 主动告知该需求未来可在 X 看板查到"软推广，接受度大幅提升。**变革管理比工具本身更重要。**\n下一步进阶：(1) 引入"自然语言查询"工具（NL2SQL），业务方用大白话问"上周服饰品类 GMV"，系统自动生成 SQL；(2) 建立指标治理系统，所有指标定义在统一平台维护，避免不同看板口径冲突；(3) 用 LLM 做"看板智能推荐"，业务方搜索时自动匹配最相关看板。'
  },

  {
    id: 'c-data-quality-33',
    title: '数据质量五维监控：表层正常底层全是脏数据的隐形危机',
    category: '基础模型',
    subcategory: '数据治理',
    industry: '综合电商平台',
    difficulty: '入门',
    tags: ['数据质量', '数据治理', '指标可信度', '数据校验'],
    prerequisites: ['数据完整性概念', 'NULL 与空值处理', '主键与外键关系'],
    summary: '某电商业务方屡次反馈"指标对不上"——大盘 GMV 与品类 GMV 加总差 8%、订单表与支付表用户数差 12%、Excel 导出与 BI 看板差 5%。建立完整性 / 一致性 / 准确性 / 唯一性 / 时效性五维数据质量监控后，识别出 18 个高频质量问题——含 6 个严重问题（如订单表外键缺失导致 12 万条孤儿记录）。系统化整改后数据可信度从"业务方常质疑"变为"业务方默认相信"，月度数据撕扯会议时长减少 80%。',
    background: '某综合电商月度交易订单 280 万笔，业务报表覆盖大盘 / 品类 / 渠道 / 用户等多维度。2024 年 Q2 业务方多次提出数据问题——CMO 看的大盘 GMV 11.4 亿、CTO 看的品类 GMV 加总 12.3 亿（差 8%）；用户运营看订单表用户数 86 万、支付分析看支付表用户数 76 万（差 12%）。\n经常发生的"数据撕扯会议"——业务方拿着不同口径的数字争论谁对谁错，数据团队夹在中间疲于解释。VP 数据要求建立体系化数据质量监控，让"数据"成为公司的可信基础设施。',
    fields: [
      { name: 'check_date', type: 'date', description: '检查日期', example: '2024-08-12' },
      { name: 'table_name', type: 'string', description: '数据表名', example: 'order_master' },
      { name: 'check_dimension', type: 'string', description: '质量维度', example: 'completeness' },
      { name: 'metric_value', type: 'float', description: '质量指标值', example: '0.965' },
      { name: 'is_passed', type: 'bool', description: '是否通过校验', example: 'false' },
      { name: 'issue_severity', type: 'string', description: '严重等级', example: 'high' }
    ],
    sqlSketch: '-- 数据质量五维监控核心 SQL（以订单表为例）\n\n-- 1. 完整性：必填字段空值率\nSELECT 1.0 - SUM(CASE WHEN user_id IS NULL THEN 1.0 ELSE 0.0 END) / COUNT(*) AS user_id_completeness,\n       1.0 - SUM(CASE WHEN pay_amount IS NULL THEN 1.0 ELSE 0.0 END) / COUNT(*) AS amount_completeness\nFROM order_master WHERE order_date = CURRENT_DATE;\n\n-- 2. 一致性：跨表关键字段加总对比\nSELECT (SELECT SUM(pay_amount) FROM order_master WHERE order_date = CURRENT_DATE)\n     - (SELECT SUM(amount)     FROM payment_log  WHERE pay_date   = CURRENT_DATE) AS gmv_diff;\n\n-- 3. 准确性：指标合理性范围（如客单价不应 < 1 元 或 > 1 万元）\nSELECT COUNT(*) AS abnormal_cnt FROM order_master\nWHERE order_date = CURRENT_DATE AND (pay_amount < 1 OR pay_amount > 10000);\n\n-- 4. 唯一性：主键重复检测\nSELECT order_id, COUNT(*) AS dup_cnt FROM order_master\nWHERE order_date = CURRENT_DATE GROUP BY order_id HAVING COUNT(*) > 1;\n\n-- 5. 时效性：数据更新延迟\nSELECT EXTRACT(EPOCH FROM (NOW() - MAX(create_time))) / 60 AS minutes_since_last\nFROM order_master;',
    analysisProcess: '问题盘点：先梳理过去 3 个月的"数据撕扯"案例 18 起，按问题模式分类——口径不一致（6 起）/ 数据丢失（4 起）/ 重复计算（3 起）/ 数据延迟（3 起）/ 其他（2 起）。\n五维框架建立：基于 DAMA 数据治理标准，定义五个质量维度——\n- **完整性**（Completeness）：必填字段是否齐全（如订单必有 user_id、pay_amount）\n- **一致性**（Consistency）：跨表/跨系统数据是否对齐（如订单表 GMV 与支付表 GMV 应相等）\n- **准确性**（Accuracy）：数据是否在合理范围（如客单价不应 < 1 元，转化率不应 > 100%）\n- **唯一性**（Uniqueness）：主键是否唯一不重复\n- **时效性**（Timeliness）：数据是否及时更新（订单表延迟应 < 5 分钟）\n核心问题诊断：跑五维校验脚本检查 12 张核心表，发现 18 个具体问题，其中 6 个严重——\n1. 订单表 12 万条记录的 user_id 是已注销用户（外键失效），但仍计入 GMV\n2. 支付表与订单表的 GMV 差 1.2 亿/月，原因是支付表把"已退款"算进 GMV 但订单表已剔除\n3. 用户表存在 8000 个重复 user_id（主键唯一性失效）\n4. 订单时间字段有 3% 用 UTC、97% 用本地时区，导致跨日订单归属错误\n5. 退货表更新延迟 12 小时（业务定义应实时），导致 GMV 净值口径滞后\n6. 渠道字段 12% 是"unknown"，但报表自动归到"自然渠道"，渠道贡献被高估\n监控系统建设：建立每日质量校验任务，每个核心表跑 5 维校验，异常自动报警到企业微信。建立"数据质量看板"——可信度评分（0-100）+ 18 个细项问题状态实时呈现。\n口径治理：所有跨表指标必须在指标 wiki 上明确定义口径（含税/不含税、含退款/不含退款、UTC/本地时区）。每个指标指定唯一"数据源真相"。',
    coreFindings: [
      {
        finding: '"表层指标正常"不等于"底层数据健康"',
        evidence: '5 个高频问题在表层指标（GMV、UV）上看起来正常，但底层全是脏数据。业务方靠肉眼无法发现。',
        implication: '数据质量必须主动监控，不能等业务方反馈。等到业务发现问题时已经决策错了。'
      },
      {
        finding: '一致性问题占数据撕扯案例 33%',
        evidence: '6 起跨表加总不一致，每次都引发跨部门争论。原因都是不同表对同一指标的口径定义不同。',
        implication: '"指标治理"比"数据校验"更重要。校验是纠正错误，治理是从源头杜绝歧义。'
      },
      {
        finding: '数据时效性影响业务决策准确度',
        evidence: '退货表延迟 12 小时导致 GMV 净值口径与毛 GMV 不同步，运营按毛 GMV 决策，事后才发现实际净 GMV 已下滑。',
        implication: '指标的更新频率必须匹配业务决策周期。日级决策需要小时级数据，小时级决策需要分钟级数据。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '5 维数据质量监控系统上线',
        action: '12 张核心表每日 5 维校验，异常自动告警企业微信。看板实时呈现可信度评分。',
        expectedOutcome: '问题发现时间从月级压缩至日级；业务方对数据信任度从 60% 升至 90%+。',
        owner: '数据治理团队'
      },
      {
        strategy: '指标 wiki 强制治理',
        action: '所有跨表/跨部门指标必须有 wiki 条目，明确口径、数据源、负责人、变更历史。无 wiki 条目的指标不允许进入正式报表。',
        expectedOutcome: '"指标对不上"撕扯案例从月均 6 起降至 1 起以下。',
        owner: '数据治理 + 各业务部门'
      },
      {
        strategy: '数据质量 SLA 与责任人',
        action: '每张核心表指定数据 owner，签 SLA——完整性 ≥ 99%、一致性差异 ≤ 0.5%、唯一性 100%、时效性符合业务定义。SLA 不达标进入责任追溯。',
        expectedOutcome: '数据质量从"团队公共问题"变为"明确责任"，问题修复速度提升 3 倍。',
        owner: '数据治理团队'
      }
    ],
    businessOutcome: '体系上线 6 个月后：18 个问题中 16 个已解决，2 个进入长期治理；月度"数据撕扯"会议时长从平均 8 小时降至 1.5 小时（-80%）；业务方满意度从 3.0 升至 4.3；CFO 在年度财务报告中明确"基于数据团队的可信指标"，数据团队首次进入公司战略决策核心。',
    reflection: '复用边界：5 维数据质量框架适用于所有有结构化数据的企业，不仅电商。不适用于：(1) 极简单业务（数据量小指标少，过度治理 ROI 低）；(2) 数据探索阶段（治理会限制创新）；(3) 仅有非结构化数据的业务（如纯内容平台，需要不同治理方法）。\n失败教训：第一版只做技术校验（SQL 跑脚本），没做指标治理（wiki + 责任人），结果发现技术问题修了但业务方依然撕扯——因为根本问题是"两边对同一指标定义不同"，不是数据本身错。**数据治理 = 技术 + 流程 + 责任，缺一不可。**\n下一步进阶：(1) 引入数据血缘工具（DataHub/Atlas），自动追踪指标的上下游依赖；(2) 用机器学习做异常检测，识别"虽然没违反规则但模式异常"的数据（如某天 GMV 突然 -30%）；(3) 建立"数据质量评分对外公开"机制，让业务方对每张表的可信度有客观认知。'
  },

  {
    id: 'c-cross-store-bench-34',
    title: '跨境多店铺横向对标：从 30 个亚马逊店铺找出 5 个标杆方法论',
    category: '基础模型',
    subcategory: '多店铺管理',
    industry: '亚马逊跨境（多账号矩阵）',
    difficulty: '入门',
    tags: ['多店铺管理', '横向对标', '标杆方法论', '亚马逊跨境'],
    prerequisites: ['亚马逊核心指标', '横向对比方法', '矩阵化店铺管理'],
    summary: '某跨境卖家在亚马逊运营 30 个店铺（覆盖 5 个品类、3 个市场），各店铺 ROAS 从 1.8 到 5.2 差异巨大。运营经验全靠各店铺主管"自己摸索"。建立"指标矩阵 × 标杆挖掘"方法——按 8 个核心指标（ROAS / ACOS / CTR / CVR / 评分 / BSR / 退货率 / 库存周转）对 30 个店铺做横向打分，识别出 5 个全维度领先标杆店铺。深拆标杆方法（PPC 出价策略、Listing 优化、库存管理）后形成 SOP 文档，6 个月后整体 30 店铺 ROAS 均值从 2.8 提升至 3.6（+29%）。',
    background: '某跨境卖家在亚马逊运营 30 个店铺，覆盖家居 / 厨房 / 户外 / 个护 / 宠物 5 个品类，分布美国 / 英国 / 德国 3 个市场。每个店铺 1-2 名运营负责，年营收合计 1.2 亿 USD。\n问题：店铺间业绩差异极大（年 GMV 从 80 万到 850 万 USD），ROAS 从 1.8 到 5.2。优秀店铺的方法没有被沉淀和复制，差店铺主管反复重复同样的错误。需要数据团队建立横向对标体系，把分散的"个体经验"沉淀为"团队方法论"。',
    fields: [
      { name: 'store_id', type: 'string', description: '店铺唯一 ID', example: 'STORE_US_HM_002' },
      { name: 'category', type: 'string', description: '店铺主品类', example: 'home' },
      { name: 'market', type: 'string', description: '市场代码', example: 'US' },
      { name: 'roas_30d', type: 'float', description: '近 30 天 ROAS', example: '4.2' },
      { name: 'avg_review_score', type: 'float', description: '平均 Review 评分', example: '4.4' },
      { name: 'inventory_turnover', type: 'int', description: '库存周转天数', example: '38' },
      { name: 'asin_count', type: 'int', description: '在售 ASIN 数', example: '142' }
    ],
    sqlSketch: '-- 8 维指标横向打分（同品类同市场内对比）\nWITH store_metrics AS (\n  SELECT store_id, category, market,\n         roas_30d, acos_30d, ctr_30d, cvr_30d,\n         avg_review_score, avg_bsr_rank, return_rate, inventory_turnover\n  FROM store_summary_monthly\n  WHERE month = \'2024-08\'\n),\nstore_scored AS (\n  -- 每个指标在同品类同市场内做百分位排名（高分越好则正向，低分越好则反向）\n  SELECT *,\n         PERCENT_RANK() OVER (PARTITION BY category, market ORDER BY roas_30d DESC)              AS roas_rank,\n         PERCENT_RANK() OVER (PARTITION BY category, market ORDER BY acos_30d ASC)               AS acos_rank,\n         PERCENT_RANK() OVER (PARTITION BY category, market ORDER BY ctr_30d DESC)               AS ctr_rank,\n         PERCENT_RANK() OVER (PARTITION BY category, market ORDER BY cvr_30d DESC)               AS cvr_rank,\n         PERCENT_RANK() OVER (PARTITION BY category, market ORDER BY avg_review_score DESC)      AS review_rank,\n         PERCENT_RANK() OVER (PARTITION BY category, market ORDER BY avg_bsr_rank ASC)           AS bsr_rank,\n         PERCENT_RANK() OVER (PARTITION BY category, market ORDER BY return_rate ASC)            AS return_rank,\n         PERCENT_RANK() OVER (PARTITION BY category, market ORDER BY inventory_turnover ASC)     AS turnover_rank\n  FROM store_metrics\n)\nSELECT store_id, category, market,\n       (roas_rank + acos_rank + ctr_rank + cvr_rank + review_rank + bsr_rank + return_rank + turnover_rank) / 8.0 AS composite_score\nFROM store_scored\nORDER BY composite_score DESC;',
    analysisProcess: '指标矩阵设计：选择 8 个对店铺业绩有强相关的核心指标——3 个营收类（ROAS / ACOS / CTR）、3 个用户类（CVR / 评分 / BSR 排名）、2 个运营类（退货率 / 库存周转天数）。\n横向对标：核心是"同品类同市场内对比"避免不公平（家居 vs 个护、美国 vs 德国本身差异大）。每个指标在同品类同市场内做百分位排名，最后 8 个百分位简单平均得综合分。\n标杆识别：30 个店铺综合分排名 Top 5——综合分 0.85+。Top 5 的特征：8 个指标中 6 个以上排名 Top 30%。**全维度领先**才是真标杆，仅某 1 个指标突出（如某店 ROAS 最高但库存周转极差）不算标杆。\n标杆方法挖掘：对 5 个标杆店铺做深度访谈 + 数据反查，沉淀 5 类核心方法——\n1. **PPC 出价策略**：标杆采用"分级出价"（核心词高出价、长尾词低出价）；后进者一刀切出价\n2. **Listing 优化节奏**：标杆每月迭代主图 + 关键词；后进者半年才更新一次\n3. **Review 主动管理**：标杆使用 Vine + 真实用户激励；后进者只等 Review 自然累积\n4. **库存预警机制**：标杆建立 7/14/30 天三档预警；后进者临近断货才补\n5. **新品试错节奏**：标杆 D14 看健康度决定加投或砍单；后进者无明确决策点\nSOP 沉淀：5 类方法各形成详细 SOP 文档（含步骤 / 工具 / 检查表 / 案例）。组织全员培训 + 季度考核 + 月度数据复盘。\n滞后店铺整改：综合分 < 0.4 的"末位 5 家店铺"进入定向整改 ——直接派 Top 5 店铺主管做 30 天驻场指导。',
    coreFindings: [
      {
        finding: '同品类同市场内店铺业绩差异 3-5 倍',
        evidence: '同样在美国家居类目下，Top 店铺 ROAS 5.2 / 末位 1.8，差距 2.9 倍。差距源自方法论差异，不是市场或品类。',
        implication: '业绩差距背后是"方法论被沉淀"的差距。同样的市场机会，会的人能赚 5 倍钱，不会的人只能赚 1 倍。'
      },
      {
        finding: '"全维度领先"才是真标杆，单维度突出意义有限',
        evidence: '某店 ROAS 5.2 但库存周转 95 天（资金占用严重），综合分仅排第 12，不是真标杆。',
        implication: '识别标杆必须用综合多维度评估，单点突出可能掩盖严重短板。'
      },
      {
        finding: '5 类方法 SOP 化后整体提升 29%',
        evidence: '6 个月内 30 店铺 ROAS 均值从 2.8 升至 3.6。其中后进店铺 ROAS 提升 60%+，标杆店铺仅小幅提升。',
        implication: '标杆方法的复制对"中下游店铺"价值最大。标杆已经在做，复制对它们没增益，但能拉起整体均值。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '建立月度横向对标看板',
        action: 'BI 平台每月跑 30 店铺 8 维度评分，给每个店铺生成"自己 vs 同品类同市场标杆"的对比报告，明确差距点。',
        expectedOutcome: '店铺主管每月明确知道自己在哪个维度落后，提升方向清晰。',
        owner: '数据团队 + 店铺管理'
      },
      {
        strategy: '5 类标杆方法 SOP 培训',
        action: '5 类方法各做详细 SOP 文档 + 录制操作视频。新店铺主管入职必须培训通过。每月 1 个专题深度复盘。',
        expectedOutcome: '新人成长周期从 6 个月缩到 3 个月；整体团队方法论水平提升。',
        owner: '运营管理'
      },
      {
        strategy: '"末位 5 家"定向整改机制',
        action: '综合分 < 0.4 的末位 5 家店铺，由 Top 5 店铺主管做 30 天驻场指导。整改后再考核，未达标的可能调整人员。',
        expectedOutcome: '末位店铺 30 天内综合分提升 ≥ 0.2，否则重新规划。',
        owner: '运营总监'
      }
    ],
    businessOutcome: '体系运行 12 个月：30 店铺 ROAS 均值从 2.8 升至 3.7；末位店铺 ROAS 提升 60%+；总营收同比 +35%；新店铺成长周期从 6 个月缩到 3 个月；标杆方法 SOP 累计 5 大类 + 30+ 子方法，成为公司核心知识资产。',
    reflection: '复用边界：横向对标方法适用于"店铺 /账号 / 业务单元 ≥ 10 个、有可比指标、有标杆店铺"的多元化运营场景。不适用于：(1) 单店铺业务；(2) 各店铺业务模式差异巨大无法对比；(3) 早期阶段所有店铺都还没找到方法（无标杆可学）。\n失败教训：第一版直接全店铺横向打分，没做品类 / 市场分组，结果家居店铺天然吃亏（家居市场 ROAS 整体偏低）。后期改为"同品类同市场内对比"才合理。**横向对比必须做基线公平。**\n下一步进阶：(1) 引入店铺画像聚类，基于业务模式（高价低频 vs 低价高频）做更细化的对标分组；(2) 用机器学习识别"潜力黑马"——目前综合分中等但某些先行指标趋势向好，提前重点扶持；(3) 把横向对标扩展到"店铺间策略复盘共享会"，让标杆主管每月做案例分享。'
  },

  {
    id: 'c-juliang-roi-35',
    title: '巨量千川直播投放 ROI 深度拆解：4 个层级找到 ROI 从 1.8 到 4.5 的杠杆',
    category: '基础模型',
    subcategory: '投放分析',
    industry: '抖音电商（女装类目）',
    difficulty: '入门',
    tags: ['巨量千川', '直播投放', 'ROI 拆解', '投流策略'],
    prerequisites: ['千川投放基础', 'ROI/ROAS 概念', '投放四要素（人/货/场/内容）'],
    summary: '某抖音女装店铺月投巨量千川 280 万元，整体 ROI 1.8（远低于行业头部 3.5+）。按"投流时段 × 主播 × 商品 × 素材"四层级拆解 ROI，定位到——黄金时段（19-23 点）+ 主推主播 + 利润款 + 真人试穿素材的组合 ROI 4.5，反之的组合（凌晨 + 副主播 + 引流款 + 图文素材）仅 0.3。重新设计"四要素匹配矩阵"投放，整体 ROI 从 1.8 提升至 3.4，月度 GMV 增长 89%。',
    background: '某抖音女装店铺，月度直播 GMV 510 万，月投巨量千川 280 万（ROI 1.8）。运营总监对 ROI 不满意，但投手反馈"已经按平台建议出价"，找不到具体优化方向。\n问题：投手报表只能看"日级 ROI"或"计划级 ROI"，看不到"哪些时段 + 哪些主播 + 哪些商品 + 哪些素材的组合 ROI 高/低"。需要数据团队建立四层级 ROI 拆解，把投放优化从"调出价"升级到"四要素匹配"。',
    fields: [
      { name: 'campaign_id', type: 'string', description: '千川计划 ID', example: 'QC_240812_002' },
      { name: 'live_session_id', type: 'string', description: '直播场次 ID', example: 'LIVE_240812_A' },
      { name: 'host_id', type: 'string', description: '主播 ID', example: 'HOST_A' },
      { name: 'product_id', type: 'string', description: '商品 ID', example: 'SKU_DR_2245' },
      { name: 'time_bucket', type: 'string', description: '时段桶（早/午/晚/夜）', example: 'evening' },
      { name: 'creative_type', type: 'string', description: '素材类型', example: 'real_model_try_on' },
      { name: 'spend', type: 'decimal', description: '该计划消耗金额', example: '4860.50' },
      { name: 'gmv', type: 'decimal', description: '该计划带来 GMV', example: '21870.00' }
    ],
    sqlSketch: '-- 四层级 ROI 矩阵：时段 × 主播 × 商品 × 素材\nSELECT time_bucket, host_id, product_id, creative_type,\n       SUM(spend)               AS spend,\n       SUM(gmv)                 AS gmv,\n       SUM(gmv) / SUM(spend)    AS roi,\n       COUNT(*)                 AS plan_cnt,\n       SUM(impressions)         AS impressions\nFROM campaign_perf_daily\nWHERE event_date BETWEEN \'2024-08-01\' AND \'2024-08-31\'\n  AND impressions >= 5000  -- 过滤数据不足的计划\nGROUP BY 1, 2, 3, 4\nHAVING SUM(spend) >= 1000\nORDER BY roi DESC;',
    analysisProcess: '现状盘点：取 8 月 280 万千川消耗对应的 1240 个具体计划，每个计划记录时段、主播、商品、素材类型、消耗、GMV。剔除消耗 < 1000 元的小计划（数据噪声）。\n四层级拆解：\n- **时段层**（4 桶）：早 9-12 点 ROI 1.2 / 午 12-19 点 1.6 / 晚 19-23 点 3.2（黄金）/ 夜 23-9 点 0.6。\n- **主播层**（5 个）：A 主推 ROI 2.6 / B 主推 2.4 / C 副主播 1.4 / D 副主播 1.0 / E 新人 0.7。\n- **商品层**（3 类）：利润款 ROI 2.8 / 爆款 2.2 / 引流款 0.9。\n- **素材层**（4 类）：真人试穿 ROI 2.6 / 对比演示 2.1 / 沉浸式 1.8 / 图文 0.8。\n四要素组合：在 4×5×3×4 = 240 个理论组合中，实际有数据的 156 个组合。组合 ROI 从 0.3 到 4.5 跨度大。Top 5 组合（ROI 4.0+）共同特征：黄金时段 + 主推主播 + 利润款 + 真人试穿/对比演示。Bottom 10 组合（ROI < 0.5）共同特征：夜间 + 副主播 + 引流款 + 图文。\n投流分配现状：当前 280 万投放中只有 28% 投在 Top 30 高 ROI 组合上，72% 分散到中低 ROI 组合。如果 80% 预算投到 Top 30 组合（ROI 平均 3.6），整体 ROI 可达 3.4。\n四要素匹配矩阵建立：基于历史数据建"组合 ROI 评分表"——每个时段 × 主播 × 商品 × 素材组合给一个预期 ROI。新计划上线前必查表，预期 ROI < 1.5 的组合不投，1.5-2.5 的小额测试，> 2.5 的重点投放。\n动态优化：每周更新一次评分表（用上周新数据）。投手月度考核新增"高 ROI 组合预算占比 ≥ 70%"指标。',
    coreFindings: [
      {
        finding: '组合 ROI 跨度从 0.3 到 4.5，差距 15 倍',
        evidence: '156 个有效组合，最差 0.3 vs 最佳 4.5。投放策略最大杠杆是"匹配组合"而非"调单维度出价"。',
        implication: '投放优化必须从"单要素"升级到"四要素组合"。单看时段或主播都会错过最关键的匹配效应。'
      },
      {
        finding: '高 ROI 组合具有强一致性（黄金时段 + 主推 + 利润款 + 真人）',
        evidence: 'Top 5 组合的 4 个要素几乎完全一致，不是巧合。',
        implication: '四要素匹配存在"协同放大效应"——单个要素好不够，必须四个都好。投手必须懂得把对的要素拼在一起。'
      },
      {
        finding: '现状 72% 预算投在中低 ROI 组合上',
        evidence: '只有 28% 预算在 Top 30 组合，预算结构性错配是 ROI 1.8 的根因。',
        implication: '投放优化的最大空间在"调整预算分配结构"，不是"细调单计划出价"。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '上线四要素匹配评分矩阵',
        action: '基于历史数据建组合 ROI 评分表，每周更新。新计划上线前必查表，预期 ROI < 1.5 不投，> 2.5 重点投放。',
        expectedOutcome: '高 ROI 组合预算占比从 28% 提升至 70%+，整体 ROI 从 1.8 升至 3.4+。',
        owner: '投手 + 数据团队'
      },
      {
        strategy: '主播 × 商品定向匹配机制',
        action: '主推主播只投利润款 + 爆款，不接引流款；副主播 + 新人主播只接引流款 + 测款。素材按"主播风格 + 商品类型"差异化生产。',
        expectedOutcome: '主播-商品-素材的协同效应最大化。',
        owner: '直播运营 + 投手'
      },
      {
        strategy: '投手考核加入"组合健康度"',
        action: '投手月度考核 KPI 增加"高 ROI 组合预算占比"和"低 ROI 组合预算占比"两个指标，权重 40%。',
        expectedOutcome: '投手从"调单一计划"转向"管整体组合结构"。',
        owner: '投放管理'
      }
    ],
    businessOutcome: '机制上线 4 个月：整体 ROI 从 1.8 升至 3.4（+89%）；月度 GMV 从 510 万升至 965 万（+89%）；投手平均日工作量减 30%（不再调单一计划反复试）；该方法论被复制到其他抖音店铺，整体多店矩阵 ROI 提升明显。',
    reflection: '复用边界：四层级 ROI 拆解适用于"千川 / 抖加 / 视频号助手等内容投流场景，月投放 ≥ 50 万、有 ≥ 100 个计划/月"的店铺。不适用于：(1) 极小投放量（计划数不足无法拆解组合）；(2) 单一主播单一商品的小店；(3) 自然流量为主不依赖投流的店铺。\n失败教训：第一版只做了"时段 × 主播"二维拆解，发现 ROI 提升仅 15%。后期增加"商品 × 素材"扩展到四维才发现真正的协同效应。**拆解维度太少看不到协同，太多噪声大，4 维是经验上的甜蜜点。**\n下一步进阶：(1) 把人工查表升级为机器学习模型预测每个新组合的 ROI；(2) 引入贝叶斯多臂老虎机自动优化预算分配；(3) 把"四要素"扩展到"五要素"（增加人群定向），实现千万级精准投放。'
  },

  {
    id: 'c-competitor-price-36',
    title: '竞品价格监控与动态调价：每周锁定 8 个核心 SKU 价格战胜负',
    category: '基础模型',
    subcategory: '竞品分析',
    industry: '快消电商',
    difficulty: '入门',
    tags: ['竞品监控', '动态调价', '价格战', '商业分析'],
    prerequisites: ['价格弹性概念', '爬虫与数据抓取基础', '价格策略思维'],
    summary: '某快消电商在 8 个核心 SKU 上与 3 大竞品长期博弈，但价格调整全凭运营经验"看着改"。建立"竞品价格日级监控 + 价格战胜负判定"系统——每天早 8 点抓取 3 大竞品同款价格，结合自身销量与毛利做动态调价决策。3 个月后核心 SKU 月度毛利提升 12%，竞品调价反应时间从 3 天压缩到 6 小时。',
    background: '某快消电商主营宠物食品（狗粮、猫粮、零食），8 个核心 SKU 占店铺 GMV 60%，与天猫上 3 大竞品（A/B/C 品牌）长期博弈。\n问题：当前价格策略是运营每周一手动查竞品价格 + Excel 决策。竞品调价后通常 3 天才反应过来，期间销量被分流。同时缺乏"调价数据"，调价后效果好坏全凭感觉。\n业务方诉求：建立日级价格监控 + 自动决策机制，让调价从"被动反应"变为"主动博弈"。',
    fields: [
      { name: 'sku_id', type: 'string', description: '自身 SKU', example: 'SKU_DOG_2245' },
      { name: 'snap_date', type: 'date', description: '抓取日期', example: '2024-08-12' },
      { name: 'self_price', type: 'decimal', description: '自身价格', example: '128.00' },
      { name: 'competitor_a_price', type: 'decimal', description: '竞品 A 同款价', example: '125.00' },
      { name: 'competitor_b_price', type: 'decimal', description: '竞品 B 同款价', example: '132.00' },
      { name: 'self_daily_sales', type: 'int', description: '自身当日销量', example: '482' },
      { name: 'self_gross_margin', type: 'float', description: '自身毛利率', example: '0.32' }
    ],
    sqlSketch: '-- 竞品价格日级监控 + 价格战胜负判定\nWITH price_position AS (\n  SELECT sku_id, snap_date, self_price,\n         LEAST(competitor_a_price, competitor_b_price, competitor_c_price) AS lowest_competitor,\n         AVG(competitor_a_price) OVER (PARTITION BY sku_id ORDER BY snap_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS avg_competitor_7d,\n         self_daily_sales, self_gross_margin\n  FROM price_monitor\n  WHERE snap_date >= \'2024-06-01\'\n)\nSELECT sku_id, snap_date,\n       self_price - lowest_competitor                  AS price_gap,\n       CASE\n         WHEN self_price <= lowest_competitor * 0.97 THEN \'price_advantage\'  -- 价格优势 ≥3%\n         WHEN self_price <= lowest_competitor * 1.03 THEN \'price_parity\'     -- 价格持平 ±3%\n         WHEN self_price <= lowest_competitor * 1.10 THEN \'price_disadvantage\' -- 略高 3-10%\n         ELSE \'price_war_loss\'                                                -- 价格战明显失利\n       END AS price_war_status,\n       self_daily_sales,\n       self_price * self_daily_sales * self_gross_margin AS gross_profit_today\nFROM price_position\nORDER BY sku_id, snap_date DESC;',
    analysisProcess: '数据采集系统：用爬虫 + 第三方 API（如店透视、生意参谋）每天早 8 点抓取 8 个核心 SKU 在 3 大竞品同款的价格、销量榜排名、库存状态。数据写入 BI 数据仓库。\n价格战胜负定义：每个 SKU 每天判定"价格战状态"——\n- price_advantage：自身价格 ≤ 竞品最低价 × 97%（价格优势 ≥ 3%）\n- price_parity：97%-103%（持平）\n- price_disadvantage：103%-110%（略高）\n- price_war_loss：> 110%（明显失利）\n3 个月数据洞察：\n- 8 个 SKU 中 3 个长期处于 price_advantage 状态，毛利率高 35%+，销量稳定\n- 2 个 SKU 长期 parity，销量随竞品调价波动\n- 3 个 SKU 长期 disadvantage 或 loss，月度销量比 advantage 状态低 45%\n动态调价规则：基于"销量弹性 + 毛利底线"建立 5 条规则——\n1. 当某 SKU 进入 price_war_loss 且销量周环比 -15%+ 时，自动触发调价审批（建议价 = 竞品最低价 × 1.02）\n2. 当连续 7 天 price_advantage 但销量未明显增长（< 10%）时，建议涨价测试（用户对该 SKU 的价格敏感度低，可提毛利）\n3. 毛利率红线 25%——任何调价不能让毛利率跌破\n4. 竞品调价 6 小时内系统自动告警，运营 12 小时内决策\n5. 月度做调价复盘——多少次调价、效果如何、毛利变化\n竞品策略画像：对 3 大竞品的调价节奏画像——A 品牌"早 9 点常调价"（应对市场）、B"周一周三调价"（按周计划）、C"大促前 7 天调价"（节奏式）。摸清节奏后可预判竞品下一步动作。\n双向博弈测试：在 1 个 SKU 上做"主动涨价测试"——发现该 SKU 处于 advantage 时涨价 5% 销量仅降 3%，毛利反而 +12%。该测试结果推广到其他 advantage 状态 SKU。',
    coreFindings: [
      {
        finding: '价格战状态与销量关系强烈',
        evidence: 'price_advantage 状态的 SKU 销量比 disadvantage 高 45%。价格战不是"传说"，是直接量化的销量影响。',
        implication: '价格监控必须日级，等到周级反应可能已经掉了 30% 销量。'
      },
      {
        finding: '竞品有可识别的调价节奏',
        evidence: 'A 品牌固定早 9 点、B 周一三、C 大促前 7 天调价。3 大竞品都有规律。',
        implication: '摸清竞品节奏后可"预判调价"——在 A 调价前 1 小时主动布局，避免被动反应。'
      },
      {
        finding: '"价格优势"持续 7 天后涨价对销量影响小',
        evidence: '某 SKU 涨 5% 销量仅降 3%，毛利 +12%。说明持续优势会导致用户对价格脱敏。',
        implication: '价格策略不是"一直最低"，是"在合理区间动态调整"。优势期是涨价提毛利的窗口。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '日级竞品价格监控 + 自动告警',
        action: '每天早 8 点抓取 3 大竞品价格，价格战状态变化（如从 advantage 转 disadvantage）自动告警企业微信。',
        expectedOutcome: '调价反应时间从 3 天压缩到 6 小时。',
        owner: '数据团队 + 商品团队'
      },
      {
        strategy: '5 条动态调价规则上线',
        action: '5 条规则配入调价系统，命中规则自动生成调价建议（含价格、预期销量、预期毛利），运营审批后执行。',
        expectedOutcome: '调价决策从"凭感觉"变为"数据驱动"，平均调价收益提升 30%+。',
        owner: '商品 + 数据团队'
      },
      {
        strategy: '竞品节奏画像 + 预判机制',
        action: '维护 3 大竞品的调价节奏画像，每月更新。在竞品预期调价前 24 小时给商品团队预警，提前布局。',
        expectedOutcome: '从被动响应变为主动博弈，市场份额逐步提升。',
        owner: '商业分析 + 商品团队'
      },
      {
        strategy: '月度调价复盘会',
        action: '每月固定开调价复盘会，回顾每次调价的预期 vs 实际，沉淀经验和反例。',
        expectedOutcome: '调价能力持续迭代，团队从经验积累中长期受益。',
        owner: '商品总监'
      }
    ],
    businessOutcome: '系统上线 6 个月：8 个核心 SKU 月度毛利从 380 万提升至 425 万（+12%）；3 个长期 disadvantage 的 SKU 中 2 个回到 parity；竞品调价反应时间从 3 天压缩到 6 小时；调价频次从月均 4 次升至 12 次（更精细化），但客诉零增加；该机制被推广到其他类目 30+ SKU。',
    reflection: '复用边界：竞品价格监控适用于"标品类目（同款可比）、有明确竞品集中度、有数据抓取能力"的场景。不适用于：(1) 非标品（同款无法直接对比，如服饰款式各异）；(2) 极分散的市场（无明确头部竞品）；(3) 受品牌强约束不能频繁调价的店铺（如奢侈品）。\n失败教训：第一版直接套用"低于竞品最低价 5% 自动调价"规则，结果跟某竞品打成价格战，2 个 SKU 毛利率跌破 15% 红线。后期增加"毛利底线"规则才避免恶性循环。**任何自动化决策必须有红线约束。**\n下一步进阶：(1) 引入博弈论模型预测竞品对自身调价的反应（如 Stackelberg 模型）；(2) 用机器学习模型预测每次调价的销量影响，比规则更精细；(3) 把价格监控扩展到"价格 + 促销 + 评价 + 排名"四维竞品全画像。'
  },

  {
    id: 'c-tag-system-37',
    title: 'CRM 用户标签体系：从 200 个杂乱标签精简到 36 个核心标签',
    category: '基础模型',
    subcategory: '标签体系',
    industry: '美妆电商（CDP 项目）',
    difficulty: '入门',
    tags: ['用户标签', '标签体系', 'CDP', '标签治理'],
    prerequisites: ['用户画像基础', '标签分类思维', 'CDP 概念'],
    summary: '某美妆电商 CDP 平台累计 200+ 用户标签（如"曾买过精华"、"小红书用户"、"双11 大客"），但运营无法用——标签太杂、定义模糊、覆盖率低、口径打架。重新设计"四级金字塔标签体系"——人口属性 / 行为特征 / 业务价值 / 场景标签，精简至 36 个核心标签。运营团队应用率从 12% 提升至 78%，标签驱动的精准营销 GMV 月增 380 万。',
    background: '某美妆电商 CDP 平台（用户数据中台）累计 200+ 用户标签，过去 2 年由不同部门提出累积。运营团队在做活动选人群时面临困境——标签太多不知道用哪个；同名标签不同部门定义不同（"高价值用户"在销售部 = 月消费 ≥ 300，在用户运营部 = 累计消费 ≥ 5000）；很多标签覆盖率不到 1% 没法用。\n业务方对 CDP 平台不满，标签体系被嘲笑为"标签坟场"。需要数据团队重建可用的标签体系。',
    fields: [
      { name: 'tag_id', type: 'string', description: '标签唯一 ID', example: 'TAG_HIGH_VALUE_3M' },
      { name: 'tag_name', type: 'string', description: '标签名称', example: '近 3 个月高价值用户' },
      { name: 'tag_category', type: 'string', description: '标签类别（4 级）', example: 'business_value' },
      { name: 'coverage_rate', type: 'float', description: '标签覆盖率（用户占比）', example: '0.085' },
      { name: 'usage_count_30d', type: 'int', description: '近 30 天被使用次数', example: '142' },
      { name: 'definition_doc', type: 'string', description: '标签定义文档', example: 'https://wiki/tag/HIGH_VALUE' }
    ],
    sqlSketch: '-- 标签健康度评估\nSELECT \n  tag_category,\n  COUNT(*)                                                AS tag_cnt,\n  AVG(coverage_rate)                                      AS avg_coverage,\n  SUM(CASE WHEN coverage_rate < 0.005 THEN 1 ELSE 0 END)  AS low_coverage_cnt,\n  SUM(CASE WHEN usage_count_30d = 0    THEN 1 ELSE 0 END) AS unused_cnt,\n  SUM(CASE WHEN definition_doc IS NULL THEN 1 ELSE 0 END) AS undefined_cnt\nFROM tag_metadata\nGROUP BY tag_category\nORDER BY tag_cnt DESC;',
    analysisProcess: '现状盘点：把 200 个标签按 4 维健康度评估——覆盖率（多少用户被打了这个标签）、使用率（近 30 天被使用次数）、定义清晰度（是否有 wiki 条目）、口径一致性（是否与其他标签冲突）。结果——\n- 覆盖率 < 0.5% 的"小众标签"68 个（占 34%）：意义不大\n- 0 使用次数标签 92 个（占 46%）：休眠标签\n- 无 wiki 定义标签 138 个（占 69%）：黑盒标签\n- 与其他标签口径冲突 24 个：撕扯标签\n四级金字塔体系设计：\n- **L1 人口属性**（5-8 个）：性别、年龄段、城市等级、地理区域、生活阶段（学生/上班族/宝妈）。覆盖率 100%。\n- **L2 行为特征**（10-15 个）：购买频次（高/中/低）、客单价分层、品类偏好、近期活跃度、设备类型、首单渠道。覆盖率 80%+。\n- **L3 业务价值**（8-10 个）：核心客（VIP）、价格敏感、品牌忠诚、流失预警、潜力新客、达人种草、内容互动。覆盖率 30-60%。\n- **L4 场景标签**（5-8 个）：双11 历史购买、618 大促响应者、新品尝鲜、特定品类深度用户。覆盖率 5-30%。\n标签治理规则：\n1. 每个标签必须有 wiki 条目（定义、口径、负责人、变更历史）\n2. 覆盖率 < 0.5% 的标签自动归档（除非业务明确需要）\n3. 30 天 0 使用次数的标签自动进入"待清理"列表\n4. 同名标签禁止——避免不同部门同名不同义\n5. 业务方提新标签必须经过"标签治理委员会"评审，优先复用已有标签\n精简结果：200 个标签精简到 36 个，覆盖率合计 95%（剩余 5% 是极小众场景）。新体系部署 CDP 平台后运营选人群效率大幅提升。',
    coreFindings: [
      {
        finding: '46% 标签是"零使用"的休眠标签',
        evidence: '92 个标签近 30 天 0 使用次数。这些标签长期占用 CDP 平台资源但产生 0 业务价值。',
        implication: '标签不是"做了就好"。没有持续业务使用的标签是 IT 资产负债，不是资产。'
      },
      {
        finding: '69% 标签缺乏明确文档定义',
        evidence: '138 个标签无 wiki 条目。运营选人群时只能"猜这个标签是什么意思"。',
        implication: '标签的"可解释性"是其能否被使用的关键。无文档的标签实际等于不存在。'
      },
      {
        finding: '36 个核心标签覆盖了 95% 业务需求',
        evidence: '精简后业务方使用频次从月均 240 次升至 1860 次（+675%）。',
        implication: '标签体系不是越多越好。少而精的体系比"标签丰富"更有效，因为运营能记住、能用对。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '四级金字塔标签体系上线',
        action: '36 个核心标签按 4 级金字塔组织，每个标签有 wiki + 数据负责人。CDP 平台界面按 4 级分类显示，运营快速找到所需标签。',
        expectedOutcome: '运营标签使用率从 12% 升至 78%；标签驱动营销活动数从月均 8 个升至 28 个。',
        owner: '数据 + 用户运营团队'
      },
      {
        strategy: '建立"标签治理委员会"',
        action: '由 1 名数据 + 1 名运营 + 1 名产品 组成的 3 人委员会，每月评审新标签申请、清理冗余标签、更新口径。',
        expectedOutcome: '杜绝标签无序膨胀，体系长期保持精简。',
        owner: '数据治理 + 业务'
      },
      {
        strategy: '标签健康度月度看板',
        action: 'BI 平台每月跑标签健康度评估（覆盖率 / 使用率 / 文档完整性），发布"标签红榜"和"标签黑榜"。',
        expectedOutcome: '体系持续优化，新增标签必须通过健康度门槛。',
        owner: '数据团队'
      }
    ],
    businessOutcome: '体系上线 6 个月：运营标签使用率从 12% 升至 82%；基于标签的精准营销月度 GMV 增 380 万；标签驱动召回的流失用户回流率从 8% 升至 22%；CDP 平台用户满意度评分从 2.6 升至 4.4；标签治理方法论被推广到其他业务线（金融、出行）。',
    reflection: '复用边界：金字塔标签体系适用于所有有 CDP / DMP / CRM 平台的中大型企业。不适用于：(1) 用户量极小（< 10 万）的早期产品，标签体系成本高于收益；(2) 数据维度极简的业务；(3) 监管严格无法做用户标签的业务（如严格隐私合规场景）。\n失败教训：第一版直接砍掉所有零使用标签，结果误删了 1 个被运营临时调用的关键标签（做季节活动用），引发投诉。后期改为"先归档不删除，3 个月后无人调用再删"的过渡机制。**清理动作必须有缓冲期。**\n下一步进阶：(1) 引入"动态标签"——基于行为序列实时生成（如"刚加购未付款用户"），把静态体系扩展为动静结合；(2) 用聚类算法发现"隐藏的标签"（用户群体存在但未被人工识别）；(3) 建立"标签 ROI 估算模型"，对每个标签的预期业务价值打分，资源向高 ROI 标签倾斜。'
  },

  {
    id: 'c-refund-deep-38',
    title: '退款率分层归因：从大盘 12% 到品类 SKU 的 5 层下钻',
    category: '基础模型',
    subcategory: '退款分析',
    industry: '综合电商平台',
    difficulty: '入门',
    tags: ['退款率', '分层归因', '5W 分析', '售后体验'],
    prerequisites: ['退款率定义', '维度下钻方法', '归因思维'],
    summary: '某电商月度退款率 12%（行业均值 8%），CFO 要求降至 9% 以下。传统看大盘退款率无法行动。建立 5 层下钻分析（品类 → 子品类 → 商家 → SKU → 退款原因），定位到——服饰品类（退款 22%）/ 厨电（18%）/ 家居（12%）/ 其他（5-8%）。深查服饰发现 70% 退款集中在 8 个商家的 35 个 SKU，进一步看退款原因 70% 是尺码不符。商家整改 + 平台尺码标准化后，整体退款率 90 天内降至 8.5%，财务节省退款成本约 1800 万/年。',
    background: '某综合电商月度订单 380 万笔，月度退款率 12%（订单退款 / 订单总数），高于行业均值 8%。退款不仅意味着收入损失，还伴随仓储 / 客服 / 物流成本（平均每单 35 元），月度退款成本约 160 万。\nCFO 设定年度目标——退款率降至 9% 以下。但运营团队不知道从哪里下手——大盘 12% 这个数字本身无法行动，必须深入到能整改的颗粒度。',
    fields: [
      { name: 'order_id', type: 'string', description: '订单 ID', example: 'ORD_220845' },
      { name: 'category_l1', type: 'string', description: '一级类目', example: '服饰' },
      { name: 'category_l2', type: 'string', description: '二级类目', example: '女装连衣裙' },
      { name: 'merchant_id', type: 'string', description: '商家 ID', example: 'M_22' },
      { name: 'sku_id', type: 'string', description: 'SKU ID', example: 'SKU_DR_2245' },
      { name: 'is_refunded', type: 'bool', description: '是否退款', example: 'true' },
      { name: 'refund_reason', type: 'string', description: '退款原因（用户填）', example: '尺码不符' }
    ],
    sqlSketch: '-- 5 层下钻：从大盘到 SKU 退款率\n-- L1 品类\nSELECT category_l1,\n       COUNT(*)                                AS order_cnt,\n       SUM(CASE WHEN is_refunded THEN 1 ELSE 0 END) AS refund_cnt,\n       SUM(CASE WHEN is_refunded THEN 1 ELSE 0 END) * 1.0 / COUNT(*) AS refund_rate\nFROM orders WHERE order_date BETWEEN \'2024-08-01\' AND \'2024-08-31\'\nGROUP BY category_l1 ORDER BY refund_rate DESC;\n\n-- L2 二级类目（在高退款 L1 内）\nSELECT category_l2, refund_rate ...\nWHERE category_l1 = \'服饰\' GROUP BY category_l2;\n\n-- L3 商家\nSELECT merchant_id, refund_rate ...\nWHERE category_l1 = \'服饰\' GROUP BY merchant_id\nHAVING COUNT(*) >= 100  -- 过滤小样本\nORDER BY refund_rate DESC;\n\n-- L4 SKU（在高退款商家内）\n-- L5 退款原因聚类',
    analysisProcess: '5 层下钻：\n- **L1 品类层**：服饰 22% / 厨电 18% / 家居 12% / 食品 6% / 数码 5% / 其他 7%。**服饰和厨电是退款重灾区**。\n- **L2 二级类目（仅服饰）**：女装连衣裙 28%、女装外套 25%、女装内衣 16%、男装 10%。**女装是核心问题**。\n- **L3 商家层（仅女装）**：80 家女装商家中，8 家商家退款率 ≥ 35%（占 GMV 28%但占退款 70%）。**少数商家集中贡献退款**。\n- **L4 SKU 层（高退款商家内）**：每个高退款商家排查具体 SKU，发现 35 个 SKU 退款率 50%+。这 35 个 SKU 占总退款数的 41%。\n- **L5 退款原因（35 个 SKU 内）**：尺码不符 70%、面料/颜色与图片不符 18%、质量问题 8%、其他 4%。**尺码不符是绝对主因**。\n根因深挖：尺码不符 70% 中——\n- 60% 是商家尺码表标准混乱（亚洲 size 当美国 size 标）\n- 25% 是详情页缺少身高体重对照表\n- 15% 是商家尺码表与实际成品不符（生产偏差）\n业务影响测算：35 个高退款 SKU 月度退款金额 ≈ 1800 万，对应平台退款成本（仓储+客服+物流）约 220 万。如果整改让退款率从 50% 降至 20%，月度节省成本约 130 万。\n整改路径：\n- 短期：8 家商家强制要求 30 天内统一尺码标准 + 详情页加身高体重表\n- 中期：平台层面发布"女装尺码规范白皮书"，所有女装商家必须遵守\n- 长期：上线 AI 量体推荐工具（Bold Size/Fit Analytics），用户自动获得推荐尺码',
    coreFindings: [
      {
        finding: '5 层下钻让"大盘问题"变成"具体可整改问题"',
        evidence: '从大盘 12% 退款率（无法行动）下钻到 35 个 SKU + 尺码原因（明确整改对象）。',
        implication: '所有"大盘异常"都需要分层下钻。停在 L1 / L2 等于没分析，必须深入到"能立即行动"的颗粒度。'
      },
      {
        finding: '帕累托分布在退款数据中再次显现',
        evidence: '8 家商家（占商家数 10%）贡献 70% 退款；35 个 SKU（占 SKU 数 0.7%）贡献 41% 退款。',
        implication: '不需要"全员加强品控"，针对关键少数 SKU 整改即可解决大部分问题。'
      },
      {
        finding: '尺码不符占女装退款 70%',
        evidence: 'L5 退款原因聚类显示尺码不符是单一最大原因。其中 60% 来自商家尺码表混乱（亚洲 vs 欧美标准）。',
        implication: '退款问题往往不是品质问题，是"信息匹配"问题——商家与用户对同一 SKU 的预期不同。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '8 家高退款商家定向整改',
        action: '8 家女装商家强制要求 30 天内统一尺码标准（按欧美 size 体系）+ 详情页必含身高体重对照表 + 试穿模特图。整改不达标的暂停服饰类目报名权限。',
        expectedOutcome: '8 家商家退款率从平均 38% 降至 20% 以下；月度退款数减少 6.2 万单。',
        owner: '商家运营 + 数据团队'
      },
      {
        strategy: '平台尺码标准化',
        action: '发布平台《女装尺码规范白皮书》，所有女装商家必须遵守欧美 size 体系 + 提供量体表（身高 / 体重 / 三围对应）。',
        expectedOutcome: '平台层面解决系统性尺码混乱问题，长期退款率下降 3-5pp。',
        owner: '平台规则 + 商家运营'
      },
      {
        strategy: 'AI 量体推荐工具上线',
        action: '集成 Fit Analytics 类工具，用户填身高体重 + 体型偏好自动推荐尺码。在 Top 30% 高退款 SKU 上强制启用。',
        expectedOutcome: '使用工具的用户尺码不符退款率降低 60%+。',
        owner: '产品 + 商家'
      },
      {
        strategy: '退款率每周看板 + 商家排行',
        action: 'BI 平台每周输出商家退款率排行，连续 3 周 > 25% 的商家进入"重点关注"，平台规则团队介入。',
        expectedOutcome: '退款率从被动事后管控变为主动预防，长期治理。',
        owner: '数据团队 + 商家运营'
      }
    ],
    businessOutcome: '整改 90 天后：整体退款率从 12% 降至 8.5%（达成 CFO 9% 目标）；女装类目退款率从 22% 降至 11%；35 个高退款 SKU 平均退款率从 50% 降至 18%；月度退款成本节省约 150 万 / 月（年化 1800 万）；用户对尺码满意度评分提升 14%。',
    reflection: '复用边界：5 层下钻方法适用于所有"大盘异常 + 维度数据丰富"的归因场景。退款率、客诉率、转化率、ROI 异动都可以用。不适用于：(1) 数据维度稀缺无法下钻；(2) 极小数据量（每层颗粒度样本不足）；(3) 主观因素主导的指标（如品牌好感度）。\n失败教训：第一版只下钻到 L3 商家层（已经定位到 8 家），但商家整改进度慢。后期再下钻到 L4 SKU + L5 原因发现"尺码不符是绝对主因"，整改才有抓手。**下钻深度决定整改效果，停在中间层等于做了一半。**\n下一步进阶：(1) 用关联分析挖掘"哪些商品组合一起买更易退款"（如夏装+秋装一起买退款率高，因为换季）；(2) 引入退款预测模型——订单下单时预测退款概率，对高风险订单做"二次确认"或"重点品控"；(3) 把退款率与 LTV 挂钩——高退款用户的 LTV 显著低，应作为劣质用户特征反哺渠道筛选。'
  },

  {
    id: 'c-clv-matrix-39',
    title: '客户生命周期价值矩阵（CLV Matrix）：把 280 万用户切成 9 宫格运营',
    category: '进阶方法',
    subcategory: '客户价值管理',
    industry: '美妆电商',
    difficulty: '进阶',
    tags: ['CLV 矩阵', '客户价值', '资源分配', '商业分析'],
    prerequisites: ['LTV 概念', '矩阵分析方法', '客户分层基础'],
    summary: '某美妆电商有 280 万付费用户，但运营预算分配粗放——"VIP 用户重点关爱、流失用户群发券"。建立"当前价值 × 潜力价值"二维 9 宫格矩阵，把用户切成 9 类各自匹配运营策略——"高当前 + 高潜力"重点服务、"低当前 + 高潜力"重点培养、"高当前 + 低潜力"维持现状、"低当前 + 低潜力"低成本运营。运营资源精准分配后整体 ROI 提升 42%，客户 LTV 增长 18%。',
    background: '某美妆电商付费用户 280 万，月度运营预算 600 万（短信 / Push / 邮件 / 客服 / 礼品 / 折扣），按"VIP 重点关爱、其他群发"粗放分配。CMO 发现两个问题——\n1. 大量预算花在"已经买得很多但没有更多潜力"的核心客户身上（边际收益递减）\n2. 大量"目前消费不高但潜力很大"的用户被忽视（错失增长机会）\n需要数据团队建立精细化客户价值评估，让运营资源精准匹配每个用户的"当前价值 + 未来潜力"。',
    fields: [
      { name: 'user_id', type: 'string', description: '用户 ID', example: 'U_8830012' },
      { name: 'current_value', type: 'decimal', description: '当前价值（过去 12 个月 GMV）', example: '1485.50' },
      { name: 'predicted_ltv_12m', type: 'decimal', description: '预测未来 12 个月 LTV', example: '2840.00' },
      { name: 'value_segment', type: 'string', description: '当前价值分层（高/中/低）', example: 'high' },
      { name: 'potential_segment', type: 'string', description: '潜力分层（高/中/低）', example: 'medium' },
      { name: 'matrix_cell', type: 'string', description: '矩阵 9 宫格位置', example: 'HC_MP' }
    ],
    sqlSketch: '# Python: 当前价值 + 潜力价值 9 宫格矩阵\nimport pandas as pd\nfrom lifetimes import BetaGeoFitter, GammaGammaFitter\n\n# 1. 算每个用户"当前价值" = 过去 12 个月 GMV\nusers = sql(\'SELECT user_id, sum(pay_amount) AS gmv_12m FROM orders WHERE pay_date >= ... GROUP BY user_id\')\n\n# 2. 算每个用户"潜力价值" = 用 BG/NBD + Gamma-Gamma 预测未来 12 个月 LTV\nbgf.fit(rfm[\'frequency\'], rfm[\'recency\'], rfm[\'T\'])\nrfm[\'pred_ltv_12m\'] = bgf.predict(365, ...) * ggf.conditional_expected_average_profit(...)\n\n# 3. 三分位切分\nusers[\'value_seg\']     = pd.qcut(users[\'gmv_12m\'],     q=3, labels=[\'low\',\'mid\',\'high\'])\nusers[\'potential_seg\'] = pd.qcut(users[\'pred_ltv_12m\'], q=3, labels=[\'low\',\'mid\',\'high\'])\n\n# 4. 9 宫格交叉\nusers[\'matrix_cell\'] = users[\'value_seg\'].astype(str) + \'_\' + users[\'potential_seg\'].astype(str)\n\n# 5. 各格画像统计\nusers.groupby(\'matrix_cell\').agg(\n    user_cnt=(\'user_id\', \'count\'),\n    avg_current_value=(\'gmv_12m\', \'mean\'),\n    avg_potential=(\'pred_ltv_12m\', \'mean\')\n)',
    analysisProcess: '指标定义：\n- **当前价值** = 过去 12 个月 GMV，分高（≥ 800 元）/ 中（200-800）/ 低（< 200）三档（按 33%/33% 分位）\n- **潜力价值** = 用 BG/NBD + Gamma-Gamma 模型预测的未来 12 个月 LTV，同样三档分位\n- 两维交叉得 9 宫格\n9 宫格人群分布与画像：\n| 格子 | 用户数 | 占比 | 当前 GMV | 预测 LTV | 运营策略 |\n|---|---|---|---|---|---|\n| 高当前+高潜力（HH）| 17 万 | 6% | 1480 | 2860 | 顶级服务 + 新品首发 |\n| 高当前+中潜力（HM）| 28 万 | 10% | 1320 | 1720 | 维护权益 + 减少打扰 |\n| 高当前+低潜力（HL）| 12 万 | 4% | 1100 | 580 | 低成本维护，避免边际投入 |\n| 中当前+高潜力（MH）| 38 万 | 14% | 480 | 2640 | **重点培养**——升级激励 |\n| 中当前+中潜力（MM）| 56 万 | 20% | 420 | 980 | 正常运营 |\n| 中当前+低潜力（ML）| 26 万 | 9% | 380 | 320 | 低频触达 |\n| 低当前+高潜力（LH）| 22 万 | 8% | 110 | 1880 | **重点激活**——首单激励 |\n| 低当前+中潜力（LM）| 48 万 | 17% | 95 | 480 | 低频触达 |\n| 低当前+低潜力（LL）| 33 万 | 12% | 75 | 130 | 极低投入 |\n关键发现：\n1. **MH（中当前 + 高潜力）**用户 38 万人，是被严重低估的群体——他们目前消费中等但模型预测未来 LTV 高，是"明日高价值客"\n2. **HL（高当前 + 低潜力）**用户 12 万人，模型预测他们的 LTV 已接近天花板，对他们的额外投入边际收益极低\n3. **LH（低当前 + 高潜力）**用户 22 万人，模型识别为"潜力新人"——目前只买过 1-2 次但消费模式像高价值用户\n资源重新分配：把对 HL 的过度投入转移到 MH 和 LH——\n- HL 月预算从 80 万降至 30 万（-62%），礼品 / 高级客服等高成本权益取消\n- MH 月预算从 60 万升至 130 万（+117%），增加升级激励 / 个性化服务 / 专属客服\n- LH 月预算从 40 万升至 100 万（+150%），增加首单大额券 / 新人导购\n6 个月效果：HL 群体当期 GMV 下降 5%（边际损失小）但 MH 群体 GMV 提升 38%，LH 群体首单率从 28% 升至 51%。整体 GMV 增长 15%，但运营总预算未增（实际降 4%）。',
    coreFindings: [
      {
        finding: 'MH 群体（中当前 + 高潜力）是被低估的"明日高价值客"',
        evidence: '38 万用户当前 GMV 中等但预测 LTV 2640 元（仅次于 HH），传统分层会把他们归为"普通用户"低投入运营。',
        implication: '客户价值评估必须看"潜力"而非仅看"当前"。低估潜力客户是运营资源错配的最大单一原因。'
      },
      {
        finding: 'HL 群体（高当前 + 低潜力）边际投入收益极低',
        evidence: '12 万 HL 用户当前 GMV 高但预测 LTV 仅 580 元（已接近天花板）。月度对其投入 80 万产生的增量 GMV < 5 万。',
        implication: '高消费用户不一定是高价值用户。"边际投入"概念必须引入客户运营，避免对已饱和群体过度投入。'
      },
      {
        finding: 'LH 群体（低当前 + 高潜力）是高 ROI 投资目标',
        evidence: '22 万 LH 用户首单激励 ROI 1:5.6，远高于 HL 的 1:1.2。每元投资能带来 5 倍以上的未来 LTV。',
        implication: '客户运营应该像股票投资——找"被低估的潜力股"而非"已经涨满的明星股"。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '9 宫格矩阵 + 差异化运营',
        action: '9 个格子各匹配独立运营 SOP——HH 顶级服务、MH 重点培养升级、LH 重点激活、HL 低成本维护、其他正常运营。预算分配按"潜力 × 当前"加权而非平均。',
        expectedOutcome: '同等总预算下 GMV 提升 15-20%，整体客户 LTV 增长 18%+。',
        owner: '用户运营 + CMO'
      },
      {
        strategy: 'MH 群体专属升级激励',
        action: 'MH 用户在购买时获得"晋升 VIP 倒计时"提示 + 距离下一档差额提示 + 专属升级礼包。强化升级动机。',
        expectedOutcome: 'MH 群体 30% 升级到 HH，对应 GMV 增量 280 万 / 月。',
        owner: '会员产品 + 用户运营'
      },
      {
        strategy: '9 宫格月度迁移分析',
        action: '每月跟踪用户在 9 宫格之间的迁移情况——上升迁移（如 MH → HH）说明运营有效，下降迁移（如 HH → HL）说明流失风险。提供给 CMO 战略复盘。',
        expectedOutcome: '客户管理从静态分群升级为动态生命周期管理。',
        owner: '数据团队 + CMO'
      }
    ],
    businessOutcome: '矩阵运营上线 12 个月：整体客户 LTV 平均 1280 元升至 1510 元（+18%）；运营总预算未增加（实际 -4%）但 GMV +15%，ROI 提升 42%；MH 群体晋升 HH 比例 32%；LH 群体首单率从 28% 升至 51%；该方法被 CFO 列为"年度最高 ROI 数据项目"。',
    reflection: '复用边界：CLV 9 宫格矩阵适用于"用户量大（≥ 50 万）、有 24+ 个月历史数据、高频复购品类"。不适用于：(1) 极低频高客单业务（数据点不足无法训 LTV 模型）；(2) B2B 大客户业务（每个客户都是独立画像）；(3) 早期产品（数据不足）。\n失败教训：第一版直接用 RFM 替代潜力价值，结果发现 RFM 是基于历史的"过去状态描述"，不是"未来潜力预测"。后期换成 BG/NBD + Gamma-Gamma 模型预测真实未来 LTV，矩阵才有真正预测价值。**潜力 ≠ 历史 RFM 分。**\n下一步进阶：(1) 把 9 宫格扩展到 27 宫格（加入"产品偏好"第三维度），实现千人千面；(2) 用强化学习模型动态优化每个用户的运营动作（券 / 推送 / 客服）；(3) 把客户价值矩阵与公司财务模型挂钩，让 CFO 在 P&L 中按客户价值层级看营收结构。'
  },

  {
    id: 'c-market-entry-40',
    title: '市场进入可行性分析：用数据决定要不要进军日本市场',
    category: '行业专题',
    subcategory: '战略决策',
    industry: '跨境电商品牌（DTC 美妆）',
    difficulty: '进阶',
    tags: ['市场进入', '可行性分析', '商业建模', '战略决策'],
    prerequisites: ['市场规模估算（TAM/SAM/SOM）', '财务建模基础', '风险评估方法'],
    summary: '某美国美妆 DTC 品牌已在欧美市场年营收 2.4 亿 USD，CEO 提议进军日本市场。直接拍脑袋决定可能投入数百万却失败。建立"市场规模 × 竞争格局 × 进入成本 × 风险"四维量化评估框架——TAM 70 亿 USD / SAM 14 亿 / SOM 第 3 年 6800 万；3 年累计投入预计 1500 万 USD / 第 3 年盈亏平衡 / 第 5 年 ROI 2.8。董事会基于该模型做出"进入但分阶段试点"的决策，避免一次性大额投入风险。',
    background: '某美国美妆 DTC 品牌（精华液、面霜为主），北美 + 欧洲年营收 2.4 亿 USD，过去 3 年年均增长 35%。CEO 在 2024 年战略会提议进军日本市场，理由是日本是亚洲最大的美妆市场（年规模 700 亿 USD）。\n但 CFO 担心三个问题——日本市场进入门槛高（产品认证、本地化）、欧美打法可能失效、文化与渠道差异极大。CEO 与 CFO 意见分歧。董事会要求商业分析团队 30 天内交付"日本市场进入可行性报告"，量化评估是否进入、何时进入、如何进入。',
    fields: [
      { name: 'segment', type: 'string', description: '市场细分维度', example: 'premium_serum' },
      { name: 'tam_usd', type: 'decimal', description: '总目标市场（USD 百万）', example: '7000' },
      { name: 'sam_usd', type: 'decimal', description: '可触达市场', example: '1400' },
      { name: 'som_y1_usd', type: 'decimal', description: '第 1 年可获得份额', example: '8.5' },
      { name: 'som_y3_usd', type: 'decimal', description: '第 3 年可获得份额', example: '68' },
      { name: 'cumulative_invest_usd', type: 'decimal', description: '累计投入', example: '15.0' }
    ],
    sqlSketch: '# Python: 多场景财务建模\nimport pandas as pd\nimport numpy as np\n\nscenarios = {\n    \'optimistic\':  {\'som_growth_rate\': 1.50, \'cac\': 35, \'ltv\': 240},\n    \'base\':        {\'som_growth_rate\': 1.30, \'cac\': 45, \'ltv\': 195},\n    \'pessimistic\': {\'som_growth_rate\': 1.10, \'cac\': 60, \'ltv\': 150}\n}\n\ndef project_5y(scenario):\n    som_y1 = 8.5  # 第 1 年市场份额（百万 USD）\n    invest = []\n    revenue = []\n    profit = []\n    for year in range(1, 6):\n        som = som_y1 * (scenario[\'som_growth_rate\'] ** (year-1))\n        revenue.append(som)\n        # 投入：第 1-2 年 600 万/年（建仓 + 拉新）；第 3 年 起 200 万/年（运营）\n        inv = 6.0 if year <= 2 else 2.0 + (year-2)*0.5\n        invest.append(inv)\n        # 利润 = 营收 × 30% 毛利 - 投入\n        profit.append(som * 0.30 - inv)\n    return pd.DataFrame({\'year\': range(1,6), \'revenue\': revenue, \'invest\': invest, \'profit\': profit})\n\nfor name, s in scenarios.items():\n    print(f\'\\n--- {name} scenario ---\')\n    print(project_5y(s))',
    analysisProcess: '四维评估框架：\n\n**第一维：市场规模（TAM / SAM / SOM）**\n- TAM（总市场）：日本美妆市场年规模 700 亿 USD\n- SAM（可触达市场）：DTC + 中端价位（4-30 USD）+ 在线渠道 = 70 亿 USD（占 TAM 10%）\n- SOM（可获得份额）：第 1 年 0.12% = 850 万；第 3 年 1% = 6800 万；第 5 年 2.5% = 1.7 亿（基于欧美市场 5 年成长曲线类比）\n\n**第二维：竞争格局**\n- 头部 3 家本土品牌（资生堂、SK-II、花王）合计市占 38%\n- 国际品牌中 Estée Lauder / La Mer / Drunk Elephant 各占 3-5%\n- DTC 品牌在日本仅占 6%，渠道空白明显\n- 竞品分析显示日本用户对"成分透明"和"包装精美"高敏感，本品牌欧美市场卖点（高活性成分 + 极简风设计）匹配度 85%\n\n**第三维：进入成本估算**\n- 一次性成本：本地化（包装/网站/客服日文化）120 万 + 产品认证（厚生劳动省 / Quasi-drug 认证）80 万 + 仓配建立 60 万 = 260 万\n- 经常性成本：年度营销 350 万 + 团队 120 万 + 仓储 80 万 = 550 万/年\n- 累计 5 年投入预计 1500 万（前 2 年密集 + 后 3 年稳定）\n\n**第四维：风险评估**\n- 监管风险：日本化妆品有 Quasi-drug 认证（部分功效宣称需认证），认证周期 12-18 月，需提前规划\n- 文化风险：日本用户对"草本""自然""敏感肌"标签高度敏感，需要本地化产品线（70% 卖现有产品 + 30% 推日本特供）\n- 渠道风险：日本电商集中度低（Amazon JP 30% / Rakuten 25% / 自营 + 其他 45%），多渠道运营成本高\n\n**3 套财务场景模型**：\n- 乐观（年增长率 50%）：5 年累计营收 4.2 亿，盈亏平衡第 2 年末，5 年 ROI 5.6\n- 基准（年增长率 30%）：5 年累计 2.1 亿，盈亏平衡第 3 年末，5 年 ROI 2.8\n- 悲观（年增长率 10%）：5 年累计 1.0 亿，盈亏平衡第 5 年，5 年 ROI 0.6（亏损）\n敏感度分析显示——CAC 和 LTV 是最大变量。CAC 上升 30% 或 LTV 下降 30% 都可能让基准场景退化为悲观。\n\n**最终决策建议**：\n- 进入但分阶段——第 1 年仅做 Amazon JP 单渠道试点（投入 250 万），观察 12 个月数据再决定是否扩展到 Rakuten + 自营\n- 不大幅本地化——前 6 个月只翻译现有畅销品 + 简单包装本地化，不开新品线\n- 12 个月后 Gate Review：CAC > 65 USD 或 LTV < 150 USD 进入悲观场景，立即收缩；CAC ≤ 50 USD 且 LTV ≥ 200 USD 加大投入',
    coreFindings: [
      {
        finding: '基准场景下 5 年 ROI 2.8，值得进入',
        evidence: '基准场景 5 年累计营收 2.1 亿，投入 7600 万（含 5 年滚动），ROI 2.8。第 3 年末盈亏平衡。',
        implication: '从财务角度日本市场可进入，但回报周期偏长（盈亏平衡 3 年），不适合资金紧张企业。'
      },
      {
        finding: 'CAC 和 LTV 是最大风险变量',
        evidence: '敏感度分析显示 CAC 上升 30% 或 LTV 下降 30% 即让模型退化到悲观（亏损）。',
        implication: '市场进入决策不能只看"基准场景"，必须做敏感度分析。识别关键变量并在执行中持续监控。'
      },
      {
        finding: '"分阶段试点"比"一次性大投入"风险显著低',
        evidence: '一次性 1500 万 vs 分阶段 250 万 + 12 个月观察后扩展。前者一旦失败损失 1500 万，后者最坏损失 250 万。',
        implication: '战略决策中"灵活性"本身有价值。期权理论告诉我们——保留"未来选择权"值得付出溢价。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '第 1 年 Amazon JP 单渠道试点（投入 250 万）',
        action: '聚焦 Amazon JP 单渠道；翻译 Top 10 畅销 SKU + 简单包装本地化；获取 Quasi-drug 认证（首批 3 款）；建立 5 人本地团队。\n关键成功指标——12 个月 CAC ≤ 50 USD、LTV ≥ 200 USD、月度 GMV ≥ 30 万 USD。',
        expectedOutcome: '12 个月内验证基础假设，损失上限可控在 250 万。',
        owner: '战略团队 + 国际业务部'
      },
      {
        strategy: '12 个月 Gate Review 决策机制',
        action: '12 个月后看试点数据决定下一步——绿灯（CAC≤50 且 LTV≥200）：扩展到 Rakuten + 自营独立站，加投到 800 万/年；黄灯（介于阈值之间）：维持单渠道，再观察 6 个月；红灯（CAC>65 或 LTV<150）：撤出市场，止损 < 300 万。',
        expectedOutcome: '降低战略决策风险，灵活应对市场反馈。',
        owner: '董事会 + CEO 办公室'
      },
      {
        strategy: '关键变量月度监控',
        action: 'CAC / LTV / 月度 GMV / 复购率 4 个核心指标月度看板，财务总监 + CMO 每月复盘。任一指标偏离基准场景 -20% 以上触发战略复议。',
        expectedOutcome: '从年度复盘升级为月度敏感监控，及早发现风险信号。',
        owner: 'CFO + 数据团队'
      }
    ],
    businessOutcome: '决策被董事会通过——按"分阶段试点"方案进入。第 1 年单渠道试点投入 220 万 USD，月度 GMV 第 12 月达 38 万 USD（超基准目标），CAC 47 / LTV 215，全部进入"绿灯"区间。第 2 年扩展到 Rakuten + 部分自营，年营收达 1100 万 USD。第 3 年实现盈亏平衡（提前 6 个月）。该框架被复制到东南亚（新加坡 + 韩国）市场进入决策，避免了 2 个市场的潜在亏损投入。',
    reflection: '复用边界：本框架适用于"重资产投入的市场进入决策、有清晰可估算的市场规模 / 竞争 / 成本数据"的场景。不适用于：(1) 极小市场进入（决策成本 > 收益）；(2) 战略意义远大于财务回报的进入（如品牌占位）；(3) 监管或政策剧烈变化的市场（无法稳定建模）。\n失败教训：第一版财务模型只算基准场景，董事会问"如果失败损失多少"答不上来。后期增加 3 套场景 + 敏感度分析才完整。**任何重大决策必须做"如果错了多惨"的边界测试，单点估算不够。**\n下一步进阶：(1) 引入蒙特卡洛模拟（Monte Carlo），算 1 万次随机模拟下的回报分布；(2) 用实物期权（Real Option）方法量化"分阶段进入"的灵活性溢价；(3) 把市场进入扩展为"市场组合优化"——在 5 个候选市场中选最优组合，而非单市场决策。'
  },

  {
    id: 'c-okr-tracking-41',
    title: 'OKR 目标拆解与达成度跟踪：从模糊"提升用户体验"到 30 个量化 KR',
    category: '基础模型',
    subcategory: '战略落地',
    industry: '综合电商平台',
    difficulty: '入门',
    tags: ['OKR 拆解', '目标管理', '达成度跟踪', '战略落地'],
    prerequisites: ['OKR 与 KPI 的区别', '指标可量化原则', '战略落地基础'],
    summary: '某电商 CEO 提出年度 O——"全面提升用户体验"，但各部门理解不同导致执行混乱。引入"3 层 OKR 拆解 + 月度达成度跟踪"机制，把模糊 O 拆解为 6 个 O1（部门级）+ 30 个 KR（具体可量化）。每月跟踪 KR 达成度（红/黄/绿），季度复盘调整。年底 NPS 提升 24 分、复购率 +5pp、客诉率 -38%，OKR 完成率 78%（健康水平 70-80%）。',
    background: '某综合电商 CEO 在 2024 年战略会上提出年度 O——"全面提升用户体验，让用户更愿意推荐"。但落到执行层，各部门理解不同——产品部理解为"改 UI"、客服理解为"提升满意度评分"、运营理解为"减少客诉"、商家运营理解为"管控商家品质"。半年过去，每个部门都做了一些事，但年度 O 是否进展？数据怎么说？谁也回答不出来。\n人力总监引入 OKR 方法论，但执行层还是不知道怎么把"用户体验"量化到可衡量的层级。需要数据团队介入，建立可执行的 OKR 拆解 + 跟踪机制。',
    fields: [
      { name: 'okr_id', type: 'string', description: 'OKR 唯一 ID', example: 'O2024_UX_01' },
      { name: 'level', type: 'string', description: '层级（O0/O1/KR）', example: 'O1' },
      { name: 'parent_id', type: 'string', description: '父级 OKR', example: 'O2024_TOP_01' },
      { name: 'owner_dept', type: 'string', description: '责任部门', example: '客服部' },
      { name: 'baseline_value', type: 'float', description: '起始值', example: '38.0' },
      { name: 'target_value', type: 'float', description: '目标值', example: '60.0' },
      { name: 'current_value', type: 'float', description: '当前值', example: '52.0' },
      { name: 'achievement_rate', type: 'float', description: '达成度', example: '0.64' }
    ],
    sqlSketch: '-- OKR 达成度跟踪\nWITH okr_progress AS (\n  SELECT okr_id, level, parent_id, owner_dept, target_value, baseline_value,\n         current_value,\n         (current_value - baseline_value) * 1.0 / NULLIF(target_value - baseline_value, 0) AS achievement_rate\n  FROM okr_tracker\n  WHERE quarter = \'2024Q4\'\n)\nSELECT *,\n       CASE\n         WHEN achievement_rate >= 0.70 THEN \'green\'\n         WHEN achievement_rate >= 0.40 THEN \'yellow\'\n         ELSE \'red\'\n       END AS status\nFROM okr_progress\nORDER BY level, owner_dept;',
    analysisProcess: '3 层 OKR 拆解：\n\n**O0（公司级，年度 1 个）**：全面提升用户体验，让用户更愿意推荐\n- KR 0.1：年度 NPS 从 38 提升至 60\n- KR 0.2：年度复购率从 35% 提升至 40%\n- KR 0.3：年度客诉率从 0.6% 降至 0.4%\n\n**O1（部门级，6 个）**：每个相关部门拆 1 个 O1，对应公司级 KR——\n1. **产品部 O1**：让用户更顺畅地完成购物。KR 1.1（核心路径转化率提升 8%）/ KR 1.2（支付成功率从 96% 升至 99%）/ KR 1.3（页面加载时长 P95 从 3.2 秒降至 1.5 秒）/ KR 1.4（产品 NPS 子项评分提升 5 分）\n2. **物流部 O1**：缩短配送时长 + 减少破损。KR 2.1（72 小时送达率从 82% 升至 95%）/ KR 2.2（破损率从 1.2% 降至 0.5%）/ KR 2.3（物流 NPS 子项评分提升 6 分）\n3. **客服部 O1**：响应快、解决率高。KR 3.1（平均首次响应从 50 秒降至 25 秒）/ KR 3.2（一次解决率从 68% 升至 82%）/ KR 3.3（客服 NPS 子项评分提升 5 分）\n4. **商家运营 O1**：商家品质管控。KR 4.1（高客诉商家数从 280 家降至 80 家）/ KR 4.2（退款率从 12% 降至 9%）/ KR 4.3（DSR 评分平均从 4.6 升至 4.8）\n5. **质检部 O1**：商品品质提升。KR 5.1（品质客诉率从 4.2% 降至 2.5%）/ KR 5.2（高频品质问题 SKU 整改完成 100%）\n6. **数据部 O1**：用户体验数据基础设施。KR 6.1（NPS 调研覆盖率从 8% 升至 25%）/ KR 6.2（5 个核心体验指标日级监控上线）\n\n合计 30 个 KR，每个都可量化、可追踪。\n\n月度跟踪机制：\n- BI 看板每月跑一次所有 KR 当前值，自动算达成度\n- 红黄绿三色——绿（达成 ≥ 70%）/ 黄（40-70%）/ 红（< 40%）\n- 每月第 5 个工作日开 OKR 月会，对所有红色 KR 进行原因分析 + 整改\n\n季度复盘：\n- 每季度 Q1/Q2/Q3 末做正式 review，对偏离严重的 KR 调整目标或资源\n- Q4 末做年度结算，分析整体达成度 + 经验教训\n\n年度结果：\n- 30 个 KR 中 23 个达成（≥ 70%），5 个部分达成（40-70%），2 个未达成（< 40%）\n- 整体 OKR 完成率 78%（健康水平 70-80%，过高说明目标设得太保守，过低说明执行有问题）\n- 关键 KR 达成情况——NPS 38 → 62（KR 0.1 完成 109%）、复购率 35% → 40%（完成 100%）、客诉率 0.6% → 0.37%（完成 115%）',
    coreFindings: [
      {
        finding: '"模糊 O"必须强制拆解到"30 个量化 KR"才能落地',
        evidence: '原 O"提升用户体验"6 个月内零进展。拆到 30 个量化 KR 后年底完成率 78%。',
        implication: '战略落地 = 量化拆解 × 责任明确 × 持续跟踪。任一缺失都会让战略空转。'
      },
      {
        finding: '78% OKR 达成率是"健康"水平',
        evidence: '23/30 KR 达成（≥ 70%）。完成率 100% 通常说明目标太保守；< 50% 说明执行有问题。70-80% 是行业最佳实践。',
        implication: 'OKR 不是 KPI，目标可以"够一够才够得到"。100% 达成的目标其实没有挑战性。'
      },
      {
        finding: '月度红黄绿跟踪显著优于季度跟踪',
        evidence: '红色 KR 在月会上即被发现并整改，避免到季度末再补救。30 个 KR 中 8 个曾出现红色但月会后修正回绿色。',
        implication: '"目标管理"不是年初定 + 年末看，是月度持续跟踪 + 调整。频次决定了战略落地的成败。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '3 层 OKR 拆解 + 月度跟踪机制',
        action: 'O0（公司）→ O1（部门 6 个）→ KR（30 个具体量化）。每个 KR 有起始值、目标值、责任部门、月度跟踪。BI 看板自动算达成度。',
        expectedOutcome: '战略落地从"喊口号"变为"可衡量、可追踪、可问责"，年度战略达成率显著提升。',
        owner: '战略部 + 数据团队'
      },
      {
        strategy: '月度 OKR 红黄绿例会',
        action: '每月第 5 个工作日开 OKR 月会，所有 KR 状态过一遍。红色 KR 必须在 30 分钟内说明——什么阻塞、需要什么资源、下月计划。',
        expectedOutcome: '红色 KR 平均 1-2 个月内修正，避免年终大幅未达成。',
        owner: '战略部 + 各部门 leader'
      },
      {
        strategy: '季度 OKR 调整机制',
        action: '每季度末对偏离严重的 KR（> 30% 偏离）允许调整目标或资源——但调整必须有充分理由（市场环境变化 / 资源被抽调），不能只是"目标定高了"。',
        expectedOutcome: 'OKR 体系灵活适应外部变化，不死板。',
        owner: '战略部 + CEO'
      }
    ],
    businessOutcome: '体系运行 12 个月：年度 NPS 从 38 升至 62（KR 完成 109%）；复购率从 35% 升至 40%（100%）；客诉率从 0.6% 降至 0.37%（115%）；30 个 KR 整体完成率 78%；CEO 在年度战略会引用 OKR 数据，董事会对管理团队的执行能力评价显著提升；该体系被复制到次年战略 OKR 制定。',
    reflection: '复用边界：3 层 OKR 拆解适用于"中大型企业（部门 ≥ 5 个）、目标稳定（季度内不剧变）、有量化数据基础"。不适用于：(1) 早期初创公司（业务方向频繁变化）；(2) 极小团队（拆解层级无意义）；(3) 完全研发驱动公司（产出难量化）。\n失败教训：第一版 KR 设得太多（每个部门 8-10 个），结果月会变成"汇报大会"开 3 小时。后期收敛到每部门 3-5 个核心 KR，月会 30 分钟搞定。**KR 数量不是越多越好，3-5 个核心比 10 个分散有效。**\n下一步进阶：(1) 引入"OKR 难度评分"，对每个 KR 评估目标设定的挑战度（保守 / 适中 / 激进），与达成度联合评估管理团队真实能力；(2) 把 OKR 与个人绩效解耦，避免目标博弈（员工故意定低保完成率）；(3) 用 AI 自动从历史数据建议合理 KR 目标值，降低拍脑袋设目标的偏差。'
  }
];
