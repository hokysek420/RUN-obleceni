'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RunLogo from './RunLogo';
import { Instagram, ArrowRight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');

  if (pathname.startsWith('/admin')) {
    return null;
  }
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setStatus('error');
      setMessage('Pro přihlášení potvrďte souhlas se zpracováním osobních údajů.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('Vítejte v RUN klubu. Potvrzení vám dorazilo do schránky.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Něco se pokazilo. Zkuste to prosím znovu.');
      }
    } catch {
      setStatus('error');
      setMessage('Chyba spojení.');
    }
  };

  return (
    <footer className="bg-[#050507] border-t border-[#1a1a20] text-zinc-400 text-xs">
      {/* Brand Statement Banner */}
      <div className="border-b border-[#141418] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block">
              AUTENTICKÝ ČESKÝ STREETWEAR & LUXURY APPAREL
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              RUN — MORE THAN CLOTHES. IT’S A MINDSET.
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tvoříme těžké siluety, zakázkové kovové detaily a nekompromisní kvalitu o gramáži až 550 GSM. Každý kus z kolekce Drop 01 je limitován.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="bg-white text-black font-black uppercase tracking-widest text-xs px-6 py-3.5 rounded hover:bg-zinc-200 transition-colors inline-flex items-center gap-2"
            >
              <span>PROZKOUMAT DROP 01</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1: Brand & Newsletter */}
          <div className="col-span-2 space-y-6">
            <RunLogo size="md" showSubtitle />
            <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
              Navrženo v Praze. Založeno s vizí definovat novou éru oděvní kultury. Limitované série, certifikace originality.
            </p>

            {/* Newsletter Form */}
            <div className="space-y-3 pt-2">
              <span className="font-display text-white text-xs tracking-widest block">
                STAY IN THE RUN.
              </span>
              <p className="text-[11px] text-zinc-500">
                Získejte přednostní přístup k novým dropům a neveřejným limitovaným edicím.
              </p>

              {status === 'success' ? (
                <div className="p-3 bg-[#112211] border border-emerald-900 rounded text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{message}</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="space-y-2">
                  <div className="flex">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Váš e-mail"
                      className="bg-[#121216] border border-[#27272a] rounded-l px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white flex-1"
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="bg-white text-black font-black uppercase text-[11px] tracking-wider px-4 rounded-r hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                      PŘIPOJIT SE
                    </button>
                  </div>

                  <label className="flex items-start space-x-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 rounded border-[#27272a] bg-[#121216] text-white focus:ring-0"
                    />
                    <span className="text-[10px] text-zinc-500 leading-tight">
                      Souhlasím se zpracováním osobních údajů pro zasílání informací o nových dropech RUN.
                    </span>
                  </label>

                  {status === 'error' && (
                    <p className="text-[11px] text-red-400 pt-1">{message}</p>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Col 2: Shop */}
          <div className="space-y-3">
            <h3 className="font-display text-white text-xs tracking-widest">SHOP</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop?filter=new_drop" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>New Drop</span>
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Všechny produkty
                </Link>
              </li>
              <li>
                <Link href="/shop?category=outerwear" className="hover:text-white transition-colors">
                  Outerwear & Mikiny
                </Link>
              </li>
              <li>
                <Link href="/shop?category=t-shirts" className="hover:text-white transition-colors">
                  Trička & Topy
                </Link>
              </li>
              <li>
                <Link href="/shop?category=pants" className="hover:text-white transition-colors">
                  Pants & Denim
                </Link>
              </li>
              <li>
                <Link href="/shop?category=footwear" className="hover:text-white transition-colors">
                  Footwear & Boty
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-white transition-colors">
                  Kolekce
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Help & Guides */}
          <div className="space-y-3">
            <h3 className="font-display text-white text-xs tracking-widest">PÉČE & PODPORA</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/size-guide" className="hover:text-white transition-colors">
                  Tabulka velikostí
                </Link>
              </li>
              <li>
                <Link href="/materials" className="hover:text-white transition-colors">
                  Průvodce materiálů (550 GSM)
                </Link>
              </li>
              <li>
                <Link href="/care" className="hover:text-white transition-colors">
                  Návod k údržbě
                </Link>
              </li>
              <li>
                <Link href="/quality" className="hover:text-white transition-colors">
                  Záruka kvality
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Vrácení zboží (14 dní)
                </Link>
              </li>
              <li>
                <Link href="/reclamations" className="hover:text-white transition-colors">
                  Reklamační formulář
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors">
                  Sledování zásilky
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Kontakt & Podpora
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Brand */}
          <div className="space-y-3">
            <h3 className="font-display text-white text-xs tracking-widest">ZNAČKA & PRÁVO</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  O značce RUN
                </Link>
              </li>
              <li>
                <Link href="/editorial" className="hover:text-white transition-colors">
                  Editorial & Kampaň
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-white transition-colors">
                  Fotogalerie komunity
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Obchodní podmínky
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Ochrana osobních údajů
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white transition-colors">
                  Zásady cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social & Payment Badges */}
        <div className="mt-12 pt-8 border-t border-[#18181c] flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social */}
          <div className="flex items-center space-x-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <Instagram className="w-4 h-4" />
              <span>INSTAGRAM</span>
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <span className="font-black text-sm">TT</span>
              <span>TIKTOK</span>
            </a>
          </div>

          {/* Delivery & Payment Badges */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 font-mono">
            <span>DORUČENÍ: ZÁSILKOVNA • DPD • GLS</span>
            <span>•</span>
            <span>PLATBA: KARTA • APPLE PAY • GOOGLE PAY • PŘEVOD</span>
          </div>
        </div>

        {/* Bottom Copyright & Admin link */}
        <div className="mt-8 pt-4 border-t border-[#121216] flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-600 gap-3">
          <div>
            © {new Date().getFullYear()} RUN CLOTHING. VŠECHNA PRÁVA VYHRAZENA.
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="hover:text-zinc-400 flex items-center gap-1 font-mono">
              <Lock className="w-3 h-3" />
              <span>RUN ADMIN PANEL</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
