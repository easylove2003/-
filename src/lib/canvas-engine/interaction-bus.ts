import mitt from 'mitt';
import { CanvasInteractionEvent } from './types';

type Events = {
  interaction: CanvasInteractionEvent;
};

export const interactionBus = mitt<Events>();
