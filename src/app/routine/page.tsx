"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { routines, getProduct } from "@/lib/data";
import { loadProfile, loadAgeGroup } from "@/lib/store";
import { getDominantDosha, DOSHA_NAMES, DOSHA_COLORS, AGE_NAMES, AGE_SUBTITLES, STEP_NAMES, AgeGroup, DoshaType } from "@/lib/types";

export default function RoutinePage() {
  const [dosha, setDosha] = useState<DoshaType | null>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "evening">("morning");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const profile = loadProfile();
    if (profile) setDosha(getDominantDosha(profile));
    const ag = loadAgeGroup();
    if (ag) setAgeGroup(ag);
  }, []);

  if (!mounted) return null;

  const routine = dosha && ageGroup
    ? routines.find(r => r.dosha === dosha && r.ageGroup === ageGroup && r.zone === "face")
    : null;

  const steps = routine
    ? routine.steps.filter(s => s.timeOfDay === timeOfDay).sort((a, b) => a.order - b.order)
    : [];

  // ─── Onboarding ──────────────────────────
  if (!dosha || !ageGroup) {
    return (
      <div className="max-w-md mx-auto px-5 py-10">
        <div className="relative -mx-5 mb-6 overflow-hidden" style={{ borderRadius: "0 0 8px 8px" }}>
          <img src="/brand/hero/face-care.jpg" alt=""
            className="w-full h-[160px] object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--lp-bg) 0%, transparent 50%)" }} />
        </div>
        <p className="eyebrow mb-3">Ваш ритуал</p>
        <h1 className="heading-xl mb-3">Ритуал ухода</h1>
        <p className="body-lp muted mb-8">Пройдите тест и выберите возраст кожи</p>

        <div className="mb-6">
          <p className="eyebrow mb-3">Возраст</p>
          <div className="grid grid-cols-2 gap-2">
            {(["young", "active", "mature", "premium"] as AgeGroup[]).map(ag => (
              <button
                key={ag}
                onClick={() => setAgeGroup(ag)}
                className={`py-4 rounded-lg text-center tap transition-all ${
                  ageGroup === ag
                    ? "bg-brand text-white"
                    : "glass-card"
                }`}
              >
                <p className="text-[17px] font-bold">{AGE_NAMES[ag]}</p>
                <p className="text-[11px] opacity-60">{AGE_SUBTITLES[ag]}</p>
              </button>
            ))}
          </div>
        </div>

        {!dosha && (
          <Link href="/test" className="btn-lp block text-center">
            Пройти доша-тест
          </Link>
        )}
      </div>
    );
  }

  // ─── Routine ─────────────────────────────
  return (
    <div className="max-w-md mx-auto px-5 py-10">
      <div className="relative -mx-5 mb-6 overflow-hidden" style={{ borderRadius: "0 0 8px 8px" }}>
        <img src="/brand/hero/face-care.jpg" alt=""
          className="w-full h-[160px] object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--lp-bg) 0%, transparent 50%)" }} />
      </div>
      <p className="eyebrow mb-3">Персональный уход</p>
      <h1 className="heading-xl mb-3">Твой ритуал</h1>

      {/* Context */}
      <div className="flex gap-1.5 mb-5">
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: DOSHA_COLORS[dosha] + "15", color: DOSHA_COLORS[dosha] }}>
          {DOSHA_NAMES[dosha]}
        </span>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-fill text-fg-secondary">
          {AGE_SUBTITLES[ageGroup]}
        </span>
      </div>

      {/* Segmented control */}
      <div className="glass-pill inline-flex p-[2px] mb-8">
        {(["morning", "evening"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTimeOfDay(t)}
            className={`rounded-full px-5 py-[7px] text-[13px] font-semibold transition-all ${
              timeOfDay === t
                ? "bg-brand text-white shadow-sm"
                : "text-fg-secondary"
            }`}
          >
            {t === "morning" ? "Утро" : "Вечер"}
          </button>
        ))}
      </div>

      {/* Steps */}
      {routine && steps.length > 0 ? (
        <div className="glass-card overflow-hidden">
          {steps.map((step, i) => {
            const product = getProduct(step.productId);
            return (
              <div key={step.order} className="px-4 py-3.5"
                style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}
              >
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-fg-tertiary uppercase tracking-wide">{STEP_NAMES[step.type]}</p>
                    <p className="text-[15px] font-semibold mt-0.5">{step.title}</p>
                    <p className="text-[13px] text-fg-secondary mt-0.5 leading-snug">{step.description}</p>
                    {product && (
                      <Link
                        href={`/catalog/${product.id}`}
                        className="inline-flex items-center gap-1 text-[13px] text-brand mt-2 tap"
                      >
                        {product.name}
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-[15px] text-fg-secondary">Ритуал для этой комбинации пока не готов</p>
        </div>
      )}

      {/* ── Сезонный уход ─────────────────────────── */}
      <Link href="/season" className="paper-card mt-6 flex items-center justify-between tap" style={{ padding: 20 }}>
        <div className="flex-1 min-w-0 pr-3">
          <p className="eyebrow mb-1">Ритучарья</p>
          <p className="body-lp">Как меняется уход по сезонам</p>
        </div>
        <svg className="w-4 h-4 shrink-0" style={{ color: "var(--lp-tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </Link>

      {/* ── Консультация специалиста ──────────────── */}
      <div className="paper-card mt-3" style={{ padding: 20 }}>
        <p className="eyebrow mb-2">Персональная консультация</p>
        <p className="body-lp mb-4">Косметолог подберёт уход под ваш запрос и ответит на вопросы в WhatsApp.</p>
        <a
          href={`https://wa.me/79031234567?text=${encodeURIComponent(`Здравствуйте! Я прошла доша-тест (${dosha ? DOSHA_NAMES[dosha] : ""}${ageGroup ? ", " + AGE_SUBTITLES[ageGroup] : ""}) и хочу персональную консультацию по уходу.`)}`}
          target="_blank"
          rel="noopener"
          className="btn-lp w-full"
        >
          Написать в WhatsApp
        </a>
      </div>
    </div>
  );
}
