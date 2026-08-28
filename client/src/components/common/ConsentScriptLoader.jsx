import { useEffect } from 'react';
import { useConsentStore } from '@/store';

/**
 * ConsentScriptLoader
 * Conditionally initializes analytics and advertising scripts ONLY after explicit category consent.
 * If user has not consented or rejected, ZERO external scripts are fetched or executed.
 */
export default function ConsentScriptLoader() {
  const consent = useConsentStore((state) => state.consent);

  // Environment-based IDs (optional, only loads if env variable is defined and category is approved)
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const metaPixelId = import.meta.env.VITE_META_PIXEL_ID;
  const clarityId = import.meta.env.VITE_CLARITY_ID;

  // 1. Google Analytics 4 (Category: Analytics)
  useEffect(() => {
    if (!consent.analytics || !gaId) return;

    if (!document.getElementById('jalyn-ga-script')) {
      const script = document.createElement('script');
      script.id = 'jalyn-ga-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', gaId, {
        anonymize_ip: true,
        cookie_flags: 'SameSite=Lax;Secure',
      });
    }
  }, [consent.analytics, gaId]);

  // 2. Microsoft Clarity (Category: Analytics)
  useEffect(() => {
    if (!consent.analytics || !clarityId) return;

    if (!document.getElementById('jalyn-clarity-script')) {
      const script = document.createElement('script');
      script.id = 'jalyn-clarity-script';
      script.async = true;
      script.innerHTML = `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");
      `;
      document.head.appendChild(script);
    }
  }, [consent.analytics, clarityId]);

  // 3. Meta Pixel (Category: Marketing)
  useEffect(() => {
    if (!consent.marketing || !metaPixelId) return;

    if (!document.getElementById('jalyn-meta-pixel-script')) {
      const script = document.createElement('script');
      script.id = 'jalyn-meta-pixel-script';
      script.async = true;
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${metaPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }
  }, [consent.marketing, metaPixelId]);

  // 4. Handle Real-Time Revocation (Disable trackers if toggled OFF)
  useEffect(() => {
    if (!consent.analytics && gaId && typeof window !== 'undefined') {
      window[`ga-disable-${gaId}`] = true;
    }
    if (!consent.marketing && typeof window !== 'undefined' && window.fbq) {
      window.fbq('consent', 'revoke');
    }
  }, [consent.analytics, consent.marketing, gaId]);

  return null;
}

