import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white space-y-8">
      <div className="border-b border-[#1f1f26] pb-6">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block mb-1">
          GDPR & OCHRANA DAT
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight">
          ZÁSADY OCHRANY OSOBNÍCH ÚDAJŮ
        </h1>
        <p className="text-xs text-zinc-400 font-mono mt-1">V souladu s nařízením GDPR (EU 2016/679)</p>
      </div>

      <div className="space-y-6 text-xs text-zinc-300 leading-relaxed font-light">
        <section className="space-y-2">
          <h2 className="font-display text-sm uppercase text-white font-bold">1. SPRÁVCE OSOBNÍCH ÚDAJŮ</h2>
          <p>
            Správcem osobních údajů je internetový obchod RUN Clothing, kontaktní e-mail: privacy@runclothing.com.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-sm uppercase text-white font-bold">2. ZPRACOVÁVANÉ ÚDAJE A ÚČEL</h2>
          <p>
            Zpracováváme jméno, příjmení, e-mail, telefon, doručovací adresu a historii objednávek výhradně za účelem vyřízení a doručení vaší objednávky, plnění zákonných účetních povinností a zákaznické podpory.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-sm uppercase text-white font-bold">3. PŘÍJEMCI ÚDAJŮ (DOPRAVCI A PLATBY)</h2>
          <p>
            Osobní údaje předáváme v nezbytném rozsahu smluvním partnerům zajišťujícím logistiku a platby (Zásilkovna s.r.o., Direct Parcel Distribution CZ s.r.o., Fio banka a.s.).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-sm uppercase text-white font-bold">4. PRÁVA SUBJEKTU ÚDAJŮ</h2>
          <p>
            Máte právo na přístup k údajům, opravu, výmaz (být zapomenut), omezení zpracování a přenositelnost. Své požadavky můžete zasílat na info@runclothing.com.
          </p>
        </section>
      </div>
    </div>
  );
}
