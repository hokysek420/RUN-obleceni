'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Star,
  Camera,
  Tag,
  Gift,
  Calendar,
  FileText,
  Image as ImageIcon,
  Settings,
  Shield,
  LogOut,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Truck,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Eye,
  DollarSign
} from 'lucide-react';
import { Product, Order, Review, CommunityPhoto, DiscountCode, GiftCard, Appointment } from '@/types';
import RunLogo from '@/components/RunLogo';
import InvoicePrintButton from '@/components/InvoicePrintButton';

interface AdminDashboardClientProps {
  initialProducts: Product[];
  initialOrders: (Order & { items: any[] })[];
  initialReviews: Review[];
  initialCommunity: CommunityPhoto[];
  initialDiscounts: DiscountCode[];
  initialGiftCards: GiftCard[];
  initialAppointments: Appointment[];
  initialUsers: any[];
  initialAdminUsers: any[];
  initialContent: Record<string, any>;
  initialSettings: Record<string, any>;
  adminUser: { id: number; email: string; name: string; role: string };
}

export default function AdminDashboardClient({
  initialProducts,
  initialOrders,
  initialReviews,
  initialCommunity,
  initialDiscounts,
  initialGiftCards,
  initialAppointments,
  initialUsers,
  initialAdminUsers,
  initialContent,
  initialSettings,
  adminUser,
}: AdminDashboardClientProps) {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'products'
    | 'orders'
    | 'customers'
    | 'reviews'
    | 'community'
    | 'discounts'
    | 'giftCards'
    | 'appointments'
    | 'content'
    | 'media'
    | 'settings'
    | 'adminUsers'
  >('dashboard');

  // Dynamic datasets
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [community, setCommunity] = useState<CommunityPhoto[]>(initialCommunity);
  const [discounts, setDiscounts] = useState<DiscountCode[]>(initialDiscounts);
  const [giftCards, setGiftCards] = useState<GiftCard[]>(initialGiftCards);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [customers, setCustomers] = useState<any[]>(initialUsers);
  const [adminUsers, setAdminUsers] = useState<any[]>(initialAdminUsers);
  const [content, setContent] = useState<Record<string, any>>(initialContent);
  const [settings, setSettings] = useState<Record<string, any>>(initialSettings);

  // Notifications / Toast
  const [notification, setNotification] = useState<string | null>(null);
  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Product Form Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // New Discount Form Modal State
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [newDiscountCode, setNewDiscountCode] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [newDiscountVal, setNewDiscountVal] = useState(10);
  const [newDiscountMin, setNewDiscountMin] = useState(0);

  // New Gift Card Form Modal State
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [newGiftAmount, setNewGiftAmount] = useState(1000);
  const [newGiftCode, setNewGiftCode] = useState('');

  // Media Library state
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Load media when tab opened
  useEffect(() => {
    if (activeTab === 'media') {
      setMediaLoading(true);
      fetch('/api/admin/media')
        .then((res) => res.json())
        .then((data) => {
          if (data.media) setMediaList(data.media);
        })
        .finally(() => setMediaLoading(false));
    }
  }, [activeTab]);

  // Handle Logout
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // Calculate Metrics for Dashboard
  const totalRevenue = orders.reduce((sum, o) => sum + (o.payment_status === 'Zaplaceno' ? o.total : 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.order_status === 'Přijato' || o.order_status === 'Čeká na platbu').length;
  const lowStockProductsCount = products.filter((p) => p.status === 'VYPRODÁNO' || (p.variants?.some((v) => v.stock <= 2))).length;

  // PRODUCT ACTIONS: Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const isEdit = Boolean(editingProduct.id);
      const res = await fetch('/api/admin/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });

      if (res.ok) {
        notify(isEdit ? 'Produkt byl aktualizován.' : 'Nový produkt byl přidán na storefront.');
        setProductModalOpen(false);
        setEditingProduct(null);
        // Refresh products list
        const prRes = await fetch('/api/admin/products');
        const prData = await prRes.json();
        if (prData.products) setProducts(prData.products);
      }
    } catch (err) {
      notify('Chyba při ukládání produktu.');
    }
  };

  // PRODUCT ACTIONS: Delete Product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Opravdu si přejete smazat tento produkt?')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        notify('Produkt byl smazán.');
      }
    } catch {
      notify('Chyba při mazání.');
    }
  };

  // ORDER ACTIONS: Update Order
  const handleUpdateOrder = async (orderId: number, updates: any) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, ...updates }),
      });
      if (res.ok) {
        notify('Stav objednávky byl aktualizován.');
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, ...updates });
        }
      }
    } catch {
      notify('Chyba při aktualizaci.');
    }
  };

  // REVIEW ACTIONS: Update Status
  const handleReviewStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    notify(`Recenze byla označena jako ${status}.`);
  };

  // COMMUNITY ACTIONS: Update Status
  const handleCommunityStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    await fetch('/api/admin/community', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setCommunity((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    notify(`Fotografie byla označena jako ${status}.`);
  };

  // DISCOUNT ACTIONS: Create
  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: newDiscountCode,
        type: newDiscountType,
        value: newDiscountVal,
        minOrder: newDiscountMin,
      }),
    });
    if (res.ok) {
      notify('Slevový kód byl vytvořen.');
      setDiscountModalOpen(false);
      setNewDiscountCode('');
      const r = await fetch('/api/admin/discounts');
      const d = await r.json();
      if (d.discounts) setDiscounts(d.discounts);
    }
  };

  // GIFT CARD ACTIONS: Create
  const handleCreateGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/gift-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: newGiftCode, balance: newGiftAmount }),
    });
    if (res.ok) {
      notify('Dárkový poukaz byl vytvořen.');
      setGiftModalOpen(false);
      setNewGiftCode('');
      const r = await fetch('/api/admin/gift-cards');
      const d = await r.json();
      if (d.giftCards) setGiftCards(d.giftCards);
    }
  };

  // CMS ACTIONS: Update Content Key
  const handleSaveContent = async (key: string, value: any) => {
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    if (res.ok) {
      notify(`Obsah sekce "${key}" byl uložen.`);
      setContent({ ...content, [key]: value });
    }
  };

  // SETTINGS ACTIONS: Update Setting Key
  const handleSaveSettings = async (key: string, value: any) => {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    if (res.ok) {
      notify(`Nastavení "${key}" bylo uloženo.`);
      setSettings({ ...settings, [key]: value });
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-white text-black px-4 py-2.5 rounded font-mono text-xs font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Admin Navbar */}
      <header className="bg-[#0c0c10] border-b border-[#1f1f26] px-6 py-3 flex items-center justify-between z-30">
        <div className="flex items-center space-x-4">
          <RunLogo size="sm" />
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase bg-[#181820] border border-[#2a2a34] px-2 py-0.5 rounded">
            ADMIN WORKSPACE v1.0
          </span>
          <Link
            href="/"
            target="_blank"
            className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Zobrazit Storefront</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="text-right hidden sm:block">
            <span className="text-white font-bold block">{adminUser.name}</span>
            <span className="text-[10px] text-zinc-500 uppercase">{adminUser.role}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 border border-[#27272a] hover:bg-red-950/40 hover:border-red-900 text-zinc-400 hover:text-red-400 rounded transition-colors"
            title="Odhlásit se"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 bg-[#09090c] border-r border-[#1a1a22] p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-1">
            {[
              { id: 'dashboard', label: 'Přehled', icon: LayoutDashboard },
              { id: 'products', label: 'Produkty & Sklad', icon: Package, badge: products.length },
              { id: 'orders', label: 'Objednávky', icon: ShoppingBag, badge: pendingOrdersCount, badgeColor: 'bg-red-500' },
              { id: 'customers', label: 'Zákazníci', icon: Users, badge: customers.length },
              { id: 'reviews', label: 'Recenze', icon: Star, badge: reviews.filter((r) => r.status === 'PENDING').length },
              { id: 'community', label: 'Komunitní galerie', icon: Camera, badge: community.filter((c) => c.status === 'PENDING').length },
              { id: 'discounts', label: 'Slevové kódy', icon: Tag },
              { id: 'giftCards', label: 'Dárkové poukazy', icon: Gift },
              { id: 'content', label: 'Správa obsahu (CMS)', icon: FileText },
              { id: 'media', label: 'Knihovna médií', icon: ImageIcon },
              { id: 'settings', label: 'Nastavení obchodu', icon: Settings },
              { id: 'adminUsers', label: 'Správa rolí a adminů', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-mono transition-colors ${
                    isActive
                      ? 'bg-white text-black font-bold shadow'
                      : 'text-zinc-400 hover:text-white hover:bg-[#121216]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {Boolean(tab.badge) && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-black text-white'
                          : tab.badgeColor || 'bg-[#222228] text-zinc-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-6 border-t border-[#1a1a22] text-[11px] font-mono text-zinc-600">
            RUN Commerce System<br />
            Database: SQLite (WAL)<br />
            Status: Synchronized
          </div>
        </aside>

        {/* Tab Workspace */}
        <main className="flex-1 bg-[#060608] overflow-y-auto p-6 sm:p-8">
          {/* 1. DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display text-2xl uppercase tracking-tight text-white">
                    PŘEHLED PRODEJE & VÝKONNOSTI
                  </h1>
                  <span className="text-xs font-mono text-zinc-500">
                    Poslední synchronizace: právě teď
                  </span>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-[#0d0d12] border border-[#222228] rounded-lg space-y-2">
                  <span className="text-[11px] font-mono uppercase text-zinc-500">CELKOVÉ TRŽBY</span>
                  <div className="text-2xl font-black font-mono text-white">
                    {totalRevenue.toLocaleString('cs-CZ')} Kč
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {orders.filter((o) => o.payment_status === 'Zaplaceno').length} zaplacených objednávek
                  </span>
                </div>

                <div className="p-5 bg-[#0d0d12] border border-[#222228] rounded-lg space-y-2">
                  <span className="text-[11px] font-mono uppercase text-zinc-500">ČEKAJÍCÍ OBJEDNÁVKY</span>
                  <div className="text-2xl font-black font-mono text-white">
                    {pendingOrdersCount}
                  </div>
                  <span className="text-[10px] font-mono text-amber-400">Vyžaduje expedici / platbu</span>
                </div>

                <div className="p-5 bg-[#0d0d12] border border-[#222228] rounded-lg space-y-2">
                  <span className="text-[11px] font-mono uppercase text-zinc-500">AKTIVNÍ PRODUKTY</span>
                  <div className="text-2xl font-black font-mono text-white">
                    {products.length}
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400">Drop 01 v prodeji</span>
                </div>

                <div className="p-5 bg-[#0d0d12] border border-[#222228] rounded-lg space-y-2">
                  <span className="text-[11px] font-mono uppercase text-zinc-500">NÍZKÉ ZÁSOBY</span>
                  <div className="text-2xl font-black font-mono text-amber-400">
                    {lowStockProductsCount}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">Varianty se zásobou ≤ 2 ks</span>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="p-6 bg-[#0d0d12] border border-[#222228] rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm uppercase text-white tracking-wider">
                    POSLEDNÍ OBJEDNÁVKY
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-mono text-zinc-400 hover:text-white underline"
                  >
                    Zobrazit všech {orders.length} objednávek →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-zinc-500">Zatím žádné objednávky.</p>
                ) : (
                  <div className="divide-y divide-[#1a1a22] overflow-x-auto">
                    <table className="w-full text-xs font-mono text-zinc-300">
                      <thead>
                        <tr className="text-left text-zinc-500 uppercase pb-2">
                          <th className="py-2">Objednávka</th>
                          <th className="py-2">Zákazník</th>
                          <th className="py-2">Doprava</th>
                          <th className="py-2">Platba</th>
                          <th className="py-2">Stav</th>
                          <th className="py-2 text-right">Celkem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#141418]">
                        {orders.slice(0, 5).map((o) => (
                          <tr
                            key={o.id}
                            onClick={() => {
                              setSelectedOrder(o);
                              setActiveTab('orders');
                            }}
                            className="hover:bg-[#14141a] cursor-pointer"
                          >
                            <td className="py-3 font-bold text-white">{o.order_number}</td>
                            <td className="py-3">{o.customer_name}</td>
                            <td className="py-3">{o.delivery_method}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${
                                o.payment_status === 'Zaplaceno' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-amber-950 text-amber-400 border border-amber-900'
                              }`}>
                                {o.payment_status}
                              </span>
                            </td>
                            <td className="py-3">{o.order_status}</td>
                            <td className="py-3 text-right font-bold text-white">
                              {o.total.toLocaleString('cs-CZ')} Kč
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. PRODUCTS & INVENTORY MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl uppercase tracking-tight text-white">
                    SPRÁVA PRODUKTŮ A SKLADU
                  </h1>
                  <p className="text-xs font-mono text-zinc-500">
                    Změny v cenách, statusech i skladových zásobách se okamžitě projevují na veřejném e-shopu.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct({
                      name: '',
                      slug: '',
                      category: 'Outerwear',
                      price: 2990,
                      sku: `RUN-${Date.now().toString().slice(-4)}`,
                      status: 'SKLADEM',
                      description: '',
                      material: 'Heavy Cotton',
                      grammage: '450 GSM',
                      fit: 'Boxy Oversized',
                      care_instructions: 'Prát na 30°C.',
                      warranty: 'Záruka 24 měsíců.',
                      primary_image: '/images/products/teddy-black-front.jpg',
                      gallery: ['/images/products/teddy-black-front.jpg'],
                      variants: [
                        { size: 'S', color: 'Black', sku: 'S', stock: 10, reserved_stock: 0, id: 0, product_id: 0 },
                        { size: 'M', color: 'Black', sku: 'M', stock: 10, reserved_stock: 0, id: 0, product_id: 0 },
                        { size: 'L', color: 'Black', sku: 'L', stock: 10, reserved_stock: 0, id: 0, product_id: 0 },
                      ],
                    });
                    setProductModalOpen(true);
                  }}
                  className="bg-white text-black font-black uppercase text-xs px-4 py-2.5 rounded hover:bg-zinc-200 transition-colors flex items-center gap-1.5 self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>PŘIDAT NOVÝ PRODUKT</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-[#0d0d12] border border-[#222228] rounded-lg overflow-x-auto">
                <table className="w-full text-xs font-mono text-zinc-300">
                  <thead>
                    <tr className="border-b border-[#1f1f26] text-left text-zinc-500 uppercase">
                      <th className="p-3.5">Foto</th>
                      <th className="p-3.5">Název produktu</th>
                      <th className="p-3.5">Kategorie</th>
                      <th className="p-3.5">Cena (Kč)</th>
                      <th className="p-3.5">Stav na e-shopu</th>
                      <th className="p-3.5">Zásoba variant</th>
                      <th className="p-3.5 text-right">Akce</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17171e]">
                    {products.map((p) => {
                      const totalStock = p.variants?.reduce((s, v) => s + v.stock, 0) || 0;
                      return (
                        <tr key={p.id} className="hover:bg-[#121217]">
                          <td className="p-3.5">
                            <div className="w-10 h-12 bg-[#181820] rounded overflow-hidden">
                              <img src={p.primary_image} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="p-3.5 font-bold text-white max-w-xs truncate">
                            <Link href={`/product/${p.slug}`} target="_blank" className="hover:underline flex items-center gap-1">
                              <span>{p.name}</span>
                              <ExternalLink className="w-3 h-3 text-zinc-500" />
                            </Link>
                            <span className="text-[10px] text-zinc-500 block font-normal">{p.sku}</span>
                          </td>
                          <td className="p-3.5">{p.category}</td>
                          <td className="p-3.5 font-bold text-white">
                            {p.price.toLocaleString('cs-CZ')} Kč
                          </td>
                          <td className="p-3.5">
                            <select
                              value={p.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value as any;
                                await fetch('/api/admin/products', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ ...p, status: newStatus }),
                                });
                                setProducts((prev) =>
                                  prev.map((item) => (item.id === p.id ? { ...item, status: newStatus } : item))
                                );
                                notify(`Stav produktu byl změněn na ${newStatus}`);
                              }}
                              className="bg-[#181820] border border-[#2e2e38] text-xs text-white rounded px-2 py-1 font-mono"
                            >
                              <option value="SKLADEM">SKLADEM</option>
                              <option value="PŘEDOBJEDNÁVKA">PŘEDOBJEDNÁVKA</option>
                              <option value="LIMITOVANÁ EDICE">LIMITOVANÁ EDICE</option>
                              <option value="VYPRODÁNO">VYPRODÁNO</option>
                            </select>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              totalStock <= 0 ? 'bg-red-950 text-red-400' : totalStock <= 5 ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-400'
                            }`}>
                              {totalStock} ks
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductModalOpen(true);
                              }}
                              className="p-1.5 border border-[#2e2e38] hover:bg-white hover:text-black rounded text-zinc-300 transition-colors"
                              title="Upravit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 border border-[#2e2e38] hover:bg-red-950 hover:text-red-400 rounded text-zinc-500 transition-colors"
                              title="Smazat"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display text-2xl uppercase tracking-tight text-white">
                    SPRÁVA OBJEDNÁVEK ({orders.length})
                  </h1>
                  <p className="text-xs font-mono text-zinc-500">
                    Změna stavu, přiřazení sledovacích čísel dopravců a tisk daňových dokladů.
                  </p>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-[#0d0d12] border border-[#222228] rounded-lg overflow-x-auto">
                <table className="w-full text-xs font-mono text-zinc-300">
                  <thead>
                    <tr className="border-b border-[#1f1f26] text-left text-zinc-500 uppercase">
                      <th className="p-3.5">Číslo</th>
                      <th className="p-3.5">Zákazník</th>
                      <th className="p-3.5">Dopravce & Sledování</th>
                      <th className="p-3.5">Platba</th>
                      <th className="p-3.5">Stav objednávky</th>
                      <th className="p-3.5 text-right">Celkem</th>
                      <th className="p-3.5 text-right">Faktura</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17171e]">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#121217]">
                        <td className="p-3.5 font-bold text-white">{ord.order_number}</td>
                        <td className="p-3.5">
                          <div>{ord.customer_name}</div>
                          <span className="text-[10px] text-zinc-500">{ord.customer_email}</span>
                        </td>
                        <td className="p-3.5">
                          <input
                            type="text"
                            placeholder="Zadejte kód zásilky..."
                            defaultValue={ord.tracking_number || ''}
                            onBlur={(e) => {
                              if (e.target.value !== ord.tracking_number) {
                                handleUpdateOrder(ord.id, { trackingNumber: e.target.value });
                              }
                            }}
                            className="bg-[#16161c] border border-[#27272a] rounded px-2 py-1 text-[11px] text-cyan-400 w-40"
                          />
                        </td>
                        <td className="p-3.5">
                          <select
                            value={ord.payment_status}
                            onChange={(e) => handleUpdateOrder(ord.id, { paymentStatus: e.target.value })}
                            className="bg-[#181820] border border-[#2e2e38] text-xs text-white rounded px-2 py-1"
                          >
                            <option value="Čeká na platbu">Čeká na platbu</option>
                            <option value="Zaplaceno">Zaplaceno</option>
                            <option value="Vráceno">Vráceno</option>
                          </select>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={ord.order_status}
                            onChange={(e) => handleUpdateOrder(ord.id, { orderStatus: e.target.value })}
                            className="bg-[#181820] border border-[#2e2e38] text-xs text-white rounded px-2 py-1"
                          >
                            <option value="Přijato">Přijato</option>
                            <option value="Zaplaceno">Zaplaceno</option>
                            <option value="Zpracovává se">Zpracovává se</option>
                            <option value="Odesláno">Odesláno</option>
                            <option value="Doručeno">Doručeno</option>
                            <option value="Stornováno">Stornováno</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right font-bold text-white">
                          {ord.total.toLocaleString('cs-CZ')} Kč
                        </td>
                        <td className="p-3.5 text-right">
                          <InvoicePrintButton order={ord} items={ord.items || []} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. CUSTOMERS DIRECTORY */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <h1 className="font-display text-2xl uppercase tracking-tight text-white">
                REGISTROVANÍ ZÁKAZNÍCI ({customers.length})
              </h1>
              <div className="bg-[#0d0d12] border border-[#222228] rounded-lg overflow-x-auto">
                <table className="w-full text-xs font-mono text-zinc-300">
                  <thead>
                    <tr className="border-b border-[#1f1f26] text-left text-zinc-500 uppercase">
                      <th className="p-3.5">Jméno</th>
                      <th className="p-3.5">E-mail</th>
                      <th className="p-3.5">Telefon</th>
                      <th className="p-3.5">Město / Adresa</th>
                      <th className="p-3.5">Datum registrace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17171e]">
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="p-3.5 font-bold text-white">{c.first_name} {c.last_name}</td>
                        <td className="p-3.5">{c.email}</td>
                        <td className="p-3.5">{c.phone || '-'}</td>
                        <td className="p-3.5">{c.street || ''} {c.city || ''}</td>
                        <td className="p-3.5 text-zinc-500">{new Date(c.created_at).toLocaleDateString('cs-CZ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <h1 className="font-display text-2xl uppercase tracking-tight text-white">
                MODERACE RECENZÍ ({reviews.length})
              </h1>
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 bg-[#0d0d12] border border-[#222228] rounded-lg flex items-center justify-between gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{r.customer_name}</span>
                        <span className="text-amber-400">★ {r.rating}/5</span>
                        <span className="text-zinc-500">k produktu: {r.product_id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          r.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      <div className="font-bold text-zinc-200">{r.title}</div>
                      <p className="text-zinc-400 font-sans">{r.comment}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {r.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleReviewStatus(r.id, 'APPROVED')}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold"
                        >
                          Schválit
                        </button>
                      )}
                      {r.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleReviewStatus(r.id, 'REJECTED')}
                          className="px-3 py-1.5 bg-[#1e1e24] text-zinc-400 hover:text-white rounded text-xs"
                        >
                          Odmítnout
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. COMMUNITY GALLERY MODERATION */}
          {activeTab === 'community' && (
            <div className="space-y-6">
              <h1 className="font-display text-2xl uppercase tracking-tight text-white">
                MODERACE FOTOGALERIE KOMUNITY ({community.length})
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {community.map((item) => (
                  <div key={item.id} className="bg-[#0e0e12] border border-[#222228] rounded-lg overflow-hidden flex flex-col justify-between">
                    <div className="aspect-square bg-[#16161c]">
                      <img src={item.image_url} alt={item.author_name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{item.author_name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          item.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-[11px] font-sans">{item.caption}</p>
                      <div className="pt-2 flex gap-2">
                        {item.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleCommunityStatus(item.id, 'APPROVED')}
                            className="flex-1 bg-emerald-600 text-white py-1.5 rounded font-bold"
                          >
                            Schválit
                          </button>
                        )}
                        {item.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleCommunityStatus(item.id, 'REJECTED')}
                            className="flex-1 bg-[#1e1e24] text-zinc-400 py-1.5 rounded"
                          >
                            Zamítnout
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. DISCOUNTS */}
          {activeTab === 'discounts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-2xl uppercase tracking-tight text-white">
                  SLEVOVÉ KÓDY & AKCE
                </h1>
                <button
                  onClick={() => setDiscountModalOpen(true)}
                  className="bg-white text-black font-black uppercase text-xs px-4 py-2.5 rounded hover:bg-zinc-200 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>VYTVOŘIT KÓD</span>
                </button>
              </div>

              <div className="bg-[#0d0d12] border border-[#222228] rounded-lg overflow-x-auto">
                <table className="w-full text-xs font-mono text-zinc-300">
                  <thead>
                    <tr className="border-b border-[#1f1f26] text-left text-zinc-500 uppercase">
                      <th className="p-3.5">Kód</th>
                      <th className="p-3.5">Typ slevy</th>
                      <th className="p-3.5">Hodnota</th>
                      <th className="p-3.5">Min. nákup</th>
                      <th className="p-3.5">Použito</th>
                      <th className="p-3.5">Aktivní</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17171e]">
                    {discounts.map((d) => (
                      <tr key={d.id}>
                        <td className="p-3.5 font-bold text-white">{d.code}</td>
                        <td className="p-3.5">{d.type === 'PERCENT' ? 'Procentuální' : 'Pevná částka'}</td>
                        <td className="p-3.5 font-bold text-emerald-400">
                          {d.type === 'PERCENT' ? `${d.value}%` : `${d.value} Kč`}
                        </td>
                        <td className="p-3.5">{d.min_order} Kč</td>
                        <td className="p-3.5">{d.times_used}×</td>
                        <td className="p-3.5">
                          <span className="text-emerald-400">Aktivní</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. GIFT CARDS */}
          {activeTab === 'giftCards' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-2xl uppercase tracking-tight text-white">
                  DÁRKOVÉ POUKAZY
                </h1>
                <button
                  onClick={() => setGiftModalOpen(true)}
                  className="bg-white text-black font-black uppercase text-xs px-4 py-2.5 rounded hover:bg-zinc-200 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>GENEROVAT POUKAZ</span>
                </button>
              </div>

              <div className="bg-[#0d0d12] border border-[#222228] rounded-lg overflow-x-auto">
                <table className="w-full text-xs font-mono text-zinc-300">
                  <thead>
                    <tr className="border-b border-[#1f1f26] text-left text-zinc-500 uppercase">
                      <th className="p-3.5">Kód poukazu</th>
                      <th className="p-3.5">Původní hodnota</th>
                      <th className="p-3.5">Aktuální zůstatek</th>
                      <th className="p-3.5">Stav</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17171e]">
                    {giftCards.map((g) => (
                      <tr key={g.id}>
                        <td className="p-3.5 font-bold text-cyan-400">{g.code}</td>
                        <td className="p-3.5">{g.initial_balance} Kč</td>
                        <td className="p-3.5 font-bold text-white">{g.current_balance} Kč</td>
                        <td className="p-3.5 text-emerald-400">Platný</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* 10. CMS CONTENT MANAGEMENT */}
          {activeTab === 'content' && (
            <div className="space-y-8 max-w-3xl">
              <div>
                <h1 className="font-display text-2xl uppercase tracking-tight text-white">
                  SPRÁVA OBSAHU WEBU (CMS)
                </h1>
                <p className="text-xs font-mono text-zinc-500">
                  Upravujte texty, slogany a kampaňové bannery bez nutnosti zásahu do zdrojového kódu.
                </p>
              </div>

              {/* Hero Banner CMS */}
              <div className="p-6 bg-[#0d0d12] border border-[#222228] rounded-lg space-y-4 text-xs font-mono">
                <h3 className="font-display text-sm uppercase text-white tracking-wider">
                  HOMEPAGE HERO SEKCÍ
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Hlavní nadpis (Headline)</label>
                    <input
                      type="text"
                      defaultValue={content.hero?.headline || 'MOVE DIFFERENT.'}
                      onBlur={(e) => {
                        handleSaveContent('hero', { ...content.hero, headline: e.target.value });
                      }}
                      className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Podnadpis (Subheadline)</label>
                    <input
                      type="text"
                      defaultValue={content.hero?.subheadline || 'MORE THAN CLOTHES. IT’S A MINDSET.'}
                      onBlur={(e) => {
                        handleSaveContent('hero', { ...content.hero, subheadline: e.target.value });
                      }}
                      className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">URL Pozadí Hero banneru</label>
                    <input
                      type="text"
                      defaultValue={content.hero?.bgImage || '/images/editorial/campaign-hero-models.jpg'}
                      onBlur={(e) => {
                        handleSaveContent('hero', { ...content.hero, bgImage: e.target.value });
                      }}
                      className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 11. MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <h1 className="font-display text-2xl uppercase tracking-tight text-white">
                KNIHOVNA MÉDIÍ & ASSETŮ
              </h1>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaList.map((m, idx) => (
                  <div key={idx} className="bg-[#0e0e12] border border-[#222228] rounded-lg overflow-hidden flex flex-col justify-between">
                    <div className="aspect-square bg-[#16161c]">
                      <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 text-[11px] font-mono space-y-1">
                      <span className="font-bold text-white block truncate">{m.name}</span>
                      <div className="flex justify-between text-zinc-500">
                        <span>{m.category}</span>
                        <span>{m.size}</span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(m.url);
                          notify('URL zkopírována do schránky');
                        }}
                        className="w-full bg-[#181820] hover:bg-white hover:text-black py-1 rounded text-zinc-300 transition-colors mt-2"
                      >
                        Kopírovat URL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. STORE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <h1 className="font-display text-2xl uppercase tracking-tight text-white">
                NASTAVENÍ E-SHOPU & PLATEB
              </h1>

              <div className="p-6 bg-[#0d0d12] border border-[#222228] rounded-lg space-y-4 text-xs font-mono">
                <h3 className="font-display uppercase text-white tracking-wider">
                  LOGISTIKA & DOPRAVA
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 block mb-1">Cena Zásilkovny (Kč)</label>
                    <input
                      type="number"
                      defaultValue={settings.shipping?.zasilkovnaPrice || 79}
                      onBlur={(e) => {
                        handleSaveSettings('shipping', {
                          ...settings.shipping,
                          zasilkovnaPrice: Number(e.target.value),
                        });
                      }}
                      className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Práh pro dopravu zdarma (Kč)</label>
                    <input
                      type="number"
                      defaultValue={settings.shipping?.freeThreshold || 2500}
                      onBlur={(e) => {
                        handleSaveSettings('shipping', {
                          ...settings.shipping,
                          freeThreshold: Number(e.target.value),
                        });
                      }}
                      className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 13. ADMIN USERS & ROLES */}
          {activeTab === 'adminUsers' && (
            <div className="space-y-6 max-w-2xl">
              <h1 className="font-display text-2xl uppercase tracking-tight text-white">
                SPRÁVA ADMINISTRÁTORŮ & ROLÍ
              </h1>
              <div className="bg-[#0d0d12] border border-[#222228] rounded-lg overflow-x-auto">
                <table className="w-full text-xs font-mono text-zinc-300">
                  <thead>
                    <tr className="border-b border-[#1f1f26] text-left text-zinc-500 uppercase">
                      <th className="p-3.5">Jméno</th>
                      <th className="p-3.5">E-mail</th>
                      <th className="p-3.5">Oprávnění (Role)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17171e]">
                    {adminUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="p-3.5 font-bold text-white">{u.name}</td>
                        <td className="p-3.5">{u.email}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-white text-black font-bold text-[10px]">
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PRODUCT EDIT / CREATE MODAL */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e0e12] border border-[#27272a] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#222228]">
              <h3 className="font-display text-lg uppercase text-white tracking-wide">
                {editingProduct.id ? 'UPRAVIT PRODUKT' : 'NOVÝ PRODUKT'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 uppercase block mb-1">Název produktu *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 uppercase block mb-1">Kategorie *</label>
                  <select
                    value={editingProduct.category || 'Outerwear'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  >
                    <option value="Outerwear">Outerwear & Mikiny</option>
                    <option value="T-Shirts">Trička & Topy</option>
                    <option value="Pants">Pants & Kalhoty</option>
                    <option value="Footwear">Footwear & Boty</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-zinc-400 uppercase block mb-1">Cena (Kč) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 uppercase block mb-1">Akční cena (Kč)</label>
                  <input
                    type="number"
                    value={editingProduct.sale_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sale_price: e.target.value ? Number(e.target.value) : null })}
                    className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 uppercase block mb-1">Stav *</label>
                  <select
                    value={editingProduct.status || 'SKLADEM'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                    className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  >
                    <option value="SKLADEM">SKLADEM</option>
                    <option value="PŘEDOBJEDNÁVKA">PŘEDOBJEDNÁVKA</option>
                    <option value="LIMITOVANÁ EDICE">LIMITOVANÁ EDICE</option>
                    <option value="VYPRODÁNO">VYPRODÁNO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 uppercase block mb-1">Gramáž (GSM / oz)</label>
                  <input
                    type="text"
                    value={editingProduct.grammage || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, grammage: e.target.value })}
                    placeholder="Např. 550 GSM"
                    className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 uppercase block mb-1">Primární obrázek URL</label>
                  <input
                    type="text"
                    value={editingProduct.primary_image || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, primary_image: e.target.value })}
                    className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 uppercase block mb-1">Popis produktu</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#222228]">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 border border-[#27272a] rounded text-zinc-400 hover:text-white"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black font-black uppercase rounded hover:bg-zinc-200"
                >
                  Uložit změny
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISCOUNT MODAL */}
      {discountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateDiscount} className="bg-[#0e0e12] border border-[#27272a] rounded-lg max-w-sm w-full p-6 space-y-4 text-xs font-mono">
            <h3 className="font-display text-white uppercase text-base">NOVÝ SLEVOVÝ KÓD</h3>
            <div>
              <label className="text-zinc-400 block mb-1">Kód (např. SUMMER20)</label>
              <input
                type="text"
                required
                value={newDiscountCode}
                onChange={(e) => setNewDiscountCode(e.target.value.toUpperCase())}
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white uppercase font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">Typ</label>
                <select
                  value={newDiscountType}
                  onChange={(e) => setNewDiscountType(e.target.value as any)}
                  className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                >
                  <option value="PERCENT">Procenta (%)</option>
                  <option value="FIXED">Částka (Kč)</option>
                </select>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Hodnota</label>
                <input
                  type="number"
                  required
                  value={newDiscountVal}
                  onChange={(e) => setNewDiscountVal(Number(e.target.value))}
                  className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDiscountModalOpen(false)}
                className="flex-1 py-2 border border-[#27272a] rounded text-zinc-400"
              >
                Zrušit
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-white text-black font-bold uppercase rounded hover:bg-zinc-200"
              >
                Vytvořit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GIFT CARD MODAL */}
      {giftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateGiftCard} className="bg-[#0e0e12] border border-[#27272a] rounded-lg max-w-sm w-full p-6 space-y-4 text-xs font-mono">
            <h3 className="font-display text-white uppercase text-base">NOVÝ DÁRKOVÝ POUKAZ</h3>
            <div>
              <label className="text-zinc-400 block mb-1">Kód poukazu (volitelné)</label>
              <input
                type="text"
                value={newGiftCode}
                onChange={(e) => setNewGiftCode(e.target.value.toUpperCase())}
                placeholder="Automaticky vygenerováno..."
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white uppercase"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Částka (Kč)</label>
              <input
                type="number"
                required
                value={newGiftAmount}
                onChange={(e) => setNewGiftAmount(Number(e.target.value))}
                className="w-full bg-[#16161c] border border-[#2e2e38] rounded px-3 py-2 text-white"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGiftModalOpen(false)}
                className="flex-1 py-2 border border-[#27272a] rounded text-zinc-400"
              >
                Zrušit
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-white text-black font-bold uppercase rounded hover:bg-zinc-200"
              >
                Vytvořit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
