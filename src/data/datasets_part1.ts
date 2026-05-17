import { Dataset } from './datasets';

export const datasetsPart1: Dataset[] = [
  {
    id: 'dataset-04',
    title: '双十一大促全域流量转化秒级监控表',
    category: '流量分析',
    industry: '全品类大盘',
    recordCount: '千万级',
    description: '该款表详细记录了大促黄金时间点、从各类外部入口到最终复购转化的全时段流量洪峰。标记了大量跳出用户及各个节点的活动挂载和投放消耗参数，可用于复杂的归因分析，以剔除虚假流量。',
    fields: [
      { name: 'timestamp', type: 'datetime', description: '精确到亚秒级别' },
      { name: 'channel_source_id', type: 'string', description: '多渠道详细下沉编码字典库' },
      { name: 'customer_device_fingerprint', type: 'string', description: '脱敏去重多模设备唯一指纹' },
      { name: 'session_duration_ms', type: 'number', description: '精准端留存总计时常' },
      { name: 'click_depth', type: 'number', description: '滑动跨度、深度衡量指标' },
      { name: 'gmv_contributed', type: 'number', description: '有效转化带来的实盘金额贡献' }
    ],
    usageScenarios: ['1. 构建庞大全链MTA(多触点归因)模型。', '2. 深挖那些低劣或虚假的机器人刷量并及时止损。']
  },
  {
    id: 'dataset-05',
    title: '高客单净值人群RFM及多维画像池',
    category: '用户分析',
    industry: '高奢珠宝及高端美妆',
    recordCount: '150,000+',
    description: '专门提取金字塔顶端及高频超大额买主群体的详尽维度与偏好标签库。这是关系到核心收入的利润源基石，用于高强度高密度的服务维护。',
    fields: [
      { name: 'vip_hash_id', type: 'string', description: '脱敏加密核心标识' },
      { name: 'lifetime_days', type: 'number', description: '首次注册建档入库总天数' },
      { name: 'total_spent_amt', type: 'number', description: '历史累计消费总额' },
      { name: 'avg_order_interval', type: 'number', description: '回购频率及周期测度' },
      { name: 'preferred_material_tag', type: 'string', description: '偏爱材质特征(如玫瑰金、冷钻等细分标签)' },
      { name: 'complaint_severity_score', type: 'number', description: '历史不满或客诉严重度评分' }
    ],
    usageScenarios: ['1. 建立分层服务模型并执行挽留回购战略。', '2. 对有流失征兆的头部客户进行前置精准捕抓与危机公关挽回。']
  },
  {
    id: 'dataset-06',
    title: '商品长尾沉滞死库断点复杂仓配表',
    category: '商品分析',
    industry: '大型综合大仓及百货总盘',
    recordCount: '800,000+',
    description: '揭露了财报上隐性亏损黑洞的仓储明细表。带有诸多历史历史数据沉淀仓库负担的各项平摊明细，是用于无情清理滞销产品、扭转整个大盘现金流的必备利器。',
    fields: [
      { name: 'sku_complex_id', type: 'string', description: '精确到最小尺寸和微小规格的SKU识别码' },
      { name: 'warehouse_zone', type: 'string', description: '存放库区及影响租金的高低区位标识' },
      { name: 'in_stock_days_avg', type: 'number', description: '库龄，即滞留冷库的平均天数' },
      { name: 'storage_penalty_cost', type: 'number', description: '每日自动叠加的仓储和折耗成本' },
      { name: 'latest_sale_date', type: 'datetime', description: '上一笔订单产生的时间' },
      { name: 'liquidation_priority_index', type: 'number', description: '系统推算的强制清仓及报废优先级' }
    ],
    usageScenarios: ['1. 利用ABC分类模型执行止损操作。', '2. 精算边际成本并在跨越止损红线后自动触发降价促销及清库存指令。']
  },
  {
    id: 'dataset-07',
    title: '全网竞品深度声量与降价监控情报库',
    category: '竞对与市场分析',
    industry: '3C数码激烈搏杀品类',
    recordCount: '千万级/日更',
    description: '通过合规监测渠道获取各大平台、KOL发布以及社群内有关行业前三强竞品的全量实时变价和公关反馈数据，汇总出的量化战情研判库。',
    fields: [
      { name: 'rival_brand_name', type: 'string', description: '精准对应的竞对品牌' },
      { name: 'sentiment_score_avg', type: 'number', description: '提取评论反馈极性计算的综合正负面舆论分' },
      { name: 'engagement_volume', type: 'number', description: '引发转发、讨论及曝光活跃度的计量' },
      { name: 'price_change_alert', type: 'boolean', description: '是否检测到大幅度隐性降价或放券动作' },
      { name: 'dominant_keyword_clusters', type: 'string', description: '被高频推演及广泛讨论的卖点热图' }
    ],
    usageScenarios: ['1. 部署硬性的防反围剿降维截流雷达，及时跟进价格战。', '2. 指导下一代新品打磨，精准避开竞品优点、命中其真正的问题死穴。']
  },
  {
    id: 'dataset-08',
    title: '高频极速下单与断点高并发极细日志表',
    category: '技术底盘与漏斗分析',
    industry: '大快消及秒杀直播',
    recordCount: '500,000,000+',
    description: '去除任何水分和粉饰的冷酷客观秒级互动数据。详尽记录了在线人数跳动、商品弹框到极快成交瞬间的底盘数据，为主管和业务负责人提供深挖内幕的素材。',
    fields: [
      { name: 'stream_segment_time', type: 'datetime', description: '粒度到亚秒级的微切分时间列' },
      { name: 'concurrent_viewers', type: 'number', description: '该切片内全场并发的真实存活设备数' },
      { name: 'conversion_revenue_5min', type: 'number', description: '5分钟内直接转化带来的成交与退款总额' },
      { name: 'cart_abandonment_spike', type: 'boolean', description: '是否有反常突变的加购后脱逃率警报' },
      { name: 'host_pitch_tag', type: 'string', description: '该切片下主播具体在推介什么话术机制' }
    ],
    usageScenarios: ['1. 作为淘汰和考核绩效不达标废柴运营的直接数据佐证。', '2. 复制提拔能够创造极其出色的吸单话术及带货流量模型的王牌主播。']
  }
];
