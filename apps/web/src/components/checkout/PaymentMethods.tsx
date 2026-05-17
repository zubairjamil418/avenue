"use client";

import React from "react";
import Image from "next/image";

interface PaymentMethodsProps {
  isLoggedIn: boolean;
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ isLoggedIn, selectedMethod, onMethodChange }) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <h3 className="font-urbanist font-bold text-[20px] leading-[30px] text-light-primary-text">
        Payment
      </h3>

      {!isLoggedIn && (
        <div className="bg-warning-lighter text-warning-dark px-4 py-3 rounded-[8px] font-dm-sans text-[15px] flex items-center gap-2">
          <span>⚠️</span>
          Please login to select a payment method.
        </div>
      )}

      <fieldset
        disabled={!isLoggedIn}
        className={`flex flex-col gap-4 ${!isLoggedIn ? "opacity-60 pointer-events-none" : ""}`}
      >
        {/* Bank Transfer (Disabled) */}
        <label
          className="w-full border rounded-[16px] px-6 py-4 flex items-center justify-between transition-colors border-border opacity-50 cursor-not-allowed"
          title="Currently unavailable"
        >
          <div className="flex items-center gap-4">
            <input
              type="radio"
              name="payment"
              className="size-5 accent-primary"
              disabled
            />
            <span className="font-dm-sans text-[16px] text-light-primary-text line-through">
              Bank Transfer
            </span>
          </div>
          <span className="text-xs text-light-disabled-text">Coming soon</span>
        </label>

        {/* Cash On Delivery */}
        <label
          className={`w-full border rounded-[16px] px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${selectedMethod === "cash" ? "border-primary bg-primary/5" : "border-border hover:border-border"}`}
        >
          <div className="flex items-center gap-4">
            <input
              type="radio"
              name="payment"
              className="size-5 accent-primary"
              checked={selectedMethod === "cash"}
              onChange={() => onMethodChange("cash")}
            />
            <span className="font-dm-sans text-[16px] text-light-primary-text">
              Cash On Delivery
            </span>
          </div>
        </label>

        {/* Credit Card (Stripe) */}
        <div
          className={`w-full border rounded-[16px] transition-colors p-[2px] ${selectedMethod === "credit_card" ? "border-primary bg-primary/5" : "border-border hover:border-border"}`}
        >
          <label className="flex items-center justify-between px-6 py-4 cursor-pointer w-full">
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="payment"
                className="size-5 accent-primary"
                checked={selectedMethod === "credit_card"}
                onChange={() => onMethodChange("credit_card")}
              />
              <span className="font-dm-sans text-[16px] text-light-primary-text">
                Credit Card (Stripe)
              </span>
            </div>
            <div className="flex items-center font-bold text-info-dark italic">
              VISA / MASTERCARD
            </div>
          </label>
        </div>

        {/* Paypal (Disabled) */}
        <label
          className="w-full border rounded-[16px] px-6 py-4 flex items-center justify-between transition-colors border-border opacity-50 cursor-not-allowed"
          title="Currently unavailable"
        >
          <div className="flex items-center gap-4">
            <input
              type="radio"
              name="payment"
              className="size-5 accent-primary"
              disabled
            />
            <span className="font-dm-sans text-[16px] text-light-primary-text line-through">
              Paypal
            </span>
          </div>
          <span className="text-xs text-light-disabled-text">Coming soon</span>
        </label>
      </fieldset>
    </div>
  );
};

export default PaymentMethods;
