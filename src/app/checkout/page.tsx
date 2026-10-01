'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Truck,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Tag,
  Gift
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart, hasFreeShipping } = useCart();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  // Contact Info
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Shipping Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('Česká republika');

  // Billing Address
  const [differentBilling, setDifferentBilling] = useState(false);
  const [bStreet, setBStreet] = useState('');
  const [bCity, setBCity] = useState('');
  const [bZip, setBZip] = useState('');
  const [bCountry, setBCountry] = useState('Česká republika');

  // Delivery & Payment selection
  const [deliveryMethod, setDeliveryMethod] = useState<'Zásilkovna' | 'Kurýrní služba' | 'Osobní odběr'>('Zásilkovna');
  const [pickupPoint, setPickupPoint] = useState('Výdejní místo / Z-BOX Praha Revoluční 12');
  const [paymentMethod, setPaymentMethod] = useState<'Platba kartou' | 'Apple Pay' | 'Bankovní převod' | 'Dobírka'>('Platba kartou');

  // Discounts & Gift Cards
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');

  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardAmount, setGiftCardAmount] = useState(0);
  const [appliedGiftCard, setAppliedGiftCard] = useState<string | null>(null);
  const [giftCardError, setGiftCardError] = useState('');

  // Terms & Submit State
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Autofill if customer is logged in
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhone(user.phone || '');
      setStreet(user.street || '');
      setCity(user.city || '');
      setZip(user.zip || '');
      if (user.country) setCountry(user.country);
    }
  }, [user]);

  // Shipping Price calculation
  let shippingPrice = 0;
  if (!hasFreeShipping) {
    if (deliveryMethod === 'Zásilkovna') shippingPrice = 79;
    if (deliveryMethod === 'Kurýrní služba') shippingPrice = 119;
    if (deliveryMethod === 'Osobní odběr') shippingPrice = 0;
  }

  // COD fee
  let paymentFee = 0;
  if (paymentMethod === 'Dobírka') paymentFee = 49;

  // Final Total
  const total = Math.max(0, subtotal - discountAmount - giftCardAmount + shippingPrice + paymentFee);

  // Apply Promo
  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountCode.trim()) return;
    setPromoError('');
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (res.ok) {
        setDiscountAmount(data.discountAmount);
        setAppliedPromo(data.code);
        setDiscountCode('');
      } else {
        setPromoError(data.error || 'Neplatný slevový kód');
      }
    } catch {
      setPromoError('Chyba spojení');
    }
  };

  // Apply Gift Card
  const handleApplyGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCardCode.trim()) return;
    setGiftCardError('');
    try {
      const res = await fetch('/api/gift-cards/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: giftCardCode.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        const applicable = Math.min(data.balance, subtotal - discountAmount);
        setGiftCardAmount(applicable);
        setAppliedGiftCard(data.code);
        setGiftCardCode('');
      } else {
        setGiftCardError(data.error || 'Neplatný dárkový poukaz');
      }
    } catch {
      setGiftCardError('Chyba spojení');
    }
  };

  // Submit Order
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!agreeTerms) {
      setErrorMsg('Pro dokončení nákupu je nutné odsouhlasit obchodní podmínky.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: `${firstName} ${lastName}`.trim(),
        customerEmail: email,
        customerPhone: phone,
        shippingStreet: street,
        shippingCity: city,
        shippingZip: zip,
        shippingCountry: country,
        billingStreet: differentBilling ? bStreet : street,
        billingCity: differentBilling ? bCity : city,
        billingZip: differentBilling ? bZip : zip,
        billingCountry: differentBilling ? bCountry : country,
        deliveryMethod,
        deliveryPickupPoint: deliveryMethod === 'Zásilkovna' ? pickupPoint : null,
        shippingPrice,
        paymentMethod: `${paymentMethod}${paymentFee > 0 ? ' (+ dobírka 49 Kč)' : ''}`,
        discountCode: appliedPromo,
        discountAmount,
        giftCardCode: appliedGiftCard,
        giftCardAmount,
        subtotal,
        total,
        items: cart,
      };

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.orderNumber) {
        clearCart();
        router.push(`/order-confirmation/${data.orderNumber}`);
      } else {
        setErrorMsg(data.error || 'Objednávku se nepodařilo dokončit.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Chyba při odesílání.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="font-display text-2xl uppercase text-white">VÁŠ KOŠÍK JE PRÁZDNÝ</h1>
        <p className="text-zinc-400 text-xs">Před přechodem k pokladně vložte produkty do košíku.</p>
        <Link
          href="/shop"
          className="inline-block bg-white text-black font-black uppercase text-xs px-6 py-3 rounded"
        >
          ZPĚT DO OBCHODU
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-[#1f1f26] pb-6 mb-8 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block mb-1">
            RUN POKLADNA / SECURE CHECKOUT
          </span>
          <h1 className="font-display text-2xl sm:text-3xl uppercase text-white tracking-tight">
            DOKONČENÍ OBJEDNÁVKY
          </h1>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-zinc-400">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>256-BIT SSL ENCRYPTION</span>
        </div>
      </div>

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form: Customer, Shipping, Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Guest checkout message if not logged in */}
          {!user && (
            <div className="p-4 bg-[#111116] border border-[#27272a] rounded flex items-center justify-between text-xs">
              <span className="text-zinc-300">
                Nakupujete jako <strong>host bez registrace</strong>. Máte již účet?
              </span>
              <Link href="/account" className="text-white underline font-bold hover:text-zinc-200">
                Přihlásit se →
              </Link>
            </div>
          )}

          {/* 1. Kontaktní údaje */}
          <div className="space-y-4">
            <h2 className="font-display text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white text-black text-[11px] font-mono font-bold flex items-center justify-center">
                1
              </span>
              <span>KONTAKTNÍ ÚDAJE</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Jméno *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jan"
                  className="w-full bg-[#121216] border border-[#27272a] rounded px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Příjmení *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Novák"
                  className="w-full bg-[#121216] border border-[#27272a] rounded px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  E-mail * (pro potvrzení objednávky)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jan.novak@email.cz"
                  className="w-full bg-[#121216] border border-[#27272a] rounded px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Telefon * (pro kurýra / SMS kód)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+420 777 123 456"
                  className="w-full bg-[#121216] border border-[#27272a] rounded px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>
            </div>
          </div>

          {/* 2. Doručovací adresa */}
          <div className="space-y-4 pt-4 border-t border-[#1a1a22]">
            <h2 className="font-display text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white text-black text-[11px] font-mono font-bold flex items-center justify-center">
                2
              </span>
              <span>DORUČOVACÍ ADRESA</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Ulice a číslo popisné *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Vodičkova 15"
                  className="w-full bg-[#121216] border border-[#27272a] rounded px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Město *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Praha 1"
                  className="w-full bg-[#121216] border border-[#27272a] rounded px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  PSČ *
                </label>
                <input
                  type="text"
                  required
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="110 00"
                  className="w-full bg-[#121216] border border-[#27272a] rounded px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Země doručení
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#121216] border border-[#27272a] rounded px-3 py-2.5 text-xs text-white focus:outline-none focus:border-white"
                >
                  <option value="Česká republika">Česká republika (CZ)</option>
                  <option value="Slovensko">Slovensko (SK)</option>
                  <option value="Německo">Německo (DE)</option>
                  <option value="Rakousko">Rakousko (AT)</option>
                </select>
              </div>
            </div>

            {/* Checkbox for different billing address */}
            <div className="pt-2">
              <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={differentBilling}
                  onChange={(e) => setDifferentBilling(e.target.checked)}
                  className="rounded border-[#27272a] bg-[#121216] text-white focus:ring-0"
                />
                <span>Zadat jinou fakturační adresu nebo firemní údaje (IČO / DIČ)</span>
              </label>

              {differentBilling && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 p-4 bg-[#111116] border border-[#222228] rounded">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                      Fakturační ulice a č.p.
                    </label>
                    <input
                      type="text"
                      value={bStreet}
                      onChange={(e) => setBStreet(e.target.value)}
                      className="w-full bg-[#18181f] border border-[#2e2e38] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                      Město
                    </label>
                    <input
                      type="text"
                      value={bCity}
                      onChange={(e) => setBCity(e.target.value)}
                      className="w-full bg-[#18181f] border border-[#2e2e38] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                      PSČ
                    </label>
                    <input
                      type="text"
                      value={bZip}
                      onChange={(e) => setBZip(e.target.value)}
                      className="w-full bg-[#18181f] border border-[#2e2e38] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Způsob dopravy */}
          <div className="space-y-4 pt-4 border-t border-[#1a1a22]">
            <h2 className="font-display text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white text-black text-[11px] font-mono font-bold flex items-center justify-center">
                3
              </span>
              <span>ZPŮSOB DORUČENÍ</span>
            </h2>

            <div className="space-y-2">
              {/* Zásilkovna */}
              <label
                className={`flex items-start justify-between p-3.5 border rounded-lg cursor-pointer transition-colors ${
                  deliveryMethod === 'Zásilkovna'
                    ? 'border-white bg-[#14141a]'
                    : 'border-[#222228] bg-[#0f0f13] hover:border-zinc-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === 'Zásilkovna'}
                    onChange={() => setDeliveryMethod('Zásilkovna')}
                    className="mt-1 text-white focus:ring-0"
                  />
                  <div>
                    <span className="font-bold text-xs text-white block">
                      Zásilkovna — Výdejní místa & Z-BOX
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Vyzvednutí na více než 9 000 místech po celé ČR/SK
                    </span>
                    {deliveryMethod === 'Zásilkovna' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={pickupPoint}
                          onChange={(e) => setPickupPoint(e.target.value)}
                          placeholder="Zvolte nebo napište výdejní místo / Z-BOX..."
                          className="bg-[#18181f] border border-[#2e2e38] rounded px-2.5 py-1.5 text-xs text-white w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-white">
                  {hasFreeShipping ? <span className="text-emerald-400">ZDARMA</span> : '79 Kč'}
                </span>
              </label>

              {/* Kurýr DPD/GLS */}
              <label
                className={`flex items-start justify-between p-3.5 border rounded-lg cursor-pointer transition-colors ${
                  deliveryMethod === 'Kurýrní služba'
                    ? 'border-white bg-[#14141a]'
                    : 'border-[#222228] bg-[#0f0f13] hover:border-zinc-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === 'Kurýrní služba'}
                    onChange={() => setDeliveryMethod('Kurýrní služba')}
                    className="mt-1 text-white focus:ring-0"
                  />
                  <div>
                    <span className="font-bold text-xs text-white block">
                      Kurýrní služba (DPD / GLS domů)
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Doručení přímo na vámi zadanou adresu do rukou
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-white">
                  {hasFreeShipping ? <span className="text-emerald-400">ZDARMA</span> : '119 Kč'}
                </span>
              </label>

              {/* Osobní odběr Showroom */}
              <label
                className={`flex items-start justify-between p-3.5 border rounded-lg cursor-pointer transition-colors ${
                  deliveryMethod === 'Osobní odběr'
                    ? 'border-white bg-[#14141a]'
                    : 'border-[#222228] bg-[#0f0f13] hover:border-zinc-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === 'Osobní odběr'}
                    onChange={() => setDeliveryMethod('Osobní odběr')}
                    className="mt-1 text-white focus:ring-0"
                  />
                  <div>
                    <span className="font-bold text-xs text-white block">
                      Osobní odběr — RUN Showroom Praha
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Revoluční 12, Praha 1 • Vyzkoušení a káva zdarma
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400">ZDARMA</span>
              </label>
            </div>
          </div>

          {/* 4. Způsob platby */}
          <div className="space-y-4 pt-4 border-t border-[#1a1a22]">
            <h2 className="font-display text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white text-black text-[11px] font-mono font-bold flex items-center justify-center">
                4
              </span>
              <span>ZPŮSOB PLATBY</span>
            </h2>

            <div className="space-y-2">
              {/* Karta */}
              <label
                className={`flex items-start justify-between p-3.5 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'Platba kartou'
                    ? 'border-white bg-[#14141a]'
                    : 'border-[#222228] bg-[#0f0f13] hover:border-zinc-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Platba kartou'}
                    onChange={() => setPaymentMethod('Platba kartou')}
                    className="mt-1 text-white focus:ring-0"
                  />
                  <div>
                    <span className="font-bold text-xs text-white block">
                      Platba kartou online (Visa / Mastercard)
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Okamžité bezpečné připsání přes zabezpečenou 3D Secure bránu
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs text-emerald-400 font-bold">ZDARMA</span>
              </label>

              {/* Apple Pay / Google Pay */}
              <label
                className={`flex items-start justify-between p-3.5 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'Apple Pay'
                    ? 'border-white bg-[#14141a]'
                    : 'border-[#222228] bg-[#0f0f13] hover:border-zinc-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Apple Pay'}
                    onChange={() => setPaymentMethod('Apple Pay')}
                    className="mt-1 text-white focus:ring-0"
                  />
                  <div>
                    <span className="font-bold text-xs text-white block">
                      Apple Pay / Google Pay
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Blesková platba v jednom dotyku
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs text-emerald-400 font-bold">ZDARMA</span>
              </label>

              {/* Bankovní převod */}
              <label
                className={`flex items-start justify-between p-3.5 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'Bankovní převod'
                    ? 'border-white bg-[#14141a]'
                    : 'border-[#222228] bg-[#0f0f13] hover:border-zinc-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Bankovní převod'}
                    onChange={() => setPaymentMethod('Bankovní převod')}
                    className="mt-1 text-white focus:ring-0"
                  />
                  <div>
                    <span className="font-bold text-xs text-white block">
                      Převod na bankovní účet (QR platba)
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Platba na účet RUN u Fio banky s vygenerovaným QR kódem
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs text-emerald-400 font-bold">ZDARMA</span>
              </label>

              {/* Dobírka */}
              <label
                className={`flex items-start justify-between p-3.5 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'Dobírka'
                    ? 'border-white bg-[#14141a]'
                    : 'border-[#222228] bg-[#0f0f13] hover:border-zinc-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Dobírka'}
                    onChange={() => setPaymentMethod('Dobírka')}
                    className="mt-1 text-white focus:ring-0"
                  />
                  <div>
                    <span className="font-bold text-xs text-white block">
                      Dobírka (platba při převzetí)
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Zaplatíte kurýrovi hotově nebo kartou při doručení (+49 Kč)
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs text-zinc-300 font-bold">49 Kč</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary & Place Order (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0e0e12] border border-[#222228] rounded-lg p-6 space-y-6 sticky top-28">
            <h2 className="font-display text-base uppercase text-white tracking-wider border-b border-[#1f1f26] pb-3">
              POLOŽKY V OBJEDNÁVCE ({cart.length})
            </h2>

            {/* Items summary list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-[#18181f]">
              {cart.map((item) => (
                <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-14 bg-[#141418] rounded overflow-hidden flex-shrink-0 border border-[#222228]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="font-bold text-white block line-clamp-1">{item.name}</span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {item.size} • {item.color} • {item.quantity}×
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-white">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Voucher / Promo code */}
            <div className="pt-2 border-t border-[#1f1f26] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Slevový kód</span>
                </span>
                {appliedPromo && <span className="text-emerald-400">{appliedPromo} (-{formatPrice(discountAmount)})</span>}
              </div>
              {!appliedPromo && (
                <div className="flex">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Např. RUN10"
                    className="bg-[#18181f] border border-[#2e2e38] rounded-l px-3 py-1.5 text-xs text-white uppercase font-mono placeholder-zinc-600 flex-1 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="bg-[#27272a] hover:bg-white hover:text-black text-zinc-200 text-xs font-bold px-3 rounded-r transition-colors"
                  >
                    Vložit
                  </button>
                </div>
              )}
              {promoError && <p className="text-[11px] text-red-400">{promoError}</p>}
            </div>

            {/* Financial breakdown */}
            <div className="space-y-2 pt-2 border-t border-[#1f1f26] text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Mezisoučet:</span>
                <span className="text-zinc-200 font-bold">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Sleva:</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              {giftCardAmount > 0 && (
                <div className="flex justify-between text-cyan-400">
                  <span>Dárkový poukaz:</span>
                  <span>-{formatPrice(giftCardAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>Doprava ({deliveryMethod}):</span>
                <span>{shippingPrice === 0 ? <strong className="text-emerald-400">ZDARMA</strong> : formatPrice(shippingPrice)}</span>
              </div>
              {paymentFee > 0 && (
                <div className="flex justify-between text-zinc-400">
                  <span>Příplatek za dobírku:</span>
                  <span>{formatPrice(paymentFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-white pt-3 border-t border-[#1f1f26]">
                <span>CELKEM K ÚHRADĚ:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="space-y-3 pt-2 border-t border-[#1f1f26]">
              <label className="flex items-start space-x-2 text-xs text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#27272a] bg-[#121216] text-white focus:ring-0"
                />
                <span className="text-[11px] leading-tight">
                  Souhlasím s{' '}
                  <Link href="/terms" target="_blank" className="text-white underline">
                    obchodními podmínkami
                  </Link>{' '}
                  a potvrzuji seznámení s{' '}
                  <Link href="/privacy" target="_blank" className="text-white underline">
                    ochranou osobních údajů
                  </Link>.
                </span>
              </label>

              {errorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 rounded text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-black font-black uppercase text-xs tracking-widest py-4 rounded hover:bg-zinc-200 transition-colors shadow-2xl flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>ZPRACOVÁVÁM OBJEDNÁVKU...</span>
                ) : (
                  <>
                    <span>ZÁVAZNĚ OBJEDNAT A ZAPLATIT</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
