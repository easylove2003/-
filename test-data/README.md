# 测试数据集 (Test Datasets)

用于测试 Data Copilot 各功能模块的模拟数据。

---

## 1. ecommerce_orders_500.csv
**用途**：测试数据上传、AI 诊断、NL2SQL 查询、图表生成
- 150 行电商订单数据
- 14 个字段：Order_ID, Date, Category, Product, Region, Channel, Sales, Quantity, Profit, Discount, Customer_Type, Payment_Method, Shipping_Cost, Return_Flag
- 数据干净，无缺失值
- 覆盖 6 个品类、4 个区域、2 个渠道、4 种支付方式
- 时间跨度：2024-01 至 2024-03

**测试场景**：
- 基础上传解析是否正常
- AI 诊断报告生成
- NL2SQL 查询（如"哪个品类利润最高"、"各区域销售趋势"）
- 图表渲染

---

## 2. dirty_data_with_issues.csv
**用途**：测试数据质量诊断、异常检测、红灯预警
- 50 行用户画像数据
- 16 个字段：user_id, register_date, age, gender, city, channel, first_order_date, total_orders, total_spent, avg_order_value, last_active_date, membership_level, churn_flag, satisfaction_score, referral_count, device_type
- **故意包含的数据问题**：
  - age 字段有缺失值（~12%）
  - age 字段有异常值（-5, 0, 200）
  - gender 字段有缺失值
  - first_order_date 有缺失（未下单用户）
  - satisfaction_score 有缺失值（~10%）
  - device_type 有缺失值（~12%）
  - city 有一个缺失值

**测试场景**：
- 异常检测是否能发现年龄异常值
- 缺失值统计是否准确
- 红灯预警是否触发
- AI 诊断是否能给出清洗建议

---

## 3. marketing_funnel_analysis.csv
**用途**：测试漏斗分析、ROAS 计算、营销归因
- 25 行营销活动数据
- 18 个字段：campaign_id, campaign_name, start_date, end_date, channel, budget, impressions, clicks, ctr, registrations, conversions, revenue, cost_per_click, cost_per_conversion, roas, target_audience, creative_type, landing_page_variant
- 覆盖多种渠道（WeChat, Douyin, Xiaohongshu, Baidu SEM, Email, Push 等）
- 时间跨度：2024-03 至 2025-04

**测试场景**：
- 漏斗转化率分析
- ROAS 对比
- 渠道效果排名
- 方法论分析（归因模型）

---

## 4. saas_monthly_metrics.csv
**用途**：测试趋势分析、SaaS 指标看板、预测
- 24 行月度 SaaS 指标
- 18 个字段：month, mrr, new_mrr, expansion_mrr, churned_mrr, net_new_mrr, active_users, new_signups, churned_users, net_retention_rate, gross_margin, cac, ltv, ltv_cac_ratio, arpu, support_tickets, nps_score, feature_adoption_rate, trial_to_paid_rate
- 时间跨度：2023-01 至 2024-12
- 展示典型 SaaS 增长曲线

**测试场景**：
- 趋势图渲染（MRR 增长曲线）
- 多指标对比
- 留存率分析
- LTV/CAC 比率计算
- SmartReport 生成

---

## 使用方法

1. 打开 http://localhost:3000
2. 进入「数据分析」页面
3. 拖拽或点击上传以上任意 CSV 文件
4. 观察 AI 诊断、图表、NL2SQL 等功能是否正常工作
