import React from 'react';
import { Settings2, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConsentStore } from '@/store';

export default function CookieConsentBanner() {
  const { consent, settings, isPreferencesModalOpen, acceptAll, rejectNonEssential, openPreferencesModal } =
    useConsentStore();

  // If user has already interacted, preferences modal is open, or banner is disabled by admin: do not render
  if (consent.hasInteracted || isPreferencesModalOpen || settings?.is_enabled === 0) return null;

  const title = settings?.banner_title || 'We Value Your Privacy & Shopping Experience';
  const description =
    settings?.banner_description ||
    'We use essential cookies to keep your cart and checkout secure. With your permission, we also use functional and analytics cookies to personalize your style recommendations.';
  const policyUrl = settings?.policy_url || '/privacy-policy';

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-0 inset-x-0 z-50 py-3.5 px-4 sm:px-6 bg-white/95 dark:bg-[#1E1119]/95 backdrop-blur-md border-t border-[#EFE8E2] dark:border-rose-950/50 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 animate-slide-up"
    >
      <div className="container-luxury max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
        {/* Banner Text (Single Line Inline Heading & Paragraph) */}
        <div className="flex-1 min-w-0 max-w-4xl">
          <p className="text-xs sm:text-[13px] text-gray-700 dark:text-zinc-300 leading-relaxed font-light">
            <span className="font-bold text-[#2A1A22] dark:text-zinc-100 font-serif mr-1.5 text-sm sm:text-[15px]">
              {title}:
            </span>
            {description}{' '}
            <Link
              to={policyUrl}
              className="underline font-medium text-[#AD4A85] hover:text-[#8E3466] dark:hover:text-[#E8C5A8] transition whitespace-nowrap"
            >
              Privacy &amp; Cookie Policy
            </Link>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto shrink-0">
          <button
            type="button"
            onClick={openPreferencesModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#D8C9BF] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-[#FAF7F5] dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-gray-500" />
            <span>Customize</span>
          </button>
          <button
            type="button"
            onClick={rejectNonEssential}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#D8C9BF] dark:border-zinc-700 bg-[#FAF7F5] dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 hover:bg-[#EFE8E2] dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
            <span>Reject Non-Essential</span>
          </button>
          <button
            type="button"
            onClick={acceptAll}
            style={{ backgroundColor: '#AD4A85', color: '#FFFFFF' }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold !text-white text-white rounded-xl shadow-md transition-all hover:opacity-95 active:scale-95 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 !text-white text-white shrink-0" style={{ color: '#FFFFFF' }} />
            <span className="!text-white text-white font-bold" style={{ color: '#FFFFFF' }}>
              Accept All
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
