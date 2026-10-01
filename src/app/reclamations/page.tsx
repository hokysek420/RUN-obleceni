'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ReclamationsPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productName, setProductName] = useState('');
  const [defectReason, setDefectReason] = useState('Vada zipu / kování');
  const [description, setDescription] = useState('');
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
          type: 'RECLAMATION',
          orderNumber,
          customerName,
          customerEmail,
          customerPhone,
          productName,
          reason: defectReason,
          description,
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
          GARANCE KVALITY & ZÁRUKA 24 MĚSÍCŮ
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight">
          REKLAMAČNÍ PROTOKOL RUN
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          Stojíme si za každým švem a kovovým detailem. V případě vady zboží zahajte reklamaci vyplněním formuláře níže.
        </p>
      </div>

      {success ? (
        <div className="bg-[#0e0e12] border border-[#27272a] rounded-lg p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-display text-xl uppercase text-white">REKLAMACE ZAŘAZENA</h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Váš reklamační požadavek k objednávce <strong className="text-white font-mono">{orderNumber}</strong> byl předán reklamačnímu oddělení RUN. Vyjádření obdržíte do 3 pracovních dnů.
          </p>
          <Link
            href="/account"
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
                Číslo objednávky nebo faktury *
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
                Jméno a příjmení zákazníka *
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
                Reklamovaný produkt *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Např. RUN Reversible Heavy Teddy Fur Zip Hoodie"
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Typ vady *
              </label>
              <select
                value={defectReason}
                onChange={(e) => setDefectReason(e.target.value)}
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
              >
                <option value="Vada zipu / kování">Vada kovového zipu nebo jezce</option>
                <option value="Poškozený šev / prošití">Porušení švu nebo nití</option>
                <option value="Vada látky / materiálu">Vada úpletu či textury</option>
                <option value="Vada výšivky / tisku">Poškození loga nebo potisku</option>
                <option value="Jiné">Jiné poškození</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Podrobný popis vady a okolností vzniku *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Popište, jak se vada projevila a jaké řešení požadujete (oprava, výměna, sleva, vrácení)..."
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
            {loading ? 'ODESÍLÁM REKLAMACI...' : 'ODESLAT REKLAMAČNÍ PROTOKOL'}
          </button>
        </form>
      )}
    </div>
  );
}
