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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-24 px-4 animate-in fade-in duration-200">
          <div className="bg-[#0e0e12] border border-[#27272a] rounded-lg max-w-2xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-3">
              VYHLEDAT V KOLEKCI RUN
            </h3>

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
                className="w-full bg-[#18181b] border border-[#2e2e34] rounded px-4 py-3.5 pl-11 text-white placeholder-zinc-500 focus:outline-none focus:border-white text-sm"
              />
              <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-4" />

              <button
                type="submit"
                className="absolute right-2 top-2 bg-white text-black font-bold text-xs px-4 py-2 rounded hover:bg-zinc-200 transition-colors"
              >
                HLEDAT
              </button>
            </form>

            {/* Quick Suggestions */}
            <div className="mt-6 pt-4 border-t border-[#1f1f24]">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block mb-2">
                Často hledané:
              </span>
              <div className="flex flex-wrap gap-2">
                {['Teddy Fur Hoodie', 'Denim Jeans', 'Air Sneaker', 'Boxy T-Shirt', 'Předobjednávka', 'Drop 01'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      window.location.href = `/shop?q=${encodeURIComponent(tag)}`;
                    }}
                    className="text-xs bg-[#18181b] hover:bg-[#27272a] text-zinc-300 hover:text-white px-3 py-1.5 rounded border border-[#27272a] transition-colors"
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
