import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Package, Truck, CreditCard, Download, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import db from '@/lib/db';
import { Order, OrderItem } from '@/types';
import InvoicePrintButton from '@/components/InvoicePrintButton';

export const dynamic = 'force-dynamic';

interface OrderConfirmationProps {
  params: {
    orderNumber: string;
  };
}

export default function OrderConfirmationPage({ params }: OrderConfirmationProps) {
  const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(params.orderNumber) as any;

  if (!order) {
    notFound();
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) as OrderItem[];

  // Order Timeline Status Progression
  const steps = [
    { key: 'Přijato', label: 'Objednávka přijata' },
    { key: 'Zaplaceno', label: 'Platba potvrzena' },
    { key: 'Zpracovává se', label: 'Příprava ve skladu' },
    { key: 'Odesláno', label: 'Předáno dopravci' },
    { key: 'Doručeno', label: 'Doručeno zákazníkovi' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.order_status);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white">
      {/* Top Success Banner */}
      <div className="bg-[#0e0e12] border border-[#27272a] rounded-lg p-6 sm:p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
            POTVRZENÍ OBJEDNÁVKY
          </span>
          <h1 className="font-display text-3xl sm:text-4xl uppercase text-white tracking-tight">
            DĚKUJEME ZA VAŠI OBJEDNÁVKU
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-lg mx-auto mt-2">
            Číslo vaší objednávky je{' '}
            <strong className="text-white font-mono">{order.order_number}</strong>.
            Potvrzení a shrnutí jsme odeslali na e-mail <strong className="text-white">{order.customer_email}</strong>.
          </p>
        </div>

        {/* Invoice Download Action */}
        <div className="pt-2 flex justify-center gap-3">
          <InvoicePrintButton order={order} items={items} />
          <Link
            href={`/track?order=${order.order_number}`}
            className="border border-[#27272a] hover:bg-[#18181f] text-zinc-300 hover:text-white px-4 py-2 rounded text-xs font-mono flex items-center gap-2 transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>Sledovat zásilku</span>
          </Link>
        </div>
      </div>

      {/* Live Order Status Timeline (Section 34 & 35) */}
      <div className="my-8 p-6 bg-[#0e0e12] border border-[#222228] rounded-lg space-y-4">
        <h2 className="font-display text-xs uppercase tracking-widest text-zinc-400 flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-400" />
          <span>STAV ZPRACOVÁNÍ OBJEDNÁVKY</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {steps.map((step, idx) => {
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div
                key={step.key}
                className={`p-3 rounded border text-xs font-mono transition-all ${
                  isCurrent
                    ? 'border-white bg-[#1a1a24] text-white shadow-md'
                    : isCompleted
                    ? 'border-emerald-900 bg-[#0e1710] text-emerald-400'
                    : 'border-[#1a1a20] bg-[#0c0c0f] text-zinc-600'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-white animate-pulse' : isCompleted ? 'bg-emerald-400' : 'bg-zinc-700'}`}></span>
                  <span className="text-[10px] uppercase font-bold">{idx + 1}. KROK</span>
                </div>
                <div className="text-[11px] font-medium leading-tight">{step.label}</div>
              </div>
            );
          })}
        </div>

        {order.tracking_number && (
          <div className="p-3 bg-[#141418] border border-[#27272a] rounded flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">
              Dopravce: <strong className="text-white">{order.carrier || 'Zásilkovna'}</strong>
            </span>
            <span className="text-zinc-400">
              Sledovací číslo: <strong className="text-cyan-400">{order.tracking_number}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Order Details & Summary Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        {/* Customer & Shipping info */}
        <div className="p-6 bg-[#0e0e12] border border-[#222228] rounded-lg space-y-4 text-xs">
          <h3 className="font-display uppercase tracking-widest text-zinc-400 text-[11px] border-b border-[#1b1b22] pb-2">
            DORUČOVACÍ ÚDAJE
          </h3>
          <div className="space-y-1 text-zinc-300">
            <div className="font-bold text-white text-sm">{order.customer_name}</div>
            <div>{order.shipping_street}</div>
            <div>{order.shipping_zip} {order.shipping_city}</div>
            <div>{order.shipping_country}</div>
            <div className="font-mono text-zinc-400 pt-1">Tel: {order.customer_phone}</div>
          </div>

          <div className="pt-3 border-t border-[#1b1b22] space-y-1">
            <span className="text-zinc-500 uppercase font-mono text-[10px]">Způsob doručení:</span>
            <div className="font-bold text-white">{order.delivery_method}</div>
            {order.delivery_pickup_point && (
              <div className="text-zinc-400 text-[11px]">{order.delivery_pickup_point}</div>
            )}
          </div>
        </div>

        {/* Payment info & QR code if bank transfer */}
        <div className="p-6 bg-[#0e0e12] border border-[#222228] rounded-lg space-y-4 text-xs">
          <h3 className="font-display uppercase tracking-widest text-zinc-400 text-[11px] border-b border-[#1b1b22] pb-2">
            PLATEBNÍ ÚDAJE
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Způsob platby:</span>
              <span className="font-bold text-white">{order.payment_method}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Stav platby:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                order.payment_status === 'Zaplaceno' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}>
                {order.payment_status}
              </span>
            </div>
          </div>

          {order.payment_method.includes('převod') && order.payment_status !== 'Zaplaceno' && (
            <div className="mt-4 p-4 bg-[#14141a] border border-[#2a2a36] rounded space-y-2 font-mono text-[11px]">
              <div className="font-bold text-cyan-400">POKYNY PRO BANKOVNÍ PŘEVOD:</div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Číslo účtu:</span>
                <span className="text-white font-bold">2100894562/2010 (Fio banka)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Variabilní symbol:</span>
                <span className="text-white font-bold">{order.order_number.replace(/\D/g, '')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Částka:</span>
                <span className="text-white font-bold">{order.total.toLocaleString('cs-CZ')} Kč</span>
              </div>
              <div className="pt-2 text-center text-zinc-500 text-[10px]">
                [ QR KÓD PRO OKAMŽITOU PLATBU MOBILNÍM BANKOVNICTVÍM ]
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ordered Items Table */}
      <div className="p-6 bg-[#0e0e12] border border-[#222228] rounded-lg space-y-4">
        <h3 className="font-display uppercase tracking-widest text-zinc-400 text-xs border-b border-[#1b1b22] pb-3">
          ZAKOUPENÉ POLOŽKY ({items.length})
        </h3>

        <div className="divide-y divide-[#1a1a22]">
          {items.map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-16 bg-[#16161c] rounded overflow-hidden flex-shrink-0 border border-[#222228]">
                  <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{item.product_name}</div>
                  <div className="font-mono text-zinc-400 text-[11px] mt-0.5">
                    Velikost: {item.size} • Barva: {item.color} • {item.quantity}×
                  </div>
                </div>
              </div>
              <span className="font-mono font-bold text-white text-sm">
                {item.total.toLocaleString('cs-CZ')} Kč
              </span>
            </div>
          ))}
        </div>

        {/* Financial recap */}
        <div className="pt-4 border-t border-[#1b1b22] space-y-2 text-xs font-mono max-w-xs ml-auto">
          <div className="flex justify-between text-zinc-400">
            <span>Mezisoučet:</span>
            <span className="text-zinc-200">{order.subtotal.toLocaleString('cs-CZ')} Kč</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Sleva ({order.discount_code}):</span>
              <span>-{order.discount_amount.toLocaleString('cs-CZ')} Kč</span>
            </div>
          )}
          <div className="flex justify-between text-zinc-400">
            <span>Doprava:</span>
            <span>{order.shipping_price === 0 ? 'ZDARMA' : `${order.shipping_price} Kč`}</span>
          </div>
          <div className="flex justify-between text-base font-black text-white pt-2 border-t border-[#1b1b22]">
            <span>CELKEM:</span>
            <span>{order.total.toLocaleString('cs-CZ')} Kč</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/shop"
          className="inline-block bg-white text-black font-black uppercase text-xs tracking-widest px-8 py-3.5 rounded hover:bg-zinc-200 transition-colors"
        >
          POKRAČOVAT V NÁKUPU
        </Link>
      </div>
    </div>
  );
}
