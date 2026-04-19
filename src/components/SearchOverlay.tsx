"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { products } from "@/lib/data";
import type { Product } from "@/lib/types";

const STORAGE_KEY = "spa-recent-searches";
const POPULAR = ["увлажнение", "anti-age", "для ваты", "сыворотка", "крем", "пилинг"];

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSearch(query: string) {
  const recent = getRecentSearches().filter(q => q !== query);
  recent.unshift(query);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, 8)));
}

function clearRecentSearches() {
  localStorage.removeItem(STORAGE_KEY);
}

interface Props {
  open: boolean;
  onClose: () => void;
}

function MiniResult({ product }: { product: Product }) {
  const img = product.images.find(i => i.isMain) || product.images[0];
  const vol = product.volumes.find(v => v.inStock) || product.volumes[0];
  return (
    <Link
      href={`/catalog/${product.id}`}
      className="flex items-center gap-3 px-4 py-3 tap"
      style={{ borderBottom: "0.5px solid var(--separator)" }}
    >
      <div className="w-12 h-12 rounded overflow-hidden shrink-0 relative" style={{ background: "var(--lp-soft)" }}>
        {img ? (
          <Image src={img.url} alt={product.name} fill sizes="48px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-brand text-lg text-fg-tertiary">S</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-fg truncate">{product.name}</p>
        <p className="text-[12px] text-fg-secondary truncate">{product.shortDescription}</p>
      </div>
      {vol && (
        <span className="text-[13px] font-semibold text-fg shrink-0">
          {vol.retailPrice.toLocaleString("ru-RU")} ₽
        </span>
      )}
    </Link>
  );
}

export function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [query]);

  function handleSelect(q: string) {
    setQuery(q);
    saveSearch(q);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) saveSearch(query.trim());
  }

  if (!open) return null;

  const showSuggestions = !query.trim();

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "0.5px solid var(--separator)" }}>
        <svg className="w-5 h-5 text-fg-tertiary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Поиск средств"
          className="flex-1 text-[16px] bg-transparent outline-none text-fg placeholder:text-fg-tertiary"
        />
        <button type="button" onClick={onClose} className="text-[15px] text-brand font-medium tap shrink-0">
          Отмена
        </button>
      </form>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showSuggestions ? (
          <div className="px-4 py-4">
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide">Недавние</p>
                  <button
                    onClick={() => { clearRecentSearches(); setRecentSearches([]); }}
                    className="text-[13px] text-brand tap"
                  >
                    Очистить
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map(q => (
                    <button
                      key={q}
                      onClick={() => handleSelect(q)}
                      className="px-3 py-1.5 rounded text-[13px] text-fg-secondary tap"
                      style={{ background: "var(--fill)" }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular */}
            <div>
              <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-2">Популярное</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSelect(q)}
                    className="px-3 py-1.5 rounded text-[13px] text-fg-secondary tap"
                    style={{ background: "var(--fill)" }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : results.length > 0 ? (
          <div>
            <p className="px-4 py-2 text-[12px] text-fg-tertiary">{results.length} результат{results.length > 4 ? "ов" : results.length > 1 ? "а" : ""}</p>
            {results.map(p => (
              <div key={p.id} onClick={onClose}>
                <MiniResult product={p} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[15px] text-fg-secondary">Ничего не найдено</p>
            <p className="text-[13px] text-fg-tertiary mt-1">Попробуйте другой запрос</p>
          </div>
        )}
      </div>
    </div>
  );
}
