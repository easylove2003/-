import type { ChartConfig } from './cases';

export function getChartsForId(id: string, name: string = '', category: string = ''): ChartConfig[] {
  if (mockChartsMapping[id] && mockChartsMapping[id].length > 0) {
    return mockChartsMapping[id];
  }

  // Simple string hasher for deterministic pseudo-random numbers
  const hash = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return Math.abs(h);
  };

  const seed = hash(id + name);
  const rnd = (min: number, max: number, offset = 0) => {
    const val = ((seed + offset) * 9301 + 49297) % 233280 / 233280;
    return Math.floor(min + val * (max - min));
  };

  const fallbacks: ChartConfig[] = [];
  
  const isRevenue = /GMV|收入|利润|客单价|销售|商业化|变现|大促|转化/i.test(name + category);
  const shortHand = name.substring(0, 8);
  const metricName = isRevenue ? 'GMV' : '活跃度';
  const unitStr = isRevenue ? '万' : '指数';
  
  if (isRevenue) {
    const b1 = rnd(80, 150, 1);
    const a1 = b1 + rnd(20, 80, 2);
    fallbacks.push({
      chartId: `${id}-chart-1`,
      chartName: `[${shortHand}] 核心KPI及转化提升前瞻`,
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['大盘核心收益', '漏斗支付转化率', '场均客单价', '核心复购率'],
      beforeData: [b1, rnd(2, 5, 3), rnd(120, 200, 4), rnd(15, 25, 5)],
      afterData: [a1, rnd(6, 12, 6), rnd(210, 280, 7), rnd(30, 45, 8)],
      unit: ['万', '%', '元', '%'],
      chartDescription: `针对该案例，实施前后核心KPI对比：总收益从${b1}万提升至${a1}万，转化效率与复购获得显著改善。`
    });
  } else {
    const b1 = rnd(120, 300, 11);
    const a1 = b1 + rnd(50, 150, 12);
    fallbacks.push({
      chartId: `${id}-chart-1`,
      chartName: `[${shortHand}] 用户活跃及留存转化评估`,
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['核心活跃(UV)', '关键次日留存', '业务流失率', '系统吞吐效率'],
      beforeData: [b1, rnd(20, 35, 13), rnd(18, 25, 14), 100],
      afterData: [a1, rnd(45, 60, 15), rnd(4, 9, 16), rnd(130, 180, 17)],
      unit: ['万', '%', '%', '指数'],
      chartDescription: `针对该案例，用户活跃数大幅从${b1}万狂飙至${a1}万，高危业务流失率得到极为有效的遏制。`
    });
  }

  // 图表2：趋势变化折线图 (dual-line)
  const baseT1 = rnd(80, 150, 36);
  fallbacks.push({
    chartId: `${id}-chart-2`,
    chartName: `干预节点后 [${shortHand}] 趋势演变`,
    chartType: 'dual-line',
    beforeAfter: true,
    xAxis: '推进时序(天)',
    yAxis: `${metricName}增势指征`,
    baselineTrend: [baseT1, rnd(baseT1-5, baseT1+5, 37), rnd(baseT1-8, baseT1+2, 38), rnd(baseT1-12, baseT1-2, 39), rnd(baseT1-15, baseT1-5, 40), rnd(baseT1-20, baseT1-8, 41), rnd(baseT1-25, baseT1-10, 42)],
    afterTrend: [baseT1, rnd(baseT1-5, baseT1+10, 43), rnd(baseT1+5, baseT1+20, 44), rnd(baseT1+15, baseT1+35, 45), rnd(baseT1+25, baseT1+50, 46), rnd(baseT1+40, baseT1+70, 47), rnd(baseT1+60, baseT1+100, 48)],
    chartDescription: `核心策略干预后（绿色实线代表落地实际走势），在极短的阵痛期后实现了脱离原灰色基线的破局反超。`
  });

  // 图表3：流量/用户结构对比图 (dual-pie)
  const vvipA = rnd(15, 30, 20);
  const sleepA = rnd(10, 20, 21);
  const beforeWool = rnd(30, 45, 19);
  const afterWool = rnd(8, 15, 23);
  fallbacks.push({
    chartId: `${id}-chart-3`,
    chartName: `执行后资源受众结构变迁 (${category || '通用'})`,
    chartType: 'dual-pie',
    beforeAfter: true,
    categories: ['高忠诚大客/VVIP', '常规贡献主力', '低价值投机/羊毛党', '沉睡尾部'],
    beforeDistribution: [rnd(5, 12, 17), rnd(20, 30, 18), beforeWool, rnd(25, 35, 50)],
    afterDistribution: [vvipA, rnd(35, 50, 22), afterWool, sleepA],
    chartDescription: `策略下场后，低效边缘/投机者从${beforeWool}%被强力压缩至${afterWool}%，高价值金字塔顶端结构实现膨胀。`
  });

  // 图表4：漏斗/转化断点对比 (grouped-bar representing funnel)
  fallbacks.push({
    chartId: `${id}-chart-4`,
    chartName: `全链路断点填补漏斗对比分析`,
    chartType: 'grouped-bar',
    beforeAfter: true,
    dimensions: ['自然进站/曝光', '深意向/交互', '提单/历史数据沉淀意向', '收割/最终支付'],
    beforeData: [100, rnd(12, 20, 51), rnd(5, 9, 52), rnd(1, 3, 53)],
    afterData: [100, rnd(25, 35, 54), rnd(15, 22, 55), rnd(5, 8, 56)],
    unit: ['%', '%', '%', '%'],
    chartDescription: `原本阻塞断流的核心环节被逐一疏通打透，整体漏斗到底层收割环节的转化率有了明显拉升成倍。`
  });

  // 图表5：瀑布图/增量拆解图 (waterfall)
  const baseV = rnd(50, 150, 31);
  const positiveA = rnd(30, 60, 32);
  const positiveB = rnd(20, 45, 33);
  const negativeC = rnd(5, 15, 34);
  fallbacks.push({
    chartId: `${id}-chart-5`,
    chartName: `增量收益及损耗拆分解构 (${unitStr})`,
    chartType: 'waterfall',
    baseValue: baseV,
    components: [
      { name: '新策略引擎红利', value: positiveA, type: 'positive' },
      { name: '沉没成本止损回收', value: positiveB, type: 'positive' },
      { name: '初期架构测试磨损', value: -negativeC, type: 'negative' }
    ],
    finalValue: baseV + positiveA + positiveB - negativeC,
    chartDescription: `基盘${baseV}${unitStr}的情况下，抓出${positiveA + positiveB}绝对净增长潜力，扣除微弱阵痛磨损${negativeC}后，录得全面胜利。`
  });

  return fallbacks;
}

export const mockChartsMapping: Record<string, ChartConfig[]> = {
  's1': [
    {
      chartId: 's1-1',
      chartName: '核心指标前后对比（实施前3个月 vs 实施后3个月）',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['大促综合ROI', 'VVIP流失率', '短信点击率', '高价值用户复购', '综合毛利率'],
      beforeData: [2.0, 18, 0.8, 100, 100],
      afterData: [3.0, 6, 3.5, 132, 150],
      unit: ['倍', '%', '%', '基准指数', '基准指数'],
      chartDescription: '实施前后3个月大盘指标对比：VVIP流失率从18%有效压降至6%，大促综合ROI从1:2.0攀升至1:3.0，毛利拉高50%。'
    },
    {
      chartId: 's1-2',
      chartName: '核心ROI趋势与干预节点',
      chartType: 'dual-line',
      beforeAfter: true,
      xAxis: '时间周期 (T轴)',
      yAxis: '营销ROI产出比',
      baselineTrend: [2.0, 2.0, 1.9, 1.8, 1.8, 1.7, 1.7],
      afterTrend: [2.0, 2.0, 2.2, 2.5, 2.8, 2.9, 3.0],
      chartDescription: '在标签体系上线并逐步灰度、全量铺开后（图中发散点），营销ROI一路从疲软的2.0稳健拉升突破并站稳3.0高位。'
    },
    {
      chartId: 's1-3',
      chartName: '用户分层结构变迁对比图',
      chartType: 'dual-pie',
      beforeAfter: true,
      categories: ['VVIP', '高价值', '中等价值', '低价值', '羊毛党', '沉睡群体'],
      beforeDistribution: [8, 12, 20, 15, 35, 10],
      afterDistribution: [10, 18, 25, 18, 10, 19],
      chartDescription: '通过精准截断无脑补贴，羊毛党占比从高达35%迅速萎缩至10%，让出的资源有效培育了高价值人群（从12%扩大至18%）。'
    },
    {
      chartId: 's1-4',
      chartName: '增量利润归因拆解瀑布图',
      chartType: 'waterfall',
      baseValue: 100,
      components: [
        { name: '高价值大客留存', value: 60, type: 'positive' },
        { name: '核心复购力提升', value: 40, type: 'positive' },
        { name: '削减羊毛党补贴', value: 50, type: 'positive' },
        { name: '运维与短息重构成本', value: -20, type: 'negative' }
      ],
      finalValue: 230,
      chartDescription: '拆解证实：从100万基准利润出发，高忠诚客群和羊毛资源释放成为了增长最核心的三点，最终净利润飙升至230万（增幅130%）。'
    }
  ],
  'c1': [
    {
      chartId: 'c1-1',
      chartName: '关键转化指标下跌前后对比',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['新用户首单转化率', 'iOS首单转化', 'Android首单转化', '次日留存率'],
      beforeData: [18, 19, 17, 45],
      afterData: [6, 2, 17, 30],
      unit: ['%', '%', '%', '%'],
      chartDescription: '整体转化率由18%骤降至6%，其中iOS端从19%跌至2%，而Android端未受影响保持17%，定位到iOS版本更新存在强相关BUG。'
    },
    {
      chartId: 'c1-2',
      chartName: 'iOS端转化漏斗拆解 (实施前 vs 实施后)',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['安装成功', '启动APP', '注册登录', '浏览商品', '加购', '成功支付'],
      beforeData: [100, 95, 80, 60, 45, 19],
      afterData: [100, 90, 8, 5, 3, 2],
      unit: ['%', '%', '%', '%', '%', '%'],
      chartDescription: '漏斗分析生动指出，在"启动APP"至"注册登录"环节，新版本产生了90% -> 8%的极高阻断式流失，确定是弹窗授权逻辑缺陷。'
    },
    {
      chartId: 'c1-3',
      chartName: 'BUG引发的大盘财务蒸发剖析',
      chartType: 'waterfall',
      baseValue: 850,
      components: [
        { name: 'iOS新入库正常交易预估损失', value: -450, type: 'negative' },
        { name: '因阻塞带来的投放沉没成本', value: -120, type: 'negative' },
        { name: 'Android端勉力支撑微增', value: 30, type: 'positive' }
      ],
      finalValue: 310,
      chartDescription: '从850万基盘跌至310万：iOS端崩盘直接抹去450万的收入，同时导致外部拉新投放费用120万全部打水漂。'
    }
  ],
  'c2': [
    {
      chartId: 'c2-1',
      chartName: '核心复购率指标变幻',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['大促期间总体复购', '大促后常态复购率', '高价值长期复购', '大额券依赖型复购'],
      beforeData: [65, 30, 40, 25],
      afterData: [75, 12, 40, 10],
      unit: ['%', '%', '%', '%'],
      chartDescription: '大量"羊毛党"集中在大促期间薅羊毛提振了当期复购率，但随即脱离诱惑，导致自然常态复购基盘由30%跌至12%。'
    },
    {
      chartId: 'c2-2',
      chartName: '促活活动前后用户画像构成演变',
      chartType: 'dual-pie',
      beforeAfter: true,
      categories: ['高忠诚度用户', '常规促活用户', '尝鲜新客', '极端羊毛党'],
      beforeDistribution: [20, 45, 20, 15],
      afterDistribution: [15, 30, 10, 45],
      chartDescription: '羊毛党占比从大促前的15%迅速膨胀至45%，严重稀释了用户池质量，更挤占了原本属于高价值客户的各种服务带宽。'
    },
    {
      chartId: 'c2-3',
      chartName: '羊毛党生命活跃与收益流逝时序追踪',
      chartType: 'dual-line',
      beforeAfter: true,
      xAxis: '促发后时间线(周)',
      yAxis: '留存与复购活跃指数',
      baselineTrend: [100, 95, 90, 85, 80, 75],
      afterTrend: [100, 45, 15, 5, 2, 1],
      chartDescription: '薅完即走：正常忠诚用户（灰色）能保持平缓复购，而靠大促吸引的羊毛党（绿色）在第二周就彻底死亡（15%），严重。'
    }
  ],
  'c3': [
    {
      chartId: 'c3-1',
      chartName: 'AB试炼指标反向反馈对比',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['最终点击转化率', '完成注册率', '核心路径耗时(s)', '退出率'],
      beforeData: [15, 15, 12, 10],
      afterData: [12, 12, 28, 25],
      unit: ['%', '%', 's', '%'],
      chartDescription: '设计旨在提升转化率的新版本（A组），核心路径耗时加倍且退出率暴涨至25%，最终转化率反而缩水超20%。'
    },
    {
      chartId: 'c3-2',
      chartName: '页面层级留存滑落追踪',
      chartType: 'dual-line',
      beforeAfter: true,
      xAxis: '访问深浅度',
      yAxis: '留存比率(%)',
      baselineTrend: [100, 80, 60, 45, 35, 25],
      afterTrend: [100, 95, 85, 20, 15, 12],
      chartDescription: '新版本在首首两屏靠前引流视觉吸引住了流量，但在弹窗打断后(深度阶4)留存直线坠落至20%，暴露交互雷区。'
    },
    {
      chartId: 'c3-3',
      chartName: 'AB试炼错误导致的机会损失剥离',
      chartType: 'waterfall',
      baseValue: 500,
      components: [
        { name: '新功能预期增加收入', value: 80, type: 'positive' },
        { name: '页面阻塞导致跳出率翻倍损失', value: -220, type: 'negative' },
        { name: '支付成功率附带受损', value: -45, type: 'negative' }
      ],
      finalValue: 315,
      chartDescription: '原本指望通过新改版增加80万收入，但因为路径冗长导致跳出狂飙，净冲减后不仅没赚，还倒亏近200万大盘。'
    }
  ],
  'c4': [
    {
      chartId: 'c4-1',
      chartName: '全端业务漏斗大盘基准变异',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['支付成功率', '日均客单层级', '日均进站UV（千）'],
      beforeData: [3.3, 160, 550],
      afterData: [3.2, 158, 300],
      unit: ['%', '元', 'k'],
      chartDescription: '事件实施界限前后核心KPI比对：客单价与支付顺畅度几无波澜，但入口UV暴降将近一半直接摧毁GMV产出大盘。'
    },
    {
      chartId: 'c4-2',
      chartName: '事件干预前后GMV宏观趋势',
      chartType: 'dual-line',
      beforeAfter: true,
      xAxis: '事件推进时刻',
      yAxis: 'GMV产能（万）',
      timeRange: '事件前溯及后续推进',
      interventionPoint: '政策硬切换点',
      beforeTrend: [250, 248, 260, 280, 275, 278, 280],
      afterTrend: [250, 248, 260, 280, 190, 210, 230],
      baselineTrend: [250, 248, 260, 280, 275, 278, 280],
      annotations: ['归因链崩塌', '预算转投'],
      chartDescription: '在政策发布并强干涉切换时点(图中骤降点)，系统在归因断链时直接停止放量，随后人为干预才缓慢震荡向上爬升。'
    },
    {
      chartId: 'c4-3',
      chartName: '指标崩盘要因乘法隔离图',
      chartType: 'waterfall',
      baseValue: 280,
      components: [
        {"name": "入口人流腰斩(UV)", "value": -85, "type": "negative"},
        {"name": "支付意愿微调(CVR)", "value": -3, "type": "negative"},
        {"name": "购买单均力微降", "value": -2, "type": "negative"}
      ],
      finalValue: 190,
      chartDescription: '拆解显示，此番从280万元防线崩溃至190万，85万元的资金血本完全是由入口端流量阻断所吞噬。'
    }
  ],
  'c5': [
    {
      chartId: 'c5-1',
      chartName: '前端负担加重引发的数据警报',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['日均流失活跃量', '首屏可用渲染期(s)', '无交互白屏期(s)'],
      beforeData: [8000, 1.2, 0.5],
      afterData: [26000, 3.8, 2.8],
      unit: ['单用户/天', 's', 's'],
      chartDescription: '重量级新特性上线的同时伴随了庞大的静态物料下载负担，导致应用核心白屏耗时直超容忍阈值，造就没有尽头的流失。'
    },
    {
      chartId: 'c5-2',
      chartName: '机型前端加载耗时恶化分布',
      chartType: 'dual-line',
      beforeAfter: true,
      xAxis: '机型性能分级(从差到优)',
      yAxis: '完整渲染时间(s)',
      baselineTrend: [4.5, 3.2, 2.1, 1.5, 1.2, 0.8],
      afterTrend: [12.5, 8.2, 5.5, 3.8, 2.4, 1.5],
      chartDescription: '细分后发现：灾难不仅发生在高端机，低端下沉机型（最左侧）的渲染耗时甚至突破12秒，彻底被新版本抛弃。'
    }
  ],
  'c6': [
    {
      chartId: 'c6-1',
      chartName: '单客财务核算成本分摊',
      chartType: 'waterfall',
      baseValue: 0,
      components: [
        {"name": "收取基础会员费", "value": 150, "type": "positive"},
        {"name": "跨期发券抵扣损耗", "value": -85, "type": "negative"},
        {"name": "客服专属通道成本", "value": -40, "type": "negative"},
        {"name": "包邮刚性物流费", "value": -60, "type": "negative"}
      ],
      finalValue: -35,
      chartDescription: '表面光鲜亮丽的高额会员群收，实则在分摊多重无底洞权益后，导致企业每拓荒一名大客户就意味着账面深陷-35元的泥沼。'
    },
    {
      chartId: 'c6-2',
      chartName: '会员与非会员净贡献率倒挂',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['订单客单毛利', '人均年化复购率', '刨除权益后净贡献率'],
      beforeData: [45, 8, 12],
      afterData: [32, 22, -5],
      unit: ['元', '次', '%'],
      chartDescription: '对比非会员（灰色）与会员（绿色）：尽管会员复购狂飙至22次，但巨额权益消耗使其净收益率跌破零轴变为倒贴的-5%。'
    }
  ],
  'c7': [
    {
      chartId: 'c7-1',
      chartName: '病态裂变的量质反差扫描',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['人均助力拉新数', '点击注册转化率', '产生复购用户率', '欺诈风险判定率'],
      beforeData: [1.2, 30, 8, 2],
      afterData: [15.5, 92, 0.5, 45],
      unit: ['人', '%', '%', '%'],
      chartDescription: '病毒式裂变造就了虚假狂欢：活动周期拉新指标爆炸，但转化到实际购买及次日的存活被机器挤压到不足0.5%。'
    },
    {
      chartId: 'c7-2',
      chartName: '裂变漏斗逐层留存',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['获得助力曝光', '授权注册', '领奖动作', '首次流水提取'],
      beforeData: [100, 45, 30, 15],
      afterData: [100, 85, 80, 0.5],
      unit: ['%', '%', '%', '%'],
      chartDescription: '常规邀请（灰色）保持正常的漏斗；而病态裂变（绿色）虽然80%为了领奖注册，但产生流水的不到0.5%。'
    }
  ],
  'c8': [
    {
      chartId: 'c8-1',
      chartName: '促销骤停前后的休止曲线',
      chartType: 'dual-line',
      beforeAfter: true,
      xAxis: '促销大盘干预时段',
      yAxis: '价格敏感型UV留存指数',
      baselineTrend: [100, 100, 100, 100, 100, 100],
      afterTrend: [100, 85, 60, 40, 20, 10],
      chartDescription: '彻底关停疯狂发券活动后，该单一型特征库用户的生命力指数直线狂泻，半月内彻底从库中沉睡。'
    },
    {
      chartId: 'c8-2',
      chartName: '干预对客单与利润的拉压',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['大盘总UV活跃度', '实售连带客单价', '整体订单净毛利率'],
      beforeData: [150, 45, 12],
      afterData: [85, 95, 32],
      unit: ['万', '元', '%'],
      chartDescription: '停促牺牲了近乎一半的虚拟活跃流量（150万→85万），但换来了真实客单价翻倍与净毛利爬升至32%。'
    }
  ],
  'c9': [
    {
      chartId: 'c9-1',
      chartName: '受众强洗后的审美疲劳效应',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['活动展示触达率', '有效商品加购率', '最后阶段支付转化率'],
      beforeData: [18.5, 12.0, 4.5],
      afterData: [8.1, 4.0, 1.2],
      unit: ['%', '%', '%'],
      chartDescription: '首波高强度促销已经抽光了下沉市场的购买预期，返场所面临的尽是疲惫不堪、加购和转化一落千丈的疲软残次流量。'
    },
    {
      chartId: 'c9-2',
      chartName: '二次触达同质化信息免疫',
      chartType: 'dual-line',
      beforeAfter: true,
      xAxis: '第N次同类型促销推送',
      yAxis: '营销短信带回UV',
      baselineTrend: [500, 480, 450, 420, 400, 380],
      afterTrend: [500, 300, 150, 50, 10, 2],
      chartDescription: '对于同一群落，连续发起无聊的平庸特降导致建立超强免疫抗体（绿色），第4次推送基本不再带来回流。'
    }
  ],
  'c10': [
    {
      chartId: 'c10-1',
      chartName: '巅峰交易阻塞下的灾难性指标',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['预先支付宕机率', '服饰全量退货率', '营销大盘达成率'],
      beforeData: [1.5, 20, 95],
      afterData: [8.5, 38, 70],
      unit: ['%', '%', '%'],
      chartDescription: '后端基础算力的不足让支付彻底崩溃拥堵致8.5%的卡单，同时长周期的冲动盲目预购催生了超乎预期的38%惊人退单洪流。'
    },
    {
      chartId: 'c10-2',
      chartName: '百亿大盘实物财富解构流失',
      chartType: 'waterfall',
      baseValue: 1000,
      components: [
        {"name": "预热分众流量缺失", "value": -40, "type": "negative"},
        {"name": "支付系统崩溃卡单", "value": -70, "type": "negative"},
        {"name": "服饰仓配发货超期退单", "value": -110, "type": "negative"},
        {"name": "小家电意外超卖反补", "value": 60, "type": "positive"}
      ],
      finalValue: 840,
      chartDescription: '目标剑指千亿基石的野望，却由于基建软肋痛失超过180的交易大门。系统级崩溃直接击穿预期。'
    }
  ],

  's2': [
    {
      chartId: 's2-1',
      chartName: '大盘老用户流失率强阻截对比',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['30天自然流失率', '高价值沉睡率', '触达召回成功率'],
      beforeData: [22, 18, 5],
      afterData: [7, 5, 28],
      unit: ['%', '%', '%'],
      chartDescription: '实施防流失干预后，大盘老用户流失率被极限压降（22%→7%），同时黄金窗口期的挽回成功率呈指数级跃升。'
    },
    {
      chartId: 's2-2',
      chartName: '高危用户挽回生命周期追踪',
      chartType: 'dual-line',
      beforeAfter: true,
      xAxis: '预警干预后天数',
      yAxis: '召回用户留存活跃度',
      baselineTrend: [100, 40, 20, 10, 5, 2, 0],
      afterTrend: [100, 85, 75, 68, 60, 58, 55],
      chartDescription: '未精准干预前（灰色），即便靠短信召回也会在3天内死透；通过体系化干预（绿色），召回客群能实现长效活跃维系。'
    },
    {
      chartId: 's2-3',
      chartName: '流失漏斗前置拦截效能',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['活跃期', '首现疲态期(干预点)', '临界流失期', '彻底流亡期'],
      beforeData: [100, 80, 50, 15],
      afterData: [100, 88, 85, 82],
      unit: ['%', '%', '%', '%'],
      chartDescription: '通过前置模型在"首现疲态期"下场拦截，成功截断了用户向下滑底的趋势，避免滑入无法挽留的死局。'
    },
    {
      chartId: 's2-4',
      chartName: '挽回战略带来的财务利润净增拆解',
      chartType: 'waterfall',
      baseValue: 0,
      components: [
        { name: '阻止高价值客流失止损', value: 350, type: 'positive' },
        { name: '流失客群被召回复购红利', value: 120, type: 'positive' },
        { name: '模型测算与特权派发成本', value: -45, type: 'negative' }
      ],
      finalValue: 425,
      chartDescription: '防守就是最好的进攻。成功阻止流失带来的止损和召回调动，扣除干预成本后，为大盘锁定425万的净利润增量。'
    }
  ],
  's3': [
    {
      chartId: 's3-1',
      chartName: '细粒度漏斗层级断点修复全案',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['外媒进站', '核心商详页', '意向加购', '收银台提单', '最终支付'],
      beforeData: [100, 45, 12, 5, 2.1],
      afterData: [100, 75, 28, 15, 8.5],
      unit: ['%', '%', '%', '%', '%'],
      chartDescription: '针对商详页到加购、提单到收银的两大世纪断层进行UI/重构强干预，最终全链路转化率实现了2.1%至8.5%的惊天跨越。'
    },
    {
      chartId: 's3-2',
      chartName: '核心路径流转耗时大幅瘦身',
      chartType: 'dual-line',
      beforeAfter: true,
      xAxis: '交易推进层级',
      yAxis: '每步平均停留阻力耗时(s)',
      baselineTrend: [12, 45, 30, 25, 18],
      afterTrend: [8, 15, 10, 5, 3],
      chartDescription: '断点排位消除后，原本晦涩难懂的UI确认路径被抹平，用户完成决策耗时极限压缩，一泻千里直达交易底。'
    },
    {
      chartId: 's3-3',
      chartName: '弃单用户真实阻力要因拆解',
      chartType: 'dual-pie',
      beforeAfter: true,
      categories: ['商品描述不清', '对运费不满', '支付组件报错', '被竞品分流', '正常对比放弃'],
      beforeDistribution: [25, 30, 18, 12, 15],
      afterDistribution: [5, 10, 2, 18, 65],
      chartDescription: '填平坑洼后，原先由于系统缺陷或业务不明导致的非自然流失被压缩殆尽，现在大部分流失回归到用户合理比价行为。'
    },
    {
      chartId: 's3-4',
      chartName: '全链路转化提升点对大盘GMV的增益拆解',
      chartType: 'waterfall',
      baseValue: 1200,
      components: [
        { name: '商详页可见度改善', value: 180, type: 'positive' },
        { name: '加购按钮缩短动线', value: 240, type: 'positive' },
        { name: '无缝支付兜底通道接入', value: 310, type: 'positive' }
      ],
      finalValue: 1930,
      chartDescription: '单点转化的提升汇聚成海：支付兜底和加购动线的优化贡献最大，将原1200万大盘托举至1930万元的崭新高度。'
    }
  ],
  's4': [
    {
      chartId: 's4-1',
      chartName: '智能定价前后大盘综合指标对比',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['综合订单转化率', '爆款溢价率', '长尾死库存周转'],
      beforeData: [3.5, 8, 15],
      afterData: [6.8, 35, 185],
      unit: ['%', '%', '%'],
      chartDescription: '动态弹性测度下：高弹性长尾货疯狂抛售促成周转升185%，同时低弹爆款利用绑定暗涨锁死35%超额红利，带动转化跃升。'
    },
    {
      chartId: 's4-2',
      chartName: '日均净利润与销量的高频震荡追踪',
      chartType: 'dual-line',
      beforeAfter: true,
      xAxis: '智能监控天长(d)',
      yAxis: '大盘纯利指数(万)',
      baselineTrend: [80, 82, 78, 85, 80, 75, 79],
      afterTrend: [80, 95, 110, 105, 135, 140, 155],
      chartDescription: '告别一刀切后（灰色线平庸），系统依据高频波动每日极速微调价格（绿线），在不断上探边界中稳吃每一分超额利润差。'
    },
    {
      chartId: 's4-3',
      chartName: '大盘首日GMV构成商品结构反转',
      chartType: 'dual-pie',
      beforeAfter: true,
      categories: ['极低频长尾商品', '腰部常规商品', '头部金牛商品', '高损耗引流款'],
      beforeDistribution: [5, 25, 40, 30],
      afterDistribution: [20, 35, 40, 5],
      chartDescription: '亏本引流款由30%大幅压降至5%，且原先毫无动静的长尾品彻底被盘活贡献了20%销售占比，品类利润厚度极度健康。'
    },
    {
      chartId: 's4-4',
      chartName: '促销干预矩阵对最终利润的影响拆解',
      chartType: 'waterfall',
      baseValue: 100,
      components: [
        { name: '头部爆款阶梯提价增盈', value: 45, type: 'positive' },
        { name: '死库存清理甩杂回流', value: 30, type: 'positive' },
        { name: '价格组合满减测试耗散', value: -15, type: 'negative' }
      ],
      finalValue: 160,
      chartDescription: '以100的大盘毛利为原点：虽然牺牲了部分中腰部利润试探边界(-15)，但这使得精算利润被整体托举到160的新高地。'
    }
  ],
  's5': [
    {
      chartId: 's5-1',
      chartName: '双引擎拉新效益与成本核心比对',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['获客成本CAC(元)', '首单后30天复购(%)', '新增流量中裂变比(%)'],
      beforeData: [120, 12, 15],
      afterData: [35, 45, 75],
      unit: ['', '', ''],
      chartDescription: '实施社交博弈模型驱动后：使得单客获取成本从120元暴跌至35元，同时熟人链引入的长线复购反倒跃升至45%。'
    },
    {
      chartId: 's5-2',
      chartName: '病毒破圈系数(K-Factor)爬升走势',
      chartType: 'dual-line',
      beforeAfter: true,
      xAxis: '活动裂变深水周次',
      yAxis: '扩散K因子(>1为爆发)',
      baselineTrend: [0.2, 0.2, 0.2, 0.15, 0.1, 0.1],
      afterTrend: [0.5, 0.9, 1.5, 2.8, 4.5, 7.2],
      chartDescription: '常规平庸活动（灰色）毫无波澜；新策在第三周势能破壁（K>1），引发核能级超指数裂变，全面席卷下沉防线。'
    },
    {
      chartId: 's5-3',
      chartName: '裂变大漏斗层级效能对位',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['好友点击曝光', '同意授权注册', '首单极速转化', '二次带新邀约'],
      beforeData: [100, 35, 5, 1],
      afterData: [100, 85, 30, 12],
      unit: ['%', '%', '%', '%'],
      chartDescription: '以无与伦比的诱饵+顺滑流程，漏斗被极限撑大：注册连带首单率逼近3成，老带新再裂变率轻松突破10%。'
    },
    {
      chartId: 's5-4',
      chartName: '拉新入网客群质量阵营变化',
      chartType: 'dual-pie',
      beforeAfter: true,
      categories: ['高黏性长尾分享客', '一般活跃随大流者', '全职薅羊毛机器大军'],
      beforeDistribution: [10, 30, 60],
      afterDistribution: [55, 35, 10],
      chartDescription: '严苛的防刷天网兜底：硬生生把以前被60%羊毛党占领的高压锅池沼，逆转为55%高质量的真实小镇社群人脉网。'
    }
  ],
  's6': [
    {
      chartId: 's6-1',
      chartName: '极端造节引流核心转化与大盘倍数',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['日GMV瞬时极倍数', '单日客单价涨幅(元)', '高意向大额锁单率'],
      beforeData: [1.2, 120, 5],
      afterData: [8.5, 280, 38],
      unit: ['倍', '元', '%'],
      chartDescription: '无中生有打造专属"超级品牌日"：单日流量峰值直接飙出8倍溢流，狂热情绪推高连带客单斩获280元高位。'
    },
    {
      chartId: 's6-2',
      chartName: '造节周期(预售到爆发)日营收轨迹',
      chartType: 'dual-line',
      beforeAfter: true,
      xAxis: '活动大日程段位',
      yAxis: '流水规模势能(万)',
      baselineTrend: [150, 140, 160, 150, 155, 160, 150],
      afterTrend: [150, 120, 100, 80, 60, 1800, 300],
      chartDescription: '极限蓄水法：大促前通过让冷期（营收承压降至60）换取开闸爆发日（图中峰值）1800万的惊天泄洪巨潮。'
    },
    {
      chartId: 's6-3',
      chartName: '节战前置漏斗之极致收网留存对比',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['大宣发进水曝光', '下定金意向率', '补齐巨额尾款率', '大促后30日复购'],
      beforeData: [100, 5, 2, 1],
      afterData: [100, 35, 32, 18],
      unit: ['基线', '%', '%', '%'],
      chartDescription: '利用强绑定的定金制锁定认知，定金并没有产生劝退，反而让交了钱的用户高达32%支付了全款完成转化。'
    },
    {
      chartId: 's6-4',
      chartName: '大促狂欢峰值增效大底盘贡献解构',
      chartType: 'waterfall',
      baseValue: 150,
      components: [
        { name: '极度预热锁单爆流', value: 850, type: 'positive' },
        { name: '直播间空降豪客潮', value: 450, type: 'positive' },
        { name: '满减使得大盘纯利让血', value: -120, type: 'negative' }
      ],
      finalValue: 1330,
      chartDescription: '由150基准起跳，预热锁单与直播为主战区提供了碾压般的贡献，即便扣除了发券补贴流血，整体依然成就惊天量级。'
    }
  ],
  's7': [
    {
      chartId: 's7-1',
      chartName: '极速跟进战下的大盘市占与生存底线',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['核心竞品重合市占率', '价格攻防拦截成功率', '拦截单次出击耗资(元)'],
      beforeData: [26, 12, 1500],
      afterData: [38, 92, 120],
      unit: ['%', '%', ''],
      chartDescription: '极敏雷达驱动：原本挨打防守反击夺回12%盘面市占，更将大炮打蚊子的无脑跟进成本单次从1500降至120。'
    },
    {
      chartId: 's7-2',
      chartName: '突发警情下的毫秒级同频绞杀时滞',
      chartType: 'dual-line',
      beforeAfter: true,
      xAxis: '突发竞价波次演练',
      yAxis: '调价拦截时差(分钟)',
      baselineTrend: [1440, 2880, 1440, 4320, 1440, 2880],
      afterTrend: [2, 5, 1, 3, 2, 1],
      chartDescription: '以前一旦遇友商偷袭，层层上报耗时几千分钟（灰色）；现自动情报中心直接将其秒杀在2分钟内（绿色），斩断一切图谋。'
    },
    {
      chartId: 's7-3',
      chartName: '竞对交战期份额争夺抢占矩阵构成',
      chartType: 'dual-pie',
      beforeAfter: true,
      categories: ['死忠我方防火墙壁垒客', '对家死忠不可转客', '游离比价骑墙派', '极易受低价勾引客'],
      beforeDistribution: [25, 30, 20, 25],
      afterDistribution: [35, 25, 30, 10],
      chartDescription: '成功策反：不仅死守住自身基本盘（涨至35%），更把游离的比价群压制入自己漏斗，对方死忠盘也被撬松。'
    },
    {
      chartId: 's7-4',
      chartName: '商战攻防总核算之纯水保卫录',
      chartType: 'waterfall',
      baseValue: 0,
      components: [
        { name: '阻止客源外崩挽救资产', value: 800, type: 'positive' },
        { name: '奇袭对家盲区抢客收益', value: 420, type: 'positive' },
        { name: '机器自动烧券抗价损耗', value: -150, type: 'negative' }
      ],
      finalValue: 1070,
      chartDescription: '攻守之势异也。依靠预判反制止损大盘800万，再掏对家底仓420万；对抗烧券仅损150万，全面斩获胜局红利。'
    }
  ],

  'm1': [
    {
      chartId: 'm1-1',
      chartName: '经典理论于混沌业态的分层解构透视',
      chartType: 'dual-pie',
      beforeAfter: true,
      categories: ['一类金字塔尖', '高潜发酵层', '游移可唤醒层', '纯无感休克地带', '羊毛投机集散地'],
      beforeDistribution: [10, 15, 10, 25, 40],
      afterDistribution: [25, 25, 18, 12, 20],
      chartDescription: '长达半年的RFM三维矩阵洗礼下，混沌一片的烂摊用户逐步升华，投机分层被有效压制，基石堡垒彻底建成。'
    },
    {
      chartId: 'm1-2',
      chartName: '矩阵体系引航下的人均产出阶梯攀登',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['头腰部单客季产出', '新进粉激活效能', '被动历史数据沉淀期激活率'],
      beforeData: [150, 5, 2],
      afterData: [450, 45, 15],
      unit: ['元', '%', '%'],
      chartDescription: '理论在实操中绽放：精雕细琢带来了头腰部战力的3倍放大，原本沉寂的新手死水被彻底盘活至45%的激活奇迹。'
    }
  ],
  'm2': [
    {
      chartId: 'm2-1',
      chartName: '指标宏脉冲动的全量化切片溯源展示',
      chartType: 'waterfall',
      baseValue: 650,
      components: [
        {"name": "外部获客引擎停转恶果", "value": -180, "type": "negative"},
        {"name": "站内搜索点击动线优化", "value": 45, "type": "positive"},
        {"name": "组合套系逼定策略成功附加", "value": 15, "type": "positive"}
      ],
      finalValue: 530,
      chartDescription: '针对大盘下坠实施因子解剖，外部环境掐断供血导致崩塌无可挽过，即便站内外围细节极力提振亦杯水车薪。'
    },
    {
      chartId: 'm2-2',
      chartName: '宏微观推演干预对赌盘底大横评',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['内生自转流量转化', '客诉及物流断点挽回', '全站整体崩盘率'],
      beforeData: [12, 10, 35],
      afterData: [15, 45, 15],
      unit: ['%', '%', '%'],
      chartDescription: '细微之处的堵漏虽不能撼动大势，但也成功把客诉断点拦截在站内（挽回率10%→45%），迫使大盘崩盘速度悬崖勒马（降至15%）。'
    }
  ],
  'm3': [
    {
      chartId: 'm3-1',
      chartName: '用户断头台的留存漏斗剖面',
      chartType: 'grouped-bar',
      beforeAfter: true,
      dimensions: ['自然进港', '激活账号', '核心操作节点X', '核心价值收获', '跨日回访'],
      beforeData: [100, 85, 30, 25, 15],
      afterData: [100, 92, 85, 70, 55],
      unit: ['%', '%', '%', '%', '%'],
      chartDescription: '群组队列模型下强打【特征交互点】，新产品将历史中极为致命的三阶台阶(横跨度断裂由85 -> 30)彻底抹平至顺滑下探，确保存活率爆发。'
    },
    {
      chartId: 'm3-2',
      chartName: '极化群组长效留存生命力分岔口',
      chartType: 'dual-line',
      beforeAfter: true,
      xAxis: '安装后生命周期(周)',
      yAxis: '同期群落留存指征(%)',
      baselineTrend: [100, 45, 25, 18, 12, 10, 8],
      afterTrend: [100, 85, 75, 68, 65, 64, 62],
      chartDescription: '完成"Ah-ha"引爆点干预的群组留存（绿色线），彻底抛弃了未受干预组（灰色）的跳水宿命，在高位形成坚挺的复购平原。'
    }
  ]
};
