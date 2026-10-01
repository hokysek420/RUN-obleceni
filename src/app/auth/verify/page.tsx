'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const isVerified = searchParams.get('verified') === 'true';
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(
    urlError === 'invalid_token'
      ? { text: 'Odkaz pro ověření e-mailu již vypršel nebo je neplatný. Můžete si nechat zaslat nový.', type: 'error' }
      : isVerified
      ? { text: 'Váš e-mail byl úspěšně ověřen! Vítejte v RUN.', type: 'success' }
      : null
  );

  const supabase = createClient();

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  // Handle single digit input
  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
          newOtp[i] = pasted[i] || '';
        }
        setOtp(newOtp);
        const nextIdx = Math.min(pasted.length, 5);
        document.getElementById(`otp-input-${nextIdx}`)?.focus();
        return;
      }
    }

    const val = value.slice(-1).replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto advance to next input
    if (val && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  // Verify OTP code
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = otp.join('');
    if (token.length !== 6) {
      setMessage({ text: 'Zadejte prosím celý 6místný ověřovací kód.', type: 'error' });
      return;
    }
    if (!email) {
      setMessage({ text: 'Zadejte prosím váš e-mail.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: 'signup',
      });

      if (error) {
        // Also try email verification type if signup wasn't matched
        const secondTry = await supabase.auth.verifyOtp({
          email: email.trim(),
          token,
          type: 'email',
        });

        if (secondTry.error) {
          setMessage({ text: secondTry.error.message || 'Neplatný nebo expirovaný kód.', type: 'error' });
          setLoading(false);
          return;
        }
      }

      setMessage({ text: 'Účet úspěšně ověřen! Přesměrováváme...', type: 'success' });
      setTimeout(() => {
        router.push('/account?verified=true');
      }, 1500);
    } catch {
      setMessage({ text: 'Chyba při komunikaci se serverem.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const handleResend = async () => {
    if (!email) {
      setMessage({ text: 'Zadejte prosím e-mail pro opětovné odeslání.', type: 'error' });
      return;
    }

    setResending(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/account`,
        },
      });

      if (error) {
        setMessage({ text: error.message || 'Nepodařilo se odeslat ověřovací e-mail.', type: 'error' });
      } else {
        setMessage({ text: 'Nový ověřovací kód a odkaz byly odeslány na váš e-mail.', type: 'info' });
      }
    } catch {
      setMessage({ text: 'Chyba při odesílání ověření.', type: 'error' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center px-4 py-16">
      <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group mb-4">
            <span className="text-3xl font-black tracking-widest text-white uppercase group-hover:opacity-80 transition">
              RUN<span className="text-neutral-500 font-light ml-1">™</span>
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700/60 text-xs font-mono tracking-wider text-neutral-300 uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ověření identity</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            {isVerified ? 'Účet úspěšně ověřen' : 'Ověřte svůj e-mail'}
          </h1>
          <p className="text-sm text-neutral-400">
            {isVerified
              ? 'Váš účet je aktivní. Nyní máte přístup k privátním dropům a objednávkám.'
              : 'Na váš e-mail jsme zaslali potvrzovací odkaz a 6místný kód.'}
          </p>
        </div>

        {/* Alerts */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-950/50 border border-emerald-800/80 text-emerald-300'
                : message.type === 'error'
                ? 'bg-rose-950/50 border border-rose-800/80 text-rose-300'
                : 'bg-neutral-800 border border-neutral-700 text-neutral-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
            )}
            <p className="leading-snug">{message.text}</p>
          </div>
        )}

        {isVerified ? (
          <div className="space-y-4">
            <Link
              href="/account"
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3.5 px-6 rounded-xl hover:bg-neutral-200 transition tracking-wide text-sm"
            >
              <span>PŘEJÍT DO MŮJ ÚČET</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/shop"
              className="w-full flex items-center justify-center gap-2 bg-neutral-800 text-neutral-300 font-medium py-3 px-6 rounded-xl hover:bg-neutral-700 transition tracking-wide text-sm"
            >
              <span>PROCHÁZET NOVÝ DROP</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {/* Email input (editable if needed) */}
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">
                E-mailová adresa
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.cz"
                  required
                  className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white transition"
                />
              </div>
            </div>

            {/* 6 digit code inputs */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono uppercase text-neutral-400">
                  6místný kód z e-mailu
                </label>
                <span className="text-[11px] text-neutral-500">Nebo klikněte na odkaz v e-mailu</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-full h-12 text-center text-xl font-bold bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
                  />
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3.5 px-6 rounded-xl hover:bg-neutral-200 transition tracking-wide text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>OVĚŘOVÁNÍ...</span>
                </>
              ) : (
                <>
                  <span>POTVRDIT ÚČET</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend link */}
            <div className="pt-2 text-center border-t border-neutral-800/80">
              <p className="text-xs text-neutral-400 mb-2">Nedorazil vám e-mail?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || !email}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white font-medium underline underline-offset-4 disabled:opacity-50 transition"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                <span>Zaslat nový ověřovací e-mail</span>
              </button>
            </div>
          </form>
        )}

        {/* Back to sign in */}
        <div className="mt-8 text-center text-xs text-neutral-500">
          <Link href="/account" className="hover:text-neutral-300 transition">
            ← Zpět na přihlášení
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
          <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
