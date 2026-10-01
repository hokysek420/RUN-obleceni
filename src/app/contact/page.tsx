'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, CheckCircle2, Send, Clock, ShieldCheck, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Dotaz k objednávce');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Spam honeypot
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Silent discard for bot spam

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white space-y-12">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
          ZÁKAZNICKÁ PODPORA & KONTAKT
        </span>
        <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight">
          SPOJTE SE S TÝMEM RUN
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Máte dotaz k objednávce, velikostem, materiálům nebo přejete domluvit spolupráci? Jsme vám plně k dispozici.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact info card (5 cols) */}
        <div className="md:col-span-5 bg-[#0e0e12] border border-[#222228] p-6 sm:p-8 rounded-lg space-y-6 text-xs">
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-base uppercase text-white tracking-wide mb-1">
                ONLINE ZÁKAZNICKÝ SERVIS
              </h2>
              <p className="text-zinc-500 text-[11px] font-mono">
                Oficiální podpora pro e-shopové objednávky a dotazy.
              </p>
            </div>

            <div className="flex items-center space-x-3 text-zinc-300">
              <Mail className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <div>
                <span className="text-zinc-500 text-[10px] uppercase font-mono block">E-mailová podpora</span>
                <span className="text-white font-medium">info@runclothing.com</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-zinc-300">
              <Phone className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <div>
                <span className="text-zinc-500 text-[10px] uppercase font-mono block">Infolinka</span>
                <span className="text-white font-medium">+420 777 000 RUN (+420 777 000 786)</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-zinc-300">
              <Clock className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-bold block">Doba odezvy podpory:</span>
                <span>Po – Pá: 09:00 – 18:00</span>
                <span className="text-zinc-500 block text-[11px]">Standardně odpovídáme do 24 hodin</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1b1b22] space-y-2">
            <Link
              href="/track"
              className="w-full block text-center bg-[#18181f] hover:bg-zinc-800 text-white font-bold text-xs uppercase py-2.5 rounded transition-colors"
            >
              Sledovat stav vaší zásilky →
            </Link>
            <Link
              href="/returns"
              className="w-full block text-center border border-[#27272a] hover:bg-zinc-900 text-zinc-400 hover:text-white font-bold text-xs uppercase py-2 rounded transition-colors"
            >
              Vrácení zboží do 14 dnů
            </Link>
          </div>
        </div>

        {/* Form (7 cols) */}
        <div className="md:col-span-7 bg-[#0e0e12] border border-[#222228] p-6 sm:p-8 rounded-lg shadow-xl">
          {success ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="font-display text-lg uppercase text-white">ZPRÁVA BYLA ODESLÁNA</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Děkujeme za zprávu. Náš tým odpovídá standardně do 24 hodin v pracovní dny.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="bg-white text-black font-bold uppercase text-xs px-6 py-2 rounded"
              >
                Napsat další zprávu
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Spam Honeypot */}
              <input
                type="text"
                name="website_url"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jan.novak@email.cz"
                    className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+420 777 000 000"
                    className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                    Předmět zprávy *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  >
                    <option value="Dotaz k objednávce">Dotaz k objednávce</option>
                    <option value="Dotaz na velikost / střih">Dotaz na velikost / střih</option>
                    <option value="Dostupnost vyprodaných kusů">Dostupnost vyprodaných kusů</option>
                    <option value="B2B / Spolupráce / Média">B2B / Spolupráce / Média</option>
                    <option value="Jiné">Jiné</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Zpráva *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Váš dotaz nebo vzkaz pro RUN..."
                  className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-black uppercase text-xs tracking-wider py-3.5 rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'ODESÍLÁM...' : 'ODESLAT ZPRÁVU'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
