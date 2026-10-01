import React from 'react';
import Link from 'next/link';
import db from '@/lib/db';
import { ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function CollectionsPage() {
  const collections = [
    {
      name: 'OUTERWEAR & MIKINY',
      slug: 'outerwear',
      badge: '550 GSM TEDDY FLEECE & BRUSHED HEAVYWEIGHT',
      description: 'Signaturní oboustranné mikiny z hustého teddy fleece s kovovým hardwarem a masivní 3D výšivkou.',
      image: '/images/products/teddy-black-front.jpg',
      itemCount: 3,
    },
    {
      name: 'TRIČKA & TOPY',
      slug: 't-shirts',
      badge: '280 GSM COMBDED ORGANIC JERSEY',
      description: 'Boxy streetwear trička s pevným 1.25" límcem a monumentálním sítotiskem na zádech.',
      image: '/images/products/tshirt-white-front.jpg',
      itemCount: 1,
    },
    {
      name: 'PANTS & DENIM',
      slug: 'pants',
      badge: '14.5 OZ DENIM & 450 GSM FRENCH TERRY',
      description: 'Extrémně široké baggy džíny a těžké tepláky s perfektním streetwear střihem.',
      image: '/images/products/denim-black-front.jpg',
      itemCount: 2,
    },
    {
      name: 'FOOTWEAR & OBUV',
      slug: 'footwear',
      badge: 'AIR UNIT & CHROME ACCENTS',
      description: 'Futuristická teniska s viditelným vzduchovým tlumením a chromovanými prvky.',
      image: '/images/products/sneaker-cyber-white-1.jpg',
      itemCount: 1,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white">
      <div className="border-b border-[#1f1f26] pb-8 mb-12">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block mb-1">
          ARCHITEKTURA & KATEGORIE
        </span>
        <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight">
          KOLEKCE RUN
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-lg">
          Kategorie odpovídající reálným výrobkům z Collection One / Drop 01.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {collections.map((col) => (
          <Link
            key={col.slug}
            href={`/shop?category=${col.slug}`}
            className="group relative aspect-[16/10] rounded-lg overflow-hidden bg-[#121216] border border-[#222228] hover:border-zinc-500 transition-all duration-300 flex flex-col justify-end p-6 sm:p-8"
          >
            <img
              src={col.image}
              alt={col.name}
              className="absolute inset-0 w-full h-full object-cover img-zoom filter brightness-75 group-hover:brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase bg-black/60 backdrop-blur-md px-2.5 py-1 rounded inline-block">
                {col.badge}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl uppercase text-white tracking-tight">
                {col.name}
              </h2>
              <p className="text-xs text-zinc-300 max-w-md line-clamp-2">{col.description}</p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
                <span>Zobrazit kousky ({col.itemCount})</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
