'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 text-center">
      <span className="font-mono text-xs tracking-widest text-rose-500 uppercase mb-3">
        SYSTÉMOVÁ CHYBA
      </span>
      <h1 className="text-3xl font-extrabold tracking-tight mb-4">
        NĚCO SE NEPODAŘILO
      </h1>
      <p className="text-sm text-neutral-400 max-w-sm mb-8">
        Omlouváme se, došlo k neočekávané chybě při načítání stránky.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-white text-black font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-neutral-200 transition"
        >
          ZKUSIT ZNOVU
        </button>
        <Link
          href="/"
          className="bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-neutral-700 transition"
        >
          DOMŮ
        </Link>
      </div>
    </div>
  );
}
