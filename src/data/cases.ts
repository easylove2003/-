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
    id: 'c4',
    title: '乘法拆解模型：大促前GMV暴跌32%之谜，细分流量归因揭示iOS端式下跌',
    category: '流量与转化分析',
    subcategory: '流量归因',
    industry: '快时尚女装电商',
    difficulty: '进阶',
    tags: ['乘法拆解', '异常诊断', '归因分析', '隐私政策', '流量分配'],
    summary: '某垂直快时尚女装电商（日均GMV约250万）在重大活动前夕，GMV同比上周异常暴降32%，业务陷入极度恐慌。通过"GMV=UV×转化率×客单价"经典乘法拆解结合多维交叉下钻分析。发现转化率3.2%和客单价158元均保持平稳，但总体UV大幅猛降45%，细分定位到iOS端UV暴跌62%。最终判定为苹果隐私政策变更导致广告无法归因被系统自动停投，48小时内紧急调整预算策略止损，最终次周GMV恢复增长反超8%。',
    background: '某垂直快时尚女装平台，主打18-25岁年轻女性市场，日均活跃用户约30万，日均GMV稳定在250-300万之间，且对外部买量渠道依赖度超过70%。\n2023年9月12日早晨，BI日报触发红色警报，昨日大盘GMV突然下探至190万，同比上周同期暴降32%。距离季度核心S级大促仅剩两周，业务线负责人极度恐慌，急需在一小时内给出方向定调，半天内找到根因止血落案。\n数据底层具备完善的访问、交易和广告投放API回传宽表。积累了近一年的设备ID、广告源参数、商品维度订单明细数据。但由于第三方归因链路复杂，实时性数据目前仅到小时级，且缺乏渠道层面的细粒度转化漏斗归档数据。\n核心分析目标是：要在不影响大促节奏的前提下，排查出是外部市场环境、竞争对手动作、内部系统故障还是运营策略失误导致的GMV雪崩，并提出行之有效的预算调度或者技术抢救动作。',
    fields: [
      { name: 'log_date', type: '日期型', description: '流量与交易发生的目标自然日，用于同比或环比分析', example: '2023-09-12' },
      { name: 'device_os', type: '文本型', description: '客户端操作系统类型，用于设备维度的交叉下钻', example: 'iOS' },
      { name: 'utm_source', type: '文本型', description: '精确的外部流量采买渠道或自然流量来源标记', example: 'Tencent_GDT' },
      { name: 'uv_count', type: '数值型', description: '单日独立访客访问去重数量，大盘流量基盘', example: '124000' },
      { name: 'pay_amount', type: '数值型', description: '用户最终实际支付的订单金额汇总数值', example: '158.50' },
      { name: 'add_cart_rate', type: '数值型', description: '进入商详页后触发加购行为的uv占比', example: '0.12' }
    ],
    analysisProcess: '数据清洗与准备阶段：我们首先排除了DDoS攻击和爬虫流量的干扰，过滤了1.5万个异常高频IP。将昨天的逐小时交易流水（190万）与上周同期的280万流水进行了统一切片，修复了120笔金额异常的无效测试订单。\n第一步分析：业务部门一开始坚信是因为竞争对手发补贴抢走了用户。但我们用“销售额 = 访客数 × 转化率 × 客单价”这个公式拆解后发现：大家的购买转化率和平均每单金额都非常正常，没出问题。问题出在访客数量上！总访客数从55万直接腰斩到了30万。这说明不是我们的商品没吸引力，而是别人根本进不来。\n深入排查：我们把流量按照手机类型和广告来源进行了细致查询。发现原来安卓手机和网页端的访客并没有少，全是苹果（iOS）手机的流量暴跌了62%！再一看，问题出在广告投放上，平常能带来很多苹果手机流量的抖音和微信广告，昨天竟然一个点击都没带来。\n核实阶段：一开始以为是广告账户里没钱了，但查了一下发现余额还剩150万。广告还在正常展示，但就是没有形成点击转化。后来我们对比了手机系统版本，发现是受苹果最新出台的隐私政策影响：苹果系统限制了广告平台去追踪客户行为。\n最终结论：因为苹果的隐私政策，导致微信和抖音的广告系统以为“没人点广告购买”，这触发了广告系统的保护机制，自动给我们的广告降低了曝光等级。所以并不是我们的商品选得不好，而是外部环境变化导致算法直接停掉了我们的优质流量。这就洗刷了运营团队选品失误的冤屈。',
    coreFindings: [
      {
        finding: 'GMV暴跌的主次矛盾被反转',
        evidence: '漏斗拆解显示，支付转化率（3.2%）和客单价（158元）基本持平，根本问题在于总UV骤减了25万人次（跌幅45%）。',
        implication: '问题并不在于商品本身或竞品促销打压，而是平台陷入了严重的外部流量断供危机。'
      },
      {
        finding: 'iOS系统流量成了重灾区被拦截',
        evidence: '设备与渠道交叉下钻表明，Android端微增3%，而长期占主导的iOS端访客暴跌62%，每天有近20万优质流量消失。',
        implication: '精准锁定了设备层的断层，将排查范围从系统迅速缩小到iOS特定的生态变化。'
      },
      {
        finding: '隐私政策引发的OCPA模型崩溃',
        evidence: '广告后台显示曝光仍有300万次，但因iOS 16隐私拦截导致归因API断链，OCPA算法误判系统停投。',
        implication: '系统算法在缺失完整行为反馈时会自动避险，技术政策的变更瞬间化身为巨大的利空。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '投放预算紧急左转安卓端',
        action: '在2小时内，由投放组将iOS端70%剩余空置预算瞬间抢切至Android端和其他非IDFA渠道投放。',
        expectedOutcome: '利用安卓市场增量弥补每日20万的UV缺口。',
        owner: '流量运营团队'
      },
      {
        strategy: '唤醒老用户沉睡流量',
        action: '框选近3个月有过购买记录的50万iOS老客，利用Push、短信以及企微生态强力低本唤醒。',
        expectedOutcome: '利用老客高复购率拉升客单价10%，稳住基本盘。',
        owner: '用户增长团队'
      },
      {
        strategy: '修复归因链路切入新框架',
        action: '技术部连夜对接苹果SKAdNetwork归因框架，并采用基于概率建模的补充验证API模型。',
        expectedOutcome: '彻底修复iOS端归因黑洞，48小时恢复正常投放。',
        owner: '技术数据中台'
      },
      {
        strategy: '建立自动化多维异动告警',
        action: '在BI表单上部署预警机器人，设定若核心指标（UV、转化、客单）小时环比较昨日>15%即告警。',
        expectedOutcome: '实现分钟级异常监测，响应时间缩至2小时以内。',
        owner: '数据分析团队'
      }
    ],
    businessOutcome: '方案实施3个月后，全链路危机处理展现出明显成效。前48小时内成功通过预算转移与老客激活挽回了近80万的交易缺口。第4天实现iOS端流量全面复苏，第7天大盘GMV强势反弹破320万反超上周同期8%。单月多创造新增GMV贡献约320万超额达成。',
    reflection: '本次分析局限在于前期对外部宏观环境以及系统生态的技术政策感知过度迟钝，导致被动陷入排查。\n如果重来一次，将联合产品提前2个月设立专门应对iOS隐私新规的演练，在投放端完成模型试错。\n后续会探索不依赖精准ID的增量模型(Uplift)，并建立起更敏锐的市场大环境雷达扫描仪。\n作为方法论，危机排查中"用乘法拆指标，用减法做下钻"的法则被证明是寻找断点的最利器。'
  },
  {
    id: 'c10',
    title: '漏斗与红黑榜：618大促全链路复盘，支付承载及服饰极高退货率成拖累',
    category: '活动与复盘分析',
    subcategory: '大促复盘',
    industry: '综合电商平台',
    difficulty: '高级',
    tags: ['大促复盘', '红黑榜', '漏斗分析', '支付失败率', '退货率'],
    summary: '某头部综合性电商平台（年GMV规模破50亿）在面临618大促目标未达预期的压力下急需深度复盘。利用阶段拆解法与品类红黑榜，分析出目标8亿仅达成7.2亿的根因。核心在于前两小时由于系统并发崩溃引发支付失败率达8%，以及服饰品类高达35%的退货率对净营收造成冲击。最终明确技术扩容2倍及服饰退现货发售策略，在次年618助力目标达成105%，支付卡损降至1%以内。',
    background: '某全国知名的综合性大众电商平台，涵盖3C、生鲜、服饰箱包等全品类矩阵，全年GMV在50亿元量级左右，正处于从流量红利向精细化运营转型的关键爬坡期。\n2023年度618S级大促总指挥部设定了挑战目标：大促周期GMV需冲刺8亿元。但活动结束后大盘核算显示，实际最终GMV仅停留在7.2亿元，大促目标达成率仅为90%。CEO对此非常不满意，要求各部门谁拖了后腿找出来负责。\n公司建立有TB级实时数仓平台，涵盖从浏览、加购、提单到中台支付流转、再到后端仓储的细粒度明细。但各品类的取数口径隔离严重，大促全周期数据整合尚有缺失。\n分析目标是全面且无死角地针对大促进行后置验证与复盘，通过量化找出流血点，并为次年双11及未来大促积累可落地、可量化的行动策略书。',
    fields: [
      { name: 'order_uuid', type: '文本型', description: '交易流水级唯一标识记录符', example: 'ORD_230618001' },
      { name: 'campaign_stage', type: '文本型', description: '大促的时间分段', example: 'BaoFa_Phase' },
      { name: 'product_category', type: '一级类目', description: '商品归属的宏观行业大类', example: '3C_Digital' },
      { name: 'payment_success_flag', type: '布尔型', description: '表征用户在收银台是否完成实际支付', example: 'true' },
      { name: 'return_refund_rate', type: '浮点数值', description: 'T+15周期内的退还额所占总额比例', example: '0.125' }
    ],
    analysisProcess: '数据准备：我们把横跨18天的大促期间的420万笔真实交易数据提取了出来。清理掉了所有虚假刷单和黄牛的订单。我们将“支付成功的钱扣掉已经退款的钱”作为最核心的观察指标。\n第一步分析：起初运营反映是买进来的流量不够。我们把大促拆开分析发现：预热期的时候因为商品好，大家已经往购物车里放了价值12亿的商品了！这说明大家是想买的。问题发生在6月18日零点开卖的前两个小时，大家都来了，却都没付成款，支付成功率不到30%。\n深入排查：我们顺着没付成款的原因找下去，发现了灾难：零点刚过，因为同时付钱的人实在太多了（一秒钟3万次），导致支付系统瘫痪崩溃了！付钱失败率从平时的2%飙升到了8%。光是系统卡壳就导致了至少损失了4500万的销售额。而且，不同商品表现不一：电脑手机卖得很好，但衣服化妆品卖得非常差。\n核实阶段：我们以为衣服卖得差是因为选品不好。去查退款数据才发现：为了把活动拉长，衣服品类做了一个时间很长的预售活动。结果大部分人都在冲动付了定金后后悔了，纷纷退款，导致退款率飙升到骇人的35%（一般20%已经非常危险了）。\n最终发现了两大要命原因：第一，系统的抗压能力没做好，导致关键时刻付不了钱；第二，衣服这种需要看款式看心情的商品根本不适合做长周期的预售，导致退款猛涨。这两大失误共同导致了8000万的损失。',
    coreFindings: [
      {
        finding: '系统崩溃成为掐住咽喉的魔爪',
        evidence: '前2小时系统并发剧增致使支付失败率激增至恐怖的8%（平日2%）。大量预加入购物车无从支付。',
        implication: '再精妙的营销运营，如果在最终收银台崩溃也是0，技术基建至关重要。'
      },
      {
        finding: '多重品类盲目跟随预售遭到反噬',
        evidence: '品类两极分化。3C达成120%，而服饰预售造成的高达35%退货率抹平了增量，仅达成75%。',
        implication: '大促期间切忌"一刀切"战略，尊重品类差异化，鞋服等极度依赖快速试穿体验。'
      },
      {
        finding: '预热期的流量势能积累跑输',
        evidence: '整个预热期间，新拉新的独立访客UV只有原定目标的70%，爆发期缺乏大广度的人群池增量。',
        implication: '由于开源流量被友商由于各种花样提前截流，大盘上限必然被提早锁死。'
      }
    ],
    improvementStrategies: [
      {
        strategy: '全链路压力极限前置',
        action: '技术与架构部门在618前沿用混沌工程理念，进行平日3倍真实全链路下单支付压测演练。',
        expectedOutcome: '排雷解决系统崩溃，支付失败拦截在1%内。',
        owner: '技术部平台组'
      },
      {
        strategy: '精细化品类专属促销',
        action: '强制服饰与美妆品类显著压缩长期盲付预售比例，将主战场切换至极速现货发售包邮机制。',
        expectedOutcome: '服饰平均退换货率降低至少10个百分点。',
        owner: '重点品类采销部'
      },
      {
        strategy: '流量抢跑并左移预算',
        action: '在竞争对手发力前，将大促买量预算和预热阶段提早两周落地；上线百亿福利引流拉拽。',
        expectedOutcome: '预算左移确保预售流量蓄水池指标达成100%。',
        owner: '市场部投放组'
      },
      {
        strategy: '老客社交裂变提振客单',
        action: '开发老带新津贴抽奖体系对沉睡老用户推送引流，用拉新返佣金带动活跃唤醒。',
        expectedOutcome: '借连带效应，提升全站笔均客单价超12%。',
        owner: '用户运营组'
      }
    ],
    businessOutcome: '经过复盘总结并在次年618大促中推行。实施双11和次年618双战双捷：次年618目标达成率飙升至105%；得益预算左移预售引入强劲达成110%；更振奋的是，爆发期支付失败率死死按在不到1%以内。单月新增GMV净值达3800万，历史新高。',
    reflection: '本次大促复盘的局限在于高度依赖事后验证，缺乏对大促中活动退款率等抛物线的"实时沙盘"预警与阻击机制。\n如果重来一次，会在监控模块增加“异动退款系数”，发现退款激增即时小时级熔断预售入口。\n后续深挖方向考虑构建商品力健康度指标树，将流量资源同"商品留存净值"实时挂钩。\n复盘在于总结"分段剖析"的方法论兵法。'
  }
];

// Cleaned up generated cases

caseStudies.push();

