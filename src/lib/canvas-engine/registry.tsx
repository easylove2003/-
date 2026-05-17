import { CanvasBlock, CanvasTemplate } from './types';
import React from 'react';
import { DefaultBlock } from '../../components/canvas-blocks/DefaultBlock';
import StrategyBoardBlock from '../../components/canvas-blocks/StrategyBoardBlock';
import AttributionWaterfallBlock from '../../components/canvas-blocks/AttributionWaterfallBlock';
import DataHealthBlock from '../../components/canvas-blocks/DataHealthBlock';
import FunnelDiagnosisBlock from '../../components/canvas-blocks/FunnelDiagnosisBlock';
import InsightCardsBlock from '../../components/canvas-blocks/InsightCardsBlock';
import TrendDashboardBlock from '../../components/canvas-blocks/TrendDashboardBlock';
import ReportLongformBlock from '../../components/canvas-blocks/ReportLongformBlock';
import RfmQuadrantBlock from '../../components/canvas-blocks/RfmQuadrantBlock';
import CodeTerminalBlock from '../../components/canvas-blocks/CodeTerminalBlock';
import QnaCompactBlock from '../../components/canvas-blocks/QnaCompactBlock';
import CohortHeatmapBlock from '../../components/canvas-blocks/CohortHeatmapBlock';
import ComparisonSplitBlock from '../../components/canvas-blocks/ComparisonSplitBlock';
import { BaseBlock } from '../../components/canvas-blocks/BaseBlock';

export const renderBlock = (block: CanvasBlock) => {
  const Component = getComponentForTemplate(block.template);
  // @ts-ignore
  return <BaseBlock key={block.id} block={block}><Component block={block} /></BaseBlock>;
};

const getComponentForTemplate = (template: CanvasTemplate) => {
  switch (template) {
    case 'strategy_board': return StrategyBoardBlock;
    case 'attribution_waterfall': return AttributionWaterfallBlock;
    case 'data_health': return DataHealthBlock;
    case 'funnel_diagnosis': return FunnelDiagnosisBlock;
    case 'insight_cards': return InsightCardsBlock;
    case 'trend_dashboard': return TrendDashboardBlock;
    case 'report_longform': return ReportLongformBlock;
    case 'rfm_quadrant': return RfmQuadrantBlock;
    case 'code_terminal': return CodeTerminalBlock;
    case 'qna_compact': return QnaCompactBlock;
    case 'cohort_heatmap': return CohortHeatmapBlock;
    case 'comparison_split': return ComparisonSplitBlock;
    default: return DefaultBlock;
  }
};
