import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  rate: number; // units of this currency per 1 USD (base)
}

const DEFAULT_CURRENCY: Currency = {
  code: "USD",
  name: "US Dollar",
  symbol: "$",
  locale: "en-US",
  rate: 1,
};

interface CurrencyStore {
  currentCode: string;
  currencies: Currency[];
  setCurrencies: (currencies: Currency[]) => void;
  setCurrency: (code: string) => void;
  getCurrent: () => Currency;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currentCode: DEFAULT_CURRENCY.code,
      currencies: [DEFAULT_CURRENCY],

      setCurrencies: (currencies) => {
        if (!currencies || currencies.length === 0) return;
        set((state) => {
          // Preserve user's selection if still supported, otherwise fall back to USD.
          const stillSupported = currencies.some(
            (c) => c.code === state.currentCode,
          );
          return {
            currencies,
            currentCode: stillSupported ? state.currentCode : DEFAULT_CURRENCY.code,
          };
        });
      },

      setCurrency: (code) => {
        const exists = get().currencies.some((c) => c.code === code);
        if (exists) set({ currentCode: code });
      },

      getCurrent: () => {
        const { currentCode, currencies } = get();
        return (
          currencies.find((c) => c.code === currentCode) || DEFAULT_CURRENCY
        );
      },
    }),
    {
      name: "currency-storage",
      // Only persist the user's chosen code; rates/symbols always re-hydrate from the API.
      partialize: (state) => ({ currentCode: state.currentCode }),
    },
  ),
);
