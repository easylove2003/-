import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ExternalLink } from 'lucide-react';
import { hasPrivacyConsent, acceptPrivacyConsent } from '../lib/privacy-consent';

interface Props {
  /** 当需要同意时显示弹窗，同意后调用 onConsent */
  onConsent: () => void;
  /** 如果已经同意过，直接调用 onConsent */
  trigger: boolean;
}

export function PrivacyConsent({ onConsent, trigger }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      if (hasPrivacyConsent()) {
        onConsent();
      } else {
        setShow(true);
      }
    }
  }, [trigger]);

  const handleAccept = () => {
    acceptPrivacyConsent();
    setShow(false);
    onConsent();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF5722]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#FF5722]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#1A1A1A]">数据处理声明</h2>
                <p className="text-xs text-[#1A1A1A]/50">使用前请阅读以下说明</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              <div className="bg-[#F5F1EA] rounded-xl p-4 space-y-3 text-sm text-[#1A1A1A]/80 leading-relaxed">
                <p className="font-semibold text-[#1A1A1A]">为了提供 AI 分析服务，您上传的数据将被处理如下：</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF5722] mt-0.5">•</span>
                    <span>数据的<strong>元信息和样本</strong>（字段名、前 10 行、统计摘要）将被发送至第三方 AI 服务（如 DeepSeek、Google Gemini）进行分析</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF5722] mt-0.5">•</span>
                    <span>完整原始数据<strong>不会</strong>被上传到外部服务器，仅在您的浏览器本地处理</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF5722] mt-0.5">•</span>
                    <span>AI 服务提供商可能会根据其隐私政策处理接收到的数据</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF5722] mt-0.5">•</span>
                    <span>我们建议<strong>不要上传包含个人身份信息（PII）</strong>的敏感数据</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-start gap-2 text-xs text-[#1A1A1A]/50">
                <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>如果您使用自带 API Key（BYOK 模式），数据将直接发送至您选择的 AI 服务商。</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setShow(false)}
                className="text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-2.5 bg-[#1A1A1A] text-[#F5F1EA] rounded-full text-sm font-semibold hover:bg-[#FF5722] transition-colors"
              >
                我已了解，继续使用
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * 简化版：直接检查并弹窗的 hook
 */
export function usePrivacyCheck() {
  const [needsConsent, setNeedsConsent] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const checkAndProceed = (action: () => void) => {
    if (hasPrivacyConsent()) {
      action();
    } else {
      setPendingAction(() => action);
      setNeedsConsent(true);
    }
  };

  const handleConsent = () => {
    acceptPrivacyConsent();
    setNeedsConsent(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleCancel = () => {
    setNeedsConsent(false);
    setPendingAction(null);
  };

  return { needsConsent, checkAndProceed, handleConsent, handleCancel };
}
