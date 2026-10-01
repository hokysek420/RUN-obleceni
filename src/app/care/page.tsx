import React from 'react';
import Link from 'next/link';
import { Droplet, Wind, Sun, AlertTriangle } from 'lucide-react';

export default function CarePage() {
  const instructions = [
    {
      category: 'TEDDY FLEECE MIKINY (550 GSM)',
      icon: Droplet,
      rules: [
        'Prát vždy naruby na jemný program s maximální teplotou 30°C.',
        'Používat tekuté prací gely bez bělidel a aviváže (aviváž slepuje fleece vlákna).',
        'NESUŠIT V SUŠIČCE. Sušit volně rozložené na vodorovné ploše nebo na širokém ramínku.',
        'Nežehlit přímo přes kožešinu ani výšivku. Po uschnutí stačí mikinu jemně protřepat pro nadýchaný objem.',
      ],
    },
    {
      category: 'TĚŽKÁ TRIČKA (280 GSM BIO BAVLNA)',
      icon: Wind,
      rules: [
        'Prát na 30°C naruby se stejnými barvami.',
        'Sítotisk "YOU HAVE NOTHING" nežehlit přímo – žehlit vždy naruby při střední teplotě.',
        'Nesušit na přímém ostrém slunci, aby se předešlo vyšisování sytosti bílé barvy.',
      ],
    },
    {
      category: 'BAGGY DENIM JEANS (14.5 OZ)',
      icon: Sun,
      rules: [
        'Prát co nejméně – pro zachování autentické textury denimu doporučujeme větrat.',
        'Při praní zapnout zip a knoflík, obrátit naruby a prát ve studené vodě (30°C).',
        'Nesušit v sušičce, nechat přirozeně uschnout zavěšené za pas.',
      ],
    },
    {
      category: 'SNEAKERS & CHROMOVÁ OBUV',
      icon: AlertTriangle,
      rules: [
        'Nikdy neprat tenisky v automatické pračce (hrozí poškození vzduchové jednotky a chromu).',
        'Čistit vlhkým hadříkem z mikrovlákna a speciální jemnou pěnou na kůži.',
        'Chromové části otírat měkkou utěrkou bez abrazivních čisticích písků.',
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white space-y-12">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
          GARANCE DLOUHOVĚKOSTI
        </span>
        <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight">
          NÁVOD K ÚDRŽBĚ PRODUKTŮ RUN
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Správnou péčí zajistíte, že si vaše kusy RUN udrží původní sytost, hustotu kožešiny i tvar po mnoho let.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {instructions.map((item, idx) => (
          <div key={idx} className="bg-[#0e0e12] border border-[#222228] p-6 rounded-lg space-y-4">
            <div className="flex items-center space-x-3 border-b border-[#1b1b22] pb-3">
              <item.icon className="w-5 h-5 text-zinc-300" />
              <h2 className="font-display text-sm uppercase text-white tracking-wide">
                {item.category}
              </h2>
            </div>
            <ul className="space-y-2 text-xs text-zinc-400">
              {item.rules.map((rule, rIdx) => (
                <li key={rIdx} className="flex items-start space-x-2">
                  <span className="text-white font-mono">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
