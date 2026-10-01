'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Package,
  Heart,
  RotateCcw,
  Settings,
  LogOut,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAuth, CustomerUser } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Order, Product } from '@/types';
import ProductCard from '@/components/ProductCard';

interface AccountClientProps {
  userOrders: (Order & { items: any[] })[];
  userReturns: any[];
  allProducts: Product[];
}

export default function AccountClient({ userOrders, userReturns, allProducts }: AccountClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerified = searchParams.get('verified') === 'true';

  const { user, loading, login, logout, refreshUser } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  // Auth form state if not logged in
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regStreet, setRegStreet] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regZip, setRegZip] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Active dashboard tab
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'returns' | 'settings'>('orders');

  // Settings form state
  const [editFirstName, setEditFirstName] = useState(user?.first_name || '');
  const [editLastName, setEditLastName] = useState(user?.last_name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editStreet, setEditStreet] = useState(user?.street || '');
  const [editCity, setEditCity] = useState(user?.city || '');
  const [editZip, setEditZip] = useState(user?.zip || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [settingsStatus, setSettingsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [settingsMsg, setSettingsMsg] = useState('');

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        login(data.user);
        window.location.reload();
      } else {
        setLoginError(data.error || 'Přihlášení se nezdařilo');
      }
    } catch {
      setLoginError('Chyba spojení se serverem');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          firstName: regFirstName,
          lastName: regLastName,
          phone: regPhone,
          street: regStreet,
          city: regCity,
          zip: regZip,
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        login(data.user);
        if (data.needsVerification) {
          router.push(`/auth/verify?email=${encodeURIComponent(regEmail)}`);
        } else {
          window.location.reload();
        }
      } else {
        setRegError(data.error || 'Registrace se nezdařila');
      }
    } catch {
      setRegError('Chyba spojení se serverem');
    } finally {
      setRegLoading(false);
    }
  };

  // Handle Settings Update
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsStatus('loading');
    setSettingsMsg('');
    try {
      const res = await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          phone: editPhone,
          street: editStreet,
          city: editCity,
          zip: editZip,
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsStatus('success');
        setSettingsMsg('Údaje byly úspěšně uloženy.');
        setCurrentPassword('');
        setNewPassword('');
        refreshUser();
      } else {
        setSettingsStatus('error');
        setSettingsMsg(data.error || 'Chyba při ukládání.');
      }
    } catch {
      setSettingsStatus('error');
      setSettingsMsg('Chyba spojení.');
    }
  };

  // Wishlist products
  const wishlistProducts = allProducts.filter((p) => wishlist.includes(p.id));

  // If user is not logged in, show Login / Register form
  if (!user && !loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-white">
        <div className="text-center space-y-2 mb-8">
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
            RUN CUSTOMER PORTAL
          </span>
          <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-tight">
            {authMode === 'login' ? 'PŘIHLÁŠENÍ DO ÚČTU' : 'NOVÁ REGISTRACE'}
          </h1>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#121216] border border-[#27272a] rounded p-1 mb-6">
          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-colors ${
              authMode === 'login' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            PŘIHLÁŠENÍ
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-colors ${
              authMode === 'register' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            VYTVOŘIT ÚČET
          </button>
        </div>

        {/* Login Form */}
        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4 bg-[#0e0e12] border border-[#222228] p-6 rounded-lg shadow-xl">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                E-mail
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="vas@email.cz"
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Heslo
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded border border-red-900">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-white text-black font-black uppercase text-xs tracking-wider py-3.5 rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {loginLoading ? 'PŘIHLAŠUJI...' : 'PŘIHLÁSIT SE'}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-zinc-500">
                Nákup můžete provést také kdykoliv{' '}
                <Link href="/shop" className="text-white underline font-bold">
                  bez registrace jako host
                </Link>.
              </span>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-4 bg-[#0e0e12] border border-[#222228] p-6 rounded-lg shadow-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Jméno *
                </label>
                <input
                  type="text"
                  required
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  placeholder="Jan"
                  className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Příjmení *
                </label>
                <input
                  type="text"
                  required
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  placeholder="Novák"
                  className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                E-mail *
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="jan.novak@email.cz"
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Heslo * (min. 6 znaků)
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="+420 777 000 000"
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Ulice a č.p.
              </label>
              <input
                type="text"
                value={regStreet}
                onChange={(e) => setRegStreet(e.target.value)}
                placeholder="Ulice 12"
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Město
                </label>
                <input
                  type="text"
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  placeholder="Město"
                  className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  PSČ
                </label>
                <input
                  type="text"
                  value={regZip}
                  onChange={(e) => setRegZip(e.target.value)}
                  placeholder="100 00"
                  className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            {regError && (
              <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded border border-red-900">
                {regError}
              </p>
            )}

            <button
              type="submit"
              disabled={regLoading}
              className="w-full bg-white text-black font-black uppercase text-xs tracking-wider py-3.5 rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {regLoading ? 'VYTVÁŘÍM ÚČET...' : 'DOKONČIT REGISTRACI'}
            </button>
          </form>
        )}
      </div>
    );
  }

  // LOGGED-IN CUSTOMER DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white">
      {/* Top Banner */}
      <div className="border-b border-[#1f1f26] pb-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block mb-1">
            ZÁKAZNICKÝ PORTÁL RUN
          </span>
          <h1 className="font-display text-2xl sm:text-3xl uppercase text-white">
            VÍTEJTE, {user?.first_name} {user?.last_name}
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">{user?.email}</p>
        </div>

        <button
          onClick={logout}
          className="self-start sm:self-center border border-[#27272a] hover:bg-red-950/30 hover:border-red-800 text-zinc-300 hover:text-red-400 px-4 py-2 rounded text-xs font-mono flex items-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Odhlásit se</span>
        </button>
      </div>

      {isVerified && (
        <div className="mb-8 p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3 text-xs text-emerald-300 font-mono">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Váš e-mail byl úspěšně ověřen. Váš RUN VIP účet je plně aktivní.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar Tabs (3 cols) */}
        <div className="lg:col-span-3 space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'orders'
                ? 'bg-white text-black font-black'
                : 'text-zinc-400 hover:text-white hover:bg-[#121216]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>MOJE OBJEDNÁVKY</span>
            <span className="ml-auto font-mono text-[10px] opacity-75">
              {userOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'wishlist'
                ? 'bg-white text-black font-black'
                : 'text-zinc-400 hover:text-white hover:bg-[#121216]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>OBLÍBENÉ POLOŽKY</span>
            <span className="ml-auto font-mono text-[10px] opacity-75">
              {wishlist.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'returns'
                ? 'bg-white text-black font-black'
                : 'text-zinc-400 hover:text-white hover:bg-[#121216]'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>VRÁCENÍ A REKLAMACE</span>
            <span className="ml-auto font-mono text-[10px] opacity-75">
              {userReturns.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'settings'
                ? 'bg-white text-black font-black'
                : 'text-zinc-400 hover:text-white hover:bg-[#121216]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>NASTAVENÍ A ADRESA</span>
          </button>
        </div>

        {/* Tab Content (9 cols) */}
        <div className="lg:col-span-9">
          {/* TAB 1: MOJE OBJEDNÁVKY */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="font-display text-sm uppercase tracking-wider text-zinc-400">
                HISTORIE OBJEDNÁVEK ({userOrders.length})
              </h2>

              {userOrders.length === 0 ? (
                <div className="p-12 text-center bg-[#0e0e12] border border-[#222228] rounded-lg space-y-3">
                  <p className="text-zinc-400 text-xs">Zatím jste nevytvořili žádnou objednávku.</p>
                  <Link
                    href="/shop"
                    className="inline-block bg-white text-black font-black uppercase text-xs px-6 py-2.5 rounded"
                  >
                    PROZKOUMAT OBCHOD
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-[#0e0e12] border border-[#222228] rounded-lg p-5 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1b1b22] gap-2 text-xs font-mono">
                        <div>
                          <span className="text-zinc-500">Číslo objednávky: </span>
                          <strong className="text-white">{ord.order_number}</strong>
                          <span className="text-zinc-500 ml-2">
                            ({new Date(ord.created_at).toLocaleDateString('cs-CZ')})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1e1e24] text-white">
                            {ord.order_status}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-900">
                            {ord.payment_status}
                          </span>
                        </div>
                      </div>

                      {/* Items preview */}
                      <div className="space-y-2">
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-12 bg-[#18181f] rounded overflow-hidden">
                                <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <span className="font-bold text-white block">{item.product_name}</span>
                                <span className="text-[11px] font-mono text-zinc-500">
                                  {item.size} • {item.color} • {item.quantity}×
                                </span>
                              </div>
                            </div>
                            <span className="font-mono text-zinc-300 font-bold">
                              {formatPrice(item.total)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Bottom action row */}
                      <div className="pt-3 border-t border-[#1b1b22] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <span className="font-mono font-bold text-white text-sm">
                          Celkem: {formatPrice(ord.total)}
                        </span>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/track?order=${ord.order_number}`}
                            className="bg-[#18181f] hover:bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded font-mono text-[11px] flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Sledovat zásilku</span>
                          </Link>
                          <Link
                            href={`/order-confirmation/${ord.order_number}`}
                            className="bg-white text-black hover:bg-zinc-200 px-3 py-1.5 rounded font-mono font-bold text-[11px]"
                          >
                            Detail & Faktura →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OBLÍBENÉ POLOŽKY (WISHLIST) */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="font-display text-sm uppercase tracking-wider text-zinc-400">
                ULOŽENÉ KUSY ({wishlistProducts.length})
              </h2>

              {wishlistProducts.length === 0 ? (
                <div className="p-12 text-center bg-[#0e0e12] border border-[#222228] rounded-lg space-y-3">
                  <p className="text-zinc-400 text-xs">Zatím nemáte v oblíbených žádné produkty.</p>
                  <Link
                    href="/shop"
                    className="inline-block bg-white text-black font-black uppercase text-xs px-6 py-2.5 rounded"
                  >
                    PROCHÁZET KATALOG
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {wishlistProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VRÁCENÍ A REKLAMACE */}
          {activeTab === 'returns' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm uppercase tracking-wider text-zinc-400">
                  VRÁCENÍ A REKLAMACE ({userReturns.length})
                </h2>
                <div className="flex gap-2">
                  <Link
                    href="/returns"
                    className="bg-white text-black font-bold uppercase text-[11px] px-3.5 py-1.5 rounded hover:bg-zinc-200"
                  >
                    + Založit vrácení zboží
                  </Link>
                  <Link
                    href="/reclamations"
                    className="border border-[#27272a] text-zinc-300 font-bold uppercase text-[11px] px-3.5 py-1.5 rounded hover:bg-[#18181f]"
                  >
                    + Založit reklamaci
                  </Link>
                </div>
              </div>

              {userReturns.length === 0 ? (
                <div className="p-12 text-center bg-[#0e0e12] border border-[#222228] rounded-lg space-y-3">
                  <p className="text-zinc-400 text-xs">Nemáte žádné aktivní požadavky na vrácení ani reklamace.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userReturns.map((r: any) => (
                    <div key={r.id} className="p-4 bg-[#0e0e12] border border-[#222228] rounded space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{r.type === 'RETURN' ? 'VRÁCENÍ ZBOŽÍ' : 'REKLAMACE'}</span>
                        <span className="text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900">
                          {r.status}
                        </span>
                      </div>
                      <div className="text-zinc-400">
                        Objednávka: <strong className="text-zinc-200">{r.order_number}</strong> • Produkt: <strong className="text-zinc-200">{r.product_name}</strong>
                      </div>
                      <div className="text-zinc-500 text-[11px]">Důvod: {r.reason}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NASTAVENÍ ÚČTU */}
          {activeTab === 'settings' && (
            <div className="bg-[#0e0e12] border border-[#222228] rounded-lg p-6 space-y-6">
              <h2 className="font-display text-sm uppercase tracking-wider text-white">
                SPRÁVA OSOBNÍCH A DODACÍCH ÚDAJŮ
              </h2>

              <form onSubmit={handleUpdateSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                      Jméno
                    </label>
                    <input
                      type="text"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                      Příjmení
                    </label>
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                    Ulice a č.p.
                  </label>
                  <input
                    type="text"
                    value={editStreet}
                    onChange={(e) => setEditStreet(e.target.value)}
                    className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                      Město
                    </label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                      PSČ
                    </label>
                    <input
                      type="text"
                      value={editZip}
                      onChange={(e) => setEditZip(e.target.value)}
                      className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1b1b22] space-y-3">
                  <span className="font-display text-xs uppercase text-zinc-300 block">
                    ZMĚNA HESLA (VOLITELNÉ)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="password"
                      placeholder="Stávající heslo"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white placeholder-zinc-600"
                    />
                    <input
                      type="password"
                      placeholder="Nové heslo (min. 6 znaků)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white placeholder-zinc-600"
                    />
                  </div>
                </div>

                {settingsMsg && (
                  <p
                    className={`text-xs p-2.5 rounded ${
                      settingsStatus === 'success'
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900'
                        : 'bg-red-950/40 text-red-400 border border-red-900'
                    }`}
                  >
                    {settingsMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={settingsStatus === 'loading'}
                  className="bg-white text-black font-black uppercase text-xs tracking-wider px-6 py-3 rounded hover:bg-zinc-200 transition-colors"
                >
                  {settingsStatus === 'loading' ? 'UKLÁDÁM...' : 'ULOŽIT ZMĚNY'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
