import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Sparkles, Layers, Box } from 'lucide-react';
import db from '@/lib/db';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import Product3DViewer from '@/components/Product3DViewer';

// Force dynamic rendering so changes in admin immediately reflect on homepage!
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

  // New drop products
  const newDropProducts = products.filter((p) => p.is_new_drop === 1);
  // Featured products
  const featuredProducts = products.filter((p) => p.is_featured === 1);

  // Fetch website content
  const contentRow = db.prepare("SELECT value FROM website_content WHERE key = 'hero'").get() as any;
  const heroContent = contentRow ? JSON.parse(contentRow.value) : {
    headline: 'MOVE DIFFERENT.',
    subheadline: 'MORE THAN CLOTHES. IT’S A MINDSET.',
    tagline: 'DROP 01 / NOW LIVE',
    bgImage: '/images/editorial/campaign-hero-models.jpg',
  };

  // Community photos
  const communityPhotos = db.prepare("SELECT * FROM community_gallery WHERE status = 'APPROVED' LIMIT 4").all() as any[];

  return (
    <div className="bg-[#080809] text-white">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] sm:min-h-[92vh] flex items-end justify-start overflow-hidden border-b border-[#1f1f26]">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source srcSet="/images/editorial/campaign-hero-models.webp" type="image/webp" />
            <img
              src={heroContent.bgImage || '/images/editorial/campaign-hero-models.jpg'}
              alt="RUN Campaign"
              className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.08] scale-100 hover:scale-105 transition-transform duration-1000"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-[#080809]/30 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#080809]/20 to-[#080809]/80" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 pt-32">
          <div className="max-w-3xl space-y-6">
            {/* Tagline */}
            <div className="inline-flex items-center space-x-3 bg-black/60 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-200">
                {heroContent.tagline || 'COLLECTION ONE / DROP 01 NOW AVAILABLE'}
              </span>
            </div>

            {/* Huge Headline */}
            <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9] text-white">
              {heroContent.headline || 'MOVE DIFFERENT.'}
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-xl font-light text-zinc-300 tracking-wide max-w-xl">
              {heroContent.subheadline || 'MORE THAN CLOTHES. IT’S A MINDSET.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/shop"
                className="bg-white text-black font-black uppercase text-xs sm:text-sm tracking-widest px-8 py-4 rounded hover:bg-zinc-200 transition-colors shadow-2xl flex items-center gap-2 group"
              >
                <span>SHOP THE DROP</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/editorial"
                className="border border-white/40 text-white font-bold uppercase text-xs sm:text-sm tracking-widest px-6 py-4 rounded hover:bg-white/10 backdrop-blur-sm transition-colors"
              >
                EDITORIAL / LOOKBOOK
              </Link>
            </div>
          </div>
        </div>

        {/* Ambient Bottom Bar */}
        <div className="absolute bottom-4 right-6 z-10 hidden sm:flex items-center space-x-6 text-[10px] font-mono text-zinc-400">
          <span>550 GSM HEAVY FAUX-FUR</span>
          <span>•</span>
          <span>14.5 OZ DENIM</span>
          <span>•</span>
          <span>AIR RUNNING UNIT</span>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS BAR */}
      <section className="border-b border-[#18181f] bg-[#0c0c0f] py-4 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-zinc-400">
          <div className="flex items-center space-x-2.5 justify-center md:justify-start">
            <Truck className="w-4 h-4 text-zinc-200" />
            <span>DOPRAVA ZDARMA NAD 2 500 KČ</span>
          </div>
          <div className="flex items-center space-x-2.5 justify-center md:justify-start">
            <ShieldCheck className="w-4 h-4 text-zinc-200" />
            <span>100% GARANCE ORIGINALITY</span>
          </div>
          <div className="flex items-center space-x-2.5 justify-center md:justify-start">
            <RefreshCw className="w-4 h-4 text-zinc-200" />
            <span>14 DNÍ NA VRÁCENÍ</span>
          </div>
          <div className="flex items-center space-x-2.5 justify-center md:justify-start">
            <Sparkles className="w-4 h-4 text-zinc-200" />
            <span>LIMITOVANÉ EDICE (DROP SYSTEM)</span>
          </div>
        </div>
      </section>

      {/* 3. NEW DROP SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>LATEST RELEASE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase text-white">
              NEW DROP — COLLECTION 01
            </h2>
          </div>

          <Link
            href="/shop?filter=new_drop"
            className="text-xs uppercase font-bold tracking-widest text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors group"
          >
            <span>ZOBRAZIT CELÝ DROP</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newDropProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. VISUAL COLLECTIONS */}
      <section className="py-16 bg-[#0a0a0d] border-y border-[#18181f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              KATEGORIE PRODUKTŮ
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
              ARCHITEKTURA KOLEKCE RUN
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Každý kus je navržen tak, aby tvořil ucelený outfit. Těžké materiály, nekompromisní střihy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Outerwear */}
            <Link
              href="/shop?category=outerwear"
              className="group relative aspect-[3/4] overflow-hidden rounded bg-[#141418] border border-[#222228] hover:border-zinc-500 transition-all duration-300"
            >
              <img
                src="/images/products/teddy-black-front.jpg"
                alt="Outerwear"
                className="w-full h-full object-cover img-zoom filter brightness-90 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                  550 GSM TEDDY FLEECE
                </span>
                <h3 className="text-xl font-black uppercase text-white mt-1">OUTERWEAR & MIKINY</h3>
                <span className="text-xs font-bold text-zinc-300 group-hover:text-white inline-flex items-center gap-1 mt-2">
                  Objevit mikiny →
                </span>
              </div>
            </Link>

            {/* 2. T-Shirts */}
            <Link
              href="/shop?category=t-shirts"
              className="group relative aspect-[3/4] overflow-hidden rounded bg-[#141418] border border-[#222228] hover:border-zinc-500 transition-all duration-300"
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
                <h3 className="text-xl font-black uppercase text-white mt-1">TRIČKA & TOPY</h3>
                <span className="text-xs font-bold text-zinc-300 group-hover:text-white inline-flex items-center gap-1 mt-2">
                  Objevit trička →
                </span>
              </div>
            </Link>

            {/* 3. Pants & Denim */}
            <Link
              href="/shop?category=pants"
              className="group relative aspect-[3/4] overflow-hidden rounded bg-[#141418] border border-[#222228] hover:border-zinc-500 transition-all duration-300"
            >
              <img
                src="/images/products/denim-black-front.jpg"
                alt="Pants & Denim"
                className="w-full h-full object-cover img-zoom filter brightness-90 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                  14.5 OZ DENIM & FRENCH TERRY
                </span>
                <h3 className="text-xl font-black uppercase text-white mt-1">PANTS & JEANS</h3>
                <span className="text-xs font-bold text-zinc-300 group-hover:text-white inline-flex items-center gap-1 mt-2">
                  Objevit kalhoty →
                </span>
              </div>
            </Link>

            {/* 4. Footwear */}
            <Link
              href="/shop?category=footwear"
              className="group relative aspect-[3/4] overflow-hidden rounded bg-[#141418] border border-[#222228] hover:border-zinc-500 transition-all duration-300"
            >
              <img
                src="/images/products/sneaker-cyber-white-1.jpg"
                alt="Footwear"
                className="w-full h-full object-cover img-zoom filter brightness-90 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                  CHROME AIR SNEAKER
                </span>
                <h3 className="text-xl font-black uppercase text-white mt-1">FOOTWEAR</h3>
                <span className="text-xs font-bold text-zinc-300 group-hover:text-white inline-flex items-center gap-1 mt-2">
                  Objevit obuv →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL MANIFESTO SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase block">
              EDITORIAL / MANIFESTO
            </span>
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-tight">
              RUN THE CITY.
              <span className="block text-zinc-500">SAME VISION STRONGER TOGETHER.</span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              RUN vznikl z odporu k průměrnosti a pomíjivým trendům. Naše oděvy se vyznačují extrémní vahou materiálů, surovou texturou kožešiny, autentickým sepraným denimem a kovovými prvky, které nepodléhají času.
            </p>

            <blockquote className="border-l-2 border-white pl-4 italic text-zinc-300 text-sm font-medium">
              „YOU’LL NEVER DO IT. YOU HAVE NOTHING.“
              <span className="block text-xs font-mono uppercase text-zinc-500 not-italic mt-1">
                — Podpisové heslo na zádech každého kusu z Collection One
              </span>
            </blockquote>

            <div className="pt-4 flex items-center gap-4">
              <Link
                href="/about"
                className="bg-white text-black font-black uppercase text-xs tracking-widest px-6 py-3.5 rounded hover:bg-zinc-200 transition-colors"
              >
                PŘEČÍST CELÝ PŘÍBĚH RUN
              </Link>
              <Link
                href="/materials"
                className="border border-[#2e2e38] text-zinc-300 font-bold uppercase text-xs tracking-widest px-6 py-3.5 rounded hover:bg-[#18181c] hover:text-white transition-colors"
              >
                PRŮVODCE MATERIÁLŮ
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] rounded overflow-hidden bg-[#141418] border border-[#222228]">
              <img
                src="/images/editorial/editorial-couple-front.jpg"
                alt="RUN Editorial Couple"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-[3/4] rounded overflow-hidden bg-[#141418] border border-[#222228] mt-8">
              <img
                src="/images/details/teddy-fur-macro-zipper.jpg"
                alt="RUN Custom Hardware"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE 3D PRODUCT VIEWER SPOTLIGHT */}
      <section className="py-20 bg-[#0c0c10] border-y border-[#1f1f26]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-md space-y-4">
              <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400 flex items-center gap-2">
                <Box className="w-4 h-4" />
                <span>ARCHITEKTURA ODĚVU & 3D STUDIO</span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
                PROZKOUMEJTE SILUETU VE 3D
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Každý detail je propracovaný do mikronu. Zkontrolujte proporce střihu, robustnost lešení, chromové odlesky a drátěnou wireframe topologii přímo v interaktivním 3D okně.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-zinc-400">
                <span className="bg-[#18181e] px-2.5 py-1 rounded border border-[#2b2b36]">360° Rotace</span>
                <span className="bg-[#18181e] px-2.5 py-1 rounded border border-[#2b2b36]">PBR Shading</span>
                <span className="bg-[#18181e] px-2.5 py-1 rounded border border-[#2b2b36]">Wireframe Mode</span>
              </div>
            </div>

            <div className="w-full lg:w-3/5">
              <Product3DViewer
                productName="RUN Cyber-Chunky Air Sneaker"
                category="Footwear"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. ALL FEATURED PRODUCTS GRID */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-1">
              VŠECHNY KUSY SKLADEM
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              DROP 01 — RUN INTO ZERO
            </h2>
          </div>

          <Link
            href="/shop"
            className="text-xs uppercase font-bold tracking-widest text-white hover:text-zinc-300 flex items-center gap-1.5"
          >
            <span>OTEVŘÍT E-SHOP</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. COMMUNITY GALLERY & LOOKBOOK */}
      <section className="py-20 bg-[#09090c] border-t border-[#1a1a22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
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
              className="text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white flex items-center gap-1"
            >
              <span>ZOBRAZIT CELOU KOMUNITU</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {communityPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square rounded overflow-hidden bg-[#141418] border border-[#222228]"
              >
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
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
