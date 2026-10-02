'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Plus, Check, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [hovered, setHovered] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const isFavorited = isInWishlist(product.id);

  // Status badge styling
  const statusStyles: Record<string, string> = {
    'SKLADEM': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    'PŘEDOBJEDNÁVKA': 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    'LIMITOVANÁ EDICE': 'bg-purple-500/10 text-purple-300 border-purple-500/25',
    'VYPRODÁNO': 'bg-red-500/10 text-red-400 border-red-500/25',
  };

  // Secondary image for hover crossfade
  const secondaryImage = product.gallery && product.gallery.length > 1 ? product.gallery[1] : null;

  // Available sizes
  const sizes = product.variants ? Array.from(new Set(product.variants.map((v) => v.size))) : ['S', 'M', 'L', 'XL'];
  const colors = product.variants ? Array.from(new Set(product.variants.map((v) => v.color))) : ['Standard'];

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (sizes.length > 1) {
      setQuickAddOpen(!quickAddOpen);
      return;
    }

    executeAddToCart(sizes[0] || 'OS');
  };

  const executeAddToCart = (size: string) => {
    addToCart({
      id: `${product.id}-${size}-${colors[0]}`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.sale_price || product.price,
      image: product.primary_image,
      size: size,
      color: colors[0],
      quantity: 1,
      status: product.status,
    });

    setAdded(true);
    setQuickAddOpen(false);
    setTimeout(() => {
      setAdded(false);
    }, 1400);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setQuickAddOpen(false);
      }}
      className="group relative flex flex-col bg-[#0c0c0f] border border-[#1b1b22] hover:border-[#383844] rounded-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden"
    >
      {/* Top Badges & Wishlist */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <span
          className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border pointer-events-auto backdrop-blur-md transition-all ${
            statusStyles[product.status] || 'bg-zinc-800 text-zinc-300 border-zinc-700'
          }`}
        >
          {product.status}
        </span>

        <div className="flex items-center space-x-1.5">
          {/* 3D Model Indicator */}
          <span className="hidden sm:inline-flex items-center gap-1 bg-black/70 backdrop-blur-md text-cyan-400 border border-cyan-500/30 text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full shadow-lg">
            <Box className="w-2.5 h-2.5 animate-spin" />
            3D
          </span>

          {/* Heart button with bounce on click */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-1.5 rounded-full pointer-events-auto transition-colors backdrop-blur-md shadow-md ${
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-black/60 text-zinc-400 hover:text-white hover:bg-black/90'
            }`}
            aria-label="Uložit do oblíbených"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Image Showcase with Smooth Crossfade */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-[#141418]">
        {/* Primary Image */}
        <img
          src={product.primary_image}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            hovered && secondaryImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
        />

        {/* Secondary Image Crossfade */}
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
              hovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
          />
        )}

        {/* Grammage / Spec badge */}
        {product.grammage && (
          <div className="absolute bottom-2.5 left-2.5 z-10 bg-black/75 backdrop-blur-sm text-[10px] font-mono tracking-wider text-zinc-300 px-2 py-0.5 rounded border border-white/10">
            {product.grammage}
          </div>
        )}
      </Link>

      {/* Quick Add Size Overlay Drawer */}
      <AnimatePresence>
        {quickAddOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-24 inset-x-2 z-30 bg-[#121216]/95 backdrop-blur-md border border-[#2e2e38] p-3 rounded-xl shadow-2xl"
          >
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2 flex justify-between items-center">
              <span>ZVOLTE VELIKOST:</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuickAddOpen(false);
                }}
                className="text-zinc-500 hover:text-white px-1"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    executeAddToCart(sz);
                  }}
                  className="py-1.5 bg-[#1b1b22] hover:bg-white hover:text-black border border-[#27272a] rounded-lg text-xs font-bold text-white transition-colors"
                >
                  {sz}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-1">
            {product.category}
          </div>
          <Link
            href={`/product/${product.slug}`}
            className="text-xs sm:text-sm font-bold text-white hover:text-zinc-300 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>

          {colors.length > 0 && (
            <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
              {colors.join(', ')}
            </div>
          )}
        </div>

        {/* Pricing and Quick Add */}
        <div className="pt-2 border-t border-[#1b1b22] flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="font-mono font-bold text-sm sm:text-base text-white">
              {formatPrice(product.sale_price || product.price)}
            </span>
            {product.sale_price && (
              <span className="text-xs text-zinc-500 line-through font-mono">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleQuickAddClick}
            disabled={product.status === 'VYPRODÁNO'}
            className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
              added
                ? 'bg-emerald-500 text-white'
                : product.status === 'VYPRODÁNO'
                ? 'bg-[#18181c] text-zinc-600 cursor-not-allowed'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
            title={product.status === 'VYPRODÁNO' ? 'Vyprodáno' : 'Přidat do košíku'}
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
