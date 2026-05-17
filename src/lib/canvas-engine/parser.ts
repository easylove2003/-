import { CanvasDirective } from './types';
import { parse as parsePartial } from 'partial-json';

export const parseCanvasDirective = (fullText: string): CanvasDirective | null => {
  const DIRECTIVE_REGEX = /```(?:.*canvas-directive|json)\s*([\s\S]*?)\s*(?:```|$)/ig;
  let match;
  let lastValidJson: CanvasDirective | null = null;

  while ((match = DIRECTIVE_REGEX.exec(fullText)) !== null) {
    try {
      const json = parsePartial(match[1]);
      if (json && typeof json === 'object') {
        // If it looks like a directive (has a layout or blocks array)
        if (json.layout || Array.isArray(json.blocks) || json.mode) {
          lastValidJson = json as CanvasDirective;
        }
      }
    } catch (e) {
      // Ignore parse errors, try next block
    }
  }

  // If no block found, we can also try to parse the entire text if it looks like raw json
  if (!lastValidJson) {
     try {
       const json = parsePartial(fullText);
       if (json && typeof json === 'object' && (json.layout || Array.isArray(json.blocks))) {
         lastValidJson = json as CanvasDirective;
       }
     } catch (e) {
       // fallback failed
     }
  }

  return lastValidJson;
};
