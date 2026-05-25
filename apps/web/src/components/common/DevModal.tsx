"use client";

import { useEffect, useState } from "react";

const LAUNCH_DATE = new Date("2026-06-15T12:00:00");

function getTimeLeft() {
  const diff = Math.max(0, LAUNCH_DATE.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function DevModal() {
  const [visible, setVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const dismissed = sessionStorage.getItem("devModalDismissed");
    if (!dismissed) {
      setVisible(true);
      document.body.style.overflow = "hidden";
    }

    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  function handleClose() {
    setVisible(false);
    document.body.style.overflow = "";
    sessionStorage.setItem("devModalDismissed", "1");
  }

  if (!visible) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className="fixed inset-0 z-[6000] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.65)" }}
    >
      <div
        className="relative w-[90%] max-w-[350px] rounded-lg bg-white px-8 py-10 text-center"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
      >
        <button
          onClick={handleClose}
          title="Close"
          className="absolute right-4 top-4 border-none bg-transparent text-2xl leading-none text-gray-400 cursor-pointer hover:text-gray-600"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="mb-2 text-xl font-semibold text-gray-800">
          Under Development
        </h2>
        <p className="mb-5 text-sm text-gray-500">
          The only way to stores, Convenience, more availability —{" "}
          <span className="font-medium text-gray-700">Coming soon!</span>
        </p>

        {/* Countdown */}
        <div className="flex justify-center gap-2">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <div
                className="rounded px-3 py-2 font-mono text-xl font-semibold text-gray-800 min-w-[40px]"
                style={{ background: "#f3f4f6" }}
              >
                {pad(value)}
              </div>
              <span className="mt-1 text-[0.7rem] text-gray-400 uppercase tracking-wide">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
