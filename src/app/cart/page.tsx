'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, Truck, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    freeShippingThreshold,
    amountToFreeShipping,
    hasFreeShipping,
  } = useCart();

  const { formatPrice } = useCurrency();

  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (res.ok) {
        setDiscountAmount(data.discountAmount);
        setAppliedPromo(data.code);
        setPromoCode('');
      } else {
        setPromoError(data.error || 'Neplatný slevový kód');
      }
    } catch {
      setPromoError('Chyba při ověřování kódu');
    } finally {
      setPromoLoading(false);
    }
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <h1 className="font-display text-3xl uppercase text-white">VÁŠ KOŠÍK JE PRÁZDNÝ</h1>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          Zatím jste si do košíku nepřidali žádný kousek z kolekce RUN. Prozkoumejte náš nejnovější Drop 01.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-white text-black font-black uppercase text-xs tracking-widest px-8 py-4 rounded hover:bg-zinc-200 transition-colors"
        >
          PROZKOUMAT KOLEKCI RUN
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-[#1f1f26] pb-6 mb-8">
        <h1 className="font-display text-3xl sm:text-4xl uppercase text-white tracking-tight">
          NÁKUPNÍ KOŠÍK
        </h1>
        <span className="text-xs font-mono text-zinc-500 uppercase">
          {cart.reduce((s, i) => s + i.quantity, 0)} POLOŽEK V KOŠÍKU
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Free Shipping Alert Bar */}
          <div className="p-4 bg-[#111116] border border-[#222228] rounded-lg">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-2 text-zinc-300 font-medium">
                <Truck className="w-4 h-4 text-zinc-400" />
                {hasFreeShipping ? (
                  <strong className="text-emerald-400">Gratulujeme! Získali jste DOPRAVU ZDARMA.</strong>
                ) : (
                  <span>
                    Nakupte ještě za <strong>{formatPrice(amountToFreeShipping)}</strong> pro dopravu ZDARMA.
                  </span>
                )}
              </span>
              <span className="font-mono text-xs text-zinc-500">
                {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#222228] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  hasFreeShipping ? 'bg-emerald-500' : 'bg-white'
                }`}
                style={{
                  width: `${Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 text-[11px] font-mono text-zinc-500 uppercase tracking-widest pb-3 border-b border-[#18181f]">
            <span className="col-span-6">PRODUKT</span>
            <span className="col-span-2 text-center">CENA ZA KUS</span>
            <span className="col-span-2 text-center">MNOŽSTVÍ</span>
            <span className="col-span-2 text-right">CELKEM</span>
          </div>

          {/* Items */}
          <div className="divide-y divide-[#18181f]">
            {cart.map((item) => (
              <div key={item.id} className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Product info */}
                <div className="sm:col-span-6 flex space-x-4 items-center">
                  <div className="w-20 h-24 bg-[#141418] rounded overflow-hidden flex-shrink-0 border border-[#222228]">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-sm font-bold text-white hover:text-zinc-300 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <div className="text-xs font-mono text-zinc-400">
                      <span>Velikost: <strong className="text-white">{item.size}</strong></span>
                      <span className="mx-2">•</span>
                      <span>Barva: <strong className="text-white">{item.color}</strong></span>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1 pt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Odstranit položku</span>
                    </button>
                  </div>
                </div>

                {/* Unit price */}
                <div className="sm:col-span-2 text-left sm:text-center text-xs font-mono text-zinc-300">
                  <span className="sm:hidden text-zinc-500 mr-2">Cena:</span>
                  {formatPrice(item.price)}
                </div>

                {/* Quantity */}
                <div className="sm:col-span-2 flex sm:justify-center items-center">
                  <div className="flex items-center border border-[#2e2e38] rounded bg-[#0a0a0c]">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1.5 text-zinc-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-xs font-mono font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1.5 text-zinc-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Line total */}
                <div className="sm:col-span-2 text-left sm:text-right font-display text-sm sm:text-base font-mono text-white">
                  <span className="sm:hidden text-zinc-500 mr-2">Celkem:</span>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4">
            <Link
              href="/shop"
              className="text-xs font-mono text-zinc-400 hover:text-white uppercase tracking-wider"
            >
              ← Pokračovat v nákupu
            </Link>
            <button
              onClick={clearCart}
              className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
            >
              Vyprázdnit košík
            </button>
          </div>
        </div>

        {/* Right: Summary Box (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-[#0e0e12] border border-[#222228] rounded-lg p-6 space-y-6 sticky top-28">
            <h2 className="font-display text-lg uppercase text-white tracking-wider border-b border-[#1f1f26] pb-3">
              SHRNUTÍ OBJEDNÁVKY
            </h2>

            {/* Promo code form */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label className="text-xs uppercase font-mono tracking-wider text-zinc-400 font-bold block">
                Slevový kód / Voucher
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="KÓD (např. RUN10)"
                  className="bg-[#18181f] border border-[#2e2e38] rounded-l px-3 py-2 text-xs text-white uppercase font-mono placeholder-zinc-500 focus:outline-none focus:border-white flex-1"
                />
                <button
                  type="submit"
                  disabled={promoLoading}
                  className="bg-white text-black font-bold uppercase text-xs px-4 rounded-r hover:bg-zinc-200 transition-colors"
                >
                  POUŽÍT
                </button>
              </div>
              {promoError && <p className="text-[11px] text-red-400">{promoError}</p>}
              {appliedPromo && (
                <div className="p-2 bg-emerald-950/40 border border-emerald-800 text-emerald-400 rounded text-xs flex justify-between items-center">
                  <span>Kód {appliedPromo} uplatněn</span>
                  <span className="font-mono font-bold">-{formatPrice(discountAmount)}</span>
                </div>
              )}
            </form>

            {/* Price lines */}
            <div className="space-y-2 pt-2 text-xs font-mono border-t border-[#1f1f26]">
              <div className="flex justify-between text-zinc-400">
                <span>Mezisoučet produktů:</span>
                <span className="text-zinc-200 font-bold">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Sleva ({appliedPromo}):</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-400">
                <span>Doprava:</span>
                <span>
                  {hasFreeShipping ? (
                    <strong className="text-emerald-400">ZDARMA</strong>
                  ) : (
                    'od 79 Kč (spočteno v dalším kroku)'
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-white pt-3 border-t border-[#1f1f26]">
                <span>CELKEM S DPH:</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center space-x-2 bg-white text-black font-black uppercase text-xs tracking-widest py-4 rounded hover:bg-zinc-200 transition-colors shadow-2xl"
            >
              <span>POKRAČOVAT K POKLADNĚ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="space-y-2 pt-2 border-t border-[#1a1a22] text-[11px] text-zinc-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Bezpečné šifrované SSL spojení</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Rychlá expedice přes Zásilkovnu nebo kurýra</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
