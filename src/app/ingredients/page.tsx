"use client";

import { useState } from "react";
import { ingredients } from "@/lib/data";
import { CATEGORY_NAMES, PURPOSE_NAMES, IngredientCategory } from "@/lib/types";

const categories: IngredientCategory[] = ["marine", "botanical", "oil", "acid", "peptide", "vitamin", "enzyme"];

export default function IngredientsPage() {
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(["marine"]));

  const filtered = search
    ? ingredients.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase())
      )
    : ingredients;

  const grouped = categories
    .map(cat => ({ category: cat, items: filtered.filter(i => i.category === cat) }))
    .filter(g => g.items.length > 0);

  function toggleCat(cat: string) {
    setExpandedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-28">
      <div className="relative -mx-5 mb-8 overflow-hidden" style={{ borderRadius: "0 0 28px 28px" }}>
        <img src="/brand/hero/berry-glow.jpg" alt=""
          className="w-full h-[180px] object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--lp-bg) 0%, transparent 50%)" }} />
      </div>
      <p className="eyebrow mb-3">Состав и наука</p>
      <h1 className="heading-xl mb-3">Ингредиенты</h1>
      <p className="body-lp muted mb-6">База активных компонентов SPAquatoria</p>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск"
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-[15px] outline-none glass-card"
          style={{ border: "none" }}
        />
      </div>

      {/* Collapsible sections */}
      <div className="space-y-3">
        {grouped.map(({ category, items }) => {
          const isOpen = search || expandedCats.has(category);
          return (
            <div key={category}>
              <button
                onClick={() => !search && toggleCat(category)}
                className="flex items-center justify-between w-full py-2 tap"
              >
                <h2 className="heading-md">{CATEGORY_NAMES[category]}</h2>
                <div className="flex items-center gap-2">
                  <span className="numeric-lp text-[12px]" style={{ color: "var(--lp-muted)" }}>{items.length}</span>
                  {!search && (
                    <svg
                      className={`w-4 h-4 text-fg-tertiary transition-transform ${isOpen ? "rotate-90" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="glass-card overflow-hidden mt-1">
                  {items.map((ing, i) => (
                    <div key={ing.id} id={ing.id} className="px-4 py-3.5 scroll-mt-20"
                      style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}
                    >
                      <h3 className="text-[15px] font-semibold">{ing.name}</h3>
                      <p className="text-[13px] text-fg-secondary mt-0.5 leading-snug">{ing.description}</p>
                      {ing.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {ing.benefits.map(b => (
                            <span key={b} className="text-[10px] font-semibold px-2 py-[2px] rounded-full bg-brand-green/10 text-brand-green">
                              {PURPOSE_NAMES[b]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
