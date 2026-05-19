/**
 * 数据隐私同意管理
 * 用户上传数据前必须确认知晓数据会被发送到外部 AI 服务
 */

const CONSENT_KEY = 'dc_privacy_consent_v1';

interface ConsentRecord {
  accepted: boolean;
  timestamp: string;
  version: string;
}

const CURRENT_VERSION = '1.0';

/**
 * 检查用户是否已同意隐私条款
 */
export function hasPrivacyConsent(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const record: ConsentRecord = JSON.parse(raw);
    return record.accepted && record.version === CURRENT_VERSION;
  } catch {
    return false;
  }
}

/**
 * 记录用户同意
 */
export function acceptPrivacyConsent(): void {
  const record: ConsentRecord = {
    accepted: true,
    timestamp: new Date().toISOString(),
    version: CURRENT_VERSION,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
}

/**
 * 撤销同意
 */
export function revokePrivacyConsent(): void {
  localStorage.removeItem(CONSENT_KEY);
}
