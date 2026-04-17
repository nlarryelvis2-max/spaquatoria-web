"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { questions, DoshaAnswer } from "@/lib/questions";
import { DoshaProfile, getDominantDosha, DOSHA_NAMES, DOSHA_SUBTITLES, DOSHA_SKIN, DOSHA_COLORS, DoshaType } from "@/lib/types";
import { saveProfile } from "@/lib/store";
import { products } from "@/lib/data";
import { Product } from "@/lib/types";

function pickStarterKit(dosha: DoshaType): Product[] {
  const desiredPurposes: Record<DoshaType, string[][]> = {
    vata: [["cleansing"], ["moisturizing", "nutrition"], ["sunProtection", "antiAge"]],
    pitta: [["cleansing"], ["moisturizing"], ["sunProtection"]],
    kapha: [["cleansing", "detox"], ["moisturizing"], ["lifting", "detox"]],
  };
  const slots = desiredPurposes[dosha];
  const pool = products.filter(p => p.bodyZone === "face" && p.doshaAffinity.includes(dosha) && p.images.length > 0);
  const picked: Product[] = [];
  const usedIds = new Set<string>();
  for (const slot of slots) {
    const match = pool.find(p => !usedIds.has(p.id) && p.purposes.some(pu => slot.includes(pu)));
    if (match) { picked.push(match); usedIds.add(match.id); }
  }
  for (const p of pool) {
    if (picked.length >= 3) break;
    if (!usedIds.has(p.id)) { picked.push(p); usedIds.add(p.id); }
  }
  return picked.slice(0, 3);
}

export default function TestPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, DoshaAnswer>>({});
  const [result, setResult] = useState<DoshaProfile | null>(null);

  const q = questions[currentIndex];
  const progress = Object.keys(answers).length / questions.length;

  function selectAnswer(answer: DoshaAnswer) {
    const newAnswers = { ...answers, [q.id]: answer };
    setAnswers(newAnswers);

    if (currentIndex === questions.length - 1) {
      let v = 0, p = 0, k = 0;
      for (const question of questions) {
        const a = newAnswers[question.id];
        if (!a) continue;
        v += a.vataWeight * question.weight;
        p += a.pittaWeight * question.weight;
        k += a.kaphaWeight * question.weight;
      }
      const t = Math.max(v + p + k, 1);
      saveProfile({ vata: v / t, pitta: p / t, kapha: k / t });
      setResult({ vata: v / t, pitta: p / t, kapha: k / t });
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  // ─── Result ───────────────────────────────
  if (result) {
    const dominant = getDominantDosha(result);
    const sorted: [string, number][] = (
      [["vata", result.vata], ["pitta", result.pitta], ["kapha", result.kapha]] as [string, number][]
    ).sort((a, b) => b[1] - a[1]);
    const starter = pickStarterKit(dominant);
    const starterTotal = starter.reduce((sum, p) => {
      const v = p.volumes.find(x => x.inStock) || p.volumes[0];
      return sum + (v ? v.retailPrice : 0);
    }, 0);

    return (
      <div className="max-w-md mx-auto px-5 py-10">
        <div className="anim-fade-up text-center mb-6">
          <p className="eyebrow mb-3">Результат</p>
          <h1 className="heading-xl" style={{ color: DOSHA_COLORS[dominant] }}>
            {DOSHA_NAMES[dominant]}
          </h1>
          <p className="body-lp muted mt-2">{DOSHA_SUBTITLES[dominant]}</p>
        </div>

        <div className="anim-d1 glass-card p-5 mb-4">
          <p className="text-[13px] text-fg-secondary leading-relaxed">{DOSHA_SKIN[dominant]}</p>
        </div>

        <div className="anim-d2 glass-card p-5 mb-6">
          {sorted.map(([dosha, value]) => (
            <div key={dosha} className="flex items-center gap-3 mb-3 last:mb-0">
              <span className="text-[13px] font-semibold w-12" style={{ color: DOSHA_COLORS[dosha as keyof typeof DOSHA_COLORS] }}>
                {DOSHA_NAMES[dosha as keyof typeof DOSHA_NAMES]}
              </span>
              <div className="flex-1 h-2 bg-fill rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${value * 100}%`, backgroundColor: DOSHA_COLORS[dosha as keyof typeof DOSHA_COLORS] }}
                />
              </div>
              <span className="text-[15px] font-semibold w-10 text-right">{Math.round(value * 100)}%</span>
            </div>
          ))}
        </div>

        {/* Starter Kit */}
        {starter.length >= 3 && (
          <div className="anim-d3 paper-card mb-4" style={{ padding: 20 }}>
            <p className="eyebrow mb-2">С чего начать</p>
            <p className="body-lp mb-4">Базовый набор для {DOSHA_NAMES[dominant]} — три шага ежедневного ритуала.</p>
            <div className="space-y-3">
              {starter.map((p, i) => {
                const img = p.images.find(x => x.isMain) || p.images[0];
                const vol = p.volumes.find(x => x.inStock) || p.volumes[0];
                return (
                  <Link key={p.id} href={`/catalog/${p.id}`} className="flex items-center gap-3 tap">
                    <span className="numeric-lp text-[11px] w-5 shrink-0" style={{ color: "var(--lp-tertiary)" }}>0{i + 1}</span>
                    <div className="w-14 h-14 shrink-0 overflow-hidden" style={{ background: "var(--lp-soft)", borderRadius: 14 }}>
                      {img && <Image src={img.url} alt={p.name} width={56} height={56} className="object-cover w-full h-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium leading-tight line-clamp-2">{p.name}</p>
                      {vol && <p className="numeric-lp text-[12px] mt-0.5" style={{ color: "var(--lp-muted)" }}>{vol.retailPrice.toLocaleString("ru-RU")} ₽</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="flex items-baseline justify-between mt-5 pt-4" style={{ borderTop: "1px solid var(--lp-line-soft)" }}>
              <p className="eyebrow">Набор</p>
              <p className="numeric-lp text-[20px]">{starterTotal.toLocaleString("ru-RU")} ₽</p>
            </div>
          </div>
        )}

        <div className="anim-d3 space-y-2">
          <Link href="/routine" className="btn-lp block text-center">
            Мой ритуал ухода
          </Link>
          <Link href="/catalog" className="btn-lp ghost block text-center">
            Каталог
          </Link>
          <button
            onClick={() => { setResult(null); setAnswers({}); setCurrentIndex(0); }}
            className="block w-full text-center text-[13px] py-2 tap"
            style={{ color: "var(--lp-accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            Пройти заново
          </button>
        </div>
      </div>
    );
  }

  // ─── Quiz ─────────────────────────────────
  return (
    <div className="max-w-md mx-auto px-5 py-10">
      <div className="relative -mx-5 mb-6 overflow-hidden" style={{ borderRadius: "0 0 28px 28px" }}>
        <img src="/brand/collections/pearl-endorphin.jpg" alt=""
          className="w-full h-[160px] object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--lp-bg) 0%, transparent 50%)" }} />
      </div>
      <div className="text-center mb-8">
        <p className="eyebrow mb-3">Аюрведа</p>
        <h1 className="heading-lg mb-2">Доша-тест</h1>
        <p className="body-lp muted">Определи свой тип кожи</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] text-fg-secondary">{q.category}</span>
        <span className="text-[13px] text-fg-tertiary">{currentIndex + 1}/{questions.length}</span>
      </div>
      <div className="h-[3px] bg-fill rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-brand rounded-full transition-all duration-400" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Question */}
      <h2 className="heading-md text-center mb-6 leading-snug">{q.text}</h2>

      {/* Answers */}
      <div className="glass-card overflow-hidden">
        {q.answers.map((answer, i) => (
          <button
            key={answer.id}
            onClick={() => selectAnswer(answer)}
            className="w-full text-left px-4 py-3.5 text-[15px] leading-snug tap hover:bg-fill transition-colors"
            style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}
          >
            {answer.text}
          </button>
        ))}
      </div>

      {currentIndex > 0 && (
        <button
          onClick={() => setCurrentIndex(currentIndex - 1)}
          className="flex items-center gap-1 mx-auto mt-5 text-[15px] text-brand tap"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Назад
        </button>
      )}
    </div>
  );
}
