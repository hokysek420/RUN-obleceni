import React from 'react';
import { Sparkles, Terminal, Palette, ShieldCheck } from 'lucide-react';

interface Creator {
  name: string;
  role: string;
  badge: string;
  initials: string;
  description: string;
  skills: string[];
}

const creators: Creator[] = [
  {
    name: 'hokysek',
    role: 'Founder & Creative Director',
    badge: 'CREATIVE DIRECTION',
    initials: 'H',
    description: 'Vize a identita značky RUN, celkový koncept kolekce Drop 01 (RUN INTO ZERO), lookbook art direction a definice streetwear estetiky.',
    skills: ['Brand Vision', 'Creative Direction', 'Drop 01 Concept', 'Streetwear Art'],
  },
  {
    name: 'Pavel Bauer',
    role: 'Design & Production Architecture',
    badge: 'DESIGN & PRODUCTION',
    initials: 'PB',
    description: 'Technická konstrukce oděvních siluet, architektura detailů a kovového hardwaru, specifikace 550 GSM materiálů a digitální platforma.',
    skills: ['Garment Architecture', 'Hardware Design', 'Material Engineering', 'Platform Build'],
  },
];

export default function CreatorsSection() {
  return (
    <section className="py-20 bg-[#070709] border-t border-[#1a1a22]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-300">
              CREATIVE DIRECTION & ARCHITECTURE
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
            LIDÉ, KTEŘÍ NA TOM PRACOVALI
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
            Kolektiv stojící za vznikem značky RUN, architekturou oděvních střihů, výběrem materiálů a realizací první oficiální kolekce Drop 01.
          </p>
        </div>

        {/* Creators Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {creators.map((c) => (
            <div
              key={c.name}
              className="group relative bg-[#0d0d12] border border-[#202028] hover:border-zinc-500 rounded-xl p-8 transition-all duration-300 hover:shadow-2xl overflow-hidden flex flex-col justify-between"
            >
              {/* Subtle Ambient Background Glow on Hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div>
                {/* Header with Monogram and Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1a1a24] to-[#0f0f15] border border-white/20 flex items-center justify-center text-white font-black text-lg tracking-wider font-display shadow-lg group-hover:border-white transition-colors">
                    {c.initials}
                  </div>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-400 bg-[#16161f] border border-[#272736] px-2.5 py-1 rounded-full uppercase">
                    {c.badge}
                  </span>
                </div>

                {/* Name & Role */}
                <h3 className="text-2xl font-black uppercase text-white tracking-tight mb-1 group-hover:text-zinc-200 transition-colors">
                  {c.name}
                </h3>
                <p className="text-xs font-mono font-semibold text-zinc-400 mb-4">
                  {c.role}
                </p>

                {/* Description */}
                <p className="text-xs text-zinc-300 leading-relaxed font-light mb-6">
                  {c.description}
                </p>
              </div>

              {/* Skills Tags */}
              <div className="pt-4 border-t border-[#1c1c24] flex flex-wrap gap-1.5">
                {c.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-mono bg-[#14141a] text-zinc-400 px-2.5 py-1 rounded border border-[#22222e]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Verification Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-[11px] font-mono text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <span>OFFICIAL RUN BRAND TEAM • ALL RIGHTS RESERVED © 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}
