'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function CartDrawer() {
  const pathname = usePathname();
  const {
    cart,
    isOpen,
    setIsOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    freeShippingThreshold,
    amountToFreeShipping,
    hasFreeShipping,
  } = useCart();
  const { formatPrice } = useCurrency();

  if (!isOpen || pathname.startsWith('/admin')) return null;

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0e0e12] border-l border-[#222228] flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-[#1f1f24] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-display text-lg tracking-wider text-white">NÁKUPNÍ KOŠÍK</span>
              <span className="text-xs bg-[#222228] text-zinc-400 px-2 py-0.5 rounded font-mono">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              aria-label="Zavřít košík"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-6 py-3 bg-[#141418] border-b border-[#222228]">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Truck className="w-3.5 h-3.5 text-zinc-400" />
                {hasFreeShipping ? (
                  <span className="text-emerald-400 font-bold">Máte dopravu ZDARMA!</span>
                ) : (
                  <span>
                    Do dopravy zdarma chybí ještě{' '}
                    <strong className="text-white">{formatPrice(amountToFreeShipping)}</strong>
                  </span>
                )}
              </span>
              <span className="text-zinc-500 font-mono text-[11px]">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#27272a] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  hasFreeShipping ? 'bg-emerald-500' : 'bg-white'
                }`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#18181c] border border-[#27272a] flex items-center justify-center text-zinc-600">
                  <Truck className="w-8 h-8" />
                </div>
                <p className="text-zinc-400 text-sm">Váš nákupní košík je prázdný.</p>
                <Link
                  href="/shop"
                  onClick={() => setIsOpen(false)}
                  className="inline-block bg-white text-black font-bold text-xs uppercase tracking-widest px-6 py-3 rounded hover:bg-zinc-200 transition-colors"
                >
                  PROZKOUMAT DROP 01
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-4 p-3 bg-[#131317] border border-[#222228] rounded-md relative group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-[#1b1b22] rounded overflow-hidden relative flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="text-xs font-bold text-white hover:text-zinc-300 line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-500 hover:text-red-400 transition-colors ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] text-zinc-400 mt-1 font-mono">
                        <span>Velikost: <strong className="text-zinc-200">{item.size}</strong></span>
                        <span>•</span>
                        <span>Barva: <strong className="text-zinc-200">{item.color}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#222228]">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-[#2e2e34] rounded bg-[#0a0a0c]">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total for item */}
                      <span className="text-xs font-black text-white font-mono">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Quick Outfit Recommendation Upsell */}
            {cart.length > 0 && !cart.some((it) => it.slug?.includes('tshirt')) && (
              <div className="p-3 bg-[#131318] border border-[#272730] rounded-lg mt-4">
                <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase block mb-2">
                  DOPORUČUJEME DO KOMBINACE:
                </span>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <img
                      src="/images/products/tshirt-white-front.jpg"
                      alt="RUN Boxy T-Shirt"
                      className="w-10 h-12 object-cover rounded bg-[#1b1b22] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        RUN Boxy T-Shirt — White
                      </p>
                      <p className="text-[11px] font-mono text-zinc-300">
                        {formatPrice(1490)} • 280 GSM
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addToCart({
                        id: '6-L-Pure White',
                        productId: 6,
                        name: 'RUN "YOU HAVE NOTHING" Heavyweight Boxy T-Shirt — White',
                        slug: 'run-you-have-nothing-heavyweight-boxy-tshirt-white',
                        price: 1490,
                        image: '/images/products/tshirt-white-front.jpg',
                        size: 'L',
                        color: 'Pure White',
                        quantity: 1,
                        status: 'SKLADEM',
                      });
                    }}
                    className="flex-shrink-0 bg-white hover:bg-zinc-200 text-black text-[11px] font-black px-3 py-1.5 rounded transition-colors uppercase"
                  >
                    + PŘIDAT
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {cart.length > 0 && (
            <div className="p-6 bg-[#0a0a0d] border-t border-[#1f1f24] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Mezisoučet</span>
                  <span className="font-mono text-zinc-200 font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Doprava</span>
                  <span className="font-mono text-zinc-200 font-bold">
                    {hasFreeShipping ? (
                      <span className="text-emerald-400">ZDARMA</span>
                    ) : (
                      'Bude spočteno v pokladně'
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-[#1f1f24]">
                  <span>Celkem k úhradě</span>
                  <span className="font-mono text-base">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 bg-white text-black font-black text-xs uppercase tracking-widest py-3.5 rounded hover:bg-zinc-200 transition-colors shadow-lg"
                >
                  <span>PŘEJÍT K POKLADNĚ</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="w-full block text-center border border-[#27272a] text-zinc-300 font-bold text-xs uppercase tracking-wider py-2.5 rounded hover:bg-[#18181c] hover:text-white transition-colors"
                >
                  ZOBRAZIT CELÝ KOŠÍK
                </Link>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-zinc-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Bezpečný nákup & 14 dní garance vrácení</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
