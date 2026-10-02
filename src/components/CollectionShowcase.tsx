'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface CollectionShowcaseProps {
  products: Product[];
}

const CATEGORY_FILTERS = [
  { id: 'all', label: 'VŠECHNY KUSY' },
  { id: 'outerwear', label: 'OUTERWEAR & MIKINY' },
  { id: 't-shirts', label: 'TRIČKA & TOPY' },
  { id: 'pants', label: 'KALHOTY & JEANS' },
  { id: 'footwear', label: 'FOOTWEAR' },
];

export default function CollectionShowcase({ products }: CollectionShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      if (activeCategory === 'outerwear') return cat.includes('outerwear') || cat.includes('mikiny') || cat.includes('hoodie');
      if (activeCategory === 't-shirts') return cat.includes('t-shirt') || cat.includes('tričk') || cat.includes('top');
      if (activeCategory === 'pants') return cat.includes('pant') || cat.includes('kalhot') || cat.includes('denim') || cat.includes('jean');
      if (activeCategory === 'footwear') return cat.includes('footwear') || cat.includes('obuv') || cat.includes('sneaker');
      return true;
    });
  }, [products, activeCategory]);

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header and Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-6">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-400 uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>COLLECTION 01 / ARCHIVE & DROPS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase text-white">
            RUN INTO ZERO
          </h2>
        </div>

        {/* Category Pill Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#101014] border border-[#202028] p-1.5 rounded-xl">
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors select-none ${
                  isActive ? 'text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Animated Products Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Simple, sleek bottom link to full shop */}
      <div className="mt-14 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white border-b border-zinc-700 hover:border-white pb-1 transition-all group"
        >
          <span>PROHLÉDNOUT VŠECHNY PRODUKTY V E-SHOPU</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
