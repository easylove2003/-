import { Dataset } from './datasets';

export const datasetsPart3: Dataset[] = [
  {
    id: 'd_part3_01',
    name: '会员分析：全阶梯会员特权与等阶滑落监控',
    category: '会员分析',
    scenarioDescription: '【业务背景】某大型泛娱乐连锁集团（含影院、乐园、餐饮）推行了黑金/铂金/黄金等付费会员。近期财务报表显示黑金高阶会员规模增长停滞，且有大量高阶跌落至低阶的保级失败案例。\n\n【分析目标】全面监控每一层级会员的权益使用率和升级保级阈值跳动情况，找出高阶会员到底是在哪个周期内丧失了积分积攒的动力。\n\n【预期产出】锁定哪些特权被视若废纸完全未起作用，哪些权益被下沉用户薅秃，并重新标定下一季度的各级保级升段数值红线门槛表。\n\n【难度说明】中级难度。需将横跨多条业务线的积分积累和跨年的流失滑落状态做联立化处理。',
    fields: [
      { name: 'member_id', type: '文本', description: '全局唯一CRM会员的内网大卡号，是其尊贵权益在全集团游走通认的核心单牌', example: 'M-VIP-99120', analysisValue: '用于精准追踪他从买卡第一天起随岁月拉长的全生命历程中复杂的升降大拐点' },
      { name: 'current_tier', type: '文本', description: '截至跑数这一秒他真实的会员当前段位，直接决定进入哪些通道和打几折', example: '黑金V4', analysisValue: '静态切片大盘时看看到底多少人待在最富顶层多少人在破底端，画出整体的金字塔大盘' },
      { name: 'points_balance', type: '数值', description: '纯正剩在账户里没有花出去的历史数据沉淀死期积分存额', example: '18500', analysisValue: '计算高阶群是否是因为忘了花才觉得卡没用，或测算公司庞大的潜在负债雷暗点' },
      { name: 'exp_this_year', type: '数值', description: '为了保住现阶需要积攒的升级经验值（非当消费钱类似飞行点）', example: '45000', analysisValue: '和保级门槛差值对撞，看多少人差那么几百点就遗憾滑落怒退大出坑中' },
      { name: 'perks_used_cnt', type: '数值', description: '当年真正被调起去核销免费送停车或机场贵宾候机的核实次数', example: '12', analysisValue: '狠的测定特权到底有没有打动高位贵人圈层而不是写在纸上纯吹纸面的' },
      { name: 'tier_change_last12m', type: '文本', description: '最近这一大跨整年定性的段位变更最后铁实录结大定标', example: 'DOWN_V3', analysisValue: '直接抓取跑的高堕退降层者抓去打深度回访或者力拦截退退退' }
    ],
    sampleData: [
      { member_id: 'M-VIP-99120', current_tier: '黑金V4', points_balance: 18500, exp_this_year: 45000, perks_used_cnt: 12, tier_change_last12m: 'STAY' },
      { member_id: 'M-VIP-88133', current_tier: '黄金V2', points_balance: 1200, exp_this_year: 5000, perks_used_cnt: 0, tier_change_last12m: 'DOWN_V1' },
      { member_id: 'M-VIP-77441', current_tier: '铂金V3', points_balance: 8500, exp_this_year: 28000, perks_used_cnt: 5, tier_change_last12m: 'UP_V2' },
      { member_id: 'M-VIP-66112', current_tier: '钻石V5', points_balance: 42000, exp_this_year: 88000, perks_used_cnt: 35, tier_change_last12m: 'STAY' },
      { member_id: 'M-VIP-55099', current_tier: '黄金V2', points_balance: 350, exp_this_year: 3200, perks_used_cnt: 1, tier_change_last12m: 'DOWN_V1' },
      { member_id: 'M-VIP-44331', current_tier: '黑金V4', points_balance: 21000, exp_this_year: 39000, perks_used_cnt: 2, tier_change_last12m: 'DOWN_V3' },
      { member_id: 'M-VIP-33118', current_tier: '白银V1', points_balance: 50, exp_this_year: 800, perks_used_cnt: 0, tier_change_last12m: 'STAY' },
      { member_id: 'M-VIP-22904', current_tier: '钻石V5', points_balance: 31000, exp_this_year: 92000, perks_used_cnt: 42, tier_change_last12m: 'UP_V4' },
      { member_id: 'M-VIP-11005', current_tier: '铂金V3', points_balance: 6200, exp_this_year: 21000, perks_used_cnt: 8, tier_change_last12m: 'STAY' },
      { member_id: 'M-VIP-00214', current_tier: '黑金V4', points_balance: 15400, exp_this_year: 46000, perks_used_cnt: 15, tier_change_last12m: 'UP_V3' }
    ],
    recommendedMethods: [
      { method: '断层高危保级预警分析', goal: '基于离下一个大节点只差一点的人做强挽救大推流触达', expectedFinding: '发现量黑金在年底差一千分掉级被忽视导致开年大规模心死退掉卡' },
      { method: '权益核销大盘大象限矩阵', goal: '扫去测查特权感知度及公司给出去的实质其成本真烧率', expectedFinding: '黑金不爱用给的破停车大券反而偏深度看首大映礼特权位' },
      { method: '卡生命期LTV追溯核算', goal: '查算一旦掉级后这个用户是否彻底停止在其本集团消费流', expectedFinding: '一旦从铂金掉下黄金此人大盘月购额度直断百分之大八十彻底心死盘' }
    ],
    relatedCase: '其断层滑落大防卫拯救保卡行动',
    relatedMethodology: '特权矩阵真知感值心算模型'
  },
  {
    id: 'd_part3_02',
    name: '会员分析：全渠道双轨积分大发放大消耗流水帐',
    category: '会员分析',
    scenarioDescription: '【业务背景】某大型百货商场量发放各种积分送，庞大的积分库成了个无底洞，既不知是谁在拿，且突然有一天出现数万恶意号涌入狂薅积分秒换实物。\n\n【分析目标】全面监控每一笔积分的收发微秒核流动日志，练就寻找积分泡沫与识别羊毛灰产黑手洞穿大眼。\n\n【预期产出】将冰冷复杂的异动帐表解出哪里的拉新发放规则被恶意找洞，封堵并精算剩余所有积的公允大负债折换现金值。\n【难度说明】高难度数据清洗查案考。面对流水帐须用高规则抓出不合理并发秒刷套连套现。',
    fields: [
      { name: 'tx_id', type: '文本', description: '数据库底底唯一流水的号条不容篡改系统实标号', example: 'P-TX-9910-AA', analysisValue: '去各种重合表核对防止有人利用断网卡卡双花多次大领核心点' },
      { name: 'member_id', type: '文本', description: '谁干这笔帐的本主体内源大标大签人', example: 'M-VIP-99120', analysisValue: '聚拢到底哪些人大堆扎在狂转换套其或老实人十年不花死存点' },
      { name: 'tx_type', type: '文本', description: '定底到底是往里进的送入出减去的消费核销大动因标记', example: 'EARN_GAME', analysisValue: '分清出账入大账查到底是哪个发放游戏的规则给的崩狂' },
      { name: 'points_val', type: '数值', description: '一笔其动作的实际数值是进了五百还是出了八千动标数值', example: '500', analysisValue: '算大盘总发放与大盘总耗用来对资产库其结账看财务坏账多' },
      { name: 'tx_time', type: '日期', description: '发生在端深更半夜还是正常白天时间源戳', example: '2023-10-15 03:12:00', analysisValue: '抓捕黑黑产大羊毛党全部在深夜用机器大刷空包异常源口' },
      { name: 'ref_source', type: '文本', description: '哪源端端导致这个单，比如是小程序签到还是买衣服送', example: 'MiniApp_SignIn', analysisValue: '精准拆大解出小程序里的签到游戏成其为了被机刷的破源流深发漏口' }
    ],
    sampleData: [
      { tx_id: 'P-TX-9910-AA', member_id: 'M-VIP-99120', tx_type: 'EARN_GAME', points_val: 500, tx_time: '2023-10-15 03:12:00', ref_source: 'MiniApp_SignIn' },
      { tx_id: 'P-TX-8821-BB', member_id: 'M-VIP-88133', tx_type: 'EARN_PURCHASE', points_val: 120, tx_time: '2023-10-15 14:30:00', ref_source: 'Offline_Store' },
      { tx_id: 'P-TX-7732-CC', member_id: 'M-VIP-77441', tx_type: 'BURN_GIFT', points_val: -800, tx_time: '2023-10-15 15:45:00', ref_source: 'Mall_Counter' },
      { tx_id: 'P-TX-6643-DD', member_id: 'M-VIP-66112', tx_type: 'EARN_GAME', points_val: 500, tx_time: '2023-10-15 03:12:05', ref_source: 'MiniApp_SignIn' },
      { tx_id: 'P-TX-5554-EE', member_id: 'M-VIP-55099', tx_type: 'BURN_PAY', points_val: -1500, tx_time: '2023-10-15 18:20:00', ref_source: 'Online_App' },
      { tx_id: 'P-TX-4465-FF', member_id: 'M-VIP-44331', tx_type: 'EARN_GAME', points_val: 500, tx_time: '2023-10-15 03:12:10', ref_source: 'MiniApp_SignIn' },
      { tx_id: 'P-TX-3376-GG', member_id: 'M-VIP-33118', tx_type: 'EARN_PURCHASE', points_val: 280, tx_time: '2023-10-15 11:05:00', ref_source: 'Online_App' },
      { tx_id: 'P-TX-2287-HH', member_id: 'M-VIP-22904', tx_type: 'BURN_GIFT', points_val: -5000, tx_time: '2023-10-15 16:50:00', ref_source: 'Mall_Counter' },
      { tx_id: 'P-TX-1198-II', member_id: 'M-VIP-11005', tx_type: 'EARN_GAME', points_val: 500, tx_time: '2023-10-15 03:12:15', ref_source: 'MiniApp_SignIn' },
      { tx_id: 'P-TX-0009-JJ', member_id: 'M-VIP-00214', tx_type: 'EARN_TWEET', points_val: 50, tx_time: '2023-10-15 09:30:00', ref_source: 'Social_Share' }
    ],
    recommendedMethods: [
      { method: '时间线毫秒重叠机刷大识别', goal: '基于端时间密集源查出是否有机器人号集群作防风假动作', expectedFinding: '惊人发现在凌晨十分内用小程序签到的发放量高出正常一千倍且全是新大空库底号' },
      { method: '出入账进出收支资金盘追源', goal: '核对总给送出去的跟最后换实物全走之间是否有其凭空大伪其造大假账端造', expectedFinding: '游戏端大由于算法没卡上线上限每发被黑产拿几百次其全空走' },
      { method: '积分折折当现负财务率算', goal: '按目前大比例给财务底上清退这堆账需要备多少真水库救大', expectedFinding: '即使把大羊查全封目前老客的大底沉数一旦出兑足够把当季利全其全刷空满' }
    ],
    relatedCase: '大积其分体系爆大被黑产狂羊毛漏洞补案',
    relatedMethodology: '基于密集大时源列大风防作漏截判'
  },
  {
    id: 'd_part3_03',
    name: '会员分析：LTV跨年拉长宏大生命期归其沉源',
    category: '会员分析',
    scenarioDescription: '【业务背景】高端昂贵的医大美及保健机构，获客单成本达大几千过万，老板必须看到这群大佬到底在大三年五年没赚够本。\n\n【分析目标】追踪三年长度内客户的所及其有回诊和新其开卡加项数，练习算真LTV看哪种首单引进来的其人后续源其深回大流血最多。\n\n【预期产出】将庞大的数大年流追溯拉其线，算出不其同获客拉来口的新人在大24大个月内的累积净利润其曲线交大交叉爆越过点。\n【难度说明】高难度数据处理。难在其要按其每其个人的注大册开始日作为零点重置向右排其月度对大齐表拉对。',
    fields: [
      { name: 'user_id', type: '文本', description: '全机构唯一真人其身份证其核验深绑内大码其防假追', example: 'M-VIP-99120', analysisValue: '用于跨年串联无论其换了多大的手机其换卡皆死其咬死本大尊其全追宗' },
      { name: 'first_visit_date', type: '日期', description: '第一天推这大机构大门的破局其实源点起始日首切标', example: '2021-05-18', analysisValue: '作为所有计算当月的基点月将全体群大及其重整以0月平大大齐发枪开跑线大定' },
      { name: 'acq_channel', type: '文本', description: '那及其第一天到底是被其哪大渠道大广告给拉大引进来的原流大宗底', example: '抖音头条系', analysisValue: '分群比到底其百度大投名医拉来的其及大客跟抖音大拉网红其拉谁的终身长长钱大厚' },
      { name: 'acquisition_cost', type: '数值', description: '当为了拉其他进门公司在其当其时付其给外渠大道的其实干花费流', example: '3500.00', analysisValue: '这是基平底大线去核算他后续到底要经过五月还是两年才其赚本平大填其补底' },
      { name: 'total_ltv_m12', type: '数值', description: '到他第12其个月结点其这长一整年加大总共给交其的所有毛利水', example: '18500.00', analysisValue: '阶段其考核核果这人一年后到底有没有赚若无说明后续根本拔不其动烂流盘' },
      { name: 'total_ltv_m24', type: '数值', description: '到其第24其两整年总结点大又加了多少大干实其水流利总大码', example: '45000.00', analysisValue: '看长流其曲线是越来越其陡暴狂赚还是其第二年直断水大就死其其断再无收归其期其落' }
    ],
    sampleData: [
      { user_id: 'M-VIP-99120', first_visit_date: '2021-05-18', acq_channel: '百度搜索系', acquisition_cost: 3500.00, total_ltv_m12: 18500.00, total_ltv_m24: 45000.00 },
      { user_id: 'M-VIP-88133', first_visit_date: '2021-06-05', acq_channel: '抖音头条系', acquisition_cost: 1200.00, total_ltv_m12: 5000.00, total_ltv_m24: 5500.00 },
      { user_id: 'M-VIP-77441', first_visit_date: '2021-08-22', acq_channel: '小红书种草', acquisition_cost: 2800.00, total_ltv_m12: 8500.00, total_ltv_m24: 28000.00 },
      { user_id: 'M-VIP-66112', first_visit_date: '2021-11-10', acq_channel: '百度搜索系', acquisition_cost: 4200.00, total_ltv_m12: 42000.00, total_ltv_m24: 88000.00 },
      { user_id: 'M-VIP-55099', first_visit_date: '2021-12-01', acq_channel: '线下大屏', acquisition_cost: 5000.00, total_ltv_m12: 3200.00, total_ltv_m24: 3200.00 },
      { user_id: 'M-VIP-44331', first_visit_date: '2022-01-15', acq_channel: '微信朋友圈', acquisition_cost: 2500.00, total_ltv_m12: 21000.00, total_ltv_m24: 39000.00 },
      { user_id: 'M-VIP-33118', first_visit_date: '2022-03-08', acq_channel: '抖音头条系', acquisition_cost: 1500.00, total_ltv_m12: 1800.00, total_ltv_m24: 2100.00 },
      { user_id: 'M-VIP-22904', first_visit_date: '2022-05-20', acq_channel: '百度搜索系', acquisition_cost: 3800.00, total_ltv_m12: 31000.00, total_ltv_m24: 92000.00 },
      { user_id: 'M-VIP-11005', first_visit_date: '2022-07-12', acq_channel: '小红书种草', acquisition_cost: 3000.00, total_ltv_m12: 16200.00, total_ltv_m24: 31000.00 },
      { user_id: 'M-VIP-00214', first_visit_date: '2022-09-01', acq_channel: '抖音头条系', acquisition_cost: 1800.00, total_ltv_m12: 15400.00, total_ltv_m24: 26000.00 }
    ],
    recommendedMethods: [
      { method: '同期群大长其生命线LTV预测模推定', goal: '基于其前一的线推后面的人多久能回血转正防断流', expectedFinding: '发及其百度其来的虽然初级费贵但一及年LTV及其长线全是其抖音十大倍其防源' },
      { method: '获客渠道长期ROI反算补大充', goal: '不看当天成交其而是将这两年收的全及其贴回当及其天算真大相', expectedFinding: '修正了抖音好的假象查其实它后面全是空不拔其复大复大购大血断' },
      { method: '生命衰退周期拐大警点', goal: '算其到几其第几个月其收曲开始变平没新增血其', expectedFinding: '在十八个月后所有人都断崖跌需要在这里设重磅老带新防退卡' }
    ],
    relatedCase: '大医其美机构跨两年全周期生命防线战',
    relatedMethodology: '用户价值深大高阶同期其群LTV算'
  },
  {
    id: 'd_part3_04',
    name: '竞品分析：智能监控全网竞对改价与隐藏券发量追踪',
    category: '竞品分析',
    scenarioDescription: '【业务背景】小家电大促市场。发现每次大促都会被竞品的隐藏满减券暗夜偷袭截流，导致我们白天主推的高潮波段完全哑火。\n\n【分析目标】通过爬虫全天候监控对标SKU的面价折价变动以及隐藏券的发放和核销预估，找出他们真实成交底价和放券时间规律。\n\n【预期产出】输出一张竞品真实的“面价-暗券-实付-时段销量”分布散点图，以及预测出他们下一个波段概率的底牌价位，以供我们立刻调价回击。\n\n【难度说明】高难度数据融合清洗。需要剥离大量的虚晃价格和非成交型凑单假象，精准定位其真实的成交价格暗线。',
    fields: [
      { name: 'crawl_time', type: '日期', description: '爬虫快照抓取的精准时间', example: '2023-11-10 18:00:00', analysisValue: '用于分析一天内的哪个时点是在发大额券偷人' },
      { name: 'sku_id', type: '文本', description: '高度对标我方主力机器的核心竞品ID', example: 'P-992110', analysisValue: '唯一主键跟踪价格链变动' },
      { name: 'page_price', type: '数值', description: '商品页面展示出来的正常满减后划线价', example: '1299.00', analysisValue: '用来做白天的表面防守线监控' },
      { name: 'hidden_coupon', type: '数值', description: '需在直播间或特定专属社群领取的隐蔽暗面优惠', example: '300.00', analysisValue: '这是竞品真实的防火墙壁垒杀手锏也是截流核心库' },
      { name: 'final_price', type: '数值', description: '算入所有复杂券和满减后最终打到支付页底部的限价格', example: '999.00', analysisValue: '我方运营必须立刻盯死且决定是否要对冲跟进的唯一对标底座' },
      { name: 'sales_velocity', type: '数值', description: '最近两小时内抓到的评价数或销量新增估算的流速值', example: '1500', analysisValue: '判断对方这个端价格手段是否有效以及我们受损有多惨重' }
    ],
    sampleData: [
      { crawl_time: '2023-11-10 08:00:00', sku_id: 'P-992110', page_price: 1299.00, hidden_coupon: 0.00, final_price: 1299.00, sales_velocity: 10 },
      { crawl_time: '2023-11-10 12:00:00', sku_id: 'P-992110', page_price: 1299.00, hidden_coupon: 100.00, final_price: 1199.00, sales_velocity: 50 },
      { crawl_time: '2023-11-10 18:00:00', sku_id: 'P-992110', page_price: 1299.00, hidden_coupon: 300.00, final_price: 999.00, sales_velocity: 1500 },
      { crawl_time: '2023-11-10 20:00:00', sku_id: 'P-992110', page_price: 1299.00, hidden_coupon: 300.00, final_price: 999.00, sales_velocity: 2800 },
      { crawl_time: '2023-11-11 00:00:00', sku_id: 'P-992110', page_price: 1099.00, hidden_coupon: 200.00, final_price: 899.00, sales_velocity: 5000 },
      { crawl_time: '2023-11-11 02:00:00', sku_id: 'P-992110', page_price: 1099.00, hidden_coupon: 200.00, final_price: 899.00, sales_velocity: 3500 },
      { crawl_time: '2023-11-11 08:00:00', sku_id: 'P-992110', page_price: 1299.00, hidden_coupon: 50.00, final_price: 1249.00, sales_velocity: 150 },
      { crawl_time: '2023-11-11 12:00:00', sku_id: 'P-992110', page_price: 1299.00, hidden_coupon: 50.00, final_price: 1249.00, sales_velocity: 80 },
      { crawl_time: '2023-11-11 18:00:00', sku_id: 'P-992110', page_price: 1299.00, hidden_coupon: 300.00, final_price: 999.00, sales_velocity: 1200 },
      { crawl_time: '2023-11-11 20:00:00', sku_id: 'P-992110', page_price: 1299.00, hidden_coupon: 300.00, final_price: 999.00, sales_velocity: 2100 }
    ],
    recommendedMethods: [
      { method: '竞对底牌价格与流量热度联立四象限分析', goal: '找出他降到什么点位流量就会井喷的阈值', expectedFinding: '惊人发现只要其跌破一千大关哪怕一块钱，流量也会百倍爆发' },
      { method: '隐藏暗券发放规律时序周期拆借', goal: '基于过去所有抓取值推算出他下一次放暗券是几号几点', expectedFinding: '高度规律性地集中在大促期间每晚的六点至六点半速放发' }
    ],
    relatedCase: '多品牌家电值暗价格防线保卫战',
    relatedMethodology: '竞品多维时空定价反猜动态推算模型'
  },
  {
    id: 'd_part3_05',
    name: '竞品分析：竞对舆情差评集中爆发点NLP智能归因聚类',
    category: '竞品分析',
    scenarioDescription: '【业务背景】在竞争激烈的洗地机全网大促中，我方亟待找到行业老大品牌的软肋核心。通过人工看几千条评论已经完全无法提炼真正的真正的问题。\n\n【分析目标】全面抓取并清洗竞品在各大电商平台的百万级全量评论，利用NLP（自然语言处理）技术提取负面评价词云，圈定打败老大的突破口。\n\n【预期产出】输出关于竞品产品设计、售后服务、品控死角的系统性劣势雷达图，指导本方研发团队在下一代新品开发上做出绝对区隔的“绝杀”卖点。\n\n【难度说明】高难度算法分析。不仅需要处理庞大的非结构化杂乱文本，还需精准剥离竞对自身花钱买的注水假好评。',
    fields: [
      { name: 'review_time', type: '日期', description: '该条评论由于实名真实买家发出的真实时戳', example: '2023-11-10 18:00:00', analysisValue: '用于监控是长期的品控问题，还是某一个特定出厂批次的突发性灾难事故' },
      { name: 'sentiment_score', type: '数值', description: '通过NLP情感分析给这段文本打出的性分数（-1至1好）', example: '-0.85', analysisValue: '过滤出那些虽然打了星但内容全在痛骂的阴阳怪气深度差评' },
      { name: 'topic_keyword', type: '文本', description: '算法从大段废话中提取的核心聚集点词汇', example: '电池续航', analysisValue: '把几万条不同的骂声最终归一到机器的几个硬件零部件上' },
      { name: 'is_verified_buy', type: '布尔', description: '是否为平台认证的真实下过单的实名可信评论', example: 'true', analysisValue: '剔除水军互黑干扰，只相信掏钱真实用过的买家血泪史反馈' }
    ],
    sampleData: [
      { review_time: '2023-11-10 08:00:00', sentiment_score: -0.85, topic_keyword: '电池续航', is_verified_buy: 'true' },
      { review_time: '2023-11-10 09:30:00', sentiment_score: -0.92, topic_keyword: '漏水短路', is_verified_buy: 'true' },
      { review_time: '2023-11-10 11:15:00', sentiment_score: 0.88, topic_keyword: '外观好看', is_verified_buy: 'false' },
      { review_time: '2023-11-10 14:00:00', sentiment_score: -0.76, topic_keyword: '清洗发臭', is_verified_buy: 'true' },
      { review_time: '2023-11-10 16:45:00', sentiment_score: -0.95, topic_keyword: '滚刷不转', is_verified_buy: 'true' },
      { review_time: '2023-11-11 08:00:00', sentiment_score: -0.81, topic_keyword: '电池续航', is_verified_buy: 'true' },
      { review_time: '2023-11-11 10:20:00', sentiment_score: 0.95, topic_keyword: '好用买', is_verified_buy: 'false' },
      { review_time: '2023-11-11 13:40:00', sentiment_score: -0.88, topic_keyword: '清洗发臭', is_verified_buy: 'true' },
      { review_time: '2023-11-11 19:15:00', sentiment_score: -0.91, topic_keyword: '漏水短路', is_verified_buy: 'true' },
      { review_time: '2023-11-12 09:10:00', sentiment_score: -0.85, topic_keyword: '售后态度差', is_verified_buy: 'true' }
    ],
    recommendedMethods: [
      { method: 'NLP文本主题聚类与情感打分模型', goal: '处理海量非结构化评论文本，提取出骂声高度集聚的核心零部件黑洞', expectedFinding: '揭露出竞对所谓爆款实际上半年后必然会滚刷发臭的致命死穴' },
      { method: '水军性反差识别剔除算法', goal: '找出那些给满星好评但评价文本完全一致的机器水军并一刀剔除', expectedFinding: '发现竞对前排好评其实全是水军，过滤后其真实好评率仅不到四成' }
    ],
    relatedCase: '竞品核心真正的问题反向研发狙击方案',
    relatedMethodology: '海量文本情感与主题深挖实战模型'
  },
  {
    id: 'd_part3_06',
    name: '竞品分析：竞对大促全局大活动玩法全维监控大底拆解',
    category: '竞品分析',
    scenarioDescription: '【业务背景】面临年终大促，头部竞对比我们早两天打出了复杂的“跨店定金裂变阶梯卷”玩法，导致第一波预热阶段我们的流量被吸干式暴跌。\n\n【分析目标】全面监控竞品的每一种大促满减机制与裂变拼团拉新套利组合，找到其流量恐怖裂变放大的节点动能。\n\n【预期产出】将复杂的玩法还原为最硬核的数学概率预估和单客获客成本拆解表，算出我方要夺回声量要补贴多少真金白银。\n\n【难度说明】高难度游戏化营销解构。不仅看数据更要具备强活动反挂拆解推算机制与博弈的敏锐大局控盘能力。',
    fields: [
      { name: 'promo_id', type: '文本', description: '对方后台复杂的这套组合大型拳的单一子活动标识', example: 'P-992110', analysisValue: '看清它是靠砍一刀拉新还是靠定金膨胀套老客防流失' },
      { name: 'mechanic_type', type: '文本', description: '该促活机制的本质归类，比如定金膨胀、裂变百人团、分享返现', example: '裂变百人团', analysisValue: '区分虚假人气和真实成单的大基底机制分类' },
      { name: 'viral_k_factor', type: '数值', description: '这种裂变机制每一人能带来下一跳真实新增用户的裂变K系数值', example: '2.5', analysisValue: '残酷的验证这种套路究竟是自嗨还是真病毒式速传导扩盘' },
      { name: 'cac_estimate', type: '数值', description: '通过其发的钱和带的人反算出它花一个新用户的拉新血本', example: '45.00', analysisValue: '直接用来和我们平时买量的高单价对打看看是否被降维打' }
    ],
    sampleData: [
      { promo_id: 'P-992110', mechanic_type: '裂变百人团', viral_k_factor: 2.5, cac_estimate: 45.00 },
      { promo_id: 'P-881220', mechanic_type: '定金大膨胀', viral_k_factor: 0.2, cac_estimate: 15.00 },
      { promo_id: 'P-774431', mechanic_type: '分享得券', viral_k_factor: 1.8, cac_estimate: 28.00 },
      { promo_id: 'P-661142', mechanic_type: '整点大秒杀', viral_k_factor: 0.1, cac_estimate: 8.00 },
      { promo_id: 'P-550953', mechanic_type: '裂变百人团', viral_k_factor: 2.8, cac_estimate: 50.00 },
      { promo_id: 'P-443364', mechanic_type: '定金大膨胀', viral_k_factor: 0.3, cac_estimate: 12.00 },
      { promo_id: 'P-331175', mechanic_type: '分享得券', viral_k_factor: 1.5, cac_estimate: 22.00 },
      { promo_id: 'P-229086', mechanic_type: '整点大秒杀', viral_k_factor: 0.1, cac_estimate: 10.00 },
      { promo_id: 'P-110097', mechanic_type: '裂变百人团', viral_k_factor: 3.1, cac_estimate: 60.00 },
      { promo_id: 'P-002108', mechanic_type: '定金大膨胀', viral_k_factor: 0.4, cac_estimate: 18.00 }
    ],
    recommendedMethods: [
      { method: '病毒K因子爆盘传导算', goal: '看它搞一次活动大图裂变是快拉来三倍人还是在朋友圈发不出去', expectedFinding: '吃惊发现它一个新玩法K因子到了3以上，可怕几天吸走整个盘流量' },
      { method: '拉新套现防死抗推打底算', goal: '基于它及其花哨眼花活动算出获单底本用来定我方补底对冲', expectedFinding: '它虽然发了几百万券但在大人数摊薄下单客几块钱便宜降维防死打击' }
    ],
    relatedCase: '大促销全防崩大抗其及其反杀对打战',
    relatedMethodology: '裂流变效抗传其防应数学反杀底网'
  }
];
