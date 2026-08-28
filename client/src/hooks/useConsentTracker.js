import { useConsentStore } from '@/store';

/**
 * Custom hook for privacy-aware tracking event dispatch.
 * Suppresses tracking calls silently if user has not granted consent for the corresponding category.
 */
export function useConsentTracker() {
  const consent = useConsentStore((state) => state.consent);

  const trackEvent = (eventName, params = {}, category = 'analytics') => {
    // 1. Verify user granted consent for this category
    if (!consent[category]) {
      return;
    }

    // 2. Dispatch to Google Analytics if available
    if (category === 'analytics' && typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }

    // 3. Dispatch to Meta Pixel if marketing event
    if (category === 'marketing' && typeof window !== 'undefined' && typeof window.fbq === 'function') {
      if (eventName === 'purchase') {
        window.fbq('track', 'Purchase', { value: params.value, currency: params.currency || 'INR' });
      } else if (eventName === 'add_to_cart') {
        window.fbq('track', 'AddToCart', { content_ids: [params.item_id], value: params.value });
      } else {
        window.fbq('trackCustom', eventName, params);
      }
    }
  };

  return { trackEvent, consent };
}

