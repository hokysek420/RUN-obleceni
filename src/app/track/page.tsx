'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Truck, Package, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Order } from '@/types';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';

  const [query, setQuery] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (res.ok && data.order) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Objednávka nebyla nalezena. Zkontrolujte prosím číslo objednávky.');
      }
    } catch {
      setError('Chyba spojení');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'Přijato', label: 'Přijato' },
    { key: 'Zaplaceno', label: 'Zaplaceno' },
    { key: 'Zpracovává se', label: 'Ve skladu' },
    { key: 'Odesláno', label: 'Na cestě' },
    { key: 'Doručeno', label: 'Doručeno' },
  ];

  const activeIndex = order
    ? Math.max(0, steps.findIndex((s) => s.key === order.order_status))
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white">
      <div className="text-center max-w-xl mx-auto space-y-3 mb-10">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
          LOGISTIKA & SLEDOVÁNÍ
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase text-white tracking-tight">
          SLEDOVÁNÍ ZÁSILKY RUN
        </h1>
        <p className="text-xs text-zinc-400">
          Zadejte číslo objednávky (např. RUN-2026-8914) nebo sledovací číslo zásilky.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-lg mx-auto flex mb-12 shadow-2xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Číslo objednávky (RUN-2026-...)"
          className="bg-[#121216] border border-[#27272a] rounded-l px-4 py-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white flex-1 font-mono uppercase"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black font-black uppercase text-xs tracking-wider px-6 rounded-r hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Hledám...' : 'VYHLEDAT'}</span>
        </button>
      </form>

      {error && (
        <div className="max-w-lg mx-auto p-4 bg-red-950/40 border border-red-800 text-red-400 rounded text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Tracking Result Card */}
      {order && (
        <div className="bg-[#0e0e12] border border-[#222228] rounded-lg p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#1f1f26] gap-3">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">OBJEDNÁVKA</span>
              <h2 className="font-display text-xl text-white font-mono">{order.order_number}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-zinc-400">Aktuální stav:</span>
              <span className="bg-white text-black font-mono font-bold text-xs px-2.5 py-1 rounded">
                {order.order_status}
              </span>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {steps.map((st, idx) => {
              const isPast = idx <= activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div
                  key={st.key}
                  className={`p-3 rounded border text-xs font-mono transition-all ${
                    isCurrent
                      ? 'border-white bg-[#1a1a24] text-white shadow-lg'
                      : isPast
                      ? 'border-emerald-900 bg-[#0e1710] text-emerald-400'
                      : 'border-[#1b1b22] bg-[#0c0c0f] text-zinc-600'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-white animate-pulse' : isPast ? 'bg-emerald-400' : 'bg-zinc-700'}`}></span>
                    <span className="text-[10px] uppercase font-bold">{idx + 1}. Krok</span>
                  </div>
                  <div className="text-[11px] font-medium">{st.label}</div>
                </div>
              );
            })}
          </div>

          {/* Carrier & Delivery details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#1f1f26] text-xs font-mono">
            <div className="space-y-1">
              <span className="text-zinc-500 uppercase">Dopravce:</span>
              <div className="text-white font-bold">{order.delivery_method}</div>
              {order.delivery_pickup_point && (
                <div className="text-zinc-400 text-[11px]">{order.delivery_pickup_point}</div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-zinc-500 uppercase">Sledovací kód zásilky:</span>
              <div className="text-cyan-400 font-bold">
                {order.tracking_number || 'Bude vygenerován při odeslání ze skladu'}
              </div>
              {order.tracking_link && (
                <a
                  href={order.tracking_link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white underline text-[11px] block hover:text-zinc-300"
                >
                  Otevřít externí sledování dopravce →
                </a>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center text-xs">
            <Link
              href={`/order-confirmation/${order.order_number}`}
              className="text-zinc-400 hover:text-white underline font-mono"
            >
              Zobrazit detailní potvrzení a položky →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-zinc-500 font-mono text-xs">
        Načítání modulu sledování zásilky...
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}
