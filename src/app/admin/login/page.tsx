'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import RunLogo from '@/components/RunLogo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@runclothing.com');
  const [password, setPassword] = useState('runadmin2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin');
      } else {
        setError(data.error || 'Neplatné přihlašovací údaje.');
      }
    } catch {
      setError('Chyba spojení.');
    } finally {
      setLoading(false);
    }
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

        <form
          onSubmit={handleLogin}
          className="bg-[#0e0e12] border border-[#222228] p-8 rounded-lg shadow-2xl space-y-5"
        >
          <div>
            <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
              Admin E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
              Admin Heslo
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900 text-red-400 rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-[#141418] border border-[#222228] rounded text-[11px] font-mono text-zinc-400">
            Výchozí přístup majitele:<br />
            E-mail: <strong className="text-white">admin@runclothing.com</strong><br />
            Heslo: <strong className="text-white">runadmin2026</strong>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-black uppercase text-xs tracking-wider py-3.5 rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'OVĚŘUJI...' : 'PŘIHLÁSIT SE DO ADMINU'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
