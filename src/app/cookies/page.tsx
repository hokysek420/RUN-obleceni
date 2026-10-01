import React from 'react';

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white space-y-8">
      <div className="border-b border-[#1f1f26] pb-6">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block mb-1">
          ZÁSADY SOUBORŮ COOKIES
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight">
          INFORMACE O POUŽÍVÁNÍ COOKIES
        </h1>
      </div>

      <div className="space-y-6 text-xs text-zinc-300 leading-relaxed font-light">
        <section className="space-y-2">
          <h2 className="font-display text-sm uppercase text-white font-bold">CO JSOU SOUBORY COOKIE?</h2>
          <p>
            Cookies jsou malé textové soubory ukládané do vašeho prohlížeče, které umožňují pamatovat si vaše nastavení (např. obsah nákupního košíku, zvolenou měnu CZK/EUR nebo přihlášení uživatele).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-sm uppercase text-white font-bold">JAKÉ COOKIES POUŽÍVÁME?</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li><strong>Nezbytné funkční cookies:</strong> Zajišťují ukládání produktů v košíku, přihlášení k účtu a proces pokladny.</li>
            <li><strong>Preferenční cookies:</strong> Ukládají volbu měny a jazykového rozhraní.</li>
            <li><strong>Analytické cookies:</strong> Pomáhají nám anonymně měřit návštěvnost a zlepšovat výkon webu.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-sm uppercase text-white font-bold">SPRÁVA COOKIES V PROHLÍŽEČI</h2>
          <p>
            Ukládání cookies můžete kdykoliv zakázat nebo omezit v nastavení svého internetového prohlížeče (Chrome, Safari, Firefox, Edge).
          </p>
        </section>
      </div>
    </div>
  );
}
