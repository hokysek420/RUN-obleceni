import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 text-center">
      <span className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-3">
        404 &bull; STRÁNKA NENALEZENA
      </span>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">
        ZTRACEN V ULICÍCH
      </h1>
      <p className="text-sm text-neutral-400 max-w-sm mb-8">
        Stránka, kterou hledáte, neexistuje nebo byla přesunuta do archivu.
      </p>
      <Link
        href="/"
        className="bg-white text-black font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-neutral-200 transition"
      >
        ZPĚT NA HLAVNÍ STRÁNKU
      </Link>
    </div>
  );
}
