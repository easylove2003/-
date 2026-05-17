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

export const simulations: Simulation[] = [];
