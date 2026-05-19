/**
 * 客户端 API 调用频率限制器
 * 每天限制 50 次 AI 调用，基于 localStorage 计数
 */

const STORAGE_KEY = 'dc_api_usage_v1';
const DAILY_LIMIT = 50;

interface UsageRecord {
  date: string;   // YYYY-MM-DD
  count: number;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getUsage(): UsageRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getToday(), count: 0 };
    const record: UsageRecord = JSON.parse(raw);
    // 如果是新的一天，重置计数
    if (record.date !== getToday()) {
      return { date: getToday(), count: 0 };
    }
    return record;
  } catch {
    return { date: getToday(), count: 0 };
  }
}

function saveUsage(record: UsageRecord): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

/**
 * 检查是否还有剩余调用次数
 */
export function canMakeRequest(): boolean {
  const usage = getUsage();
  return usage.count < DAILY_LIMIT;
}

/**
 * 消耗一次调用次数，返回是否成功
 */
export function consumeRequest(): boolean {
  const usage = getUsage();
  if (usage.count >= DAILY_LIMIT) return false;
  usage.count += 1;
  saveUsage(usage);
  return true;
}

/**
 * 获取今日剩余次数
 */
export function getRemainingRequests(): number {
  const usage = getUsage();
  return Math.max(0, DAILY_LIMIT - usage.count);
}

/**
 * 获取今日已用次数
 */
export function getUsedRequests(): number {
  return getUsage().count;
}

/**
 * 获取每日限额
 */
export function getDailyLimit(): number {
  return DAILY_LIMIT;
}
