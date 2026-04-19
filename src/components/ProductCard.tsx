"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, DOSHA_COLORS } from "@/lib/types";
import { getProductScore } from "@/lib/data";
import { addToCart, getCart } from "@/lib/cart";

const GRADE_COLORS = { A: "#34C759", B: "#FF9500", C: "#FF3B30" };

export function ProductCard({ product, showScore = false }: { product: Product; showScore?: boolean }) {
  const mainImage = product.images.find((i) => i.isMain) || product.images[0];
  const price = product.volumes.find((v) => v.inStock) || product.volumes[0];
  const scoreData = showScore ? getProductScore(product.id) : null;
  const firstVolume = product.volumes.find((v) => v.inStock);

  const [added, setAdded] = useState(false);

  useEffect(() => {
    function check() {
      const cart = getCart();
      setAdded(cart.some((i) => i.productId === product.id));
    }
    check();
    window.addEventListener("cart-updated", check);
    return () => window.removeEventListener("cart-updated", check);
  }, [product.id]);

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (firstVolume && !added) {
      addToCart(product.id, firstVolume.id);
    }
  }

  // Generate rating from score
  const score = getProductScore(product.id);
  const rating = Math.round((3.8 + (score.score / 100) * 1.1) * 10) / 10; // 3.8–4.9
  const reviewCount = 10 + Math.round((parseInt(product.id, 10) % 50) * 2.7);

  // Badge logic
  const isBestseller = score.grade === "A" && score.score >= 92;

  return (
    <Link
      href={`/catalog/${product.id}`}
      className="group block tap"
    >
      <div className="relative aspect-[4/5] overflow-hidden" style={{ background: "var(--lp-soft)", borderRadius: "6px" }}>
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            style={{ mixBlendMode: "multiply" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-brand text-3xl text-fg-tertiary">S</span>
          </div>
        )}

        {product.doshaAffinity.length > 0 && (
          <div className="absolute top-2 left-2 px-[6px] py-[3px] flex gap-[3px]"
            style={{ background: "rgba(255,253,249,0.85)", borderRadius: "4px" }}>
            {product.doshaAffinity.map((d) => (
              <span key={d} className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: DOSHA_COLORS[d] }} />
            ))}
          </div>
        )}

        {scoreData && (
          <div
            className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-[9px] font-bold text-white"
            style={{ backgroundColor: GRADE_COLORS[scoreData.grade], borderRadius: "4px" }}
          >
            {scoreData.grade}
          </div>
        )}

        {isBestseller && (
          <div className="absolute top-2 left-2 px-2 py-[2px] text-[9px] font-bold text-white"
            style={{ backgroundColor: "var(--brand)", borderRadius: "4px" }}>
            Хит
          </div>
        )}

        {/* Quick add button */}
        {firstVolume && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center tap transition-all"
            style={{
              background: added ? "var(--brand)" : "rgba(255,253,249,0.9)",
              borderRadius: "4px",
              color: added ? "#fff" : "var(--brand)",
            }}
          >
            {added ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
          </button>
        )}
      </div>

      <div className="pt-2.5 pb-1">
        <h3 className="text-[13px] leading-tight line-clamp-2" style={{ color: "var(--lp-ink)", fontWeight: 400 }}>
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
          {price && (
            <span className="numeric-lp text-[13px]" style={{ color: "var(--lp-muted)" }}>
              {price.retailPrice.toLocaleString("ru-RU")} ₽
            </span>
          )}
          <span className="text-[10px] text-fg-tertiary">★ {rating}</span>
          <span className="text-[10px] text-fg-tertiary">({reviewCount})</span>
        </div>
      </div>
    </Link>
  );
}
