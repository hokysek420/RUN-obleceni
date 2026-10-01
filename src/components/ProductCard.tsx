'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Plus, Check } from 'lucide-react';
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
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [added, setAdded] = useState(false);

  const isFavorited = isInWishlist(product.id);

  // Status badge colors
  const statusStyles: Record<string, string> = {
    'SKLADEM': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'PŘEDOBJEDNÁVKA': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'LIMITOVANÁ EDICE': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    'VYPRODÁNO': 'bg-red-500/15 text-red-400 border-red-500/30',
  };

  // Secondary image for hover effect
  const secondaryImage = product.gallery && product.gallery.length > 1 ? product.gallery[1] : product.primary_image;

  // Available sizes
  const sizes = product.variants ? Array.from(new Set(product.variants.map((v) => v.size))) : ['S', 'M', 'L', 'XL'];
  const colors = product.variants ? Array.from(new Set(product.variants.map((v) => v.color))) : ['Standard'];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedSize && sizes.length > 0) {
      setQuickAddOpen(!quickAddOpen);
      return;
    }

    addToCart({
      id: `${product.id}-${selectedSize || 'OS'}-${colors[0]}`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.sale_price || product.price,
      image: product.primary_image,
      size: selectedSize || sizes[0],
      color: colors[0],
      quantity: 1,
      status: product.status,
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQuickAddOpen(false);
    }, 1200);
  };

  const handleSelectSizeAndAdd = (size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
    setTimeout(() => {
      setAdded(false);
      setQuickAddOpen(false);
    }, 1200);
  };

  return (
    <div
      className="group relative flex flex-col bg-[#0c0c0f] border border-[#1b1b22] hover:border-[#383844] rounded-sm transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setQuickAddOpen(false);
      }}
    >
      {/* Top Badges & Wishlist */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <span
          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border pointer-events-auto backdrop-blur-md ${
            statusStyles[product.status] || 'bg-zinc-800 text-zinc-300 border-zinc-700'
          }`}
        >
          {product.status}
        </span>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`p-1.5 rounded-full pointer-events-auto transition-colors backdrop-blur-md ${
            isFavorited
              ? 'bg-red-500 text-white'
              : 'bg-black/50 text-zinc-400 hover:text-white hover:bg-black/80'
          }`}
          aria-label="Přidat do oblíbených"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Image Area with Link */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-[#141418]">
        <img
          src={hovered && secondaryImage ? secondaryImage : product.primary_image}
          alt={product.name}
          className="w-full h-full object-cover img-zoom transition-all duration-500"
        />

        {/* Grammage / Spec pill */}
        {product.grammage && (
          <div className="absolute bottom-2.5 left-2.5 z-10 bg-black/70 backdrop-blur-sm text-[10px] font-mono tracking-wider text-zinc-300 px-2 py-0.5 rounded border border-white/10">
            {product.grammage}
          </div>
        )}
      </Link>

      {/* Quick Add Overlay Drawer if triggered */}
      {quickAddOpen && (
        <div className="absolute bottom-24 inset-x-2 z-30 bg-[#121216] border border-[#2e2e38] p-3 rounded shadow-2xl animate-in fade-in duration-200">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2 flex justify-between">
            <span>VYBERTE VELIKOST:</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickAddOpen(false);
              }}
              className="text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {sizes.map((sz) => (
              <button
                key={sz}
                onClick={(e) => handleSelectSizeAndAdd(sz, e)}
                className="py-1.5 bg-[#1b1b22] hover:bg-white hover:text-black border border-[#27272a] rounded text-xs font-bold text-white transition-colors"
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Card Body */}
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

          {/* Color hints */}
          {colors.length > 0 && (
            <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
              {colors.join(', ')}
            </div>
          )}
        </div>

        {/* Price & Quick Add Button */}
        <div className="pt-2 border-t border-[#1b1b22] flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="font-display text-sm sm:text-base text-white font-mono">
              {formatPrice(product.sale_price || product.price)}
            </span>
            {product.sale_price && (
              <span className="text-xs text-zinc-500 line-through font-mono">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={product.status === 'VYPRODÁNO'}
            className={`p-2 rounded transition-all duration-200 flex items-center justify-center ${
              added
                ? 'bg-emerald-500 text-white'
                : product.status === 'VYPRODÁNO'
                ? 'bg-[#18181c] text-zinc-600 cursor-not-allowed'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
            title={product.status === 'VYPRODÁNO' ? 'Vyprodáno' : 'Rychle přidat do košíku'}
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
