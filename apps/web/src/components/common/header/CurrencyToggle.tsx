"use client";
import React from "react";
import { Link } from "@/i18n/routing";
import { ChevronDown } from "lucide-react";
import { useCurrencyStore } from "@/store/useCurrencyStore";

const CurrencyToggle = () => {
  const currencies = useCurrencyStore((s) => s.currencies);
  const currentCode = useCurrencyStore((s) => s.currentCode);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);

  const selectedCurrency =
    currencies.find((c) => c.code === currentCode) || currencies[0];

  if (!selectedCurrency) return null;

  return (
    <li className="relative group">
      <Link
        href="#"
        className="text-sm leading-[22px] text-primary-foreground flex items-center gap-x-2 py-3.5"
      >
        <span className="inline-flex items-center justify-center size-7 bg-primary-dark rounded-full">
          <span className="text-xs font-bold text-primary-foreground">
            {selectedCurrency.symbol}
          </span>
        </span>
        {selectedCurrency.code}
        <span className="inline-flex items-center justify-center">
          <ChevronDown className="size-5 text-primary-foreground" />
        </span>
      </Link>
      <ul className="absolute left-0 top-[calc(100%-4px)] py-2 z-50 w-[150px] bg-white rounded-lg shadow-dark-z-24 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 before:absolute before:content-[''] before:w-full before:h-6 before:-top-4 before:left-0">
        {currencies.map((currency) => (
          <li key={currency.code} className="py-2 px-4 group/item">
            <button
              onClick={() => setCurrency(currency.code)}
              className="flex items-center gap-x-2 relative text-foreground hover:text-primary transition-colors duration-300 w-full text-left"
            >
              <span className="w-8 h-8 bg-gray-100 group-hover/item:bg-primary/8 inline-flex items-center justify-center rounded-full text-xs font-bold">
                {currency.symbol}
              </span>
              {currency.code}
            </button>
          </li>
        ))}
      </ul>
    </li>
  );
};

export default CurrencyToggle;
