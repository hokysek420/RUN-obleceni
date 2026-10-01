'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal, X, Search, Check, RefreshCw } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { useCurrency } from '@/context/CurrencyContext';

interface ShopClientProps {
  initialProducts: Product[];
}

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialFilter = searchParams.get('filter') || '';
  const initialQuery = searchParams.get('q') || '';

  const { formatPrice } = useCurrency();

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Categories list
  const categories = [
    { id: 'all', name: 'Všechny produkty' },
    { id: 'outerwear', name: 'Outerwear & Mikiny' },
    { id: 't-shirts', name: 'Trička & Topy' },
    { id: 'pants', name: 'Pants & Denim' },
    { id: 'footwear', name: 'Footwear & Boty' },
  ];

  // All distinct sizes across products
  const allSizes = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      p.variants?.forEach((v) => set.add(v.size));
    });
    return Array.from(set);
  }, [initialProducts]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const catSlug = p.category.toLowerCase();
        if (selectedCategory === 'outerwear' && !catSlug.includes('outerwear') && !catSlug.includes('mikiny')) return false;
        if (selectedCategory === 't-shirts' && !catSlug.includes('shirt') && !catSlug.includes('top')) return false;
        if (selectedCategory === 'pants' && !catSlug.includes('pant') && !catSlug.includes('denim') && !catSlug.includes('kalhoty')) return false;
        if (selectedCategory === 'footwear' && !catSlug.includes('footwear') && !catSlug.includes('boty')) return false;
      }

      // Initial filter param check (e.g. new_drop)
      if (initialFilter === 'new_drop' && p.is_new_drop !== 1) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && p.status !== selectedStatus) {
        return false;
      }

      // Size filter
      if (selectedSize !== 'all') {
        const hasSize = p.variants?.some((v) => v.size === selectedSize && v.stock > 0);
        if (!hasSize) return false;
      }

      // Price filter
      const effectivePrice = p.sale_price || p.price;
      if (effectivePrice > maxPrice) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchMat = p.material.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchSku && !matchMat) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.sale_price || a.price;
      const priceB = b.sale_price || b.price;

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'newest') return b.id - a.id;
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [initialProducts, selectedCategory, selectedStatus, selectedSize, maxPrice, searchQuery, sortBy, initialFilter]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedSize('all');
    setMaxPrice(5000);
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-[#1f1f26] pb-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-500 block mb-1">
              RUN E-SHOP / CATALOG
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              VŠECHNY PRODUKTY
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-zinc-400">
              Nalezeno: <strong className="text-white">{filteredProducts.length}</strong> kousků
            </span>

            {/* Mobile Filters trigger */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center space-x-2 bg-[#18181c] border border-[#27272a] px-3.5 py-2 rounded text-xs font-bold text-white"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filtry</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-8 pr-4">
          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-xs uppercase font-mono tracking-wider text-zinc-400 font-bold block">
              Hledat v katalogu
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Název, kód, materiál..."
                className="w-full bg-[#121216] border border-[#27272a] rounded px-3 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <label className="text-xs uppercase font-mono tracking-wider text-zinc-400 font-bold block">
              Kategorie
            </label>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center justify-between ${
                    selectedCategory === cat.id
                      ? 'bg-white text-black font-black'
                      : 'text-zinc-400 hover:text-white hover:bg-[#141418]'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Availability Status */}
          <div className="space-y-3">
            <label className="text-xs uppercase font-mono tracking-wider text-zinc-400 font-bold block">
              Dostupnost
            </label>
            <div className="space-y-1">
              {[
                { id: 'all', label: 'Všechny stavy' },
                { id: 'SKLADEM', label: 'Skladem ihned' },
                { id: 'PŘEDOBJEDNÁVKA', label: 'Předobjednávka' },
                { id: 'LIMITOVANÁ EDICE', label: 'Limitovaná edice' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                    selectedStatus === st.id
                      ? 'text-white font-bold bg-[#1e1e24]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-3">
            <label className="text-xs uppercase font-mono tracking-wider text-zinc-400 font-bold block">
              Velikost
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setSelectedSize('all')}
                className={`py-1.5 px-2 rounded text-xs font-mono font-bold border transition-colors ${
                  selectedSize === 'all'
                    ? 'bg-white text-black border-white'
                    : 'bg-[#121216] text-zinc-400 border-[#27272a] hover:text-white'
                }`}
              >
                Vše
              </button>
              {allSizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`py-1.5 px-2 rounded text-xs font-mono font-bold border transition-colors ${
                    selectedSize === sz
                      ? 'bg-white text-black border-white'
                      : 'bg-[#121216] text-zinc-400 border-[#27272a] hover:text-white'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="uppercase font-mono tracking-wider text-zinc-400 font-bold">
                Max. cena
              </label>
              <span className="font-mono font-bold text-white">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-white bg-[#222228] h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="w-full flex items-center justify-center space-x-2 py-2 text-xs text-zinc-500 hover:text-white border border-[#27272a] rounded transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resetovat filtry</span>
          </button>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-6">
          {/* Sorting Bar */}
          <div className="flex items-center justify-between bg-[#101014] border border-[#1f1f26] p-3 rounded text-xs">
            <span className="text-zinc-400 font-mono text-[11px]">
              Zobrazeno {filteredProducts.length} z {initialProducts.length}
            </span>

            <div className="flex items-center space-x-2">
              <span className="text-zinc-500 text-[11px] uppercase font-mono">Řadit podle:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#18181e] border border-[#2e2e38] text-white text-xs rounded px-2.5 py-1 focus:outline-none focus:border-white font-medium"
              >
                <option value="featured">Doporučené</option>
                <option value="newest">Nejnovější</option>
                <option value="price_asc">Cena: Od nejlevnějšího</option>
                <option value="price_desc">Cena: Od nejdražšího</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center space-y-4 bg-[#0e0e12] border border-[#1f1f26] rounded">
              <p className="text-zinc-400 text-sm">
                Pro zvolené filtry nebyly nalezeny žádné produkty.
              </p>
              <button
                onClick={resetFilters}
                className="bg-white text-black font-bold text-xs uppercase px-6 py-2.5 rounded hover:bg-zinc-200 transition-colors"
              >
                Zrušit všechny filtry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#0e0e12] border-l border-[#222228] p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#222228]">
                <h3 className="font-display text-sm tracking-wider text-white">FILTROVAT PRODUKTY</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-zinc-500 uppercase block font-bold">
                  Kategorie
                </span>
                <div className="space-y-1">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCategory(c.id);
                        setMobileFiltersOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-xs ${
                        selectedCategory === c.id ? 'bg-white text-black font-bold' : 'text-zinc-400'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-zinc-500 uppercase block font-bold">
                  Dostupnost
                </span>
                <div className="space-y-1">
                  {['all', 'SKLADEM', 'PŘEDOBJEDNÁVKA', 'LIMITOVANÁ EDICE'].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setSelectedStatus(st);
                        setMobileFiltersOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-xs ${
                        selectedStatus === st ? 'bg-white text-black font-bold' : 'text-zinc-400'
                      }`}
                    >
                      {st === 'all' ? 'Všechny' : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full bg-white text-black font-black uppercase text-xs py-3 rounded mt-6"
            >
              ZOBRAZIT VÝSLEDKY ({filteredProducts.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
