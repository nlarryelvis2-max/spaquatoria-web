"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { PURPOSE_NAMES } from "@/lib/types";

interface Props {
  product: Product;
}

function generateFAQ(product: Product): { q: string; a: string }[] {
  const faq: { q: string; a: string }[] = [];
  const name = product.name.toLowerCase();

  // Sensitive skin
  if (product.doshaAffinity.includes("pitta") || product.doshaAffinity.includes("vata")) {
    faq.push({
      q: "Подходит ли для чувствительной кожи?",
      a: `Да, ${product.name} разработан с учётом потребностей ${product.doshaAffinity.includes("vata") ? "Вата" : "Питта"}-типа кожи и подходит для чувствительной кожи. Формула без парабенов, SLS и синтетических отдушек.`,
    });
  }

  // How often
  if (name.includes("маск")) {
    faq.push({ q: "Как часто использовать?", a: "Рекомендуем использовать маску 1-2 раза в неделю для интенсивного ухода." });
  } else if (name.includes("пилинг") || name.includes("скраб")) {
    faq.push({ q: "Как часто использовать?", a: "Рекомендуем использовать 1-2 раза в неделю. Не чаще — чтобы не повредить защитный барьер кожи." });
  } else if (name.includes("сыворот") || name.includes("серум")) {
    faq.push({ q: "Как часто использовать?", a: "Ежедневно, утром и/или вечером, после очищения и тонизирования, перед кремом." });
  } else if (name.includes("крем")) {
    faq.push({ q: "Как часто использовать?", a: "Ежедневно, утром и/или вечером, как финальный шаг ухода." });
  } else {
    faq.push({ q: "Как часто использовать?", a: "Следуйте рекомендациям на упаковке или проконсультируйтесь с косметологом." });
  }

  // Purposes
  if (product.purposes.length > 0) {
    const purposeList = product.purposes.map(p => PURPOSE_NAMES[p]).join(", ").toLowerCase();
    faq.push({
      q: "Для каких задач подходит это средство?",
      a: `Основное назначение: ${purposeList}. Выбирайте средства, которые соответствуют вашим задачам по уходу.`,
    });
  }

  // Storage
  faq.push({
    q: "Как хранить?",
    a: "Храните при комнатной температуре, в сухом месте, вдали от прямых солнечных лучей. После вскрытия используйте в течение 12 месяцев.",
  });

  return faq.slice(0, 4);
}

export function ProductFAQ({ product }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const faq = generateFAQ(product);

  if (faq.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-3">Частые вопросы</p>
      <div className="glass-card overflow-hidden">
        {faq.map((item, i) => (
          <div key={i} style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full text-left px-4 py-3 flex items-start gap-3 tap"
            >
              <span className="text-[14px] font-medium flex-1 leading-snug">{item.q}</span>
              <span className={`text-[14px] shrink-0 font-light transition-transform ${openIdx === i ? "rotate-45" : ""}`}
                style={{ color: "var(--lp-muted)" }}>
                +
              </span>
            </button>
            {openIdx === i && (
              <div className="px-4 pb-3">
                <p className="text-[13px] text-fg-secondary leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
