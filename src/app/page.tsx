import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import db from '@/lib/db';
import { Product } from '@/types';
import HeroSection from '@/components/HeroSection';
import CollectionShowcase from '@/components/CollectionShowcase';
import Home3DShowroom from '@/components/Home3DShowroom';
import CreatorsSection from '@/components/CreatorsSection';
import MotionReveal from '@/components/ui/MotionReveal';

// Force dynamic rendering so changes in admin immediately reflect on homepage
export const dynamic = 'force-dynamic';

export default function HomePage() {
  // Fetch real products from DB
  const rawProducts = db.prepare('SELECT * FROM products ORDER BY id ASC').all() as any[];
  const products: Product[] = rawProducts.map((p) => {
    let gallery = [];
    try {
      gallery = JSON.parse(p.gallery);
    } catch {
      gallery = [p.primary_image];
    }
    const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(p.id) as any[];
    return {
      ...p,
      gallery,
      variants,
    };
  });

  // Fetch website hero content
  const contentRow = db.prepare("SELECT value FROM website_content WHERE key = 'hero'").get() as any;
  const heroContent = contentRow
    ? JSON.parse(contentRow.value)
    : {
        headline: 'MOVE DIFFERENT.',
        subheadline: 'MORE THAN CLOTHES. IT’S A MINDSET.',
        tagline: 'DROP 01 / RUN INTO ZERO',
        bgImage: '/images/editorial/campaign-hero-models.jpg',
      };

  // Community photos
  const communityPhotos = db
    .prepare("SELECT * FROM community_gallery WHERE status = 'APPROVED' LIMIT 4")
    .all() as any[];

  return (
    <div className="bg-[#080809] text-white overflow-hidden">
      {/* 1. CINEMATIC HERO SECTION */}
      <HeroSection heroContent={heroContent} />

      {/* 2. INFINITE MONOCHROME TICKER */}
      <div className="bg-white text-black py-2.5 overflow-hidden select-none border-y border-white">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-6 mx-4 text-xs font-black tracking-widest uppercase">
              <span>RUN INTO ZERO</span>
              <span>✦</span>
              <span>DROP 01 LIVE</span>
              <span>✦</span>
              <span>550 GSM HEAVY FAUX-FUR</span>
              <span>✦</span>
              <span>CRAFTED IN EUROPE</span>
              <span>✦</span>
              <span>DOPRAVA ZDARMA NAD 2 500 KČ</span>
              <span>✦</span>
              <span>YOU HAVE NOTHING</span>
              <span>✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. VALUE PROPOSITIONS (Clean Minimalist Trust Bar) */}
      <div className="border-b border-[#18181f] bg-[#0c0c0f] py-4 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-zinc-400">
          <div className="flex items-center space-x-2.5 justify-center md:justify-start">
            <Truck className="w-4 h-4 text-zinc-300" />
            <span>DOPRAVA ZDARMA NAD 2 500 KČ</span>
          </div>
          <div className="flex items-center space-x-2.5 justify-center md:justify-start">
            <ShieldCheck className="w-4 h-4 text-zinc-300" />
            <span>ORIGINÁLNÍ ARCHIVNÍ KUSY</span>
          </div>
          <div className="flex items-center space-x-2.5 justify-center md:justify-start">
            <RefreshCw className="w-4 h-4 text-zinc-300" />
            <span>14 DNÍ NA VRÁCENÍ</span>
          </div>
          <div className="flex items-center space-x-2.5 justify-center md:justify-start">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIMITOVANÉ SÉRIE (DROP SYSTEM)</span>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE COLLECTION SHOWCASE (Unified, filtered, animated) */}
      <CollectionShowcase products={products} />

      {/* 5. VISUAL CATEGORIES ARCHITECTURE */}
      <section className="py-20 bg-[#09090c] border-y border-[#18181f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal className="mb-12 text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              KATEGORIE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
              ARCHITEKTURA SILUETY
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Každý kus je konstruován pro vrstvení. Těžká gramáž, přesné proporce, nekompromisní hardware.
            </p>
          </MotionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Outerwear */}
            <MotionReveal delay={0.05}>
              <Link
                href="/shop?category=outerwear"
                className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-[#141418] border border-[#202028] hover:border-zinc-400 transition-all duration-500 block"
              >
                <img
                  src="/images/products/teddy-black-front.jpg"
                  alt="Outerwear"
                  className="w-full h-full object-cover img-zoom filter brightness-90 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                    550 GSM FAUX-FUR
                  </span>
                  <h3 className="text-xl font-black uppercase text-white mt-0.5">OUTERWEAR</h3>
                  <span className="text-xs font-bold text-zinc-300 group-hover:text-white inline-flex items-center gap-1 mt-1.5 transition-transform group-hover:translate-x-1">
                    Objevit mikiny →
                  </span>
                </div>
              </Link>
            </MotionReveal>

            {/* T-Shirts */}
            <MotionReveal delay={0.15}>
              <Link
                href="/shop?category=t-shirts"
                className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-[#141418] border border-[#202028] hover:border-zinc-400 transition-all duration-500 block"
              >
                <img
                  src="/images/products/tshirt-white-front.jpg"
                  alt="T-Shirts"
                  className="w-full h-full object-cover img-zoom filter brightness-90 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                    280 GSM BOXY FIT
                  </span>
                  <h3 className="text-xl font-black uppercase text-white mt-0.5">TRIČKA & TOPY</h3>
                  <span className="text-xs font-bold text-zinc-300 group-hover:text-white inline-flex items-center gap-1 mt-1.5 transition-transform group-hover:translate-x-1">
                    Objevit trička →
                  </span>
                </div>
              </Link>
            </MotionReveal>

            {/* Pants */}
            <MotionReveal delay={0.25}>
              <Link
                href="/shop?category=pants"
                className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-[#141418] border border-[#202028] hover:border-zinc-400 transition-all duration-500 block"
              >
                <img
                  src="/images/products/denim-black-front.jpg"
                  alt="Pants & Denim"
                  className="w-full h-full object-cover img-zoom filter brightness-90 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                    14.5 OZ SELVEDGE
                  </span>
                  <h3 className="text-xl font-black uppercase text-white mt-0.5">PANTS & JEANS</h3>
                  <span className="text-xs font-bold text-zinc-300 group-hover:text-white inline-flex items-center gap-1 mt-1.5 transition-transform group-hover:translate-x-1">
                    Objevit kalhoty →
                  </span>
                </div>
              </Link>
            </MotionReveal>

            {/* Footwear */}
            <MotionReveal delay={0.35}>
              <Link
                href="/shop?category=footwear"
                className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-[#141418] border border-[#202028] hover:border-zinc-400 transition-all duration-500 block"
              >
                <img
                  src="/images/products/sneaker-cyber-white-1.jpg"
                  alt="Footwear"
                  className="w-full h-full object-cover img-zoom filter brightness-90 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                    CHROME AIR UNIT
                  </span>
                  <h3 className="text-xl font-black uppercase text-white mt-0.5">FOOTWEAR</h3>
                  <span className="text-xs font-bold text-zinc-300 group-hover:text-white inline-flex items-center gap-1 mt-1.5 transition-transform group-hover:translate-x-1">
                    Objevit obuv →
                  </span>
                </div>
              </Link>
            </MotionReveal>
          </div>
        </div>
      </section>

      {/* 6. EDITORIAL MANIFESTO */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <MotionReveal className="space-y-6">
            <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase block">
              EDITORIAL / MANIFESTO
            </span>
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-[0.95]">
              RUN THE CITY.
              <span className="block text-zinc-500">SAME VISION STRONGER TOGETHER.</span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              RUN vznikl z odporu k pomíjivým trendům a syntetickému průměru. Naše oděvy se vyznačují extrémní gramáží, surovou texturou kožešiny, autentickým japonským denimem a kovovými zipy, které nepodléhají času.
            </p>

            <blockquote className="border-l-2 border-white pl-4 italic text-zinc-200 text-sm font-medium">
              „YOU’LL NEVER DO IT. YOU HAVE NOTHING.“
              <span className="block text-xs font-mono uppercase text-zinc-500 not-italic mt-1.5">
                — Podpisové heslo na zádech každého kusu z Collection One
              </span>
            </blockquote>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <Link
                href="/about"
                className="bg-white text-black font-black uppercase text-xs tracking-widest px-6 py-3.5 rounded hover:bg-zinc-200 transition-all flex items-center gap-2 group"
              >
                <span>PŘÍBĚH ZNAČKY RUN</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/materials"
                className="border border-[#2e2e38] text-zinc-300 font-bold uppercase text-xs tracking-widest px-6 py-3.5 rounded hover:bg-[#18181c] hover:text-white transition-colors"
              >
                PRŮVODCE MATERIÁLŮ
              </Link>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.2} className="grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#141418] border border-[#222228] shadow-2xl">
              <img
                src="/images/editorial/editorial-couple-front.jpg"
                alt="RUN Lookbook Couple"
                className="w-full h-full object-cover img-zoom"
              />
            </div>
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#141418] border border-[#222228] shadow-2xl mt-8">
              <img
                src="/images/details/teddy-fur-macro-zipper.jpg"
                alt="RUN Custom Hardware"
                className="w-full h-full object-cover img-zoom"
              />
            </div>
          </MotionReveal>
        </div>
      </section>

      {/* 7. INTERACTIVE 3D PRODUCT VIEWER SHOWROOM */}
      <section className="py-20 sm:py-24 bg-[#0a0a0d] border-y border-[#18181f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal>
            <Home3DShowroom />
          </MotionReveal>
        </div>
      </section>

      {/* 8. COMMUNITY GALLERY & STREET LOOKBOOK */}
      <section className="py-20 sm:py-24 bg-[#080809] border-b border-[#18181f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                #RUNCLOTHING ON STREETS
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
                FOTOGALERIE KOMUNITY
              </h2>
            </div>
            <Link
              href="/community"
              className="text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white flex items-center gap-1 group"
            >
              <span>ZOBRAZIT CELOU KOMUNITU</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </MotionReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {communityPhotos.map((photo, i) => (
              <MotionReveal key={photo.id} delay={i * 0.1}>
                <div className="group relative aspect-square rounded-xl overflow-hidden bg-[#141418] border border-[#222228]">
                  <img
                    src={photo.image_url}
                    alt={photo.caption || 'Community lookbook'}
                    className="w-full h-full object-cover img-zoom"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <span className="text-xs font-bold text-white">{photo.author_handle || photo.author_name}</span>
                    <p className="text-[11px] text-zinc-300 line-clamp-1 mt-0.5">{photo.caption}</p>
                  </div>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 9. LIDÉ, KTEŘÍ NA TOM PRACOVALI */}
      <CreatorsSection />
    </div>
  );
}
