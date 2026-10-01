import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white space-y-8">
      <div className="border-b border-[#1f1f26] pb-6">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block mb-1">
          PRÁVNÍ DOKUMENTACE
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight">
          VŠEOBECNÉ OBCHODNÍ PODMÍNKY
        </h1>
        <p className="text-xs text-zinc-400 font-mono mt-1">Platné od 1. 10. 2026</p>
      </div>

      <div className="space-y-6 text-xs text-zinc-300 leading-relaxed font-light">
        <section className="space-y-2">
          <h2 className="font-display text-sm uppercase text-white font-bold">1. ÚVODNÍ USTANOVENÍ</h2>
          <p>
            Tyto obchodní podmínky platí pro nákup v internetovém obchodě značky RUN Clothing (oficiální kontakt: info@runclothing.com).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-sm uppercase text-white font-bold">2. OBJEDNÁVKA A UZAVŘENÍ KUPNÍ SMLOUVY</h2>
          <p>
            Prezentace veškerého zboží umístěného ve webovém rozhraní obchodu je informativního charakteru a prodávající není povinen uzavřít kupní smlouvu ohledně tohoto zboží. Kupní smlouva vzniká odesláním objednávky kupujícím a přijetím objednávky prodávajícím formou potvrzujícího e-mailu.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-sm uppercase text-white font-bold">3. PŘEDOBJEDNÁVKY (PRE-ORDERS)</h2>
          <p>
            U zboží označeného stavem „PŘEDOBJEDNÁVKA“ je uveden předpokládaný termín expedice. Uhrazením předobjednávky si kupující rezervuje kus z limitované výrobní várky. V případě neočekávaného zpoždění má kupující právo od smlouvy odstoupit s okamžitým vrácením celé uhrazené částky.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-sm uppercase text-white font-bold">4. CENA ZBOŽÍ A PLATEBNÍ PODMÍNKY</h2>
          <p>
            Všechny ceny na e-shopu jsou konečné včetně DPH. Kupující může zvolit platbu kartou online, Apple Pay / Google Pay, bankovním převodem na účet prodávajícího nebo dobírkou při převzetí.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-sm uppercase text-white font-bold">5. ODSTOUPENÍ OD SMLOUVY (VRÁCENÍ ZBOŽÍ)</h2>
          <p>
            Kupující – spotřebitel má v souladu s § 1829 občanského zákoníku právo odstoupit od smlouvy bez udání důvodu ve lhůtě 14 dnů ode dne převzetí zboží. Zboží musí být vráceno nepoškozené, nenošené a s původními visačkami.
          </p>
        </section>

        <div className="p-4 bg-[#111116] border border-[#27272a] rounded text-[11px] text-zinc-400 font-mono">
          Upozornění: Text obchodních podmínek je standardní informativní šablonou a nebyl individuálně ověřen advokátem pro specifické situace.
        </div>
      </div>
    </div>
  );
}
