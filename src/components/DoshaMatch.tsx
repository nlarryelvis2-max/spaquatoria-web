"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadProfile } from "@/lib/store";
import { getDominantDosha, DOSHA_NAMES, DOSHA_COLORS, DoshaType } from "@/lib/types";

interface Props {
  doshaAffinity: DoshaType[];
}

export function DoshaMatch({ doshaAffinity }: Props) {
  const [userDosha, setUserDosha] = useState<DoshaType | null>(null);

  useEffect(() => {
    const profile = loadProfile();
    if (profile) setUserDosha(getDominantDosha(profile));
  }, []);

  if (doshaAffinity.length === 0) return null;

  // No profile yet — prompt to take test
  if (!userDosha) {
    return (
      <Link href="/test" className="glass-card p-3.5 flex items-center gap-3 mb-5 tap">
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "var(--lp-soft)" }}>
          <span className="text-[14px]">?</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium">Подходит ли вам это средство?</p>
          <p className="text-[11px]" style={{ color: "var(--lp-muted)" }}>Пройдите доша-тест за 2 минуты</p>
        </div>
        <svg className="w-4 h-4 shrink-0" style={{ color: "var(--lp-tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </Link>
    );
  }

  const isMatch = doshaAffinity.includes(userDosha);

  return (
    <div className="glass-card p-3.5 flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[14px]"
        style={{ background: isMatch ? "#34C75915" : "#FF950015" }}>
        {isMatch ? "✓" : "~"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium" style={{ color: isMatch ? "#34C759" : "#FF9500" }}>
          {isMatch
            ? `Подходит для ${DOSHA_NAMES[userDosha]}`
            : `Не основной тип (${DOSHA_NAMES[userDosha]}), но можно использовать`
          }
        </p>
        <p className="text-[11px]" style={{ color: "var(--lp-muted)" }}>
          {isMatch
            ? "Это средство создано для вашего типа кожи"
            : `Рекомендовано для ${doshaAffinity.map(d => DOSHA_NAMES[d]).join(", ")}`
          }
        </p>
      </div>
    </div>
  );
}
