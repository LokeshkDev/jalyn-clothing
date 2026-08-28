import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, Check } from 'lucide-react';
import { useConsentStore } from '@/store';

export default function CookiePreferencesModal() {
  const { consent, isPreferencesModalOpen, closePreferencesModal, saveConsent } = useConsentStore();

  const [preferences, setPreferences] = useState({
    preferences: false,
    analytics: false,
    marketing: false,
  });

  // Sync state whenever modal opens or consent changes
  useEffect(() => {
    if (isPreferencesModalOpen) {
      setPreferences({
        preferences: Boolean(consent.preferences),
        analytics: Boolean(consent.analytics),
        marketing: Boolean(consent.marketing),
      });
    }
  }, [isPreferencesModalOpen, consent]);

  // Handle ESC key to close modal & prevent body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPreferencesModalOpen) {
        closePreferencesModal();
      }
    };
    if (isPreferencesModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isPreferencesModalOpen, closePreferencesModal]);

  if (!isPreferencesModalOpen) return null;

  const handleSave = () => {
    saveConsent(preferences);
  };

  const categories = [
    {
      id: 'necessary',
      name: 'Strictly Necessary Cookies',
      required: true,
      description:
        'Essential for core store functionality, including user login session, cart persistence, security tokens, and checkout processing. These cannot be disabled.',
      examples: 'jalyn-cart, jalyn-user, jalyn-orders, session_id, csrf_token',
      duration: 'Session to 30 days',
      checked: true,
      disabled: true,
    },
    {
      id: 'preferences',
      name: 'Functional & Preferences Cookies',
      required: false,
      description:
        'Allows the store to remember your choices such as saved wishlist items, delivery pincode availability, and localized shopping preferences.',
      examples: 'jalyn-wishlist, jalyn-delivery-pincode, jalyn_user_pincode',
      duration: '6 months',
      checked: preferences.preferences,
      disabled: false,
      onChange: (e) => setPreferences((p) => ({ ...p, preferences: e.target.checked })),
    },
    {
      id: 'analytics',
      name: 'Analytics & Performance Cookies',
      required: false,
      description:
        'Helps us understand visitor traffic, popular fashion categories, and optimize website loading speeds anonymously without storing personal identity.',
      examples: '_ga, _ga_*, _gid, clarity_id',
      duration: '1 to 2 years',
      checked: preferences.analytics,
      disabled: false,
      onChange: (e) => setPreferences((p) => ({ ...p, analytics: e.target.checked })),
    },
    {
      id: 'marketing',
      name: 'Marketing & Advertising Cookies',
      required: false,
      description:
        'Used by advertising platforms to measure promotional campaign performance and show you relevant apparel collections and curated discounts.',
      examples: '_fbp, _fbc, tt_pixel, gads',
      duration: '90 days to 1 year',
      checked: preferences.marketing,
      disabled: false,
      onChange: (e) => setPreferences((p) => ({ ...p, marketing: e.target.checked })),
    },
  ];

  return (
    <div
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-preferences-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closePreferencesModal();
      }}
    >
      <div
        data-lenis-prevent
        className="bg-white dark:bg-[#1E1119] border border-[#EFE8E2] dark:border-rose-950/50 rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#EFE8E2] dark:border-rose-950/50 bg-[#FAF7F5] dark:bg-[#160E12] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FAF0E6] dark:bg-rose-950/40 text-[#AD4A85] rounded-xl border border-[#EFD7E3] dark:border-rose-900/40">
              <ShieldCheck className="w-5 h-5 text-[#AD4A85]" />
            </div>
            <div>
              <h2
                id="cookie-preferences-title"
                className="text-base sm:text-lg font-serif font-bold text-[#2A1A22] dark:text-zinc-100"
              >
                Cookie &amp; Privacy Preferences
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Choose which cookie categories you allow during your shopping session.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closePreferencesModal}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 rounded-lg transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Scrollable List (with data-lenis-prevent and overscroll-contain) */}
        <div
          data-lenis-prevent
          className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-4 divide-y divide-[#EFE8E2] dark:divide-rose-950/30"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {categories.map((cat) => (
            <div key={cat.id} className="pt-4 first:pt-0">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-[#2A1A22] dark:text-zinc-100">
                    {cat.name}
                  </h3>
                  {cat.required && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 bg-[#FAF0E6] text-[#AD4A85] border border-[#EFD7E3] rounded">
                      <Lock className="w-3 h-3 text-[#AD4A85]" /> Always Active
                    </span>
                  )}
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cat.checked}
                    disabled={cat.disabled}
                    onChange={cat.onChange}
                    aria-label={`Toggle ${cat.name}`}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#AD4A85] disabled:opacity-70"></div>
                </label>
              </div>

              <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1.5 leading-relaxed font-light">
                {cat.description}
              </p>
              <div className="mt-2 text-[11px] text-gray-500 dark:text-zinc-500 flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  <strong className="text-gray-700 dark:text-zinc-400">Lifespan:</strong> {cat.duration}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EFE8E2] dark:border-rose-950/50 bg-[#FAF7F5] dark:bg-[#160E12] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setPreferences({ preferences: true, analytics: true, marketing: true });
            }}
            className="text-xs font-semibold text-[#AD4A85] hover:text-[#8E3466] hover:underline cursor-pointer"
          >
            Allow All Categories
          </button>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={closePreferencesModal}
              className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-200/70 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{ backgroundColor: '#AD4A85', color: '#FFFFFF' }}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold !text-white text-white rounded-xl shadow-md transition-all hover:opacity-95 active:scale-95 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 !text-white text-white shrink-0" style={{ color: '#FFFFFF' }} />
              <span className="!text-white text-white font-bold" style={{ color: '#FFFFFF' }}>
                Save My Preferences
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
