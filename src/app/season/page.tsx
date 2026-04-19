"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RITUCHARYA, getCurrentSeason } from "@/lib/content";
import { products } from "@/lib/data";
import { addToCart } from "@/lib/cart";
import { DOSHA_NAMES, DOSHA_COLORS } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

export default function SeasonPage() {
  const [seasonAdded, setSeasonAdded] = useState(false);
  const current = getCurrentSeason();
  const currentIdx = RITUCHARYA.findIndex(s => s.name === current.name);

  const seasonProducts = products
    .filter(p => p.bodyZone === "face" && p.doshaAffinity.includes(current.dosha) && p.images.length > 0)
    .slice(0, 6);

  const seasonTotal = seasonProducts.reduce((sum, p) => {
    const vol = p.volumes.find(v => v.inStock) || p.volumes[0];
    return sum + (vol ? vol.retailPrice : 0);
  }, 0);

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-28">
      <p className="eyebrow mb-3">Ритучарья</p>
      <h1 className="heading-xl mb-3">Сейчас {current.nameEn.toLowerCase()}</h1>
      <p className="body-lp muted mb-6">Аюрведа делит год на шесть сезонов. Каждый меняет состояние кожи и требует своего ритуала.</p>

      {/* Brand hero image */}
      <div className="relative -mx-5 mb-8 overflow-hidden h-[180px]" style={{ borderRadius: "0 0 8px 8px" }}>
        <Image src="/brand/hero/massage.jpg" alt="Массаж — SPAquatoria"
          fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--lp-bg) 0%, transparent 50%)" }} />
      </div>

      {/* Current season hero */}
      <div className="paper-card mb-6" style={{ padding: 24, background: `linear-gradient(180deg, ${current.color}0F 0%, var(--lp-paper) 60%)` }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="eyebrow" style={{ color: current.color }}>{current.period}</p>
            <p className="heading-lg mt-1">{current.name}</p>
            <p className="body-lp muted mt-1">{current.nameEn}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="eyebrow">Доминанта</p>
            <p className="numeric-lp text-[14px] mt-1" style={{ color: DOSHA_COLORS[current.dosha] }}>
              {DOSHA_NAMES[current.dosha]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--lp-muted)" }}>
          <span>{current.element}</span>
        </div>
      </div>

      {/* Three tips */}
      <div className="space-y-3 mb-8">
        {[
          { label: "Кожа", text: current.skinTip },
          { label: "Ритуал", text: current.ritualTip },
          { label: "Питание", text: current.foodTip },
        ].map(tip => (
          <div key={tip.label} className="paper-card" style={{ padding: 18 }}>
            <p className="eyebrow mb-2">{tip.label}</p>
            <p className="body-lp">{tip.text}</p>
          </div>
        ))}
      </div>

      {/* Products for the season */}
      {seasonProducts.length > 0 && (
        <div className="mb-10">
          <p className="eyebrow mb-2">Для {current.nameEn.toLowerCase()}</p>
          <h2 className="heading-md mb-5">Средства под сезонную дошу</h2>
          <div className="grid grid-cols-2 gap-3">
            {seasonProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          {seasonProducts.length >= 3 && (
            <button
              onClick={() => {
                for (const p of seasonProducts.slice(0, 3)) {
                  const vol = p.volumes.find(v => v.inStock) || p.volumes[0];
                  if (vol) addToCart(p.id, vol.id);
                }
                setSeasonAdded(true);
              }}
              disabled={seasonAdded}
              className="btn-lp w-full mt-4 disabled:opacity-60"
            >
              {seasonAdded ? "Набор в корзине" : `Собрать сезонный набор · ${seasonTotal.toLocaleString("ru-RU")} ₽`}
            </button>
          )}
        </div>
      )}

      {/* CTA to routine */}
      <div className="paper-card mb-10" style={{ padding: 20 }}>
        <p className="eyebrow mb-2">Ежедневный уход</p>
        <p className="body-lp mb-4">Ваш ритуал уже учитывает текущий сезон. Откройте пошаговый уход для утра и вечера.</p>
        <Link href="/routine" className="btn-lp ghost w-full">Мой ритуал</Link>
      </div>

      {/* All six seasons timeline */}
      <p className="eyebrow mb-3">Шесть сезонов</p>
      <h2 className="heading-md mb-5">Годовой цикл</h2>
      <div className="paper-card" style={{ padding: 0, overflow: "hidden" }}>
        {RITUCHARYA.map((s, i) => {
          const isCurrent = i === currentIdx;
          return (
            <div
              key={s.name}
              className="flex items-center gap-4 px-5 py-4"
              style={{
                borderTop: i > 0 ? "1px solid var(--lp-line-soft)" : undefined,
                background: isCurrent ? `${s.color}0A` : "transparent",
              }}
            >
              <div
                className="w-11 h-11 flex items-center justify-center shrink-0 rounded-full"
                style={{ background: `${s.color}18`, border: isCurrent ? `1px solid ${s.color}` : "none" }}
              >
                <span className="numeric-lp text-[11px]" style={{ color: s.color, letterSpacing: "0.06em" }}>
                  0{i + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium" style={{ color: "var(--lp-ink)", letterSpacing: "0.02em" }}>
                  {s.name} {isCurrent && <span className="eyebrow ml-2" style={{ color: s.color }}>сейчас</span>}
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--lp-muted)" }}>
                  {s.nameEn} · {s.period}
                </p>
              </div>
              <span className="numeric-lp text-[11px] shrink-0" style={{ color: DOSHA_COLORS[s.dosha], letterSpacing: "0.06em" }}>
                {DOSHA_NAMES[s.dosha].toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
