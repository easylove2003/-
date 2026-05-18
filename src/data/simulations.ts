// simulations.ts
export interface Simulation {
  id: string;
  name?: string;
  title?: string;
  scenario: string;
  difficulty: string;
  businessBackground?: string;
  dataDescription?: string;
  tags?: string[];
  dataProvided?: string[];
  requiredQuestions: (string | { question: string; evaluationPoints?: string })[];
  optionalQuestions?: { question: string; hint: string }[];
  analysisGuidance?: string;
  referenceAnswer?: {
    analysisProcess: string;
    coreFindings: string;
    conclusion: string;
    recommendations: string;
    juniorExpectation: string;
    seniorExpectation: string;
  };
  expectedJuniorAnswer?: string;
  expectedSeniorAnswer?: string;
}

// 模拟训练题数据（暂未启用，预留给未来"分析师陪练"功能）
// 接口已被 mock.ts 通过 type Simulation 重新导出，删除前请确认无外部引用
export const simulations: Simulation[] = [];
