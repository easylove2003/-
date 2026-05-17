export const exampleDatasets = [
  {
    id: 'ecommerce_sales',
    name: '电商销售预估分析 (E-commerce)',
    desc: '包含订单日期、SKU、价格、销量、渠道等字段。预期得出：价格弹性曲线与最佳毛利点。',
    presetQuestion: '按渠道拆解，哪个渠道的 ROI 最高？',
    data: `order_id,date,sku_id,category,price,original_price,quantity,channel,discount_rate
8001,2023-11-01,SKU_001,婴儿辅食,40.0,80.0,300,直播带货,0.5
8002,2023-11-01,SKU_002,果味零食,19.9,39.9,1500,短视频,0.5
8003,2023-11-02,SKU_001,婴儿辅食,60.0,80.0,310,自营店铺,0.75
8004,2023-11-03,SKU_002,果味零食,29.9,39.9,400,自营店铺,0.75
8005,2023-11-04,SKU_001,婴儿辅食,70.0,80.0,290,公域分发,0.875
8006,2023-11-05,SKU_002,果味零食,35.0,39.9,150,公域分发,0.877
8007,2023-11-06,SKU_001,婴儿辅食,80.0,80.0,280,私域社群,1.0
8008,2023-11-07,SKU_002,果味零食,39.9,39.9,50,私域社群,1.0`,
  },
  {
    id: 'user_retention',
    name: '用户留存与队列 (Retention)',
    desc: '包含用户ID、注册日期、活跃日期、首次获客渠道等。预期得出：留存阶梯跌落点与魔法时刻。',
    presetQuestion: '绘制用户留存热力图，并找出流失最高的群体。',
    data: `user_id,register_date,last_active_date,channel,total_spent,days_active
U1001,2023-01-01,2023-01-05,微信公众号,0,4
U1002,2023-01-01,2023-06-15,抖音广告,540.5,160
U1003,2023-01-02,2023-01-03,小红书推荐,0,1
U1004,2023-01-02,2023-03-10,朋友邀请,120.0,60
U1005,2023-01-03,2023-08-22,抖音广告,890.0,230
U1006,2023-01-03,2023-01-04,微信公众号,0,1
U1007,2023-01-04,2023-07-01,朋友邀请,300.0,170`,
  },
  {
    id: 'supply_chain',
    name: '供应链异常检测 (Supply Chain)',
    desc: '包含SKU、仓储中心、日均消耗、现库存、安全库存阈值。预期得出：潜在断货预警与周转率过低分析。',
    presetQuestion: '预测下周哪些SKU有可能发生断货？',
    data: `sku_id,warehouse_id,current_stock,daily_consumption,safe_stock_level,lead_time_days,defect_rate
SKU_A01,WH_East,500,60,200,3,0.01
SKU_A02,WH_East,120,40,150,5,0.02
SKU_A03,WH_North,3000,10,100,2,0.05
SKU_B01,WH_South,80,90,300,7,0.01
SKU_B02,WH_South,1500,200,400,2,0.03
SKU_C01,WH_West,0,50,100,5,0.00
SKU_C02,WH_West,450,150,200,3,0.04`,
  }
];
