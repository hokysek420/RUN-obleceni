'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'CZK' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountInCzk: number) => string;
  rate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('CZK');
  const rate = 25.0; // 1 EUR = 25 CZK

  useEffect(() => {
    try {
      const saved = localStorage.getItem('run_currency') as Currency;
      if (saved && (saved === 'CZK' || saved === 'EUR')) {
        setCurrencyState(saved);
      }
    } catch {}
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('run_currency', c);
    } catch {}
  };

  const formatPrice = (amountInCzk: number): string => {
    if (currency === 'EUR') {
      const eur = Math.round(amountInCzk / rate);
      return `${eur} €`;
    }
    // Czech format: e.g. 3 890 Kč
    return `${amountInCzk.toLocaleString('cs-CZ')} Kč`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, rate }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}
