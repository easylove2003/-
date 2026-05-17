export type CanvasMode = 'idle' | 'switch' | 'append' | 'update' | 'focus' | 'split' | 'clear';
export type CanvasLayout = 'single' | 'split' | 'grid_2x2' | 'report' | 'focus' | 'idle';

export type CanvasTemplate =
  | 'idle'
  | 'data_health'
  | 'insight_cards'
  | 'strategy_board'
  | 'funnel_diagnosis'
  | 'attribution_waterfall'
  | 'cohort_heatmap'
  | 'rfm_quadrant'
  | 'trend_dashboard'
  | 'comparison_split'
  | 'report_longform'
  | 'code_terminal'
  | 'qna_compact';

export interface CanvasBlock {
  id: string;
  template: CanvasTemplate;
  title: string;
  subtitle?: string;
  data: any;
  animation?: 'slide_in_right' | 'fade_in' | 'scale_up';
  highlight?: string[];
  conversationAnchor?: string; // Links to chat message
}

export interface CanvasDirective {
  mode: CanvasMode;
  layout: CanvasLayout;
  blocks: CanvasBlock[];
  transitions?: { from: string; to: string; duration_ms: number };
  narration?: string;
}

export type CanvasInteractionEvent =
  | { type: 'chart_point_click'; blockId: string; dataPoint: any }
  | { type: 'metric_drilldown'; blockId: string; metric: string; dimension: string }
  | { type: 'strategy_thumbs'; blockId: string; strategyId: string; vote: 'up' | 'down' }
  | { type: 'parameter_change'; blockId: string; param: string; value: any }
  | { type: 'block_question'; blockId: string; question: string }
  | { type: 'block_pin' | 'block_close' | 'block_export'; blockId: string };
