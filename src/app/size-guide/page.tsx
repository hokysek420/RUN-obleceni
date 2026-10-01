import React from 'react';
import Link from 'next/link';
import { Ruler, ArrowRight } from 'lucide-react';

export default function SizeGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white space-y-12">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
          FIT & MEASUREMENTS
        </span>
        <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight">
          TABULKA VELIKOSTÍ RUN
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Všechny střihy RUN jsou koncipovány v autentickém streetwear standardu. Níže naleznete rozměry pro jednotlivé kategorie oděvů.
        </p>
      </div>

      {/* 1. Mikiny & Outerwear */}
      <div className="bg-[#0e0e12] border border-[#222228] rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1b1b22] pb-3">
          <h2 className="font-display text-base uppercase text-white tracking-wide">
            1. MIKINY & OUTERWEAR (BOXY / OVERSIZED FIT)
          </h2>
          <span className="text-[11px] font-mono text-zinc-500">Míry v cm</span>
        </div>
        <p className="text-xs text-zinc-400">
          Mikiny mají výrazně padlá ramena, široký hrudník a kratší boxy délku do pasu. Pro standardní střih volte o velikost menší.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-zinc-300">
            <thead>
              <tr className="border-b border-[#222228] text-zinc-500 text-left uppercase">
                <th className="py-2.5">Velikost</th>
                <th className="py-2.5">Šířka hrudníku (A)</th>
                <th className="py-2.5">Celková délka (B)</th>
                <th className="py-2.5">Délka rukávu od krku (C)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18181f]">
              <tr><td className="py-2.5 font-bold text-white">S</td><td>60 cm</td><td>68 cm</td><td>78 cm</td></tr>
              <tr><td className="py-2.5 font-bold text-white">M</td><td>63 cm</td><td>70 cm</td><td>80 cm</td></tr>
              <tr><td className="py-2.5 font-bold text-white">L</td><td>66 cm</td><td>72 cm</td><td>82 cm</td></tr>
              <tr><td className="py-2.5 font-bold text-white">XL</td><td>69 cm</td><td>74 cm</td><td>84 cm</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Trička & Topy */}
      <div className="bg-[#0e0e12] border border-[#222228] rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1b1b22] pb-3">
          <h2 className="font-display text-base uppercase text-white tracking-wide">
            2. TRIČKA (HEAVYWEIGHT 280 GSM BOXY TEE)
          </h2>
          <span className="text-[11px] font-mono text-zinc-500">Míry v cm</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-zinc-300">
            <thead>
              <tr className="border-b border-[#222228] text-zinc-500 text-left uppercase">
                <th className="py-2.5">Velikost</th>
                <th className="py-2.5">Šířka hrudníku</th>
                <th className="py-2.5">Délka zad</th>
                <th className="py-2.5">Délka rukávu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18181f]">
              <tr><td className="py-2.5 font-bold text-white">S</td><td>56 cm</td><td>71 cm</td><td>23 cm</td></tr>
              <tr><td className="py-2.5 font-bold text-white">M</td><td>59 cm</td><td>73 cm</td><td>24 cm</td></tr>
              <tr><td className="py-2.5 font-bold text-white">L</td><td>62 cm</td><td>75 cm</td><td>25 cm</td></tr>
              <tr><td className="py-2.5 font-bold text-white">XL</td><td>65 cm</td><td>77 cm</td><td>26 cm</td></tr>
              <tr><td className="py-2.5 font-bold text-white">XXL</td><td>68 cm</td><td>79 cm</td><td>27 cm</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Džíny & Kalhoty */}
      <div className="bg-[#0e0e12] border border-[#222228] rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1b1b22] pb-3">
          <h2 className="font-display text-base uppercase text-white tracking-wide">
            3. DŽÍNY & KALHOTY (BAGGY STREETWEAR FIT)
          </h2>
          <span className="text-[11px] font-mono text-zinc-500">Míry v cm</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-zinc-300">
            <thead>
              <tr className="border-b border-[#222228] text-zinc-500 text-left uppercase">
                <th className="py-2.5">Velikost</th>
                <th className="py-2.5">Obvod pasu</th>
                <th className="py-2.5">Celková délka</th>
                <th className="py-2.5">Šířka nohavice dole</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18181f]">
              <tr><td className="py-2.5 font-bold text-white">28 / 32</td><td>76 cm</td><td>106 cm</td><td>26 cm</td></tr>
              <tr><td className="py-2.5 font-bold text-white">30 / 32</td><td>81 cm</td><td>108 cm</td><td>27 cm</td></tr>
              <tr><td className="py-2.5 font-bold text-white">32 / 32</td><td>86 cm</td><td>110 cm</td><td>28 cm</td></tr>
              <tr><td className="py-2.5 font-bold text-white">34 / 32</td><td>91 cm</td><td>112 cm</td><td>29 cm</td></tr>
              <tr><td className="py-2.5 font-bold text-white">36 / 32</td><td>96 cm</td><td>114 cm</td><td>30 cm</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Obuv */}
      <div className="bg-[#0e0e12] border border-[#222228] rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1b1b22] pb-3">
          <h2 className="font-display text-base uppercase text-white tracking-wide">
            4. OBUV (SNEAKERS EU / CM)
          </h2>
          <span className="text-[11px] font-mono text-zinc-500">Míry v cm</span>
        </div>
        <p className="text-xs text-zinc-400">
          Tenisky odpovídají standardnímu číslování (True To Size). Doporučujeme volit vaši běžnou velikost tenisek.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-zinc-300">
            <thead>
              <tr className="border-b border-[#222228] text-zinc-500 text-left uppercase">
                <th className="py-2.5">EU Velikost</th>
                <th className="py-2.5">Délka stélky</th>
                <th className="py-2.5">US Pánské</th>
                <th className="py-2.5">UK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18181f]">
              <tr><td className="py-2.5 font-bold text-white">40</td><td>25.5 cm</td><td>7.5</td><td>6.5</td></tr>
              <tr><td className="py-2.5 font-bold text-white">41</td><td>26.0 cm</td><td>8.0</td><td>7.0</td></tr>
              <tr><td className="py-2.5 font-bold text-white">42</td><td>26.5 cm</td><td>8.5</td><td>7.5</td></tr>
              <tr><td className="py-2.5 font-bold text-white">43</td><td>27.5 cm</td><td>9.5</td><td>8.5</td></tr>
              <tr><td className="py-2.5 font-bold text-white">44</td><td>28.0 cm</td><td>10.0</td><td>9.0</td></tr>
              <tr><td className="py-2.5 font-bold text-white">45</td><td>29.0 cm</td><td>11.0</td><td>10.0</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center pt-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-white text-black font-black uppercase text-xs tracking-widest px-8 py-3.5 rounded hover:bg-zinc-200 transition-colors"
        >
          <span>PŘEJÍT NA NÁKUP</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
