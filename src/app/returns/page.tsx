'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RotateCcw, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ReturnsPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productName, setProductName] = useState('');
  const [reason, setReason] = useState('Nevyhovující velikost');
  const [description, setDescription] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'RETURN',
          orderNumber,
          customerName,
          customerEmail,
          customerPhone,
          productName,
          reason,
          description,
          bankAccount,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Něco se pokazilo.');
      }
    } catch {
      setError('Chyba spojení.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-white">
      <div className="text-center space-y-3 mb-10">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
          ZÁKAZNICKÝ SERVIS & VRÁCENÍ
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight">
          VRÁCENÍ ZBOŽÍ VE LHŮTĚ 14 DNŮ
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          Zboží vám nesedí nebo chcete vyměnit velikost? Vyplňte formulář níže a zašleme vám kód pro bezplatné odeslání přes Zásilkovnu.
        </p>
      </div>

      {success ? (
        <div className="bg-[#0e0e12] border border-[#27272a] rounded-lg p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-display text-xl uppercase text-white">ŽÁDOST BYLA PŘIJATA</h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Vaši žádost o vrácení zboží z objednávky <strong className="text-white font-mono">{orderNumber}</strong> jsme zaevidovali. Do schránky {customerEmail} jsme vám odeslali štítek pro zpětnou zásilku.
          </p>
          <Link
            href="/account?tab=returns"
            className="inline-block bg-white text-black font-bold uppercase text-xs px-6 py-2.5 rounded mt-4"
          >
            PŘEJÍT DO ÚČTU
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[#0e0e12] border border-[#222228] p-6 sm:p-8 rounded-lg space-y-5 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Číslo objednávky *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="RUN-2026-XXXX"
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white font-mono uppercase"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Jméno a příjmení *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Jan Novák"
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                E-mail *
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="jan.novak@email.cz"
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Telefon *
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+420 777 000 000"
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Vracený produkt & velikost *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Např. RUN Reversible Heavy Teddy Fur Zip Hoodie — Velikost L"
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Důvod vrácení *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
              >
                <option value="Nevyhovující velikost (požaduji výměnu)">Nevyhovující velikost (výměna)</option>
                <option value="Nevyhovující střih">Nevyhovující střih</option>
                <option value="Odstoupení od smlouvy bez udání důvodu">Odstoupení od smlouvy (vrácení peněz)</option>
                <option value="Jiné">Jiné</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Číslo bankovního účtu pro vrácení peněz *
              </label>
              <input
                type="text"
                required
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="123456789/0100"
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Doplňující poznámka / požadovaná nová velikost
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Pokud žádáte výměnu velikosti, uveďte jakou velikost požadujete..."
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 p-3 rounded border border-red-900">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-black uppercase text-xs tracking-wider py-3.5 rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'ODESÍLÁM ŽÁDOST...' : 'ODESLAT FORMULÁŘ K VRÁCENÍ'}
          </button>
        </form>
      )}
    </div>
  );
}
