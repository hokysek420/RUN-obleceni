import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function EditorialPage() {
  const editorialItems = [
    {
      title: 'SAME VISION STRONGER TOGETHER',
      subtitle: 'RUN INTO ZERO / DROP 01',
      description: 'Dva modely v industriálním prostoru definují kontrast tmavého a světlého faux-fur teddy fleecu. Oboustranná konstrukce, 550 GSM, 3D výšivka loga.',
      image: '/images/editorial/campaign-hero-models.jpg',
      ctaLink: '/shop?category=outerwear',
      ctaText: 'Zobrazit Outerwear',
    },
    {
      title: 'DUAL IDENTITY: BLACK & BONE CREAM',
      subtitle: 'REVERSIBLE TEDDY FUR HOODIES',
      description: 'Detailní pohled na frontální siluetu obou modelů. Dvojitá kapuce, kovové stahovací aglety, gravírovaný RUN jezdec.',
      image: '/images/editorial/editorial-couple-front.jpg',
      ctaLink: '/product/run-reversible-heavy-teddy-fur-zip-hoodie-black',
      ctaText: 'Detail Černé mikiny',
    },
    {
      title: 'BACK MANIFESTO & IDENTITY',
      subtitle: 'YOU’LL NEVER DO IT. YOU HAVE NOTHING.',
      description: 'Pohled na monumentální grafiku na zádech. Odmítnutí falešného optimismu ve prospěch syrového odhodlání a práce.',
      image: '/images/editorial/editorial-couple-back.jpg',
      ctaLink: '/product/run-reversible-heavy-teddy-fur-zip-hoodie-cream',
      ctaText: 'Detail Světlé mikiny',
    },
    {
      title: 'STREET DRAPE & 14.5 OZ DENIM',
      subtitle: 'VINTAGE WASHED BLACK BAGGY JEANS',
      description: 'Silueta kalhot na ulici. Široký baggy střih perfektně padající přes robustní tenisky. Masivní kovové knoflíky a kontrastní prošívání.',
      image: '/images/editorial/model-black-denim.jpg',
      ctaLink: '/product/run-washed-heavy-denim-baggy-jeans-charcoal',
      ctaText: 'Zobrazit Baggy džíny',
    },
    {
      title: 'HEAVYWEIGHT ATHLETIC FRENCH TERRY',
      subtitle: 'HEATHER GREY BAGGY SWEATPANTS',
      description: '450 GSM počesaná bavlna. Volný streetwear střih s prodlouženými šňůrami v pase a minimalistickou 3D výšivkou RUN.',
      image: '/images/editorial/model-grey-sweatpants.jpg',
      ctaLink: '/product/run-heavy-cotton-baggy-sweatpants-grey',
      ctaText: 'Zobrazit Tepláky',
    },
  ];

  return (
    <div className="bg-[#080809] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
            RUN VISUAL CAMPAIGN
          </span>
          <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight">
            EDITORIAL LOOKBOOK
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Oficiální kampaň Drop 01. Nekompromisní estetika, surové materiály a reálné snímky v městském prostoru.
          </p>
        </div>

        <div className="space-y-24">
          {editorialItems.map((item, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={`lg:col-span-7 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="rounded-lg overflow-hidden border border-[#222228] bg-[#121216] aspect-[4/3] group">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover img-zoom"
                  />
                </div>
              </div>

              <div className={`lg:col-span-5 space-y-4 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase block">
                  {item.subtitle}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black uppercase text-white leading-tight">
                  {item.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
                  {item.description}
                </p>
                <div className="pt-2">
                  <Link
                    href={item.ctaLink}
                    className="inline-flex items-center gap-2 bg-white text-black font-black uppercase text-xs tracking-wider px-6 py-3 rounded hover:bg-zinc-200 transition-colors"
                  >
                    <span>{item.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
