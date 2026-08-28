import { create } from 'zustand';
import api from '@/services/api';

const CONSENT_STORAGE_KEY = 'jalyn_cookie_consent_v1';
let currentPolicyVersion = '1.0.0';

const getDefaultConsent = (version = currentPolicyVersion) => ({
  version: version,
  timestamp: null,
  necessary: true, // Always true (Cart, Auth, Security, CSRF)
  preferences: false,
  analytics: false,
  marketing: false,
  hasInteracted: false,
});

export const useConsentStore = create((set, get) => ({
  settings: {
    banner_title: 'We Value Your Privacy & Shopping Experience',
    banner_description:
      'We use essential cookies to keep your cart and checkout secure. With your permission, we also use functional and analytics cookies to personalize your style recommendations.',
    policy_url: '/privacy-policy',
    current_version: '1.0.0',
    is_enabled: 1,
  },
  consent: (() => {
    if (typeof window === 'undefined') return getDefaultConsent();
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === currentPolicyVersion && parsed.hasInteracted) {
          return {
            ...parsed,
            necessary: true,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse cookie consent from storage', e);
    }
    return getDefaultConsent();
  })(),
  isPreferencesModalOpen: false,

  openPreferencesModal: () => set({ isPreferencesModalOpen: true }),
  closePreferencesModal: () => set({ isPreferencesModalOpen: false }),

  fetchSettings: async () => {
    try {
      const res = await api.get('/consent/settings');
      if (res.data?.success && res.data.data?.settings) {
        const serverSettings = res.data.data.settings;
        const serverVersion = serverSettings.current_version || '1.0.0';
        currentPolicyVersion = serverVersion;

        // If stored consent version is older than active server version, prompt re-consent
        const currentConsent = get().consent;
        if (currentConsent.hasInteracted && currentConsent.version !== serverVersion) {
          const resetConsent = getDefaultConsent(serverVersion);
          localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(resetConsent));
          set({
            settings: serverSettings,
            consent: resetConsent,
          });
        } else {
          set({ settings: serverSettings });
        }
      }
    } catch (err) {
      console.debug('Failed to fetch consent settings from server:', err?.message || err);
    }
  },

  saveConsent: (preferences) => {
    const activeVersion = get().settings?.current_version || currentPolicyVersion;
    const updatedConsent = {
      version: activeVersion,
      timestamp: new Date().toISOString(),
      necessary: true,
      preferences: Boolean(preferences.preferences),
      analytics: Boolean(preferences.analytics),
      marketing: Boolean(preferences.marketing),
      hasInteracted: true,
    };

    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updatedConsent));
    } catch (e) {
      console.warn('Failed to persist cookie consent to localStorage', e);
    }

    // Clean up cookies for any revoked categories
    if (!updatedConsent.analytics || !updatedConsent.marketing) {
      cleanupNonEssentialCookies(updatedConsent);
    }

    // Dispatch global event for external scripts, tag managers, or listener hooks
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cookie_consent_updated', { detail: updatedConsent })
      );
    }

    // Asynchronously log anonymous consent for GDPR Article 7 compliance
    syncConsentWithBackend(updatedConsent);

    set({ consent: updatedConsent, isPreferencesModalOpen: false });
  },

  acceptAll: () => {
    get().saveConsent({
      preferences: true,
      analytics: true,
      marketing: true,
    });
  },

  rejectNonEssential: () => {
    get().saveConsent({
      preferences: false,
      analytics: false,
      marketing: false,
    });
  },
}));

/**
 * Removes non-essential cookies where accessible when consent is revoked.
 * Strictly preserves authentication, session, cart, and security cookies.
 */
function cleanupNonEssentialCookies(consent) {
  if (typeof document === 'undefined') return;

  const cookies = document.cookie.split(';');
  const preservedPrefixes = ['jalyn-user', 'jalyn-cart', 'session', 'csrf', 'token'];

  for (let cookie of cookies) {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    if (!name) continue;

    const isPreserved = preservedPrefixes.some((p) => name.toLowerCase().startsWith(p));
    if (isPreserved) continue;

    // Analytics cookies (_ga, _gid, _gat, clarity)
    if (!consent.analytics && (name.startsWith('_ga') || name.startsWith('_gid') || name.includes('clarity'))) {
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
    }

    // Marketing cookies (_fbp, _fbc, tt_pixel)
    if (!consent.marketing && (name.startsWith('_fb') || name.startsWith('tt_') || name.startsWith('ad_'))) {
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
    }
  }
}

/**
 * Non-blocking asynchronous sync to log proof of consent with salted SHA-256 hashed IP
 */
async function syncConsentWithBackend(consentData) {
  try {
    let consentUUID = localStorage.getItem('jalyn_consent_uuid');
    if (!consentUUID) {
      consentUUID = 'c_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('jalyn_consent_uuid', consentUUID);
    }

    await api.post('/consent/log', {
      consentUuid: consentUUID,
      version: consentData.version,
      categories: {
        necessary: consentData.necessary,
        preferences: consentData.preferences,
        analytics: consentData.analytics,
        marketing: consentData.marketing,
      },
    });
  } catch (err) {
    console.debug('Consent backend sync skipped:', err?.message || err);
  }
}

// Automatically fetch latest settings on client load
if (typeof window !== 'undefined') {
  useConsentStore.getState().fetchSettings();
}
