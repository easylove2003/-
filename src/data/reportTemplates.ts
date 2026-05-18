export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: { id: number; title: string; hint: string }[];
  isBuiltIn?: boolean;
}

export const BUILTIN_TEMPLATES: ReportTemplate[] = [
  {
    id: 'standard_bi',
    name: '标准 BI 蓝图（7 段）',
    description: '通用电商场景，覆盖资产识别 → 看板 → 策略',
    isBuiltIn: true,
    sections: [
      { id: 1, title: '数据资产识别', hint: '识别字段语义、数据粒度、时间范围' },
      { id: 2, title: '业务场景判断', hint: '推断这份数据属于哪个电商业务环节' },
      { id: 3, title: '数据质量评估', hint: '空值、唯一值、异常值、TOP3 风险' },
      { id: 4, title: '字段语义模型', hint: '逐字段输出物理类型/逻辑角色/业务含义' },
      { id: 5, title: '核心指标体系', hint: '规模/效率/质量/结构四类指标，含可计算性' },
      { id: 6, title: '看板布局与图表', hint: '推荐看板模块结构与图表配置' },
      { id: 7, title: '关键业务洞察与策略', hint: 'ICE 评分驱动的 P0/P1/P2 行动建议' },
    ]
  },
  {
    id: 'crossborder',
    name: '跨境电商专版',
    description: '聚焦物流、退款、区域、选品',
    isBuiltIn: true,
    sections: [
      { id: 1, title: '订单与 GMV 概览', hint: '总单量、GMV、客单价、SKU 数' },
      { id: 2, title: '区域市场分布', hint: '按国家/地区拆解订单量与销售额，识别 TOP 5 与潜力市场' },
      { id: 3, title: '物流与时效诊断', hint: '平均时效、超时率、各物流商对比' },
      { id: 4, title: '退款与售后风险', hint: '退款率、退款原因 TOP 5、对应 SKU' },
      { id: 5, title: '选品与库存策略', hint: '爆款/滞销分类，补货/清仓建议' },
      { id: 6, title: '关键业务洞察与行动', hint: 'P0/P1/P2 行动建议' },
    ]
  },
  {
    id: 'user_growth',
    name: '用户增长专版',
    description: '聚焦获客、激活、留存、复购',
    isBuiltIn: true,
    sections: [
      { id: 1, title: '用户规模与新增', hint: '总用户、新增、活跃 DAU/MAU' },
      { id: 2, title: '渠道与获客成本', hint: '各渠道引流、CPA、ROAS' },
      { id: 3, title: '激活与首单转化', hint: '注册→首单漏斗，关键流失节点' },
      { id: 4, title: '留存与复购', hint: '次日/7 日/30 日留存、复购率、回购周期' },
      { id: 5, title: '用户分层与 RFM', hint: 'RFM 分群占比、各群价值贡献' },
      { id: 6, title: '增长策略建议', hint: 'P0/P1/P2 行动建议' },
    ]
  }
];

const STORAGE_KEY = 'dc_user_report_templates_v1';

export function loadUserTemplates(): ReportTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveUserTemplate(tpl: ReportTemplate): void {
  const list = loadUserTemplates().filter(t => t.id !== tpl.id);
  list.push({ ...tpl, isBuiltIn: false });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function deleteUserTemplate(id: string): void {
  const list = loadUserTemplates().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function listAllTemplates(): ReportTemplate[] {
  return [...BUILTIN_TEMPLATES, ...loadUserTemplates()];
}
