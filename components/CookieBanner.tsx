"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const CONSENT_KEY = "cookie-consent";
type Consent = "all" | "necessary";

export default function CookieBanner() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as Consent | null;
    if (stored === "all" || stored === "necessary") {
      setConsent(stored);
    } else {
      setVisible(true);
    }
  }, []);

  function acceptAll() {
    localStorage.setItem(CONSENT_KEY, "all");
    setConsent("all");
    setVisible(false);
  }

  function acceptNecessary() {
    localStorage.setItem(CONSENT_KEY, "necessary");
    setConsent("necessary");
    setVisible(false);
  }

  return (
    <>
      {consent === "all" && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-P7KKXJ1XYD"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P7KKXJ1XYD');
          `}</Script>
          <Script id="meta-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1274005248236685');
            fbq('track', 'PageView');
          `}</Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src="https://www.facebook.com/tr?id=1274005248236685&ev=PageView&noscript=1"
              alt=""
            />
          </noscript>
        </>
      )}

      {visible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
          <div
            className="mx-auto max-w-2xl rounded-xl bg-white px-5 py-4 shadow-[0_4px_32px_rgba(13,13,13,0.12)] border border-[var(--rule)]"
          >
            <p className="text-[13px] leading-relaxed text-[var(--fg)] mb-1 font-medium">
              Den här sajten använder cookies
            </p>
            <p className="text-[12px] leading-relaxed text-[var(--muted)] mb-4">
              Vi använder Google Analytics och Meta Pixel för att förstå hur sajten används och
              nå ut till fler vinnördar. Ditt val sparas och kan ändras när som helst.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={acceptAll}
                className="flex-1 rounded-lg bg-[var(--fg)] px-4 py-2.5 text-[13px] font-medium text-[var(--bg)] transition-opacity hover:opacity-80"
              >
                Acceptera alla
              </button>
              <button
                onClick={acceptNecessary}
                className="flex-1 rounded-lg border border-[var(--rule)] px-4 py-2.5 text-[13px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--fg)] hover:text-[var(--fg)]"
              >
                Endast nödvändiga
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
