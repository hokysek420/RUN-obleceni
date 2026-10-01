'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, ShoppingBag, User, Menu, X, ArrowRight } from 'lucide-react';
import RunLogo from './RunLogo';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function Header() {
  const pathname = usePathname();
  const { totalItems, setIsOpen, subtotal } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { formatPrice } = useCurrency();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  // Live debounced search query fetch
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery.trim())}&limit=6`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.products || []);
        }
      } catch (err) {
        console.error('Search fetch error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }, [pathname]);

  const navLinks = [
    { label: 'SHOP', href: '/shop' },
    { label: 'NEW DROP', href: '/shop?filter=new_drop', highlight: true },
    { label: 'KOLEKCE', href: '/collections' },
    { label: 'EDITORIAL', href: '/editorial' },
    { label: 'COMMUNITY', href: '/community' },
    { label: 'O ZNAČCE', href: '/about' },
  ];

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-[#080809]/95 backdrop-blur-md border-b border-[#222228] py-3.5 shadow-xl'
            : 'bg-[#080809] border-b border-[#18181b] py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: Mobile Menu Trigger + Logo */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors"
                aria-label="Otevřít menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <RunLogo size="md" showSubtitle={!scrolled} />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs uppercase font-bold tracking-widest transition-all duration-200 relative py-1 ${
                      isActive
                        ? 'text-white'
                        : link.highlight
                        ? 'text-zinc-200 hover:text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {link.highlight && (
                      <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white"></span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
                aria-label="Hledat produkty"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/account?tab=wishlist"
                className="p-2 text-zinc-400 hover:text-white transition-colors relative"
                aria-label="Oblíbené produkty"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-white text-black text-[10px] font-black rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                href="/account"
                className="p-2 text-zinc-400 hover:text-white transition-colors"
                aria-label="Můj účet"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart Button */}
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center space-x-2 bg-white text-black hover:bg-zinc-200 px-3.5 py-2 rounded text-xs font-black tracking-wider uppercase transition-colors"
                aria-label="Otevřít nákupní košík"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">KOŠÍK</span>
                <span className="bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                  {totalItems}
                </span>
                {totalItems > 0 && (
                  <span className="hidden md:inline text-[11px] font-bold text-zinc-800 border-l border-zinc-300 pl-2">
                    {formatPrice(subtotal)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Live Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
          <div className="bg-[#0e0e12] border border-[#27272a] rounded-xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center justify-between mb-3 pr-8">
              <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
                VYHLEDAT V KOLEKCI RUN
              </h3>
              <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-500 bg-[#1a1a22] px-2 py-0.5 rounded border border-[#2c2c36]">
                ESC pro zavření
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
                }
              }}
              className="relative"
            >
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hledejte mikiny, trička, kalhoty, boty..."
                className="w-full bg-[#18181b] border border-[#2e2e34] rounded-lg px-4 py-3.5 pl-11 pr-24 text-white placeholder-zinc-500 focus:outline-none focus:border-white text-sm"
              />
              <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-4" />

              <button
                type="submit"
                className="absolute right-2 top-2 bg-white text-black font-bold text-xs px-4 py-2 rounded-md hover:bg-zinc-200 transition-colors"
              >
                HLEDAT
              </button>
            </form>

            {/* Live Interactive Results */}
            {searchQuery.trim() && (
              <div className="mt-4 pt-3 border-t border-[#1f1f24]">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
                  <span>VÝSLEDKY HLEDÁNÍ ({searchResults.length})</span>
                  {isSearching && <span className="text-zinc-500">Vyhledávám...</span>}
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center justify-between p-2.5 bg-[#141418] hover:bg-[#1c1c24] border border-[#222228] hover:border-zinc-500 rounded-lg transition-all group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-14 bg-[#1b1b22] rounded overflow-hidden flex-shrink-0">
                            <img
                              src={product.primary_image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase">
                              {product.category}
                            </span>
                            <h4 className="text-xs font-bold text-white group-hover:text-zinc-200 line-clamp-1">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-mono font-bold text-white">
                                {formatPrice(product.sale_price || product.price)}
                              </span>
                              {product.status && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#202028] text-zinc-300">
                                  {product.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  !isSearching && (
                    <div className="py-6 text-center text-xs text-zinc-400">
                      Žádný produkt neodpovídá výrazu &ldquo;{searchQuery}&rdquo;.
                    </div>
                  )
                )}
              </div>
            )}

            {/* Quick Suggestions */}
            <div className="mt-5 pt-4 border-t border-[#1f1f24]">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block mb-2">
                Populární kategorie & hledání:
              </span>
              <div className="flex flex-wrap gap-2">
                {['Teddy Fur Hoodie', 'Denim Jeans', 'Air Sneaker', 'Boxy T-Shirt', 'Předobjednávka', 'Drop 01'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                    }}
                    className="text-xs bg-[#18181b] hover:bg-[#27272a] text-zinc-300 hover:text-white px-3 py-1.5 rounded-md border border-[#27272a] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#0e0e11] border-r border-[#222228] p-6 flex flex-col justify-between z-50">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#1f1f24]">
                <RunLogo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm uppercase font-black tracking-widest text-zinc-200 hover:text-white py-2 border-b border-[#18181c]"
                  >
                    <div className="flex items-center justify-between">
                      <span>{link.label}</span>
                      <ArrowRight className="w-4 h-4 text-zinc-600" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#1f1f24] space-y-3">
              <Link
                href="/account"
                className="flex items-center space-x-3 text-xs uppercase font-bold tracking-wider text-zinc-300 hover:text-white"
              >
                <User className="w-4 h-4" />
                <span>MŮJ ÚČET / PŘIHLÁŠENÍ</span>
              </Link>
              <Link
                href="/size-guide"
                className="block text-xs text-zinc-500 hover:text-zinc-300"
              >
                Tabulka velikostí
              </Link>
              <Link
                href="/track"
                className="block text-xs text-zinc-500 hover:text-zinc-300"
              >
                Sledování zásilky
              </Link>
              <Link
                href="/admin"
                className="block text-[11px] text-zinc-600 hover:text-zinc-400 font-mono pt-2"
              >
                Admin Panel →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
