import * as fs from 'fs';

const newCaseStudies = `export const caseStudies: CaseStudy[] = [
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
    background: '某内容电商日均 DAU 80 万，模式是"短视频种草 + 站内购买"。Q3 总经理在战略会提出"全面提升用户活跃度"，要求各部门 KPI 与该目标对齐。\\n但落到执行层面，三个核心部门理解南辕北辙：内容团队认为活跃 = PV 总量，于是疯狂铺量；运营团队认为活跃 = DAU，于是发券拉拉签到；商业化团队认为活跃 = 下单率，于是减少广告位增加购物车曝光。三个方向甚至互相冲突（如商业化减广告位影响内容曝光）。\\n数据团队的任务：把"活跃度"这个模糊目标，拆成全公司能共识、可分配 KPI、可监控的指标体系。要求 2 周内交付。',
    fields: [
      { name: 'user_id', type: 'string', description: '用户唯一标识', example: 'U_8830012' },
      { name: 'event_date', type: 'date', description: '事件发生日期', example: '2024-08-12' },
      { name: 'event_type', type: 'string', description: '行为类型：view/like/cart/pay 等', example: 'cart' },
      { name: 'session_duration_sec', type: 'int', description: '会话时长，用于衡量参与深度', example: '486' },
      { name: 'pay_amount', type: 'decimal', description: '当次会话内的支付金额，关联商业化指标', example: '128.50' }
    ],
    sqlSketch: '-- 北极星："周内有效互动用户数"（产生 ≥1 次点赞/收藏/加购/支付的 7 日活跃用户）\\nWITH weekly AS (\\n  SELECT DATE_TRUNC(\\'week\\', event_date) AS week_start,\\n         user_id,\\n         MAX(CASE WHEN event_type IN (\\'like\\',\\'fav\\',\\'cart\\',\\'pay\\') THEN 1 ELSE 0 END) AS has_engagement\\n  FROM events\\n  WHERE event_date >= \\'2024-06-01\\'\\n  GROUP BY 1, 2\\n)\\nSELECT week_start,\\n       COUNT(DISTINCT user_id)                                       AS wau,\\n       COUNT(DISTINCT CASE WHEN has_engagement = 1 THEN user_id END) AS active_engaged_users,\\n       active_engaged_users * 1.0 / NULLIF(wau, 0)                    AS engagement_rate\\nFROM weekly\\nGROUP BY 1\\nORDER BY 1;',
    analysisProcess: '需求澄清：约总经理沟通 30 分钟，问出关键信息——"活跃"在他心里其实是"用户愿意持续来、不流失、且对商业化有正向贡献"。这是个混合目标，必须拆成多个具体指标来管。\\nOSM 拆解：用 OSM 模型展开。Objective（业务目标）= 提升用户活跃度。Strategy（核心策略）= 提升内容质量、降低使用门槛、强化用户分层运营、提升内容到购买的转化效率。Metrics（衡量指标）= 每条策略对应的可量化指标。\\n选定北极星：用 4 条选择标准（① 反映长期用户价值；② 全公司可共识；③ 不易被短期行为操纵；④ 可被多团队共同推动）筛选候选指标。淘汰 PV（短期可灌水）、DAU（不区分质量）、GMV（不直接反映活跃）。最终选定"周内有效互动用户数"作为北极星——产生过点赞/收藏/加购/支付任一行为的 7 日活跃用户数。\\n金字塔搭建：北极星之下设 4 个一级指标（次日留存率、人均互动次数、内容到购物车转化率、付费用户占比），每个一级指标下挂 3 个二级指标。例如"次日留存率"下挂"新人 Day1 留存""老人月活跃天数""推送点击留存"。每个二级指标明确归口部门。\\n指标对齐与试运行：与各部门 leader 逐一对齐，调整部门 KPI 权重，让每个部门的核心 KPI 都至少包含 1 个北极星金字塔上的二级指标。试运行 4 周后开第一次复盘，剔除 6 个无人关注/无法影响的指标。',
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
    reflection: '复用边界：北极星模型适用于"业务方向相对稳定、有多部门协作、需要长期目标对齐"的成熟产品。不适用于：(1) 早期 PMF 探索阶段（指标可能频繁变化）；(2) 单一团队、目标极简的小型业务；(3) 监管驱动型业务（如金融合规，KPI 由外部决定）。\\n失败教训：第一版我们贪多堆了 30 个二级指标，3 个 dashboard 没人看。指标体系不是越全越好，是越用越好——能进入业务会议引用的才算活的指标。\\n下一步进阶：(1) 从静态 KPI 升级到动态指标健康度评分（结合趋势/方差/相关性），自动识别需要重设的指标；(2) 把北极星拆解逻辑做成"指标工厂"工具，让产品/运营自助拆解新业务目标。'
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
    background: '某美妆个护电商月度优惠券预算 100 万元（包含满减、品类券、新人券、唤回券）。运营月报口径是"领券用户在 30 天内的总 GMV"，按此口径核算 ROI 长期稳定在 1:4.5 - 1:5.5，被认为是高效投放。\\n但 CFO 在季度复盘提出疑问："这些用户中有多少不发券也会买？我们到底为多少\\'额外购买\\'付了钱？"现有的 ROI 口径无法回答。数据团队需要给出"真实增量 GMV"的测算方法，并建议预算如何重新分配。',
    fields: [
      { name: 'user_id', type: 'string', description: '用户唯一标识', example: 'U_8830012' },
      { name: 'received_coupon', type: 'bool', description: '本期是否领取了优惠券', example: 'true' },
      { name: 'used_coupon', type: 'bool', description: '本期是否实际核销了优惠券', example: 'true' },
      { name: 'gmv_30d', type: 'decimal', description: '当期（领券或对照基准）后 30 天的 GMV', example: '358.40' },
      { name: 'pay_count_180d', type: 'int', description: '过去 180 天支付订单数，用于匹配画像', example: '4' }
    ],
    sqlSketch: '-- 简单版："PSM 思路"匹配对照组并计算增量\\nWITH treatment AS (\\n  SELECT user_id, gmv_30d AS treated_gmv,\\n         pay_count_180d, last_pay_recency_days, fav_category\\n  FROM coupon_log\\n  WHERE used_coupon = TRUE AND batch_id = \\'2024_aug\\'\\n),\\ncontrol AS (\\n  SELECT user_id, gmv_30d AS control_gmv,\\n         pay_count_180d, last_pay_recency_days, fav_category\\n  FROM user_summary\\n  WHERE NOT EXISTS (\\n    SELECT 1 FROM coupon_log c\\n    WHERE c.user_id = user_summary.user_id\\n      AND c.batch_id = \\'2024_aug\\'\\n  )\\n)\\nSELECT t.user_id,\\n       t.treated_gmv,\\n       AVG(c.control_gmv) AS expected_natural_gmv,\\n       t.treated_gmv - AVG(c.control_gmv) AS incremental_gmv\\nFROM treatment t\\nJOIN control c\\n  ON ABS(t.pay_count_180d - c.pay_count_180d) <= 1\\n AND ABS(t.last_pay_recency_days - c.last_pay_recency_days) <= 7\\n AND t.fav_category = c.fav_category\\nGROUP BY t.user_id, t.treated_gmv;',
    analysisProcess: '数据准备：取 2024 年 8 月某次满减券活动数据。领券核销用户 12.4 万人（实验组），同期未领券的活跃用户 95.6 万人（对照池）。剔除企业账号、异常退款用户、ID 关联可疑账号约 2.1%。\\n构造对照组：直接对比"领券用户 vs 全体未领券用户"会被画像差异污染（领券的本来就是高频用户）。用 PSM（倾向得分匹配）思路，按"过去 180 天支付次数±1、最近一次支付距今天数±7、偏好品类相同"三个条件做 1:5 匹配，为每个领券用户找到 5 个画像相似的"双胞胎"作为对照。匹配成功率 87%。\\n计算真实增量：领券用户 30 天平均 GMV 412 元，匹配的对照组用户 30 天平均 GMV 279 元。真实增量 = 412 - 279 = 133 元/人。乘以核销人数 12.4 万 = 总真实增量约 165 万元。同期券面值消耗 100 万。真实 ROI = 1.65（远低于报告的 5）。\\n分人群拆解：把领券用户按"过去 180 天 GMV"分四组。低活跃（< 100 元）人均增量 +186 元（券真正激活了沉睡）；中活跃（100-500）人均 +98 元；高活跃（500-2000）人均 +35 元；超高活跃（> 2000）人均 -12 元（这部分人本来就要买，券其实让他们买得更少了——被券面值"封顶"）。',
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
    reflection: '复用边界：本方法适用于"有大量未投放用户作为天然对照池、画像数据较丰富"的场景。不适用于：(1) 全量投放（没人没领券，无对照组）；(2) 用户画像稀疏的早期产品；(3) 强网络效应业务（对照组用户也会被领券用户的行为间接影响）。\\n失败教训：第一版仅按"过去 30 天消费"单维度匹配，结果增量被高估约 40%（没控制品类偏好），把美妆品类的领券用户和零食品类的非领券用户匹配在了一起。匹配维度的覆盖完整性比方法本身更重要。\\n下一步进阶：(1) 从 PSM 升级到 DiD（双重差分），同时控制时间趋势；(2) 引入 Uplift Model（增效模型），不仅算"哪些人增量大"，还能预测"如果给某用户发券，他的增量是多少"，实现更精细的人群圈选。'
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
    background: '某生鲜电商月均订单 80 万，客诉 5000 条左右（投诉率约 0.6%）。客服团队每条人工打标签，但标签体系混乱（30+ 个标签，部分含义重叠），运营每月开复盘会拿到的"投诉 Top 10"每次都不一样，没法支持改进。\\nVP 客服提出诉求：(1) 建立稳定可用的客诉分类体系；(2) 找出真正高频高影响的根因；(3) 关联到具体 SKU/仓库/链路环节，让责任落到部门。',
    fields: [
      { name: 'complaint_id', type: 'string', description: '客诉单唯一 ID', example: 'CMP_240812_0345' },
      { name: 'submit_at', type: 'datetime', description: '客诉提交时间', example: '2024-08-12 14:23:11' },
      { name: 'content_text', type: 'text', description: '用户填写的客诉描述（自由文本）', example: '草莓收到的时候已经发霉了一半' },
      { name: 'related_sku_id', type: 'string', description: '关联订单的主要 SKU', example: 'SKU_F2245' },
      { name: 'warehouse_id', type: 'string', description: '出库仓库', example: 'WH_HZ_03' }
    ],
    sqlSketch: '-- 用关键词词典做一级 + 二级分类\\nWITH classified AS (\\n  SELECT complaint_id, related_sku_id, warehouse_id,\\n         CASE\\n           WHEN content_text LIKE \\'%发霉%\\' OR content_text LIKE \\'%变质%\\' OR content_text LIKE \\'%臭%\\'  THEN \\'品质_腐败\\'\\n           WHEN content_text LIKE \\'%破损%\\' OR content_text LIKE \\'%压碎%\\' OR content_text LIKE \\'%漏%\\'    THEN \\'品质_破损\\'\\n           WHEN content_text LIKE \\'%晚%\\'   OR content_text LIKE \\'%延迟%\\' OR content_text LIKE \\'%没到%\\' THEN \\'物流_延迟\\'\\n           WHEN content_text LIKE \\'%少%\\'   OR content_text LIKE \\'%缺%\\'   OR content_text LIKE \\'%漏发%\\' THEN \\'物流_少件\\'\\n           WHEN content_text LIKE \\'%态度%\\' OR content_text LIKE \\'%客服%\\'                              THEN \\'服务_态度\\'\\n           WHEN content_text LIKE \\'%退款%\\' OR content_text LIKE \\'%售后%\\'                              THEN \\'服务_售后\\'\\n           ELSE \\'其他\\'\\n         END AS sub_category\\n  FROM complaints WHERE submit_at >= \\'2024-08-01\\' AND submit_at < \\'2024-09-01\\'\\n)\\nSELECT sub_category,\\n       related_sku_id,\\n       warehouse_id,\\n       COUNT(*) AS complaint_cnt\\nFROM classified\\nGROUP BY 1, 2, 3\\nORDER BY complaint_cnt DESC;',
    analysisProcess: '数据准备：取 8 月共 5012 条客诉。先随机抽 200 条人工标注，整理出 4 个一级类目（品质、物流、服务、其他）+ 12 个二级类目，建立关键词词典（每个二级类目 5-15 个高频关键词）。\\n关键词分类与抽检：用 SQL CASE WHEN + LIKE 跑词典分类，覆盖 89% 的客诉（其余 11% 落入"其他"）。再随机抽 100 条机器分类结果人工抽检，准确率 84%（足够用，比人工不一致性强）。\\n二级帕累托：分析二级类目的频次分布，发现 12 个二级类目中"品质_腐败""物流_延迟""品质_破损"三个类目合计占 67% 客诉量。继续做"二级类目 × SKU"和"二级类目 × 仓库"交叉。\\n三级关联：发现 73% 的"品质_腐败"客诉集中在 5 个 SKU（占总 SKU 数 0.6%），都是"水果生鲜叶菜"高敏感品类；82% 的"物流_延迟"客诉集中在 3 个仓库（共 11 仓），其中 2 个是新启用的偏远仓。问题不是大盘性的，而是结构性的——少数节点在持续拖累。\\n业务影响测算：把客诉用户与未客诉用户的 30 天复购率对比，客诉用户复购率 18%（未客诉 41%），且 NPS 评分下降 47 分。客诉的真实成本不是赔付金额，是客户流失。',
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
        expectedOutcome: '物流延迟客诉减少 60%。'
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
    reflection: '复用边界：关键词词典法适用于"客诉文本相对短、模式相对固定、问题类目数量在 30 个以内"的场景。不适用于：(1) 客诉文本极长且分散（如医疗投诉，需要专业 NLP）；(2) 类目数量上百的复杂业务（用 LIKE 维护成本爆炸）；(3) 跨语言客诉。\\n失败教训：第一版试图用情感分析做分类（按 polarity 打分），但发现客诉本质都是负面，情感分析没区分度。后改回主题分类才有用。技术选型必须服务业务问题，不要为了"高级"而高级。\\n下一步进阶：(1) 用 sentence embedding（如 BGE 模型）做向量化 + 聚类，自动发现新的客诉类目；(2) 接入 LLM 做客诉摘要 + 自动归因（"这条客诉关联 SKU/仓库/链路环节是什么"），让分析师从打标签的工作中解放出来。'
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
    background: '某宠物食品电商猫粮品类年销售额 2.4 亿，毛利率从 2 年前的 28% 持续下滑到当前 19%。下滑主因：上游进口粮成本上涨 + 平台促销补贴加码 + 竞品价格战。\\n2024 年 9 月业务方提出"全线涨价 5%"提案，预期增收 1200 万。但 CEO 担心销量崩塌，要求数据团队基于历史数据测算"涨价后的真实销量影响"，并给出可执行的调价方案。',
    fields: [
      { name: 'sku_id', type: 'string', description: 'SKU 唯一标识', example: 'SKU_CF_2034' },
      { name: 'sale_date', type: 'date', description: '销售日期', example: '2024-09-12' },
      { name: 'price', type: 'decimal', description: '当日实际售价（剔除促销后）', example: '128.00' },
      { name: 'sales_qty', type: 'int', description: '当日销售数量', example: '482' },
      { name: 'competitor_price', type: 'decimal', description: '同期主要竞品该品类同档位均价', example: '125.00' }
    ],
    sqlSketch: '-- 价格弹性回归（双对数模型）：log(Q) = α + ε·log(P) + β·log(P_competitor) + γ·season\\nWITH daily AS (\\n  SELECT sku_id, sale_date,\\n         LN(sales_qty)         AS ln_q,\\n         LN(price)             AS ln_p,\\n         LN(competitor_price)  AS ln_pc,\\n         EXTRACT(DOW FROM sale_date) AS dow,\\n         EXTRACT(MONTH FROM sale_date) AS mon\\n  FROM sku_daily\\n  WHERE sale_date BETWEEN \\'2023-04-01\\' AND \\'2024-09-30\\'\\n    AND sales_qty > 0 AND price > 0\\n)\\n-- 在 Python/R 里跑回归：lm(ln_q ~ ln_p + ln_pc + factor(dow) + factor(mon))，ε 的系数即弹性\\nSELECT * FROM daily;',
    analysisProcess: '数据准备：取过去 18 个月（2023-04 至 2024-09）猫粮品类 47 个核心 SKU 的日级销售数据，共 25.7 万条记录。剔除大促周期数据（双 11、618、年货节，价格扰动太大）和库存断货日（销量被供应限制，不反映需求）。剩余 18.3 万条用于建模。\\n弹性建模：用双对数回归 ln(Q) = α + ε·ln(P) + β·ln(P_competitor) + γ·季节项。系数 ε 即价格弹性。先按品类整体跑一次得到 -1.18（销量弹性弹），然后按 SKU 单独跑，得到每个 SKU 的弹性系数。\\nSKU 弹性分层：47 个 SKU 按弹性系数分组——高弹性组（ε < -1.5，22 个 SKU，多为平价主粮）：销量对价格极敏感，涨价 1% 销量降 1.5%+；中弹性（-1.5 ≤ ε < -0.8，14 个）：价格敏感度中等；低弹性（-0.8 ≤ ε < -0.3，11 个 SKU，多为高端进口/处方粮）：销量对价格不敏感，涨价空间大。\\n竞品交叉验证：观察过去 6 次重大调价事件（涨价或降价 ≥ 3%）。当竞品同期同向调整时，自身弹性绝对值降低 50%-70%（说明用户不会跑去竞品）。当竞品反向调整时，弹性绝对值翻倍（用户会立刻流失）。这意味着调价时机比调价幅度更关键。\\n调价方案模拟：用每个 SKU 的弹性系数模拟"涨 3%/5%/7%"对应的销量与营收变化。全线涨 5% 的预测结果：营收 +0.8%（远低于 +5% 目标），销量 -4.1%，毛利率 +2.5pp。分层调价方案预测：低弹性 SKU 涨 7%、中弹性涨 3%、高弹性不动，营收 +3.2%，销量仅 -1.5%，毛利率 +4.2pp。',
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
    reflection: '复用边界：双对数弹性模型适用于"价格变化频繁、有较多历史数据点（18 个月以上）、销量与价格之间无极端非线性关系"的成熟品类。不适用于：(1) 新品（数据点不够）；(2) 价格策略很少变化的品类（共线性严重）；(3) 强奢侈品/低敏感的品类（弹性接近 0，模型不显著）。\\n失败教训：第一版回归没有控制大促周期，把双 11 期间的"低价 + 高销量"数据混入，得到了错误的弹性系数 -3.2（虚高），险些劝退业务方涨价。所有自然实验性质的因果分析都必须严格清洗外生干扰。\\n下一步进阶：(1) 引入 GLS（广义最小二乘）处理时间序列自相关问题；(2) 建立分人群弹性模型（高净值用户对价格不敏感，价格敏感用户对促销极敏感），实现千人千价的精准定价。'
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
    background: '某家居用品电商连续 3 年参加双 11，蓄水期（10/15-10/31）+ 爆发期（11/1-11/11）模式成熟。今年大促 GMV 目标 1.2 亿，蓄水期投入广告预算 800 万，到 10/28 累计加购单 240 万、加购金额 4.8 亿。\\n业务团队按"加购金额 × 历史转化率 25%"心算预期爆发期 GMV 约 1.2 亿，认为目标可达。但数据团队从蓄水量同比 -18%、品类结构变化等信号判断目标存在缺口风险，需要在 10/30 前给出量化预测，决定是否追加蓄水投入。',
    fields: [
      { name: 'user_id', type: 'string', description: '用户唯一标识', example: 'U_8830012' },
      { name: 'add_cart_at', type: 'datetime', description: '加购时间', example: '2024-10-22 21:14:33' },
      { name: 'sku_id', type: 'string', description: '加购 SKU', example: 'SKU_HM_2245' },
      { name: 'cart_amount', type: 'decimal', description: '加购金额（数量×单价）', example: '459.00' },
      { name: 'campaign_year', type: 'int', description: '大促年份，用于历史同期对比', example: '2024' }
    ],
    sqlSketch: '-- 蓄水池规模 + 历史同期对比 + 转化率预测\\nWITH this_year AS (\\n  SELECT user_id, SUM(cart_amount) AS cart_amt,\\n         CASE WHEN SUM(cart_amount) >= 1000 THEN \\'high\\' \\n              WHEN SUM(cart_amount) >= 300  THEN \\'mid\\' ELSE \\'low\\' END AS cart_tier\\n  FROM cart_log\\n  WHERE add_cart_at BETWEEN \\'2024-10-15\\' AND \\'2024-10-28\\'\\n  GROUP BY user_id\\n),\\nlast_year AS (\\n  SELECT cart_tier,\\n         COUNT(DISTINCT user_id)              AS uv,\\n         SUM(cart_amt)                        AS total_cart,\\n         SUM(actual_paid_amt)                 AS total_paid,  -- 该 cohort 在爆发期实际支付\\n         SUM(actual_paid_amt) / SUM(cart_amt) AS conv_rate\\n  FROM cart_log_2023_with_payment\\n  GROUP BY cart_tier\\n)\\nSELECT t.cart_tier,\\n       SUM(t.cart_amt)                          AS this_year_cart,\\n       l.conv_rate                              AS hist_conv_rate,\\n       SUM(t.cart_amt) * l.conv_rate            AS predicted_gmv\\nFROM this_year t\\nJOIN last_year l ON t.cart_tier = l.cart_tier\\nGROUP BY 1, l.conv_rate;',
    analysisProcess: '数据准备：取 2021、2022、2023 三年的蓄水期与爆发期完整数据，剔除受疫情扰动的部分。每个年度按"用户加购金额"分三档：高客单（≥1000）/ 中客单（300-1000）/ 低客单（<300），分别计算"加购金额 → 爆发期实际支付金额"的转化率。\\n历史规律识别：高客单层转化率稳定在 35%-38%（用户决策周期长但意愿明确）；中客单层 22%-26%；低客单层 10%-13%（多为冲动加购，会被替换或忘记）。整体转化率受三档比例影响，三档比例稳定时整体转化率 24%-26%。\\n本年蓄水量诊断：截至 10/28，今年加购金额 4.8 亿，对比 2023 年同期 5.85 亿，同比 -18%。更关键的是层级结构：今年高客单占比 22%（去年同期 31%），中客单 41%（35%），低客单 37%（34%）。**结构向低客单倾斜**——可能是流量结构变化（拉新偏多但价值低）或选品下沉。\\n爆发期 GMV 预测：用今年三档加购金额 × 各档历史转化率。高客单 1.06 亿 × 36% = 3820 万；中客单 1.97 亿 × 24% = 4730 万；低客单 1.78 亿 × 12% = 2140 万。合计预测爆发期 GMV 1.07 亿（目标 1.2 亿，缺口 13%）。再叠加结构性折扣（结构差时整体转化率会比加权平均还低 5%-8%），保守预测 9800 万，缺口约 17%。\\n敏感度分析：要让 GMV 达标，最有效的杠杆是补充高客单蓄水（每补 1 亿高客单加购可贡献 GMV 3600 万）。继续在大众品类拉低客单加购对达标贡献极小（边际产出 1200 万/亿）。',
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
        action: '10/30 起投放预算追加 150 万，定向高客单偏好用户（基于过去 12 个月单笔订单 > 500 元的用户画像），素材聚焦套装/高端品类。',
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
    reflection: '复用边界：本方法适用于"大促有清晰的蓄水 + 爆发模式、有 2 年以上历史数据、加购到购买的转化逻辑稳定"的电商场景。不适用于：(1) 平铺式销售（无明显大促节点）；(2) 服务类业务（无加购环节）；(3) 大促玩法每年大改的业务（历史转化率不可参考）。\\n失败教训：第一版预测没分层，直接用历史整体转化率 25%，结果偏差很大。后期复盘发现，**结构变化是大多数预测失准的根源**，永远要先看分布再算总数。\\n下一步进阶：(1) 用机器学习模型（XGBoost）预测每个加购订单的转化概率，比分层平均更精细；(2) 建立"蓄水质量评分"指标（综合加购金额、用户历史 LTV、品类毛利率等），让蓄水期投放从"加购数最大化"切换到"加购质量最大化"。'
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
    background: '某美妆电商每月新品上架 200-300 SKU，传统流程是"上线 30 天看总销量决定去留"，但 30 天后已错过黄金推广期。商品团队的痛点：(1) 上线初期不敢判断潜力，怕错杀好品；(2) 早期销量好的不一定是真好（可能只是初期流量倾斜的虚高）；(3) 没有量化标准，全靠资深 buyer 经验。\\n数据团队需要建立一套"D14 早期信号识别"模型，用上线 14 天数据预测 D90 GMV，给商品团队提供决策依据。',
    fields: [
      { name: 'sku_id', type: 'string', description: 'SKU 唯一标识', example: 'SKU_BM_2024_NEW_055' },
      { name: 'launch_date', type: 'date', description: '新品上线日期', example: '2024-09-01' },
      { name: 'days_since_launch', type: 'int', description: '距离上线天数', example: '14' },
      { name: 'daily_uv', type: 'int', description: '当日商品详情页 UV', example: '8240' },
      { name: 'daily_sales_qty', type: 'int', description: '当日销售数量', example: '142' }
    ],
    sqlSketch: '-- 计算每个新品的 D1-D14 累计销量，并对齐到同类品的历史百分位\\nWITH new_sku AS (\\n  SELECT sku_id, category, days_since_launch, SUM(daily_sales_qty) OVER (\\n    PARTITION BY sku_id ORDER BY days_since_launch\\n  ) AS cumulative_sales\\n  FROM sku_daily\\n  WHERE launch_date BETWEEN \\'2024-09-01\\' AND \\'2024-09-30\\'\\n    AND days_since_launch <= 14\\n),\\nbenchmark AS (\\n  SELECT category, days_since_launch,\\n         PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY cumulative_sales) AS p25,\\n         PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY cumulative_sales) AS p50,\\n         PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY cumulative_sales) AS p75,\\n         PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY cumulative_sales) AS p90\\n  FROM sku_daily_history  -- 过去 24 个月同类品历史\\n  WHERE days_since_launch <= 14\\n  GROUP BY 1, 2\\n)\\nSELECT n.sku_id, n.cumulative_sales,\\n       b.p25, b.p50, b.p75, b.p90,\\n       CASE\\n         WHEN n.cumulative_sales >= b.p75 THEN \\'高潜\\'\\n         WHEN n.cumulative_sales >= b.p50 THEN \\'达标\\'\\n         WHEN n.cumulative_sales >= b.p25 THEN \\'观察\\'\\n         ELSE \\'低潜\\'\\n       END AS signal\\nFROM new_sku n\\nJOIN benchmark b ON n.category = b.category AND n.days_since_launch = b.days_since_launch\\nWHERE n.days_since_launch = 14;',
    analysisProcess: '历史数据沉淀：取过去 24 个月同类目（一级类目）成功上线的所有新品（约 4200 个 SKU），按品类分组，提取每个新品 D1-D90 的日级销量。剔除异常事件（大促期间上新、流量倾斜测试等），剩余 3185 个 SKU 作为基准库。\\n爬坡曲线建模：每个品类拟合 D1 到 D90 的累计销量百分位曲线（P25/P50/P75/P90），形成该品类的"爬坡基准带"。同时按 D90 GMV 表现把历史新品分成"明星品（Top 10%）/优秀品（10-30%）/合格品（30-70%）/普通品（70-90%）/失败品（10%）"。\\nD14 预测信号验证：用历史数据回测——D14 累计销量在同品类 P75 以上的新品，最终 D90 进入 Top 30% 的概率 71%；P50-P75 的概率 38%；P25-P50 的概率 18%；P25 以下的概率仅 6%。说明 D14 信号有较强预测力。\\n"明星错觉"识别：进一步看 D7 与 D14 的对比。前 7 天爆发但 D8-D14 增速急剧下滑（D14 累计 / D7 累计 < 1.5）的新品中，有 71% 最终落入"普通品"或"失败品"。这类品多为"标题党+视觉冲击"导致的初期点击虚高，复购信号弱。需要在 D14 对这类"假爆款"亮黄灯。\\n落地与运营机制：D14 当天自动跑分类，每个新品标记 4 种信号（高潜/达标/观察/低潜）+ 是否假爆款标记。商品团队按信号分配资源——高潜大力推、达标常规推、观察待复审、低潜清退或转长尾仓。',
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
    reflection: '复用边界：爬坡曲线对标方法适用于"新品上线频繁、有大量同类品历史数据、品类生命周期相对稳定"的成熟电商。不适用于：(1) 全新品类（无历史可对标）；(2) 极低频高客单业务（数据点不够）；(3) 政策/季节剧烈影响的品类（如保健品、应季服装，需要先做季节调整）。\\n失败教训：第一版直接用一级类目做基线，发现彩妆和护肤的爬坡形态差异极大，导致护肤新品被系统性低估（前期慢）。后续每个二级类目分别建模才解决。基线粒度比模型本身更影响准确率。\\n下一步进阶：(1) 引入贝叶斯更新方法，每天根据新数据动态更新预测，比固定 D14 决策更灵活；(2) 加入用户复购信号（D14 内已有复购的用户比例），单独的销量信号可能被运营拉新行为污染，复购是更稳定的"真实需求"指标。'
  }
];`

let content = fs.readFileSync('src/data/cases.ts', 'utf8');

const exportIndex = content.indexOf('export const caseStudies: CaseStudy[] = [');
if (exportIndex === -1) {
  console.error('Cannot find export const caseStudies');
  process.exit(1);
}

content = content.substring(0, exportIndex) + newCaseStudies;
fs.writeFileSync('src/data/cases.ts', content);
console.log('Successfully updated src/data/cases.ts');
