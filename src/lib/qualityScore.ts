import { quantile } from 'simple-statistics';

export interface QualityResult {
  completeness: number;
  consistency: number;
  sufficiency: number;
  overall: number;
  lowConfidenceReasons: string[];
}

export function calculateQualityScore(data: any[]): QualityResult {
  const lowConfidenceReasons: string[] = [];
  if (!data || data.length === 0) {
    return { completeness: 0, consistency: 0, sufficiency: 0, overall: 0, lowConfidenceReasons: ['No data'] };
  }

  const rows = data.length;
  let totalCells = 0;
  let missingCells = 0;

  const numericFields: string[] = [];
  const fieldValues: Record<string, number[]> = {};

  if (rows > 0) {
    const keys = Object.keys(data[0]);
    keys.forEach(key => {
      let isNumeric = true;
      for (let i = 0; i < Math.min(rows, 100); i++) {
        const val = data[i][key];
        if (val !== null && val !== undefined && val !== '') {
           const num = Number(val);
           if (isNaN(num)) {
             isNumeric = false;
             break;
           }
        }
      }
      if (isNumeric) {
        numericFields.push(key);
        fieldValues[key] = [];
      }
    });
  }

  data.forEach(row => {
    Object.keys(row).forEach(key => {
      totalCells++;
      const val = row[key];
      if (val === null || val === undefined || val === '') {
        missingCells++;
      } else if (numericFields.includes(key)) {
        const num = Number(val);
        if (!isNaN(num)) {
          fieldValues[key].push(num);
        }
      }
    });
  });

  const completeness = totalCells > 0 ? (1 - missingCells / totalCells) * 100 : 0;
  if (completeness < 80) lowConfidenceReasons.push(`缺失率较高(${Math.round(100-completeness)}%)`);

  let outlierRatioSum = 0;
  let fieldsAnalyzed = 0;

  numericFields.forEach(key => {
    const vals = fieldValues[key];
    if (vals.length > 3) {
      try {
        const q1 = quantile(vals, 0.25);
        const q3 = quantile(vals, 0.75);
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        
        let outliers = 0;
        vals.forEach(v => {
          if (v < lowerBound || v > upperBound) outliers++;
        });
        
        outlierRatioSum += (outliers / vals.length);
        fieldsAnalyzed++;
      } catch (e) {}
    }
  });

  const outlierRatio = fieldsAnalyzed > 0 ? (outlierRatioSum / fieldsAnalyzed) : 0;
  const consistency = Math.max(0, (1 - outlierRatio) * 100);
  if (consistency < 85) lowConfidenceReasons.push(`含较多异常值(${Math.round(outlierRatio*100)}%)`);

  const sufficiency = Math.min(rows / 500, 1) * 100;
  if (sufficiency < 100) lowConfidenceReasons.push(`样本量不足(${rows}行)`);

  const overall = (0.4 * completeness) + (0.3 * consistency) + (0.3 * sufficiency);

  return {
    completeness,
    consistency,
    sufficiency,
    overall,
    lowConfidenceReasons
  };
}
