"use client";
import { cn } from "@/lib/utils";
import { useCurrencyStore } from "@/store/useCurrencyStore";

interface Props {
  amount: number | undefined;
  className?: string;
}

const PriceFormatter = ({ amount, className }: Props) => {
  const current = useCurrencyStore((s) =>
    s.currencies.find((c) => c.code === s.currentCode) || s.currencies[0],
  );

  const safeAmount = Number(amount) || 0;
  const converted = safeAmount * (current?.rate ?? 1);

  const formattedPrice = new Intl.NumberFormat(current?.locale || "en-US", {
    style: "currency",
    currency: current?.code || "USD",
    minimumFractionDigits: 2,
  }).format(converted);

  return (
    <span className={cn("text-sm font-semibold text-gofarm-black", className)}>
      {formattedPrice}
    </span>
  );
};

export default PriceFormatter;
