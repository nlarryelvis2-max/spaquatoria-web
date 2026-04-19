"use client";

import { useState } from "react";
import type { Product, DoshaType } from "@/lib/types";
import { DOSHA_NAMES } from "@/lib/types";
import { getProductScore } from "@/lib/data";

const NAMES = [
  "Анна К.", "Марина Д.", "Елена С.", "Ольга М.", "Наталья В.",
  "Ирина Б.", "Татьяна П.", "Светлана Г.", "Юлия Л.", "Дарья Н.",
  "Алиса Р.", "Виктория Ш.", "Екатерина Ф.", "Мария А.", "Полина Т.",
];

const AGES = [24, 28, 31, 34, 37, 40, 43, 46, 29, 33, 27, 35, 38, 42, 30];

const DOSHA_SKIN: Record<DoshaType, string> = {
  vata: "сухая кожа",
  pitta: "чувствительная кожа",
  kapha: "комбинированная кожа",
};

const TEMPLATES: Record<string, string[]> = {
  love: [
    "Пользуюсь уже месяц — кожа стала заметно лучше! Текстура приятная, впитывается быстро.",
    "Обожаю это средство! Результат видно уже через неделю. Аромат натуральный и ненавязчивый.",
    "Лучшее, что я пробовала в этой категории. Кожа мягкая и увлажнённая весь день.",
    "Заказала после рекомендации подруги и не пожалела. Теперь это must-have в моём ритуале.",
    "Очень довольна! Натуральный состав, нежная текстура, видимый результат.",
  ],
  good: [
    "Хорошее средство за свою цену. Кожа стала мягче. Буду заказывать ещё.",
    "Приятная текстура, расходуется экономно. Небольшой эффект заметен через 2 недели.",
    "Достойное качество. Использую в утреннем ритуале, хорошо ложится под макияж.",
    "Нравится состав — без химии. Аромат приятный. Увлажняет неплохо.",
  ],
};

function generateReviews(product: Product): {
  name: string; age: number; dosha: DoshaType; rating: number; text: string; date: string;
}[] {
  const { grade, score } = getProductScore(product.id);
  const seed = product.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const count = grade === "A" ? 5 : grade === "B" ? 3 : 2;
  const reviews: ReturnType<typeof generateReviews> = [];

  for (let i = 0; i < count; i++) {
    const idx = (seed + i * 7) % NAMES.length;
    const doshaIdx = (seed + i) % product.doshaAffinity.length;
    const dosha = product.doshaAffinity[doshaIdx] || "vata";
    const isLove = grade === "A" || (grade === "B" && i < 2);
    const templates = isLove ? TEMPLATES.love : TEMPLATES.good;
    const tIdx = (seed + i * 3) % templates.length;
    const rating = isLove ? 5 : (score > 60 ? 4 : 4);
    const daysAgo = (seed + i * 13) % 90 + 3;
    const date = new Date(Date.now() - daysAgo * 86400000);
    const dateStr = date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

    reviews.push({
      name: NAMES[idx],
      age: AGES[idx],
      dosha,
      rating,
      text: templates[tIdx],
      date: dateStr,
    });
  }

  return reviews;
}

function Stars({ count }: { count: number }) {
  return (
    <span className="text-[12px]" style={{ color: "#FFB800", letterSpacing: 1 }}>
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  );
}

export function ProductReviews({ product }: { product: Product }) {
  const [expanded, setExpanded] = useState(false);
  const reviews = generateReviews(product);
  if (reviews.length === 0) return null;

  const visible = expanded ? reviews : reviews.slice(0, 2);
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide">
          Отзывы · {reviews.length}
        </p>
        <div className="flex items-center gap-1.5">
          <Stars count={Math.round(Number(avgRating))} />
          <span className="text-[13px] font-semibold text-fg">{avgRating}</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {visible.map((r, i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ background: "var(--lp-accent)" }}>
                  {r.name[0]}
                </div>
                <div>
                  <p className="text-[13px] font-medium">{r.name}</p>
                  <p className="text-[11px] text-fg-tertiary">{r.age} лет · {DOSHA_NAMES[r.dosha]} · {DOSHA_SKIN[r.dosha]}</p>
                </div>
              </div>
              <span className="text-[11px] text-fg-tertiary">{r.date}</span>
            </div>
            <Stars count={r.rating} />
            <p className="text-[13px] text-fg-secondary leading-snug mt-1.5">{r.text}</p>
          </div>
        ))}
      </div>
      {reviews.length > 2 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-[13px] text-brand mt-2 tap"
        >
          Показать все отзывы ({reviews.length})
        </button>
      )}
    </div>
  );
}
