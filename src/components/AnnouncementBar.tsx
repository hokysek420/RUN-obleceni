'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';

export default function AnnouncementBar() {
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="bg-[#050507] text-[#a1a1aa] border-b border-[#18181b] text-xs py-2 px-4 select-none relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center space-x-4 text-[11px] tracking-widest text-[#71717a]">
          <span>COLLECTION ONE / DROP 01</span>
          <span>•</span>
          <span className="text-[#e4e4e7]">OFFICIAL ONLINE STORE</span>
        </div>

        <div className="flex-1 text-center font-medium tracking-wide text-[11px] sm:text-xs text-white">
          <Link href="/shop" className="hover:text-zinc-300 transition-colors inline-flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>DROP 01: RUN INTO ZERO NYNÍ V PRODEJI — DOPRAVA ZDARMA NAD 2 500 KČ / 100 €</span>
          </Link>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center bg-[#121216] border border-[#27272a] rounded px-1.5 py-0.5">
            <button
              onClick={() => setCurrency('CZK')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                currency === 'CZK' ? 'bg-white text-black' : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              CZK
            </button>
            <button
              onClick={() => setCurrency('EUR')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                currency === 'EUR' ? 'bg-white text-black' : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              EUR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
