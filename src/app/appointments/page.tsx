'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Sparkles, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

export default function AppointmentsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('VIP Showroom Fitting & Stylist (Praha)');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('14:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const appointmentTypes = [
    'VIP Showroom Fitting & Stylist (Praha)',
    'Soukromá předobjednávková zkouška Drop 01',
    'Zakázková úprava a fitting střihu',
    'B2B / Wholesale konzultace',
  ];

  const availableTimes = ['11:00', '13:00', '14:30', '16:00', '17:30', '19:00'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, type, date, time, notes }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Rezervaci se nepodařilo odeslat.');
      }
    } catch {
      setError('Chyba spojení.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white">
      <div className="text-center space-y-3 mb-12">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
          PRIVATE SHOWROOM APPOINTMENT
        </span>
        <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight">
          REZERVACE SCHŮZKY V RUN SHOWROOMU
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          Vyzkoušejte si novou kolekci Drop 01 v privátním prostředí našeho pražského showroomu s osobním stylistou a výběrovou kávou.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Info details (5 cols) */}
        <div className="md:col-span-5 bg-[#0e0e12] border border-[#222228] p-6 rounded-lg space-y-6 text-xs">
          <div className="space-y-2">
            <span className="font-display uppercase tracking-wider text-white text-sm block">
              RUN SHOWROOM & ATELIÉR
            </span>
            <p className="text-zinc-400 leading-relaxed">
              Revoluční 12, 110 00 Praha 1<br />
              Česká republika
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#1b1b22] text-zinc-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Privátní přístup k celé kolekci Drop 01</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Délka návštěvy: 45–60 minut</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-zinc-400" />
              <span>Možnost okamžitého zakoupení na místě</span>
            </div>
          </div>

          <div className="p-3 bg-[#141418] border border-[#27272a] rounded text-[11px] font-mono text-zinc-400">
            Rezervace je zcela nezávazná a bezplatná. Termín vám potvrdíme do 2 hodin od odeslání.
          </div>
        </div>

        {/* Right: Booking Form (7 cols) */}
        <div className="md:col-span-7">
          {success ? (
            <div className="bg-[#0e0e12] border border-[#222228] p-8 rounded-lg text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="font-display text-xl uppercase text-white">TERMÍN REZERVOVÁN</h2>
              <p className="text-xs text-zinc-400">
                Děkujeme! Vaši rezervaci na datum <strong className="text-white">{date}</strong> v{' '}
                <strong className="text-white">{time}</strong> evidujeme. Potvrzení vám odesíláme na{' '}
                <strong className="text-white">{email}</strong>.
              </p>
              <Link
                href="/shop"
                className="inline-block bg-white text-black font-bold uppercase text-xs px-6 py-2.5 rounded mt-2"
              >
                PROZKOUMAT KOLEKCI
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-[#0e0e12] border border-[#222228] p-6 rounded-lg space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Typ návštěvy / schůzky *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                >
                  {appointmentTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                    Požadované datum *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                    Požadovaný čas *
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white font-mono"
                  >
                    {availableTimes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Jméno a příjmení *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jan Novák"
                  className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vas@email.cz"
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+420 777 000 000"
                    className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Poznámka / Konkrétní modely, které si přejete vyzkoušet
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Např. Chtěl bych porovnat velikost L a XL u černé Teddy fur mikiny..."
                  className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded border border-red-900">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-black uppercase text-xs tracking-wider py-3.5 rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'ODESÍLÁM...' : 'POTVRDIT REZERVACI TERMÍNU'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
