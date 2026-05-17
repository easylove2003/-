export interface Dataset {
  id: string;
  name?: string;
  title?: string;
  category: string;
  industry?: string;
  recordCount?: string | number;
  scenarioDescription?: string;
  description?: string;
  fields: { name: string; type: string; description: string; example?: string; analysisValue?: string }[];
  sampleData?: any[];
  recommendedMethods?: { method: string; goal: string; expectedFinding: string }[];
  usageScenarios?: string[];
  relatedCase?: string;
  relatedMethodology?: string;
}

export const datasets: Dataset[] = [
  {
    id: 'd1',
    name: '电商大盘日销异动监控数据',
    category: '销售分析',
    scenarioDescription: '某综合电商平台每日高管必看的昨日核心交易大盘数据源。覆盖近半年的逐日数据，含有明显的周末效应和节假日大促脉冲特征。常用于训练分析师的异动归因和趋势排查能力。',
    fields: [
      { name: 'stat_date', type: '日期', description: '统计业务日期', example: '2023-10-24', analysisValue: '时序分析，节日标记' },
      { name: 'channel_id', type: '文本', description: '流量汇入渠道（App/小程序/H5）', example: 'Wechat_MiniProgram', analysisValue: '多端贡献拆分' },
      { name: 'total_uv', type: '数值', description: '当日全站去重活跃访客数', example: '150420', analysisValue: '测算日活规模基础' },
      { name: 'gross_gmv', type: '数值', description: '拍下并成功的总销售额', example: '3200450.00', analysisValue: '核心北极星指标' },
      { name: 'paid_order_cnt', type: '数值', description: '当日成功支付的订单总笔数', example: '18400', analysisValue: '推算整体客单价' },
      { name: 'conversion_rate', type: '数值', description: '全站综合访问到支付转化率(%)', example: '12.2', analysisValue: '网站健康度关键指标' }
    ],
    sampleData: [
      { stat_date: '2023-10-24', channel_id: 'Wechat_MiniProgram', total_uv: 150420, gross_gmv: 3200450.00, paid_order_cnt: 18400, conversion_rate: 12.2 },
      { stat_date: '2023-10-24', channel_id: 'App_iOS', total_uv: 230100, gross_gmv: 5800000.00, paid_order_cnt: 31000, conversion_rate: 13.5 },
      { stat_date: '2023-10-24', channel_id: 'App_Android', total_uv: 310200, gross_gmv: 6200000.00, paid_order_cnt: 38000, conversion_rate: 12.2 },
      { stat_date: '2023-10-25', channel_id: 'Wechat_MiniProgram', total_uv: 145000, gross_gmv: 3000500.00, paid_order_cnt: 17500, conversion_rate: 12.0 },
      { stat_date: '2023-10-25', channel_id: 'App_iOS', total_uv: 240000, gross_gmv: 6000000.00, paid_order_cnt: 32000, conversion_rate: 13.3 },
      { stat_date: '2023-10-25', channel_id: 'App_Android', total_uv: 325000, gross_gmv: 6500000.00, paid_order_cnt: 40000, conversion_rate: 12.3 }
    ],
    recommendedMethods: [
      { method: '乘法模型拆解', goal: '将GMV异动拆散为UV、转化率和客单价的叠加影响', expectedFinding: '能看出某天下跌究竟是因为流量少了，还是因为用户光逛不买' },
      { method: '时间序列分析', goal: '剔除周末/节假日的季节性干扰', expectedFinding: '真实业务往往具有7天一循环的周期律，需对比同比/周环比' }
    ],
    relatedCase: 'c4',
    relatedMethodology: 'm1'
  },
  {
    id: 'd2',
    name: '生鲜全品类销售与库存周转数据',
    category: '销售管理',
    scenarioDescription: '某连锁生鲜零售业务数据，涵盖了极难管理的生鲜库存指标与销售毛亏，常用于品类矩阵梳理。帮助分析团队洞察哪些品类赚钱但流转慢，哪些品类亏钱但引流强。',
    fields: [
      { name: 'category_level1', type: '文本', description: '一级品类', example: '活鲜类', analysisValue: '宏观业务大类监控' },
      { name: 'sku_name', type: '文本', description: '具体商品标准名称', example: '基围虾500g', analysisValue: '细粒度爆款探究' },
      { name: 'daily_sales_qty', type: '数值', description: '当日实际售出份数', example: '450', analysisValue: '单品热度评估' },
      { name: 'gross_profit_margin', type: '数值', description: '单品系统后台毛利率(%)', example: '8.5', analysisValue: '判断是否亏本赚吆喝' },
      { name: 'turnover_days', type: '数值', description: '库存周转天数（存货/日均销量）', example: '1.2', analysisValue: '生鲜品控红线的预警' },
      { name: 'spoilage_rate', type: '数值', description: '变质/损耗比率(%)', example: '3.4', analysisValue: '隐形成本审计重点' }
    ],
    sampleData: [
      { category_level1: '活鲜类', sku_name: '基围虾500g', daily_sales_qty: 450, gross_profit_margin: 8.5, turnover_days: 1.2, spoilage_rate: 3.4 },
      { category_level1: '活鲜类', sku_name: '大闸蟹一只', daily_sales_qty: 120, gross_profit_margin: 15.2, turnover_days: 0.8, spoilage_rate: 5.1 },
      { category_level1: '叶菜类', sku_name: '上海青250g', daily_sales_qty: 1200, gross_profit_margin: -2.5, turnover_days: 0.5, spoilage_rate: 6.8 },
      { category_level1: '水果类', sku_name: '阳光玫瑰葡萄', daily_sales_qty: 80, gross_profit_margin: 35.0, turnover_days: 4.5, spoilage_rate: 12.5 },
      { category_level1: '猪肉类', sku_name: '黑猪五花肉', daily_sales_qty: 320, gross_profit_margin: 12.0, turnover_days: 1.8, spoilage_rate: 1.2 },
      { category_level1: '水果类', sku_name: '智利车厘子JJ级', daily_sales_qty: 210, gross_profit_margin: 28.5, turnover_days: 3.2, spoilage_rate: 8.5 }
    ],
    recommendedMethods: [
      { method: '波士顿矩阵分群 (BCG)', goal: '按毛利与销量对SKU强制分档', expectedFinding: '锁定高销量高毛利的"明星款"与高库存低毛利的"瘦狗款"' },
      { method: 'ABC库存分类', goal: '定位尾部冗余商品', expectedFinding: '发现60%的长尾商品挤占了库区却只带来5%的销售额' }
    ],
    relatedCase: 'c2',
    relatedMethodology: 'm2'
  },
  {
    id: 'd3',
    name: '多步漏斗用户注册及首单转化日志',
    category: '用户分析',
    scenarioDescription: '详细打点了用户在获客落地页从看一眼到最后首单支付的完整行为步长。用于排查流量在哪个断点大规模跌落。',
    fields: [
      { name: 'log_id', type: '文本', description: '日志流水号', example: 'L99283-A1', analysisValue: '去重依赖' },
      { name: 'user_pseudo_id', type: '文本', description: '设备伪装ID', example: 'DF-092-11X', analysisValue: '串联未注册时的操作' },
      { name: 'event_name', type: '文本', description: '前端埋点事件', example: 'Click_GetCode', analysisValue: '构建漏斗节点' },
      { name: 'event_timestamp', type: '日期', description: '事件发生精确时戳', example: '2023-01-15 14:02:11', analysisValue: '计算步长耗时' },
      { name: 'source_campaign', type: '文本', description: '带入流量的站外活动编号', example: 'TouTiao_Summer_01', analysisValue: '评判买量质量' }
    ],
    sampleData: [
      { log_id: 'L99283-A1', user_pseudo_id: 'DF-092-11X', event_name: 'Page_View', event_timestamp: '2023-01-15 14:00:15', source_campaign: 'TouTiao_Summer_01' },
      { log_id: 'L99283-A2', user_pseudo_id: 'DF-092-11X', event_name: 'Click_RegisterBtn', event_timestamp: '2023-01-15 14:01:03', source_campaign: 'TouTiao_Summer_01' },
      { log_id: 'L99283-A3', user_pseudo_id: 'DF-092-11X', event_name: 'Click_GetCode', event_timestamp: '2023-01-15 14:02:11', source_campaign: 'TouTiao_Summer_01' },
      { log_id: 'L99283-A4', user_pseudo_id: 'DF-092-11X', event_name: 'Submit_Register', event_timestamp: '2023-01-15 14:03:00', source_campaign: 'TouTiao_Summer_01' },
      { log_id: 'L99283-A5', user_pseudo_id: 'DF-092-11X', event_name: 'First_Order_Paid', event_timestamp: '2023-01-15 14:35:10', source_campaign: 'TouTiao_Summer_01' },
      { log_id: 'L99284-B1', user_pseudo_id: 'OP-111-99A', event_name: 'Page_View', event_timestamp: '2023-01-15 15:10:00', source_campaign: 'Wechat_Moments_03' },
      { log_id: 'L99284-B2', user_pseudo_id: 'OP-111-99A', event_name: 'Click_RegisterBtn', event_timestamp: '2023-01-15 15:10:45', source_campaign: 'Wechat_Moments_03' }
    ],
    recommendedMethods: [
      { method: '漏斗转化率对比', goal: '各步骤间的自然流失测算', expectedFinding: '最惨烈的流失通常在"获取短信验证码"那7秒的等待死角' },
      { method: 'Cohort同群留存比对', goal: '不同渠道引流进来的群体质量对比', expectedFinding: 'A渠道便宜但连第二步都不走，B渠道贵但注册率达60%' }
    ],
    relatedCase: 'c1',
    relatedMethodology: 'm3'
  }
];

