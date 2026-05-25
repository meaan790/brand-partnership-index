"use client";

import { useState } from "react";

interface BrandLogoProps {
  name: string;
  domain: string;
  size?: string;
}

type LogoStep = "google" | "letter";

function LetterFallback({ name, size }: { name: string; size: string }) {
  return (
    <div className={`${size} bg-surface-variant rounded border border-border-hairline flex items-center justify-center shrink-0`}>
      <span className="font-bold text-text-caption">{name.charAt(0)}</span>
    </div>
  );
}

export function BrandLogo({ name, domain, size = "w-10 h-10" }: BrandLogoProps) {
  const hasDomain = Boolean(domain && domain.trim());
  const [step, setStep] = useState<LogoStep>(hasDomain ? "google" : "letter");

  if (step === "letter" || !hasDomain) {
    return <LetterFallback name={name} size={size} />;
  }

  return (
    <div className={`${size} bg-white rounded border border-border-hairline flex items-center justify-center shrink-0 overflow-hidden p-1`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={`${name} logo`}
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
        className="max-w-full max-h-full object-contain"
        onError={() => setStep("letter")}
      />
    </div>
  );
}
