import { Dataset } from './datasets';

export const datasetsPart2: Dataset[] = [
  {
    id: 'd_part2_01',
    name: '销售分析：区域门店销售业绩对标监控',
    category: '销售分析',
    scenarioDescription: '【业务背景】某大型全国连锁新零售品牌，拥有数百家线下直营门店，并依托门店所在网格开展即时配送到家业务。近期发现东大区整体销售额出现异常停滞。\n\n【分析目标】通过调取全国不同大区及门店铺设的精细化销售数据，重点练习区域对标分析能力，找出导致东区瓶颈的具体省份、城市甚至极速达业务环节盲区。\n\n【预期产出】能够基于门店生命周期（老店/新店）将自然增长剥离，计算出同店同比销售增长率（SSSG），准确产出一份针对衰退战区的战备级定位诊断指标报告单。\n\n【难度说明】适合具备中级分析能力、能够熟练使用多维度钻取与门店业务统一尺度分析的人员。',
    fields: [
      { name: 'region_name', type: '文本', description: '门店所属地理一级编制区域，常用于拉齐大盘做最高层的对比管理', example: '华东大区', analysisValue: '用于高管视角的大区宏观对标与整体业绩归因判断' },
      { name: 'store_id', type: '文本', description: '后台门店唯一性系统编码，精准定位到实地具体位置和负责具体店长', example: 'S-701A9', analysisValue: '下钻到极细精细程度的门店业绩诊断及个体考核分析' },
      { name: 'open_date', type: '日期', description: '该门店首次对外开门营业并产生首笔真实流水的系统初始化记录', example: '2021-05-18', analysisValue: '核心用于界定新老店属性并计算同店同比销售额的基础' },
      { name: 'offline_gmv', type: '数值', description: '纯线下到店客人通过扫码或收银设备付款所产生的真实含税交易额', example: '42500.50', analysisValue: '衡量单纯线下地段流量情况及到店引流体验健康状态' },
      { name: 'o2o_gmv', type: '数值', description: '依托该门店物理仓发货的外卖平台或自有APP即时达产生的交易总额', example: '18300.00', analysisValue: '测算全渠道扩张能力以及门店对外卖圈周边渗透运力' },
      { name: 'area_sqm', type: '数值', description: '该门店实际租赁及用作展销营运的实用物理建筑有效平方面积', example: '150', analysisValue: '通过计算坪效(GMV/平米)来评估单店硬性空间利用率水平' }
    ],
    sampleData: [
      { region_name: '华东大区', store_id: 'S-701A9', open_date: '2021-05-18', offline_gmv: 42500.50, o2o_gmv: 18300.00, area_sqm: 150 },
      { region_name: '华东大区', store_id: 'S-701A2', open_date: '2022-11-04', offline_gmv: 31000.00, o2o_gmv: 29500.00, area_sqm: 120 },
      { region_name: '华北大区', store_id: 'S-109B1', open_date: '2019-02-14', offline_gmv: 82000.00, o2o_gmv: 12400.00, area_sqm: 300 },
      { region_name: '华北大区', store_id: 'S-109B5', open_date: '2023-01-10', offline_gmv: 15800.00, o2o_gmv: 42000.00, area_sqm: 80 },
      { region_name: '华南大区', store_id: 'S-504C3', open_date: '2020-08-22', offline_gmv: 56000.00, o2o_gmv: 38000.00, area_sqm: 200 },
      { region_name: '华南大区', store_id: 'S-504C8', open_date: '2021-12-01', offline_gmv: 48900.00, o2o_gmv: 36000.00, area_sqm: 220 },
      { region_name: '西南大区', store_id: 'S-802D1', open_date: '2022-03-15', offline_gmv: 39000.00, o2o_gmv: 22000.00, area_sqm: 180 },
      { region_name: '西南大区', store_id: 'S-802D2', open_date: '2018-06-18', offline_gmv: 61000.00, o2o_gmv: 15000.00, area_sqm: 250 },
      { region_name: '华中大区', store_id: 'S-301E4', open_date: '2021-09-09', offline_gmv: 44000.00, o2o_gmv: 21000.00, area_sqm: 160 },
      { region_name: '华中大区', store_id: 'S-301E7', open_date: '2023-05-20', offline_gmv: 12000.00, o2o_gmv: 31000.00, area_sqm: 90 }
    ],
    recommendedMethods: [
      { method: '同店同比分析(SSSG)', goal: '剥离新开店激增效应，横行评估经营一网年以上成熟老店的真实续航', expectedFinding: '华东区大盘没掉但老门店坪效狂降，新开小店外卖流水冲高掩盖了老店衰退危险' },
      { method: '门店坪效与人效核算', goal: '将绝对的销售额转化成单位物理面积的出账比，评估空间的绝对利用率指标', expectedFinding: '数百平米老店空间冗余度高而O2O，小面积新店却因O2O模式坪效达到老店3倍' },
      { method: 'O2O渠道占比结构排查', goal: '拆解全渠道结构下门店对于外卖业务依赖度与抗风险协同平衡能力的测试', expectedFinding: '发现极度依赖O2O业务的店铺常因运力恶化致使整月大盘坍塌而毫无自救能力之弊病' }
    ],
    relatedCase: '新老店坪效替换案例分析',
    relatedMethodology: '线下零售人场货拆解体系'
  },
  {
    id: 'd_part2_02',
    name: '用户分析：极简App核心功能活跃与留存记录',
    category: '用户分析',
    scenarioDescription: '【业务背景】一款主打工具型转社区的效率App，累计用户千万级别。近期通过各种渠道买量拉取大量新注册，但产品大盘日活始终在低位徘徊未见爆发。\n\n【分析目标】追踪近一个月内用户对不同核心模块的访问日志与时长，练习计算多周期同群留存表，找出让用户持续留下的核心锚点（Aha Moment）。\n\n【预期产出】找到新老用户在不同功能间游走的流转断层点，描绘出能够带来强粘性甚至自发传播的高价值用户使用路径，出具功能改版决策指导。\n\n【难度说明】适合中高级分析师，要求熟练掌握SQL的组群函数分析与极坐标漏斗搭建框架模型。',
    fields: [
      { name: 'user_id', type: '文本', description: '全局唯一识别某位实名注册用户的系统核心哈希字符串，串联生命周期的线索', example: 'U8829K-M2', analysisValue: '用于精确去重活跃规模并回溯用户自注册那天起的所有长线完整使用轨迹' },
      { name: 'reg_date', type: '日期', description: '用户手机获取初次验证码并填完资料落库的初始记录天', example: '2023-10-01', analysisValue: '进行Cohort留存组块划分的根本锚点指标，区分不同买量周期的特征' },
      { name: 'login_date', type: '日期', description: '该用户确实产生有效前台应用开启调用的交互发生的具体登录日期时间', example: '2023-10-05', analysisValue: '配合注册点计算其次日、三日、七日以及更长期活跃跳动回归曲线走势的落子' },
      { name: 'used_feature', type: '文本', description: '用户当天重点停留超过十秒钟或者产生深入有效交互操作的具体大功能名', example: '社区发帖', analysisValue: '定位究竟是工具吸引了他们还是内容功能成为了真正的吸盘驻留之地' },
      { name: 'stay_duration_sec', type: '数值', description: '用户当天在上述核心功能所持续消耗积累的实际前端界面的总时长秒数累加', example: '320', analysisValue: '排除闪退或机器刷量带来的虚假活跃从而精准判断业务内容的绝对高吸引度' },
      { name: 'is_premium', type: '布尔', description: '截至该日结算快照时间点，该用户是否通过付费升级成订阅型会员的身份旗', example: 'false', analysisValue: '切割高净值付费变现人群与纯免费白嫖盘的留存差异及行为走向的不同分歧' }
    ],
    sampleData: [
      { user_id: 'U8829K-M2', reg_date: '2023-10-01', login_date: '2023-10-01', used_feature: '日程创建', stay_duration_sec: 120, is_premium: 'false' },
      { user_id: 'U8829K-M2', reg_date: '2023-10-01', login_date: '2023-10-03', used_feature: '日程创建', stay_duration_sec: 45, is_premium: 'false' },
      { user_id: 'U7731J-X1', reg_date: '2023-10-01', login_date: '2023-10-01', used_feature: '社区浏览', stay_duration_sec: 850, is_premium: 'false' },
      { user_id: 'U7731J-X1', reg_date: '2023-10-01', login_date: '2023-10-02', used_feature: '社区发帖', stay_duration_sec: 1200, is_premium: 'true' },
      { user_id: 'U7731J-X1', reg_date: '2023-10-01', login_date: '2023-10-05', used_feature: '社区发帖', stay_duration_sec: 430, is_premium: 'true' },
      { user_id: 'U1104P-Z9', reg_date: '2023-10-02', login_date: '2023-10-02', used_feature: '模板库下载', stay_duration_sec: 60, is_premium: 'false' },
      { user_id: 'U5592W-Q4', reg_date: '2023-10-02', login_date: '2023-10-02', used_feature: '日程创建', stay_duration_sec: 15, is_premium: 'false' },
      { user_id: 'U5592W-Q4', reg_date: '2023-10-02', login_date: '2023-10-09', used_feature: '日程创建', stay_duration_sec: 300, is_premium: 'true' },
      { user_id: 'U9922R-A3', reg_date: '2023-10-03', login_date: '2023-10-03', used_feature: '社区浏览', stay_duration_sec: 1500, is_premium: 'true' },
      { user_id: 'U9922R-A3', reg_date: '2023-10-03', login_date: '2023-10-04', used_feature: '社区浏览', stay_duration_sec: 1800, is_premium: 'true' }
    ],
    recommendedMethods: [
      { method: 'Cohort同群留存阵列法', goal: '基于共同的开始日期圈定精准的新增群体，看随时间推移下他们按组衰退率', expectedFinding: '首日体验工具功能而走的人次日崩盘式衰退，而首日触发点进社区板块的人一周留存居高不下稳若泰山' },
      { method: '魔法数字Aha聚类寻找', goal: '定位产生黏性的动作阈值点，看活跃行为频次达到几次后引发质变长期常驻', expectedFinding: '前三天内如果发帖量达到2篇的用户，他们的三个月长线留存惊人地锁死在了80%极高质量刻度' },
      { method: '时段驻留核查切割', goal: '深度排查高时长消耗带来的业务有效转化的必然性关系验证', expectedFinding: '刷社区越长转化率激增非常明显直接带来收益，而一直用工具模块的因为免费完全无刺激消费之真正的问题' }
    ],
    relatedCase: '用户黏性与留存拐点寻找分析',
    relatedMethodology: '用户生命周期极防火墙壁垒AARRR框架'
  },
  {
    id: 'd_part2_03',
    name: '用户分析：基于RFM的高净值消费生命线',
    category: '用户分析',
    scenarioDescription: '【业务背景】一家精品综合母婴电商商城积累了十万级核心注册盘，近来面临严重的老客流失，只靠大尺度发券强拉新人度日，营销利润已经触到底部红线警告区。\n\n【分析目标】引入经典的RFM等高配建模概念，挖掘历史长线交易表中哪些是核心贵客、哪些是即将休眠的长线游离客，练习极度细化的价值分群并制定挽救大盘红头文件。\n\n【预期产出】将冰冷的订单流水直接计算转换成每个ID的标签定级，并对占销售贡献八成的前排重要挽回层输出极度定向的活动召回测算与权益重振方案表。\n\n【难度说明】高难度体系练习，需要在极乱的海量无关联交易内跑复杂计算窗口并强行人工拟合业务切分标度点。',
    fields: [
      { name: 'user_id', type: '文本', description: '全局唯一客户识别数字符串，穿透用户长短期甚至跨年账本的唯一追踪索引', example: 'V-882239', analysisValue: '将零散发生数万次的各张碎单聚合打包归一计算到底归属于哪一位核心实名持卡者的基座' },
      { name: 'last_order_date', type: '日期', description: '该用户在全平台最终一次成功发生真实含税交易的绝对完成历史倒数时标记', example: '2023-09-12', analysisValue: '用于反推R（Recency）数值从而敏锐的监测这个人是否已经处于将要流失边缘红线之秋的要点' },
      { name: 'total_orders_1yr', type: '数值', description: '在最近严格对标的一整年移动自然窗口内，该用户累计下单成局的总计次', example: '18', analysisValue: '核实其作为F（Frequency）绝对高频刚需用户特性的基坐标，并用来筛选区分薅一波就走的绝对流离死客群体' },
      { name: 'total_amount_1yr', type: '数值', description: '该人在一整年贡献真金白银刨除了各种极高补贴底价后打入公司总账户的干现金', example: '8400.50', analysisValue: '推算M（Monetary）的极端重要利润压舱石，用来定级到底是高额消费巨鳄层还是多频低额拼夕夕捡漏下沉散户群' },
      { name: 'avg_discount_rate', type: '数值', description: '全网该人平均享受的折让比例汇总折中评估其薅毛本性与价格绝对极敏感雷达度', example: '38.5', analysisValue: '测算未来召回激活该重症级用户时，究竟发多少面额的高抵金券才能重新刺激他敏感底线的强测算力防线' },
      { name: 'primary_category', type: '文本', description: '该人买的最密集占大头买走的大核核心类目，反映其在这个品牌下的强定位', example: '2段奶粉', analysisValue: '根据特定品类生命周期（奶粉喝三年）判断他未复单是流向对标竞争品还是本身随着年龄退出了整个圈层市场' }
    ],
    sampleData: [
      { user_id: 'V-882239', last_order_date: '2023-09-12', total_orders_1yr: 18, total_amount_1yr: 8400.50, avg_discount_rate: 15.0, primary_category: '2段奶粉' },
      { user_id: 'V-100244', last_order_date: '2022-11-05', total_orders_1yr: 2, total_amount_1yr: 150.00, avg_discount_rate: 65.5, primary_category: '湿巾纸' },
      { user_id: 'V-33924A', last_order_date: '2023-10-20', total_orders_1yr: 35, total_amount_1yr: 15800.00, avg_discount_rate: 5.5, primary_category: '安全座椅' },
      { user_id: 'V-5541L3', last_order_date: '2023-01-14', total_orders_1yr: 5, total_amount_1yr: 2300.00, avg_discount_rate: 22.0, primary_category: '3段奶粉' },
      { user_id: 'V-9993E1', last_order_date: '2023-08-01', total_orders_1yr: 12, total_amount_1yr: 5200.00, avg_discount_rate: 18.0, primary_category: '婴儿辅食' },
      { user_id: 'V-7711Q8', last_order_date: '2023-07-25', total_orders_1yr: 4, total_amount_1yr: 450.00, avg_discount_rate: 55.0, primary_category: '洗护用品' },
      { user_id: 'V-2200X4', last_order_date: '2023-10-23', total_orders_1yr: 22, total_amount_1yr: 9100.00, avg_discount_rate: 12.0, primary_category: '婴幼服装' },
      { user_id: 'V-4488H7', last_order_date: '2022-12-19', total_orders_1yr: 1, total_amount_1yr: 80.00, avg_discount_rate: 88.0, primary_category: '试用装奶粉' },
      { user_id: 'V-6655R9', last_order_date: '2023-05-11', total_orders_1yr: 6, total_amount_1yr: 3800.00, avg_discount_rate: 25.0, primary_category: '1段奶粉' },
      { user_id: 'V-8811F2', last_order_date: '2023-10-21', total_orders_1yr: 2, total_amount_1yr: 290.00, avg_discount_rate: 45.0, primary_category: '尿裤纸品' }
    ],
    recommendedMethods: [
      { method: 'RFM加权分层聚类', goal: '把杂乱指标转化为重要价值人群（高价值、将流失重要、一般保持客等八类大层）', expectedFinding: '15%的客户群贡献了75%纯利润但均出现了最近九十天未交互的频发休眠前兆须紧急救命回盘' },
      { method: '毛利与成本弹性折算', goal: '反推不同高分层的人究竟值得多贵的短信电话极深打扰或者空投多少价值免减', expectedFinding: '针对重金高客单即使不发券单打电话致歉都有奇效，羊毛薅子反扔券也不转只等极破防破价' },
      { method: '品类退出生命特征查实', goal: '与年龄段品类结合确认他们是否自然衰老还是非正规异常转移被对手残酷截胡', expectedFinding: '大批停买辅食的客户并不是孩子长大而是全跑到竞对社群买大促套包被强力硬生洗脑卷断了' }
    ],
    relatedCase: '用户分层与高频召回精准策略设计',
    relatedMethodology: '用户价值深度重磅RFM高能雷达模型'
  },
  {
    id: 'd_part2_04',
    name: '流量分析：全渠道拉新追踪与真实获客成本透视',
    category: '流量分析',
    scenarioDescription: '【业务背景】某在线职业成人教育平台在短视频、微信大号、搜索引擎砸下每月千万级别广告。但财务核对后发现总体营销处于血亏地步，虚假繁荣明显。\n\n【分析目标】清洗从外部各端引流而来的全触点日志带量记录，精准追击各个媒介带客到底留存怎样、有没有完成终极的高阶数万大单报课指标。\n\n【预期产出】将前端曝光、表单留资、试听消耗最终算透到底合规获客单价（CAC），揭露出到底是哪个看似极度爆棚大流量其实是个吞金水军毒药洼地断层坑。\n\n【难度说明】中级进阶必修。要求强悍的全链路成本均摊意识防刷虚假分析对抗逻辑的建立推算把控能力。',
    fields: [
      { name: 'channel_name', type: '文本', description: '带引外部流量跨度过来的广告主阵地底层宏大一级归属源追踪包标记名号', example: '抖音头条系', analysisValue: '区分各个完全大阵营平台不同的调性特征和极端底线做法应对策略宏观方向盘调优' },
      { name: 'campaign_id', type: '文本', description: '细化到底部的具体广告落地页或视频切片素材的具体唯一追踪计划极精准标识', example: 'C-Vid-0092', analysisValue: '对比是美女跳舞类视频买来的留资好还是严肃上课型教授名师素材带来的客盘质量极度厚实' },
      { name: 'daily_spend', type: '数值', description: '当天在上面投放所消耗划拨真金白银财务实打实的硬流水烧掉的花费流耗数值', example: '58000.00', analysisValue: '将曝光留资全部均摊回根骨用来死死测算出每个实名表单甚至有效转化单到底花费多少核心肉底' },
      { name: 'impressions', type: '数值', description: '该计划或者视频在站外总共铺出被无差别全盘滑到的次数总汇大盘虚量', example: '1205000', analysisValue: '和点击产生CTR用以鉴定平台到底给没给高精人群匹配还只是用烂泛乱底垃圾烂池水军乱充' },
      { name: 'leads_count', type: '数值', description: '确实留下精准可联手机号码或添加企业微的且真身有效实盘咨询表单数', example: '420', analysisValue: '直接反映前端泛水后有多少高意愿意向客进盘，算出留资成本管控前端质量漏斗口' },
      { name: 'paid_enrollment', type: '数值', description: '经过电话回访极度清洗试听最后真的买下数万元正课且不退费的极真大铁真成交单', example: '8', analysisValue: '最血腥底端唯一认证的大胜漏斗结局防弹层，彻底戳穿大留资假人完全不结课的惊世大假局' }
    ],
    sampleData: [
      { channel_name: '抖音头条系', campaign_id: 'C-Vid-0092', daily_spend: 58000.00, impressions: 1205000, leads_count: 420, paid_enrollment: 8 },
      { channel_name: '抖音头条系', campaign_id: 'C-Vid-0010', daily_spend: 25000.00, impressions: 850000, leads_count: 650, paid_enrollment: 2 },
      { channel_name: '微信朋友圈', campaign_id: 'C-Pic-0081', daily_spend: 38000.00, impressions: 450000, leads_count: 120, paid_enrollment: 15 },
      { channel_name: '百度搜索系', campaign_id: 'C-Kw-0105', daily_spend: 15000.00, impressions: 50000, leads_count: 85, paid_enrollment: 22 },
      { channel_name: '小红书种草', campaign_id: 'C-Note-11', daily_spend: 12000.00, impressions: 320000, leads_count: 210, paid_enrollment: 9 },
      { channel_name: '知乎问答贴', campaign_id: 'C-Ans-991', daily_spend: 8500.00, impressions: 125000, leads_count: 45, paid_enrollment: 12 },
      { channel_name: '抖音头条系', campaign_id: 'C-Vid-0095', daily_spend: 42000.00, impressions: 950000, leads_count: 380, paid_enrollment: 5 },
      { channel_name: '微信公众号', campaign_id: 'C-Art-702', daily_spend: 20000.00, impressions: 180000, leads_count: 75, paid_enrollment: 10 },
      { channel_name: '百度搜索系', campaign_id: 'C-Kw-0118', daily_spend: 22000.00, impressions: 65000, leads_count: 110, paid_enrollment: 28 },
      { channel_name: '小红书种草', campaign_id: 'C-Note-25', daily_spend: 18000.00, impressions: 410000, leads_count: 320, paid_enrollment: 6 }
    ],
    recommendedMethods: [
      { method: 'ROI与深度漏斗成本均线拆解法', goal: '不看留资而死磕最后获客结单成本极线将其排雷扒皮清仓核算真投入和极度净出水比对', expectedFinding: '短视频表单好收但假客不付费获客单价畸高至大几千，搜索虽点击奇少且贵但成交奇稳利润爆炸极高' },
      { method: '虚假防刷流量质量交叉极甄别人群验证', goal: '对比点击率高然留资后结单比例无限趋零的极端大背刺异常作假恶反黑产现象', expectedFinding: '某大美女素材带来日均千条表单但全数电话空号加不上严重揭露素材跑偏水军纯恶代投做假假象' },
      { method: '多媒介预算矩阵强调整极调重塑', goal: '基于后端硬铁成单转化切停全前线吃干饭低效渠道猛将火力倾泻增投猛压优质黑马', expectedFinding: '建议彻底砍削某华丽百万级表面大号全部投钱死压知乎百度这种带着明确真正的问题求生上游绝好线口' }
    ],
    relatedCase: '大推广渠道虚耗归因排查防坑指南',
    relatedMethodology: '全面归因LTV成本极致回收追踪核弹级漏斗'
  },
  {
    id: 'd_part2_05',
    name: '转化分析：大促逆反局购物车疯狂加购结算阻断深剖',
    category: '转化分析',
    scenarioDescription: '【业务背景】某高客单重度女装电商品牌双十一期间罕见的推出反常门槛：满600减100。结果当天看数据发生非常诡异之事：全盘加购暴涨平时数倍甚至数天车全塞满壮观但一进出大收银台全部血洗崩塌弃大局流散。\n\n【分析目标】通过密集精准的购物车停留单价格分布和合并同群车单量组合日志抓捕剖析并查截这个超级极断跳水大逃亡到底源于哪里死心口。\n\n【预期产出】用精辟组合商品车总单图切大还原场景并给出为什么客户满而不付反而暴走抛车深邃真正的问题及后续秒极修补断水防策。\n\n【难度说明】高难度行为心理解剖。跳出纯干数据冷漠看流而是带着极强的人性反思代入业务痛极和满减数强关联对抗逻辑。',
    fields: [
      { name: 'session_id', type: '文本', description: '一次连续发生逛与加与结的极度连续超短连接全周期对话标记防抖标', example: 'S-772910-B', analysisValue: '防止跨天乱扯单纯定出一次疯狂冲动极度密集买扫加购物车狂乱轨迹行为锁' },
      { name: 'user_level', type: '文本', description: '表明深定该号在这个平台以往买服饰的分层消费底线会员标旗', example: 'V3-复购主力', analysisValue: '看究竟是新人瞎图热闹随便装车还是连这种年付几千的老绝客全盘都被惹怒一起砸车' },
      { name: 'items_in_cart', type: '数值', description: '这次极短行为终极收局后该车内硬堆被点进加购确实件数全盘码', example: '5', analysisValue: '判定他是明确有目标买那一两件还是被这奇葩门槛逼停全盘瞎塞垃圾随便应考强凑套合的现象线' },
      { name: 'cart_total_value', type: '数值', description: '这些塞入所有衣服未经任何极算减打后的平台极最裸原始堆单钱额标', example: '540.00', analysisValue: '绝杀定音核心用它画柱大分布图到底卡被卡在何诡异不上不下让其抓狂门限极口点' },
      { name: 'step_checkout', type: '布尔', description: '是否明确按下发起了去结算跳转收银核对极重其神圣确认大跨跃动作', example: 'true', analysisValue: '区别他到底只是拿当展藏衣物柜随便收着还是真的极去凑并算计大算门门账单的防真分水岭' },
      { name: 'step_paid', type: '布尔', description: '绝真防跑最终掏真金完成最终极度大收官真正进仓交易单标旗的落锤', example: 'false', analysisValue: '看结算到支付崩的最毒环节和算上运费或发不觉满减大呼当撤漂防守定局' }
    ],
    sampleData: [
      { session_id: 'S-772910-B', user_level: 'V3-复购主力', items_in_cart: 5, cart_total_value: 540.00, step_checkout: 'true', step_paid: 'false' },
      { session_id: 'S-881023-A', user_level: 'V1-新客试水', items_in_cart: 2, cart_total_value: 290.00, step_checkout: 'false', step_paid: 'false' },
      { session_id: 'S-992211-C', user_level: 'V4-高净值老客', items_in_cart: 3, cart_total_value: 850.00, step_checkout: 'true', step_paid: 'true' },
      { session_id: 'S-110293-D', user_level: 'V2-一般保持', items_in_cart: 6, cart_total_value: 580.00, step_checkout: 'true', step_paid: 'false' },
      { session_id: 'S-440212-B', user_level: 'V1-新客试水', items_in_cart: 1, cart_total_value: 120.00, step_checkout: 'false', step_paid: 'false' },
      { session_id: 'S-550344-F', user_level: 'V3-复购主力', items_in_cart: 4, cart_total_value: 510.00, step_checkout: 'true', step_paid: 'false' },
      { session_id: 'S-660421-E', user_level: 'V2-一般保持', items_in_cart: 7, cart_total_value: 620.00, step_checkout: 'true', step_paid: 'true' },
      { session_id: 'S-220199-A', user_level: 'V4-高净值老客', items_in_cart: 4, cart_total_value: 590.00, step_checkout: 'true', step_paid: 'false' },
      { session_id: 'S-330188-B', user_level: 'V3-复购主力', items_in_cart: 2, cart_total_value: 650.00, step_checkout: 'true', step_paid: 'true' },
      { session_id: 'S-110177-C', user_level: 'V1-新客试水', items_in_cart: 5, cart_total_value: 550.00, step_checkout: 'true', step_paid: 'false' }
    ],
    recommendedMethods: [
      { method: '极核价格带分布直方图解密', goal: '精准拆分车内总件额聚集何可怕数段口', expectedFinding: '极惊呆发现百分七十人都被硬死堵逼在520-590元间发疯且再无几十元碎件顺带逼使全部因算差放弃大单极退撤流血流流' },
      { method: '漏斗转化大断口对极查', goal: '细拆比查加到点去付这小三五秒间距断去逃源', expectedFinding: '结算按键非常极多但一见实付根本没够只减失望心防受压撤车扔弃' },
      { method: '抢修门槛及凑件降维救亡挽折', goal: '基于极短车内被卡金额立即反投极小无门槛去接底强转库存血', expectedFinding: '建议极速改局发送百变无门槛神券即使只付五百也解让堵血倾散盘出巨单现金流水狂洗死单清空' }
    ],
    relatedCase: '凑满减大反噬灾变弃车门剖析',
    relatedMethodology: '用户折损心理行为漏斗拦截抢修阵'
  },
  {
    id: 'd_part2_06',
    name: '转化分析：自营App端支付提交到最终成功落回链路流转异常监测',
    category: '转化分析',
    scenarioDescription: '【业务背景】一款正在快速崛起的自营生鲜买菜App，业务看重极速链路极简无碍。但最近客诉及财务都警报说有很多明明确认提交了大堆支付跳转的客人最后没入账单生成。\n\n【分析目标】扒开从下决定付款跳向三方各不同（威信支某付云闪等）极各不同通道回链的黑洞盒断血隐死因。\n\n【预期产出】清算各个大支付大入口失败崩坍阻断率并指出具体是不是某种特定端系统跳漏其引发流血失巨局。\n\n【难度说明】初接中级能力要求。须分清楚自己系统掉跟三方掉两者不相连的逻辑且极熟各种通道流标错误查漏及分层端比度对。',
    fields: [
      { name: 'order_sn', type: '文本', description: '唯一确认发出去产生流水的商户本系统本系统抛出的真单标号条', example: 'OD-992110-XA', analysisValue: '全网极查比对一切其它三方平台流水极用来防掉挂单漏单基础去接核心大盘根' },
      { name: 'platform_os', type: '文本', description: '客户当时到底是用安卓最新系统还是旧果或者是小的大程序的极度客户端环', example: 'iOS_16', analysisValue: '非常重要极重要比由于某个特定小程序环或低版本被支付端切调拉不起黑极掉盘原因源' },
      { name: 'pay_channel', type: '文本', description: '最终跳转且客户选择的到底巨头的哪个绿软或蓝极支付大大通道口', example: 'WeChat_Pay', analysisValue: '切分大通道对比哪个大渠道近期有波动流或者接口大变巨崩跌' },
      { name: 'submit_time', type: '日期', description: '极精确捕捉客户去按那个极神圣发起冲锋发起的跳转去的其精准秒针极日时间点', example: '2023-11-11 14:02:15', analysisValue: '匹配服务器回血点测算大的极慢跳期等极流时看看是否被卡太久超期放弃不玩' },
      { name: 'callback_status', type: '文本', description: '支付大巨头给的本地库机器打返的极终确认到底大没拿大钱状态机代码', example: 'SUCCESS', analysisValue: '非常核心认定防飞单防极空刷或者半路死撤挂单最大核心判定定单大论据果' },
      { name: 'error_code', type: '文本', description: '如果上述没成抛出的巨头报错底反的其核心查故障巨码单错误源流', example: 'USER_CANCEL', analysisValue: '抓人看人没钱限额极度或放弃撤大撤单的主动极被动原因流极深刨溯底分查原因库' }
    ],
    sampleData: [
      { order_sn: 'OD-992110-XA', platform_os: 'iOS_16', pay_channel: 'WeChat_Pay', submit_time: '2023-11-11 14:02:15', callback_status: 'SUCCESS', error_code: 'NULL' },
      { order_sn: 'OD-881203-BB', platform_os: 'Android_13', pay_channel: 'AliPay', submit_time: '2023-11-11 14:05:22', callback_status: 'FAILED', error_code: 'BALANCE_NOT_ENOUGH' },
      { order_sn: 'OD-773411-CC', platform_os: 'WeChat_Mini', pay_channel: 'WeChat_Pay', submit_time: '2023-11-11 14:08:10', callback_status: 'SUCCESS', error_code: 'NULL' },
      { order_sn: 'OD-664531-DD', platform_os: 'iOS_15', pay_channel: 'UnionPay', submit_time: '2023-11-11 14:12:05', callback_status: 'FAILED', error_code: 'SYSTEM_TIMEOUT' },
      { order_sn: 'OD-556122-EE', platform_os: 'Android_12', pay_channel: 'WeChat_Pay', submit_time: '2023-11-11 14:15:30', callback_status: 'USER_CANCEL', error_code: 'USER_CANCEL' },
      { order_sn: 'OD-447819-FF', platform_os: 'AliPay_Mini', pay_channel: 'AliPay', submit_time: '2023-11-11 14:18:45', callback_status: 'SUCCESS', error_code: 'NULL' },
      { order_sn: 'OD-338901-GG', platform_os: 'iOS_16', pay_channel: 'WeChat_Pay', submit_time: '2023-11-11 14:21:12', callback_status: 'FAILED', error_code: 'BANK_REJECT' },
      { order_sn: 'OD-229014-HH', platform_os: 'Android_13', pay_channel: 'AliPay', submit_time: '2023-11-11 14:25:50', callback_status: 'SUCCESS', error_code: 'NULL' },
      { order_sn: 'OD-110293-II', platform_os: 'WeChat_Mini', pay_channel: 'WeChat_Pay', submit_time: '2023-11-11 14:30:05', callback_status: 'FAILED', error_code: 'SYSTEM_TIMEOUT' },
      { order_sn: 'OD-001284-JJ', platform_os: 'iOS_17', pay_channel: 'Apple_Pay', submit_time: '2023-11-11 14:35:20', callback_status: 'USER_CANCEL', error_code: 'USER_CANCEL' }
    ],
    recommendedMethods: [
      { method: '多端支付掉率多维大交叉对比', goal: '明确圈死不是通盘跌而是某一个大渠道极与平台发生极端极兼容不阻挂网坑', expectedFinding: '大跌出奇发现只有在安桌系统极小程序的某一版本拉不起大额微信崩血端' },
      { method: '错误回报大聚类分析占比盘查', goal: '分拣是客户自己极因没额度撤极还是我们的网挂没回跳死坑大漏', expectedFinding: '一半失败是超时跳不其拉不回且是系统升级断漏极接口而非不给大钱' },
      { method: '响应大盘长线大追踪回归线', goal: '基于极秒表分析客户从跳去到完回调在各不同网的用时不耐烦防退撤点查', expectedFinding: '某通道极需卡五极八秒回大幅引起客户极狂躁退按引致假极失败大巨崩丢单' }
    ],
    relatedCase: '其终局一厘米支付跳漏掉巨崩大防救案',
    relatedMethodology: '大收银台终极端漏斗补防救铁网框定'
  }
];
