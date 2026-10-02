'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  heroContent: {
    headline?: string;
    subheadline?: string;
    tagline?: string;
    bgImage?: string;
  };
}

export default function HeroSection({ heroContent }: HeroSectionProps) {
  return (
    <section className="relative min-h-[88vh] sm:min-h-[94vh] flex items-end justify-start overflow-hidden border-b border-[#18181f]">
      {/* Background Image with Cinematic Grading */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full"
        >
          <picture>
            <source srcSet="/images/editorial/campaign-hero-models.webp" type="image/webp" />
            <img
              src={heroContent.bgImage || '/images/editorial/campaign-hero-models.jpg'}
              alt="RUN Streetwear Campaign"
              className="w-full h-full object-cover object-top filter brightness-[0.88] contrast-[1.08]"
            />
          </picture>
        </motion.div>

        {/* Ambient Gradient Overlays for readability and seamless edge blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-black/40 to-black/20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#080809] to-transparent pointer-events-none" />
      </div>

      {/* Main Content with Staggered Entrance */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 pt-32">
        <div className="max-w-3xl space-y-6">
          {/* Subtle Live Drop Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="inline-flex items-center space-x-2.5 bg-black/60 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-200">
              {heroContent.tagline || 'DROP 01 / RUN INTO ZERO'}
            </span>
          </motion.div>

          {/* Huge Minimalist Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.88] text-white"
          >
            {heroContent.headline || 'MOVE DIFFERENT.'}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-xl font-light text-zinc-300 tracking-wide max-w-xl leading-relaxed"
          >
            {heroContent.subheadline || 'MORE THAN CLOTHES. IT’S A MINDSET.'}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/shop"
                className="bg-white text-black font-black uppercase text-xs sm:text-sm tracking-widest px-8 py-4 rounded hover:bg-zinc-200 transition-colors shadow-2xl flex items-center gap-2.5 group"
              >
                <span>PROZKOUMAT DROP 01</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/editorial"
                className="border border-white/30 text-white font-bold uppercase text-xs sm:text-sm tracking-widest px-6 py-4 rounded hover:bg-white/10 backdrop-blur-sm transition-all"
              >
                LOOKBOOK
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Sleek Minimalist Bottom Information Bar */}
      <div className="absolute bottom-6 left-4 sm:left-8 z-10 hidden sm:flex items-center space-x-3 text-[11px] font-mono text-zinc-400">
        <div className="w-1.5 h-5 rounded-full border border-white/30 flex items-start justify-center p-0.5">
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-1 bg-white rounded-full"
          />
        </div>
        <span className="tracking-widest uppercase">SCROLL</span>
      </div>

      <div className="absolute bottom-6 right-4 sm:right-8 z-10 hidden md:flex items-center space-x-5 text-[11px] font-mono text-zinc-400">
        <span>550 GSM HEAVY FAUX-FUR</span>
        <span className="text-zinc-600">•</span>
        <span>14.5 OZ SELVEDGE DENIM</span>
        <span className="text-zinc-600">•</span>
        <span>AIR RUNNING UNIT</span>
      </div>
    </section>
  );
}
