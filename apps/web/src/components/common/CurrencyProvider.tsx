"use client";
import { useEffect } from "react";
import { useCurrencyStore, type Currency } from "@/store/useCurrencyStore";

interface Props {
  initialCurrencies?: Currency[];
  children?: React.ReactNode;
}

const CurrencyProvider = ({ initialCurrencies, children }: Props) => {
  const setCurrencies = useCurrencyStore((s) => s.setCurrencies);

  useEffect(() => {
    if (initialCurrencies && initialCurrencies.length > 0) {
      setCurrencies(initialCurrencies);
    }
  }, [initialCurrencies, setCurrencies]);

  return <>{children}</>;
};

export default CurrencyProvider;
