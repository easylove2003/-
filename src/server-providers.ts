import { GoogleGenAI } from "@google/genai";

export interface ProviderRequest {
  contents: { role: 'user' | 'model'; parts: { text: string }[] }[];
  systemInstruction?: { parts: { text: string }[] };
  apiKey: string;
  model: string;
  baseUrl?: string;
  temperature?: number;
}

export type StreamCallback = (token: string) => void;

const DEFAULTS = {
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  anthropic: { baseUrl: 'https://api.anthropic.com/v1', model: 'claude-3-5-sonnet-latest' },
  deepseek: { baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  moonshot: { baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-32k' },
  zhipu: { baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
  qwen: { baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
  siliconflow: { baseUrl: 'https://api.siliconflow.cn/v1', model: 'Qwen/Qwen2.5-7B-Instruct' },
  openrouter: { baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini' },
  ollama: { baseUrl: 'http://localhost:11434/v1', model: 'llama3.2' },
};

const PROTOCOL_MAP: Record<string, 'gemini' | 'openai' | 'anthropic'> = {
  gemini: 'gemini',
  openai: 'openai',
  anthropic: 'anthropic',
  deepseek: 'openai',
  moonshot: 'openai',
  zhipu: 'openai',
  qwen: 'openai',
  siliconflow: 'openai',
  openrouter: 'openai',
  ollama: 'openai',
  custom: 'openai',
};

function resolveProtocol(provider: string): 'gemini' | 'openai' | 'anthropic' {
  return PROTOCOL_MAP[provider] || 'openai';
}

// 把 Gemini 风格 contents 转 OpenAI/Anthropic 格式
function toFlatMessages(contents: ProviderRequest['contents']) {
  return contents.map(m => ({
    role: m.role === 'model' ? 'assistant' : 'user',
    content: m.parts.map(p => p.text).join('\n')
  }));
}

function getSystemText(req: ProviderRequest): string {
  return req.systemInstruction?.parts.map(p => p.text).join('\n') || '';
}

// ── Gemini ──
async function callGemini(req: ProviderRequest, onToken: StreamCallback): Promise<void> {
  const opts: any = { apiKey: req.apiKey };
  if (req.baseUrl) opts.baseUrl = req.baseUrl;
  const ai = new GoogleGenAI(opts);
  const stream = await ai.models.generateContentStream({
    model: req.model || 'gemini-2.5-flash',
    contents: req.contents,
    config: {
      systemInstruction: req.systemInstruction,
      temperature: req.temperature ?? 0.2,
    }
  });
  for await (const chunk of stream) {
    if (chunk.text) onToken(chunk.text);
  }
}

// ── OpenAI 兼容（DeepSeek/Moonshot/智谱/Qwen/SF/OpenRouter/Ollama 共用） ──
async function callOpenAICompatible(req: ProviderRequest, onToken: StreamCallback, provider: string): Promise<void> {
  const baseUrl = req.baseUrl || (DEFAULTS as any)[provider]?.baseUrl || DEFAULTS.openai.baseUrl;
  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const messages: any[] = [];
  const sysText = getSystemText(req);
  if (sysText) messages.push({ role: 'system', content: sysText });
  messages.push(...toFlatMessages(req.contents));

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${req.apiKey}`,
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: req.model,
      messages,
      stream: true,
      temperature: req.temperature ?? 0.2,
    }),
  });

  if (!resp.ok || !resp.body) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`Upstream ${resp.status}: ${errText.slice(0, 500)}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        const obj = JSON.parse(payload);
        const delta = obj.choices?.[0]?.delta?.content;
        if (delta) onToken(delta);
      } catch {}
    }
  }
}

// ── Anthropic Messages API ──
async function callAnthropic(req: ProviderRequest, onToken: StreamCallback): Promise<void> {
  const baseUrl = req.baseUrl || DEFAULTS.anthropic.baseUrl;
  const url = `${baseUrl.replace(/\/$/, '')}/messages`;
  const messages = toFlatMessages(req.contents);

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': req.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: req.model,
      system: getSystemText(req) || undefined,
      messages,
      max_tokens: 8192,
      temperature: req.temperature ?? 0.2,
      stream: true,
    }),
  });

  if (!resp.ok || !resp.body) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`Anthropic ${resp.status}: ${errText.slice(0, 500)}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      try {
        const obj = JSON.parse(trimmed.slice(5).trim());
        if (obj.type === 'content_block_delta' && obj.delta?.text) {
          onToken(obj.delta.text);
        } else if (obj.type === 'message_stop') {
          return;
        }
      } catch {}
    }
  }
}

export async function callProvider(
  provider: string,
  req: ProviderRequest,
  onToken: StreamCallback
): Promise<void> {
  const protocol = resolveProtocol(provider);
  if (protocol === 'gemini') return callGemini(req, onToken);
  if (protocol === 'anthropic') return callAnthropic(req, onToken);
  return callOpenAICompatible(req, onToken, provider);
}
