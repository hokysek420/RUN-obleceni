'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Box, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import Product3DViewer from './Product3DViewer';

interface ModelOption {
  id: string;
  name: string;
  category: string;
  slug: string;
  price: string;
  spec: string;
  tag: string;
}

const modelOptions: ModelOption[] = [
  {
    id: 'hoodie',
    name: 'RUN Reversible Heavy Teddy Fur Zip Hoodie',
    category: 'Outerwear',
    slug: 'run-reversible-heavy-teddy-fur-zip-hoodie-black',
    price: '3 890 Kč',
    spec: '550 GSM Faux-Fur • Oboustranné • RUN Metal Hardware',
    tag: 'LIMITOVANÁ EDICE',
  },
  {
    id: 'sneaker',
    name: 'RUN Cyber-Chunky Air Sneaker — Pure Chrome',
    category: 'Footwear',
    slug: 'run-cyber-chunky-air-sneaker-chrome',
    price: '4 490 Kč',
    spec: 'Vzduchový polštář RUN AIR • Zrcadlový chrom • Masivní grip',
    tag: 'LIMITOVANÁ EDICE',
  },
  {
    id: 'pants',
    name: 'RUN Washed Heavy Denim Baggy Jeans',
    category: 'Pants',
    slug: 'run-washed-heavy-denim-baggy-jeans-charcoal',
    price: '2 990 Kč',
    spec: '14.5 oz Selvedge Denim • Baggy Cut • Stacking Ankle',
    tag: 'SKLADEM',
  },
  {
    id: 'tshirt',
    name: 'RUN "YOU HAVE NOTHING" Boxy T-Shirt',
    category: 'T-Shirts',
    slug: 'run-you-have-nothing-heavyweight-boxy-tshirt-white',
    price: '1 490 Kč',
    spec: '280 GSM Bio bavlna • Drop-Shoulder • Silkscreen Print',
    tag: 'SKLADEM',
  },
];

export default function Home3DShowroom() {
  const [selectedModel, setSelectedModel] = useState<ModelOption>(modelOptions[0]);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
      {/* Left Info & Selectors */}
      <div className="max-w-md w-full space-y-6">
        <div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400 flex items-center gap-2 mb-2">
            <Box className="w-4 h-4 animate-spin" />
            <span>INTERAKTIVNÍ 3D SHOWROOM</span>
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight leading-none">
            ARCHITEKTURA SILUETY
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mt-3">
            Otestujte proporce, textury, barvy a drátěný blueprint oděvu v reálném 3D prostoru. Změňte materiál na chrom, rozložte vrstvy nebo přepněte studiové neonové osvětlení.
          </p>
        </div>

        {/* Product Model Selector Buttons */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">
            ZVOLTE PRODUKT PRO 3D ZOBRAZENÍ:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {modelOptions.map((opt) => {
              const isActive = selectedModel.id === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedModel(opt)}
                  className={`p-2.5 rounded-lg text-left border transition-all text-xs font-mono ${
                    isActive
                      ? 'bg-white text-black border-white shadow-xl font-bold'
                      : 'bg-[#141418] text-zinc-300 border-[#22222a] hover:bg-[#1a1a22]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-zinc-500 font-semibold">{opt.category}</span>
                    <span className="text-[9px] font-bold">{opt.price}</span>
                  </div>
                  <div className="font-bold truncate mt-0.5">{opt.name.replace('RUN ', '')}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Product Quick Details */}
        <div className="p-3.5 bg-[#121216] border border-[#22222a] rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
              {selectedModel.tag}
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {selectedModel.price}
            </span>
          </div>
          <p className="text-xs text-zinc-300 font-mono">
            {selectedModel.spec}
          </p>
          <div className="pt-2">
            <Link
              href={`/product/${selectedModel.slug}`}
              className="w-full inline-flex items-center justify-center gap-2 bg-white text-black font-black uppercase text-xs tracking-wider py-2.5 rounded hover:bg-zinc-200 transition-colors"
            >
              <span>ZOBRAZIT KARTU PRODUKTU</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Right: 3D Canvas */}
      <div className="w-full lg:w-3/5">
        <Product3DViewer
          key={selectedModel.id}
          productName={selectedModel.name}
          category={selectedModel.category}
        />
      </div>
    </div>
  );
}
