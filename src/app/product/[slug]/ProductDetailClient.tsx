'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Ruler,
  FileText,
  AlertCircle,
  Star,
  Sparkles,
  Maximize2,
  Box,
  Video,
  ChevronRight,
  Share2
} from 'lucide-react';
import { Product, ProductVariant, Review } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCurrency } from '@/context/CurrencyContext';
import ProductCard from '@/components/ProductCard';
import Product3DViewer from '@/components/Product3DViewer';

interface ProductDetailClientProps {
  product: Product;
  reviews: Review[];
  relatedProducts: Product[];
}

export default function ProductDetailClient({
  product,
  reviews: initialReviews,
  relatedProducts,
}: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  const isFavorited = isInWishlist(product.id);

  // Gallery
  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.primary_image];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Active Tab for Media: 'gallery' | '3d' | 'video'
  const [mediaMode, setMediaMode] = useState<'gallery' | '3d' | 'video'>('gallery');

  // Variants
  const variants = product.variants || [];
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const colors = Array.from(new Set(variants.map((v) => v.color)));

  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || 'Standard');
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Modals for Size Guide & Material Guide
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [materialGuideOpen, setMaterialGuideOpen] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Selected Variant stock
  const currentVariant = variants.find(
    (v) => v.size === selectedSize && (colors.length <= 1 || v.color === selectedColor)
  );
  const stock = currentVariant ? currentVariant.stock : 10;
  const isOutOfStock = product.status === 'VYPRODÁNO' || stock <= 0;

  // Add to cart handler
  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addToCart({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id,
      variantId: currentVariant?.id,
      name: product.name,
      slug: product.slug,
      price: product.sale_price || product.price,
      image: images[0],
      size: selectedSize,
      color: selectedColor,
      quantity,
      status: product.status,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Buy Now handler
  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/checkout';
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: reviewAuthor,
          customerEmail: reviewEmail,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });

      if (res.ok) {
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewFormOpen(false);
          setReviewSuccess(false);
          setReviewTitle('');
          setReviewComment('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Status styles
  const statusStyles: Record<string, string> = {
    'SKLADEM': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'PŘEDOBJEDNÁVKA': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'LIMITOVANÁ EDICE': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    'VYPRODÁNO': 'bg-red-500/15 text-red-400 border-red-500/30',
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="bg-[#080809] text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs font-mono text-zinc-500 mb-8 uppercase">
          <Link href="/" className="hover:text-white transition-colors">DOMŮ</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <Link href="/shop" className="hover:text-white transition-colors">SHOP</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <Link href={`/shop?category=${product.category.toLowerCase()}`} className="hover:text-white transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-300 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Top Grid: Gallery & Buying Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* LEFT: Media Showcase (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* View Mode Switcher: Foto, 3D, Video */}
            <div className="flex items-center space-x-2 border-b border-[#1f1f26] pb-3">
              <button
                onClick={() => setMediaMode('gallery')}
                className={`text-xs font-mono font-bold tracking-wider px-3 py-1.5 rounded transition-colors ${
                  mediaMode === 'gallery'
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white bg-[#121216]'
                }`}
              >
                FOTOGRAFIE ({images.length})
              </button>

              <button
                onClick={() => setMediaMode('3d')}
                className={`text-xs font-mono font-bold tracking-wider px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
                  mediaMode === '3d'
                    ? 'bg-white text-black'
                    : 'text-cyan-400 hover:text-cyan-300 bg-[#121216] border border-cyan-900/50'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D MODEL VIEWER</span>
              </button>

              {product.video_url && (
                <button
                  onClick={() => setMediaMode('video')}
                  className={`text-xs font-mono font-bold tracking-wider px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
                    mediaMode === 'video'
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white bg-[#121216]'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>UKÁZKA STŘIHU</span>
                </button>
              )}
            </div>

            {/* Media Content */}
            {mediaMode === 'gallery' && (
              <div className="space-y-4">
                {/* Main Large Image */}
                <div className="relative aspect-[4/5] bg-[#121216] border border-[#222228] rounded-lg overflow-hidden group">
                  <img
                    src={images[activeImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover object-center cursor-zoom-in"
                    onClick={() => setFullscreenImage(images[activeImageIndex])}
                  />

                  {/* Fullscreen zoom trigger */}
                  <button
                    onClick={() => setFullscreenImage(images[activeImageIndex])}
                    className="absolute bottom-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded text-zinc-300 hover:text-white transition-colors"
                    title="Zvětšit fotografii"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  {/* Watermark notice if applicable */}
                  <div className="absolute top-4 right-4 text-[9px] font-mono tracking-widest text-zinc-600 bg-black/40 px-2 py-0.5 rounded select-none pointer-events-none">
                    RUN ARCHIVE ©
                  </div>
                </div>

                {/* Thumbnails Row */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`aspect-square rounded overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-white opacity-100 scale-95'
                          : 'border-[#222228] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Detail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mediaMode === '3d' && (
              <Product3DViewer
                productName={product.name}
                category={product.category}
                modelUrl={product.model_3d_url}
              />
            )}

            {mediaMode === 'video' && product.video_url && (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-[#222228]">
                <video
                  src={product.video_url}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* RIGHT: Product Buying Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Top Badges */}
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${
                  statusStyles[product.status] || 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {product.status}
              </span>

              <div className="flex items-center space-x-1 text-xs text-zinc-400 font-mono">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                <span className="font-bold text-white">{avgRating}</span>
                <span>({reviews.length} recenzí)</span>
              </div>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 text-xs font-mono text-zinc-500 mt-2">
                <span>SKU: {product.sku}</span>
                <span>•</span>
                <span>{product.grammage}</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-3 pt-2 border-t border-[#1b1b22]">
              <span className="font-display text-2xl sm:text-3xl font-mono text-white">
                {formatPrice(product.sale_price || product.price)}
              </span>
              {product.sale_price && (
                <span className="text-sm font-mono text-zinc-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
              <span className="text-[11px] font-mono text-emerald-400">Včetně 21% DPH</span>
            </div>

            {/* Pre-order Alert box if status is PREORDER */}
            {product.status === 'PŘEDOBJEDNÁVKA' && (
              <div className="p-4 bg-amber-950/25 border border-amber-800/40 rounded-lg space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-amber-400 font-bold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>POLOŽKA NA PŘEDOBJEDNÁVKU</span>
                </div>
                <p className="text-zinc-300 leading-relaxed text-[11px]">
                  {product.preorder_info ||
                    'Tento produkt je momentálně ve výrobě v limitovaném množství. Objednáním si rezervujete kus.'}
                </p>
                {product.expected_shipping && (
                  <div className="font-mono text-amber-300 text-[11px] pt-1">
                    Očekávaná expedice: <strong>{product.expected_shipping}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Authenticity Certificate Badge */}
            {product.certificate_id && (
              <div className="p-3 bg-[#111116] border border-[#27272a] rounded flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2 text-zinc-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>CERTIFIKÁT ORIGINALITY:</span>
                </div>
                <span className="font-bold text-white tracking-widest bg-black px-2 py-0.5 rounded border border-[#333]">
                  {product.certificate_id}
                </span>
              </div>
            )}

            {/* Color selection if multiple colors */}
            {colors.length > 1 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs uppercase font-mono tracking-wider text-zinc-400 font-bold">
                  Barva: <strong className="text-white">{selectedColor}</strong>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3.5 py-1.5 rounded text-xs font-bold border transition-colors ${
                        selectedColor === c
                          ? 'bg-white text-black border-white'
                          : 'bg-[#121216] text-zinc-400 border-[#27272a] hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="uppercase text-zinc-400 font-bold">
                  Velikost: <strong className="text-white">{selectedSize}</strong>
                </span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-zinc-400 hover:text-white underline inline-flex items-center gap-1"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Tabulka velikostí</span>
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {sizes.map((sz) => {
                  const variantForSize = variants.find(
                    (v) => v.size === sz && (colors.length <= 1 || v.color === selectedColor)
                  );
                  const isSzOut = variantForSize && variantForSize.stock <= 0;

                  return (
                    <button
                      key={sz}
                      disabled={isSzOut}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-3 rounded font-mono font-bold text-xs uppercase border transition-all ${
                        selectedSize === sz
                          ? 'bg-white text-black border-white shadow-lg'
                          : isSzOut
                          ? 'bg-[#0f0f12] text-zinc-700 border-[#1a1a20] cursor-not-allowed line-through'
                          : 'bg-[#121216] text-zinc-300 border-[#27272a] hover:border-zinc-500'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {/* Stock status indicator */}
              <div className="text-[11px] font-mono text-zinc-500 pt-1">
                {isOutOfStock ? (
                  <span className="text-red-400">Vyprodáno pro zvolenou variantu.</span>
                ) : stock <= 3 ? (
                  <span className="text-amber-400">Zbývají pouze {stock} kusy skladem!</span>
                ) : (
                  <span className="text-emerald-400">Skladem k okamžitému odeslání</span>
                )}
              </div>
            </div>

            {/* CTAs: Add to Cart & Buy Now */}
            <div className="space-y-2 pt-4">
              <div className="flex space-x-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-4 rounded font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all duration-200 shadow-xl ${
                    added
                      ? 'bg-emerald-500 text-white'
                      : isOutOfStock
                      ? 'bg-[#18181c] text-zinc-600 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {added
                      ? 'PŘIDÁNO DO KOŠÍKU'
                      : product.status === 'PŘEDOBJEDNÁVKA'
                      ? 'PŘEDOBJEDNAT'
                      : isOutOfStock
                      ? 'VYPRODÁNO'
                      : 'PŘIDAT DO KOŠÍKU'}
                  </span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-4 border rounded transition-colors ${
                    isFavorited
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-[#121216] border-[#27272a] text-zinc-400 hover:text-white hover:border-zinc-500'
                  }`}
                  aria-label="Oblíbené"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              {!isOutOfStock && (
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3 bg-[#16161c] hover:bg-[#202028] border border-[#27272a] text-zinc-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded transition-colors"
                >
                  KOUPIT IHNED V 1 KROKU
                </button>
              )}
            </div>

            {/* Quick Guarantees Accordion-style list */}
            <div className="pt-4 border-t border-[#1b1b22] space-y-3 text-xs text-zinc-400">
              <div className="flex items-center space-x-3">
                <Truck className="w-4 h-4 text-zinc-200 flex-shrink-0" />
                <span>Expedice do 24h • Doprava zdarma nad 2 500 Kč</span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-4 h-4 text-zinc-200 flex-shrink-0" />
                <span>14 dní garance vrácení peněz nebo výměny velikosti</span>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-4 h-4 text-zinc-200 flex-shrink-0" />
                <span>100% originál z dílny RUN Clothing Prague</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Full Specs & Detail Tabs */}
        <div className="mt-20 pt-12 border-t border-[#1f1f26]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Popis & Materiál */}
            <div className="space-y-4">
              <h3 className="font-display text-sm uppercase tracking-widest text-white">
                POPIS & SPECIFIKACE
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{product.description}</p>
              <div className="space-y-2 pt-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-[#18181f]">
                  <span className="text-zinc-500">Materiál:</span>
                  <span className="text-zinc-200">{product.material}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#18181f]">
                  <span className="text-zinc-500">Gramáž:</span>
                  <span className="text-zinc-200">{product.grammage}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#18181f]">
                  <span className="text-zinc-500">Střih:</span>
                  <span className="text-zinc-200">{product.fit}</span>
                </div>
              </div>
            </div>

            {/* Údržba & Záruka */}
            <div className="space-y-4">
              <h3 className="font-display text-sm uppercase tracking-widest text-white">
                NÁVOD K ÚDRŽBĚ & ZÁRUKA
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{product.care_instructions}</p>
              <div className="p-3 bg-[#111116] border border-[#222228] rounded space-y-1.5 text-xs">
                <span className="font-bold text-zinc-200 block">Záruka kvality RUN Standard:</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{product.warranty}</p>
              </div>
              <button
                onClick={() => setMaterialGuideOpen(true)}
                className="text-xs font-mono text-zinc-400 hover:text-white underline inline-block"
              >
                Přečíst podrobného průvodce materiály →
              </button>
            </div>

            {/* Recenze Zákazníků */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm uppercase tracking-widest text-white">
                  HODNOCENÍ ({reviews.length})
                </h3>
                <button
                  onClick={() => setReviewFormOpen(!reviewFormOpen)}
                  className="text-xs bg-white text-black font-bold uppercase px-3 py-1.5 rounded hover:bg-zinc-200"
                >
                  Napsat recenzi
                </button>
              </div>

              {/* Review submission drawer */}
              {reviewFormOpen && (
                <form
                  onSubmit={handleSubmitReview}
                  className="p-4 bg-[#121216] border border-[#27272a] rounded space-y-3 text-xs"
                >
                  <div className="font-bold text-white uppercase text-[11px]">Nová recenze</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-zinc-400">Hodnocení:</span>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="bg-[#18181f] border border-[#2e2e38] text-white rounded px-2 py-1"
                    >
                      <option value={5}>5 hvězdiček (Vynikající)</option>
                      <option value={4}>4 hvězdičky (Velmi dobré)</option>
                      <option value={3}>3 hvězdičky (Průměr)</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Váše jméno"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    className="w-full bg-[#18181f] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Váš e-mail"
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    className="w-full bg-[#18181f] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Název recenze (např. Perfektní střih a těžká gramáž)"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full bg-[#18181f] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                  <textarea
                    required
                    rows={3}
                    placeholder="Vaše zkušenost s produktem..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-[#18181f] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full bg-white text-black font-bold uppercase py-2 rounded text-xs"
                  >
                    {reviewSubmitting ? 'Odesílám...' : 'Odeslat recenzi ke schválení'}
                  </button>
                  {reviewSuccess && (
                    <p className="text-emerald-400 text-xs">
                      Děkujeme! Recenze byla přijata a po moderaci se zobrazí.
                    </p>
                  )}
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-zinc-500 text-xs">Zatím žádné recenze. Buďte první!</p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3 bg-[#0d0d10] border border-[#1b1b22] rounded space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{rev.customer_name}</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <div className="font-bold text-zinc-300 text-[11px]">{rev.title}</div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">{rev.comment}</p>
                      {rev.verified_purchase === 1 && (
                        <span className="text-[10px] text-emerald-400 font-mono block">
                          ✓ Ověřený nákup
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-[#1f1f26]">
            <h2 className="font-display text-2xl uppercase tracking-tight text-white mb-8">
              DOPLŇTE SVŮJ OUTFIT
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt="Fullscreen Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded"
          />
        </div>
      )}

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101015] border border-[#27272a] rounded-lg max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222228]">
              <h3 className="font-display text-white text-base tracking-wider">
                TABULKA VELIKOSTÍ — RUN
              </h3>
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Všechny oděvy RUN jsou koncipovány v charakteristickém streetwear střihu (Boxy / Oversized). Pokud preferujete standardní přiléhavější fit, volte o jednu velikost menší.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-zinc-300">
                <thead>
                  <tr className="border-b border-[#222228] text-zinc-500 uppercase text-left">
                    <th className="py-2">Velikost</th>
                    <th className="py-2">Hrudník (cm)</th>
                    <th className="py-2">Délka (cm)</th>
                    <th className="py-2">Rukáv (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a22]">
                  <tr>
                    <td className="py-2 font-bold text-white">S</td>
                    <td className="py-2">118</td>
                    <td className="py-2">68</td>
                    <td className="py-2">61</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-white">M</td>
                    <td className="py-2">124</td>
                    <td className="py-2">70</td>
                    <td className="py-2">63</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-white">L</td>
                    <td className="py-2">130</td>
                    <td className="py-2">72</td>
                    <td className="py-2">65</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-white">XL</td>
                    <td className="py-2">136</td>
                    <td className="py-2">74</td>
                    <td className="py-2">67</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setSizeGuideOpen(false)}
              className="w-full bg-white text-black font-bold text-xs uppercase py-2.5 rounded mt-4"
            >
              ROZUMÍM
            </button>
          </div>
        </div>
      )}

      {/* Material Guide Modal */}
      {materialGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101015] border border-[#27272a] rounded-lg max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222228]">
              <h3 className="font-display text-white text-base tracking-wider">
                PRŮVODCE MATERIÁLŮ RUN
              </h3>
              <button
                onClick={() => setMaterialGuideOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <div>
                <strong className="text-white block font-mono">550 GSM Heavy Faux-Fur Teddy Fleece</strong>
                Hustý syntetický fleece s jemným chlupem, který drží stálý objem a nabízí tepelné vlastnosti srovnatelné se zimními bundami.
              </div>
              <div>
                <strong className="text-white block font-mono">14.5 oz Selvedge / Heavy Ring-Spun Denim</strong>
                Tradičně tkaný bavlněný kepr s vysokou gramáží, který se postupem nošení autenticky adaptuje na siluetu těla.
              </div>
              <div>
                <strong className="text-white block font-mono">280 GSM Organic Single Jersey Cotton</strong>
                Pevný úplet z dlouhých vláken česané bavlny. Nekroutí se ve švech a má hladký povrch pro detailní sítotisk.
              </div>
            </div>
            <button
              onClick={() => setMaterialGuideOpen(false)}
              className="w-full bg-white text-black font-bold text-xs uppercase py-2.5 rounded mt-4"
            >
              ZAVŘÍT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
