import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, Layers } from 'lucide-react';
import RunLogo from '@/components/RunLogo';
import CreatorsSection from '@/components/CreatorsSection';

export default function AboutPage() {
  return (
    <div className="bg-[#080809] text-white py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <RunLogo size="lg" className="mx-auto" />
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block pt-4">
            MANIFEST ZNAČKY & DESIGN PHILOSOPHY
          </span>
          <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-white leading-tight">
            MORE THAN CLOTHES. IT’S A MINDSET.
          </h1>
        </div>

        {/* Hero Editorial Campaign Banner */}
        <div className="aspect-[16/9] rounded-lg overflow-hidden border border-[#222228] bg-[#121216]">
          <img
            src="/images/editorial/campaign-hero-models.jpg"
            alt="RUN Campaign"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Narrative / Manifesto Statement */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5 space-y-4">
            <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
              KDO JSME
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white leading-snug">
              ZROZENO V PRAZE PRO TY, KTEŘÍ SE POHYBUJÍ JINAK.
            </h2>
            <div className="w-12 h-0.5 bg-white"></div>
          </div>

          <div className="md:col-span-7 space-y-6 text-sm text-zinc-300 leading-relaxed font-light">
            <p>
              Značka <strong>RUN</strong> nevznikla proto, aby zapadla do uniformity fast-fashionu nebo sezónních výprodejů. Naším posláním je navrhovat oděvy s brutální fyzickou vahou, nekompromisními materiály a provokativním poselstvím.
            </p>
            <p>
              Zatímco většina trhu šetří na hustotě vláken a levných zipech, my pracujeme s <strong className="text-white">550 GSM oboustranným faux-fur teddy fleecem</strong>, <strong className="text-white">14.5 oz japonským/těžkým denimem</strong> a celokovovým hardwarem RUN s gravírovanými detaily.
            </p>

            <blockquote className="p-4 bg-[#111116] border-l-2 border-white italic text-white text-sm font-medium">
              „YOU’LL NEVER DO IT. YOU HAVE NOTHING.“
              <span className="block text-[11px] font-mono uppercase text-zinc-500 not-italic mt-1">
                Zadní podpisová grafika, která redefinuje motivaci skrz surovou realitu ulice.
              </span>
            </blockquote>

            <p>
              RUN funguje v limitovaných vlnách — <strong>DROP SYSTEM</strong>. Každý kousek má svůj konkrétní certifikát originality a jakmile je várka vyprodána, přechází do archivu.
            </p>
          </div>
        </div>

        {/* 3 Pillars / Materials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-[#18181f]">
          <div className="p-6 bg-[#0e0e12] border border-[#222228] rounded-lg space-y-3">
            <Layers className="w-6 h-6 text-zinc-200" />
            <h3 className="font-display text-sm uppercase text-white tracking-wider">
              3 MATERIÁLY ∞ JEDEN POHYB
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Kombinace vysokogramážního teddy fleecu, pevného denimu a čisté česané bavlny tvoří dokonale vyvážený siluetový kontrast.
            </p>
          </div>

          <div className="p-6 bg-[#0e0e12] border border-[#222228] rounded-lg space-y-3">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <h3 className="font-display text-sm uppercase text-white tracking-wider">
              ZAKÁZKOVÝ HARDWARE
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Kovové zipy, gravírované pullery, masivní džínové knoflíky a kovové koncovky tkaniček jsou vyráběny na zakázku pouze pro RUN.
            </p>
          </div>

          <div className="p-6 bg-[#0e0e12] border border-[#222228] rounded-lg space-y-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h3 className="font-display text-sm uppercase text-white tracking-wider">
              CERTIFIKACE ORIGINALITY
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Limitované série obsahují unikátní kód osvědčení pravosti. Garance originality a sběratelské hodnoty.
            </p>
          </div>
        </div>

        {/* Creators Section */}
        <div className="pt-8 border-t border-[#18181f]">
          <CreatorsSection />
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-white text-black font-black uppercase text-xs tracking-widest px-8 py-4 rounded hover:bg-zinc-200 transition-colors shadow-2xl"
          >
            <span>PROZKOUMAT KOLEKCI DROP 01</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
