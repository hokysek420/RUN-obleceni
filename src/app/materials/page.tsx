import React from 'react';
import Link from 'next/link';
import { Layers, ShieldCheck, Sparkles, Feather } from 'lucide-react';

export default function MaterialsPage() {
  const materials = [
    {
      name: '550 GSM HEAVY FAUX-FUR TEDDY FLEECE',
      subtitle: 'Maximální hustota vlákna & Oboustranná konstrukce',
      tag: 'OUTERWEAR',
      description: 'Naše vlajková loď. Hustý, ultra-hřejivý syntetický fleece s jemným chlupem, který na rozdíl od běžných fleeců drží stabilní architektonický tvar. Vnitřní strana je podšita hladkým kontrastním úpletem pro komfortní vrstvení přes trička nebo mikiny.',
      specs: ['Gramáž: 550 g/m²', 'Složení: 100% Poly-Plush Fleece', 'Termoregulace: Extrémní', 'Povrch: Matná šelmovitá textura'],
      image: '/images/details/teddy-fur-macro-zipper.jpg',
    },
    {
      name: '14.5 OZ RING-SPUN SELVEDGE DENIM',
      subtitle: 'Klasický tuhý bavlněný kepr s vintage sepráním',
      tag: 'JEANS',
      description: 'Hutná bavlněná džínovina tkaná tradiční technikou prstencového předení. Kalhoty mají pevnou strukturu, která vytváří dramatické drapování kolem kotníků a bot. Ručně stíraný odstín Vintage Charcoal Black získává nošením jedinečnou patinu.',
      specs: ['Váha: 14.5 unce (cca 490 GSM)', 'Materiál: 100% Ring-Spun bavlna', 'Zpracování: Enzymatické seprání s jemnou abrazí', 'Hardware: Zakázkový masivní kov'],
      image: '/images/details/denim-wash-texture.jpg',
    },
    {
      name: '280 GSM COMBED ORGANIC JERSEY',
      subtitle: 'Česaná bio bavlna s dvojitým zpevněním límce',
      tag: 'T-SHIRTS',
      description: 'Vysokogramážní úplet z dlouhých vláken česané bavlny. Látka je pevná na dotek, nepůsobí průsvitně ani po desítkách praní a drží dokonalý drop-shoulder boxy tvar. Krční lem je vyztužen elastanem o šířce 1.25 palce.',
      specs: ['Gramáž: 280 g/m²', 'Materiál: 100% Bio česaná bavlna', 'Límec: 1.25" Heavy 1x1 Rib', 'Tisk: High-Density Plastisol'],
      image: '/images/details/tshirt-neck-label.jpg',
    },
    {
      name: '450 GSM HEAVY FRENCH TERRY',
      subtitle: 'Hustý bavlněný teplákový úplet s vnitřní smyčkou',
      tag: 'SWEATPANTS',
      description: 'Pevný a prodyšný bavlněný úplet s nepočesanou vnitřní smyčkou French Terry. Zajišťuje, že tepláky nevytahují kolena a drží široký splývavý profil.',
      specs: ['Gramáž: 450 g/m²', 'Materiál: 100% Bavlna', 'Pas: Zesílená guma + kovové koncovky', 'Odolnost proti žmolkování: 4.5/5'],
      image: '/images/details/sweatpants-heavy-cotton-texture.jpg',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white space-y-16">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
          MATERIÁLOVÁ ARCHITEKTURA
        </span>
        <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight">
          PRŮVODCE MATERIÁLŮ RUN
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Proč je oblečení RUN těžší a odolnější než běžná konfekce. Detailní přehled vláken a gramáží.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {materials.map((m, idx) => (
          <div
            key={idx}
            className="bg-[#0e0e12] border border-[#222228] rounded-lg overflow-hidden flex flex-col justify-between"
          >
            <div className="aspect-[16/10] overflow-hidden bg-[#16161c]">
              <img src={m.image} alt={m.name} className="w-full h-full object-cover img-zoom" />
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase bg-cyan-950/40 border border-cyan-900 px-2 py-0.5 rounded">
                {m.tag}
              </span>
              <h2 className="font-display text-xl uppercase text-white tracking-wide">
                {m.name}
              </h2>
              <p className="text-xs text-zinc-300 font-mono text-[11px]">{m.subtitle}</p>
              <p className="text-xs text-zinc-400 leading-relaxed">{m.description}</p>

              <div className="pt-4 border-t border-[#1b1b22] grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
                {m.specs.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
