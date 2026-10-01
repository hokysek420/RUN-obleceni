'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CookieBanner() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('run_cookie_consent');
      if (!consent) {
        setShow(true);
      }
    } catch {}
  }, []);

  const accept = () => {
    try {
      localStorage.setItem('run_cookie_consent', 'accepted');
    } catch {}
    setShow(false);
  };

  if (!show || pathname.startsWith('/admin')) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#121216]/95 border border-[#27272a] backdrop-blur-md p-4 rounded-lg shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-display text-white text-xs tracking-wider">OCHRANA SOUKROMÍ & COOKIES</span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Tento web používá soubory cookies pro zajištění správného fungování e-shopu, ukládání košíku a anonymní analýzu návštěvnosti.{' '}
          <Link href="/cookies" className="text-zinc-200 underline hover:text-white">
            Více informací
          </Link>.
        </p>
        <div className="flex items-center space-x-2 pt-1">
          <button
            onClick={accept}
            className="flex-1 bg-white text-black font-bold text-xs py-2 rounded hover:bg-zinc-200 transition-colors uppercase tracking-wider"
          >
            ROZUMÍM A PŘIJÍMÁM
          </button>
          <button
            onClick={() => setShow(false)}
            className="px-3 py-2 text-xs text-zinc-400 hover:text-white border border-[#27272a] rounded"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
}
