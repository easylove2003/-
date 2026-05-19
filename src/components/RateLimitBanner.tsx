import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { getRemainingRequests, getDailyLimit } from '../lib/rate-limiter';

/**
 * 显示在页面顶部的调用次数提示条
 * 当剩余次数 <= 10 时显示警告，= 0 时显示已用完
 */
export function RateLimitBanner() {
  const remaining = getRemainingRequests();
  const limit = getDailyLimit();

  if (remaining > 10) return null;

  if (remaining === 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>今日 AI 调用次数已用完（{limit}/{limit}）。明天将自动重置，或配置自己的 API Key 解除限制。</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl flex items-center gap-2 text-xs">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
      <span>今日剩余 AI 调用次数：{remaining}/{limit}</span>
    </div>
  );
}
