'use client';

import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import RunLogo from '@/components/RunLogo';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@runclothing.com');
  const [password, setPassword] = useState('runadmin2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Full page redirect ensures browser applies new authentication cookie to SSR
        window.location.href = '/admin';
      } else {
        setError(data.error || 'Neplatné přihlašovací údaje.');
      }
    } catch {
      setError('Chyba spojení se serverem.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitLogin(email, password);
  };

  const handleQuickLogin = async () => {
    setEmail('admin@runclothing.com');
    setPassword('runadmin2026');
    await submitLogin('admin@runclothing.com', 'runadmin2026');
  };

  return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center p-4 text-white">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-3">
          <RunLogo size="lg" className="mx-auto" />
          <div className="inline-flex items-center space-x-2 bg-red-950/40 border border-red-900 px-3 py-1 rounded text-[11px] font-mono text-red-400">
            <Lock className="w-3.5 h-3.5" />
            <span>RUN INTERNAL ADMINISTRATION</span>
          </div>
          <h1 className="font-display text-2xl uppercase tracking-tight text-white">
            ADMINISTRACE E-SHOPU
          </h1>
          <p className="text-xs text-zinc-500">
            Přístup vyhrazen pro správce a majitele značky RUN.
          </p>
        </div>

        <div className="bg-[#0e0e12] border border-[#222228] p-8 rounded-lg shadow-2xl space-y-6">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-400 rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick 1-Click Login Button */}
          <button
            type="button"
            onClick={handleQuickLogin}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold py-3 rounded flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950/50"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>{loading ? 'PŘIHLAŠUJI...' : 'RYCHLÉ PŘIHLÁŠENÍ SPRÁVCE (1-KLIK)'}</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#222228]"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono text-zinc-500 uppercase">NEBO ZADEJTE RUČNĚ</span>
            <div className="flex-grow border-t border-[#222228]"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Admin E-mail nebo Uživatelské jméno
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@runclothing.com nebo admin"
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Heslo
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-black uppercase text-xs tracking-wider py-3 rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              <span>{loading ? 'OVĚŘOVÁNÍ...' : 'PŘIHLÁSIT SE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Credentials Helper Box */}
          <div className="pt-2 border-t border-[#1f1f26] text-[11px] font-mono text-zinc-500 space-y-1">
            <div className="text-zinc-400 font-bold uppercase text-[10px]">Výchozí přihlašovací údaje:</div>
            <div>E-mail: <span className="text-white">admin@runclothing.com</span> (nebo <span className="text-white">admin</span>)</div>
            <div>Heslo: <span className="text-white">runadmin2026</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
