import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, Award, Lock, ArrowRight } from 'lucide-react';

export default function QualityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white space-y-12">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
          ZÁRUKA & AUTENTICITA
        </span>
        <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight">
          ZÁRUKA KVALITY & CERTIFIKÁT
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Jak garantujeme původ, materiálovou integritu a sběratelskou hodnotu každého kusu RUN.
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-[#0e0e12] border border-[#222228] p-8 rounded-lg space-y-4">
          <div className="flex items-center space-x-3 text-cyan-400">
            <Sparkles className="w-6 h-6" />
            <h2 className="font-display text-xl uppercase tracking-wide text-white">
              CERTIFIKÁT ORIGINALITY (RUN CERTIFICATE)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Každý limitovaný produkt z edice Drop 01 má své unikátní sériové číslo certifikátu (např.{' '}
            <code className="text-white bg-black px-1.5 py-0.5 rounded font-mono">RUN-CERT-DROP1-0892</code>). Tento certifikát je fyzicky přiložen v prémiovém packagingu a zároveň digitálně zapsán v naší centrální databázi.
          </p>
          <div className="p-4 bg-[#141418] border border-[#222228] rounded text-xs font-mono text-zinc-400">
            Pravost svého certifikátu můžete kdykoliv ověřit prostřednictvím zákaznické podpory RUN nebo v showroomu v Praze.
          </div>
        </div>

        <div className="bg-[#0e0e12] border border-[#222228] p-8 rounded-lg space-y-4">
          <div className="flex items-center space-x-3 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
            <h2 className="font-display text-xl uppercase tracking-wide text-white">
              ZÁRUKA RUN LIFETIME HARDWARE
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Věříme v trvanlivost našich zakázkových kovových prvků. Poskytujeme rozšířenou záruku na veškeré zipy, kovové jezdce, nýty a shank knoflíky. V případě technického selhání kování vám díl bezplatně vyměníme.
          </p>
        </div>
      </div>
    </div>
  );
}
