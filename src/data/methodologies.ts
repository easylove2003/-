import type { ChartConfig } from './cases';

export interface Methodology {
  id: string;
  name?: string;
  title?: string;
  englishName?: string;
  oneLineDefinition?: string;
  category: string;
  coreConcept?: string;
  summary?: string;
  applicableScenarios?: string;
  goal?: string;
  steps?: any[];
  realExample?: string;
  commonMistakes?: any[];
  pitfalls?: string[];
  advancedTips?: any;
  mentorChecklist?: string[];
  relatedCases?: string[];
  relatedStrategies?: string[];
  visualizationPlan?: any;
  solutions?: string[];
  charts?: ChartConfig[];
}

export const methodologies: Methodology[] = [];

