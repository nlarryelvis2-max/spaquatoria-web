"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { addToCart, getCart } from "@/lib/cart";
import { toggleFavorite, getFavorites } from "@/lib/store";
import type { Product } from "@/lib/types";

const REPLENISH_INTERVALS = [
  { days: 30, label: "30 дней" },
  { days: 60, label: "60 дней" },
  { days: 90, label: "90 дней" },
];

interface Props {
  product: Product;
}

export function ProductDetail({ product }: Props) {
  const inStockVolumes = product.volumes.filter((v) => v.inStock);
  const [selectedVolumeId, setSelectedVolumeId] = useState(
    inStockVolumes[0]?.id ?? product.volumes[0]?.id ?? ""
  );
  const [inCart, setInCart] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [replenish, setReplenish] = useState(false);
  const [replenishInterval, setReplenishInterval] = useState(60);

  useEffect(() => {
    function check() {
      const cart = getCart();
      setInCart(
        cart.some(
          (i) =>
            i.productId === product.id && i.volumeId === selectedVolumeId
        )
      );
    }
    check();
    setIsFav(getFavorites().includes(product.id));
    window.addEventListener("cart-updated", check);
    return () => window.removeEventListener("cart-updated", check);
  }, [product.id, selectedVolumeId]);

  const selectedVolume = product.volumes.find((v) => v.id === selectedVolumeId);

  function handleAdd() {
    addToCart(product.id, selectedVolumeId);
  }

  function handleFav() {
    toggleFavorite(product.id);
    setIsFav(!isFav);
  }

  return (
    <div>
      {/* Volume selector */}
      {product.volumes.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {product.volumes.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVolumeId(v.id)}
              disabled={!v.inStock}
              className={`px-4 py-2 rounded text-[13px] font-semibold transition-colors tap ${
                v.id === selectedVolumeId
                  ? "bg-brand text-white"
                  : "glass-card text-fg"
              } ${!v.inStock ? "opacity-40" : ""}`}
            >
              {v.volume}
            </button>
          ))}
        </div>
      )}

      {/* Price + Favorite */}
      <div className="flex items-center justify-between mb-4">
        {selectedVolume && (
          <p className="text-[22px] font-bold text-brand">
            {selectedVolume.retailPrice.toLocaleString("ru-RU")} &#8381;
          </p>
        )}
        <button onClick={handleFav} className="tap p-2 -mr-2">
          <svg className="w-6 h-6" fill={isFav ? "currentColor" : "none"}
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
            style={{ color: isFav ? "#FF3B5C" : "var(--lp-muted)" }}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      {/* Auto-replenishment hint */}
      {selectedVolume && selectedVolume.inStock && (
        <div className="glass-card p-3.5 mb-4">
          <label className="flex items-start gap-3 cursor-pointer tap">
            <input
              type="checkbox"
              checked={replenish}
              onChange={() => setReplenish(!replenish)}
              className="mt-0.5 accent-[var(--brand)]"
              style={{ width: 16, height: 16 }}
            />
            <div className="flex-1">
              <p className="text-[13px] font-medium">
                Авто-пополнение — скидка 15%
              </p>
              <p className="text-[11px] text-fg-tertiary mt-0.5">
                Получайте каждые {replenishInterval} дней за {Math.round(selectedVolume.retailPrice * 0.85).toLocaleString("ru-RU")} ₽
              </p>
              {replenish && (
                <div className="flex gap-1.5 mt-2">
                  {REPLENISH_INTERVALS.map(opt => (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={(e) => { e.preventDefault(); setReplenishInterval(opt.days); }}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        replenishInterval === opt.days
                          ? "bg-brand text-white"
                          : "bg-fill text-fg-secondary"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </label>
        </div>
      )}

      {/* Sticky bottom bar */}
      <div className="fixed bottom-[72px] left-0 right-0 z-40 px-5 pb-2 pt-3"
        style={{ background: "linear-gradient(to top, var(--lp-bg) 80%, transparent)" }}>
        <div className="max-w-lg mx-auto">
          {inCart ? (
            <Link
              href="/cart"
              className="block text-center bg-brand/10 text-brand py-3 rounded text-[15px] font-semibold tap w-full"
            >
              &#10003; В корзине
            </Link>
          ) : (
            <button
              onClick={handleAdd}
              disabled={!selectedVolume?.inStock}
              className="block text-center bg-brand text-white py-3 rounded text-[15px] font-semibold tap w-full disabled:opacity-40"
            >
              В корзину{selectedVolume ? ` · ${selectedVolume.retailPrice.toLocaleString("ru-RU")} ₽` : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
