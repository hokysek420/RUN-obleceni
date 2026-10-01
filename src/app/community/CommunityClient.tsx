'use client';

import React, { useState } from 'react';
import { Camera, CheckCircle2, Instagram, Plus, X } from 'lucide-react';
import { CommunityPhoto } from '@/types';

interface CommunityClientProps {
  initialPhotos: CommunityPhoto[];
}

export default function CommunityClient({ initialPhotos }: CommunityClientProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [modalOpen, setModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [productTagged, setProductTagged] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, authorHandle, imageUrl, caption, productTagged }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setModalOpen(false);
          setAuthorName('');
          setImageUrl('');
        }, 2000);
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#1f1f26] pb-8 mb-10 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block mb-1">
            STREET CULTURE & RUN COMMUNITY
          </span>
          <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight">
            FOTOGALERIE KOMUNITY
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-lg">
            Jak lidé nosí RUN v ulicích. Označte @run.clothing nebo #runclothing na Instagramu a staňte se součástí oficiální galerie.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="self-start sm:self-auto bg-white text-black font-black uppercase text-xs tracking-wider px-5 py-3 rounded hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          <span>PŘIDAT SVŮJ OUTFIT</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((item) => (
          <div
            key={item.id}
            className="group bg-[#0e0e12] border border-[#222228] rounded-lg overflow-hidden flex flex-col justify-between"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[#16161c]">
              <img
                src={item.image_url}
                alt={item.caption || item.author_name}
                className="w-full h-full object-cover img-zoom"
              />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300">
                {item.author_handle || item.author_name}
              </div>
            </div>

            <div className="p-4 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{item.author_name}</span>
                {item.author_handle && (
                  <span className="text-zinc-500 font-mono text-[11px]">{item.author_handle}</span>
                )}
              </div>
              {item.caption && <p className="text-xs text-zinc-400">{item.caption}</p>}
              {item.product_tagged && (
                <div className="pt-2 text-[10px] font-mono text-cyan-400">
                  Na fotce: {item.product_tagged}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101015] border border-[#27272a] rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222228]">
              <h3 className="font-display text-white text-base tracking-wider">
                SDÍLEJTE SVŮJ RUN OUTFIT
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">FOTOGRAFIE BYLA ODESLÁNA</h4>
                <p className="text-xs text-zinc-400">
                  Po rychlé moderaci naším týmem bude fotka zařazena do galerie RUN.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                    Vaše jméno nebo přezdívka *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Marek"
                    className="w-full bg-[#18181f] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                    Instagram handle (@vaše_jméno)
                  </label>
                  <input
                    type="text"
                    value={authorHandle}
                    onChange={(e) => setAuthorHandle(e.target.value)}
                    placeholder="@marek_prague"
                    className="w-full bg-[#18181f] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                    URL fotografie / odkazu *
                  </label>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#18181f] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                    Popisek outfitu
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Night session in Prague..."
                    className="w-full bg-[#18181f] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                    Který produkt RUN máte na sobě?
                  </label>
                  <input
                    type="text"
                    value={productTagged}
                    onChange={(e) => setProductTagged(e.target.value)}
                    placeholder="RUN Reversible Teddy Fur Hoodie"
                    className="w-full bg-[#18181f] border border-[#2e2e38] rounded px-3 py-2 text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black font-black uppercase text-xs py-3 rounded hover:bg-zinc-200 mt-2"
                >
                  {submitting ? 'ODESÍLÁM...' : 'ODESLAT KE SCHVÁLENÍ'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
