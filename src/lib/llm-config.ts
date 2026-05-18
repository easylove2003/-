export type ProviderId =
  | 'gemini' | 'openai' | 'anthropic' | 'deepseek'
  | 'moonshot' | 'zhipu' | 'qwen' | 'siliconflow'
  | 'openrouter' | 'ollama' | 'custom';

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  protocol: 'gemini' | 'openai' | 'anthropic';
  defaultBaseUrl: string;
  defaultModel: string;
  modelOptions: string[];
  free?: boolean;
  hint?: string;
  apiKeyHelpUrl?: string;
}

export const PROVIDERS: ProviderMeta[] = [
  { id: 'gemini', name: 'Google Gemini', protocol: 'gemini',
    defaultBaseUrl: '', defaultModel: 'gemini-2.5-flash',
    modelOptions: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    free: true, hint: 'AI Studio 提供免费配额',
    apiKeyHelpUrl: 'https://aistudio.google.com/app/apikey' },
  { id: 'openai', name: 'OpenAI', protocol: 'openai',
    defaultBaseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini',
    modelOptions: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1-mini'],
    apiKeyHelpUrl: 'https://platform.openai.com/api-keys' },
  { id: 'anthropic', name: 'Anthropic Claude', protocol: 'anthropic',
    defaultBaseUrl: 'https://api.anthropic.com/v1', defaultModel: 'claude-3-5-sonnet-latest',
    modelOptions: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
    apiKeyHelpUrl: 'https://console.anthropic.com/settings/keys' },
  { id: 'deepseek', name: 'DeepSeek', protocol: 'openai',
    defaultBaseUrl: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat',
    modelOptions: ['deepseek-chat', 'deepseek-reasoner'],
    hint: '国内访问稳定，价格低',
    apiKeyHelpUrl: 'https://platform.deepseek.com/api_keys' },
  { id: 'moonshot', name: 'Moonshot (Kimi)', protocol: 'openai',
    defaultBaseUrl: 'https://api.moonshot.cn/v1', defaultModel: 'moonshot-v1-32k',
    modelOptions: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    apiKeyHelpUrl: 'https://platform.moonshot.cn/console/api-keys' },
  { id: 'zhipu', name: '智谱 GLM', protocol: 'openai',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4', defaultModel: 'glm-4-flash',
    modelOptions: ['glm-4-flash', 'glm-4-plus', 'glm-4-air', 'glm-4-long'],
    free: true, hint: 'glm-4-flash 完全免费',
    apiKeyHelpUrl: 'https://open.bigmodel.cn/usercenter/apikeys' },
  { id: 'qwen', name: '阿里通义 Qwen', protocol: 'openai',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', defaultModel: 'qwen-plus',
    modelOptions: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen2.5-72b-instruct'],
    apiKeyHelpUrl: 'https://bailian.console.aliyun.com/?apiKey=1' },
  { id: 'siliconflow', name: '硅基流动 SiliconFlow', protocol: 'openai',
    defaultBaseUrl: 'https://api.siliconflow.cn/v1', defaultModel: 'Qwen/Qwen2.5-7B-Instruct',
    modelOptions: ['Qwen/Qwen2.5-7B-Instruct', 'Qwen/Qwen2.5-72B-Instruct',
                   'deepseek-ai/DeepSeek-V3', 'meta-llama/Meta-Llama-3.1-8B-Instruct'],
    free: true, hint: '聚合多家开源模型，部分免费',
    apiKeyHelpUrl: 'https://cloud.siliconflow.cn/account/ak' },
  { id: 'openrouter', name: 'OpenRouter (聚合)', protocol: 'openai',
    defaultBaseUrl: 'https://openrouter.ai/api/v1', defaultModel: 'openai/gpt-4o-mini',
    modelOptions: ['openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet',
                   'google/gemini-2.0-flash-exp:free', 'meta-llama/llama-3.3-70b-instruct:free'],
    hint: '一个 Key 调用全网模型，:free 后缀模型免费',
    apiKeyHelpUrl: 'https://openrouter.ai/keys' },
  { id: 'ollama', name: 'Ollama (本地)', protocol: 'openai',
    defaultBaseUrl: 'http://localhost:11434/v1', defaultModel: 'llama3.2',
    modelOptions: ['llama3.2', 'qwen2.5', 'deepseek-r1', 'phi4', 'gemma2'],
    free: true, hint: '本地部署，无需 API Key（任意填写如 ollama 即可）' },
  { id: 'custom', name: '自定义 (OpenAI 兼容)', protocol: 'openai',
    defaultBaseUrl: '', defaultModel: '',
    modelOptions: [], hint: '任何 OpenAI 协议兼容的接口都可填' },
];

export interface LLMConfig {
  provider: ProviderId;
  apiKey: string;
  baseUrl?: string;   // 留空使用默认
  model?: string;     // 留空使用默认
  temperature?: number;
}

const STORAGE_KEY = 'llm_config_v1';

export function getLLMConfig(): LLMConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // 兼容老 key
  const legacyKey = localStorage.getItem('gemini_api_key');
  if (legacyKey) {
    return { provider: 'gemini', apiKey: legacyKey };
  }
  return { provider: 'gemini', apiKey: '' };
}

export function saveLLMConfig(cfg: LLMConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  // 同步到老 key（兼容仍未迁移的页面）
  if (cfg.provider === 'gemini') {
    localStorage.setItem('gemini_api_key', cfg.apiKey);
  }
}

export function getProviderMeta(id: ProviderId): ProviderMeta {
  return PROVIDERS.find(p => p.id === id) || PROVIDERS[0];
}

export function getEffectiveModel(cfg: LLMConfig): string {
  return cfg.model || getProviderMeta(cfg.provider).defaultModel;
}

export function getEffectiveBaseUrl(cfg: LLMConfig): string {
  return cfg.baseUrl || getProviderMeta(cfg.provider).defaultBaseUrl;
}
