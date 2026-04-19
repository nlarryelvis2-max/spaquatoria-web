"use client";

import { useState, useEffect } from "react";
import { getCartTotal } from "@/lib/cart";

const FREE_SHIPPING_THRESHOLD = 3000;

export function ShippingProgress() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    function refresh() {
      setTotal(getCartTotal());
    }
    refresh();
    window.addEventListener("cart-updated", refresh);
    return () => window.removeEventListener("cart-updated", refresh);
  }, []);

  if (total === 0) return null;

  const remaining = FREE_SHIPPING_THRESHOLD - total;
  const progress = Math.min(total / FREE_SHIPPING_THRESHOLD, 1);

  return (
    <div className="glass-card p-3 mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[12px] font-medium" style={{ color: "var(--lp-muted)" }}>
          {remaining > 0
            ? `До бесплатной доставки — ${remaining.toLocaleString("ru-RU")} ₽`
            : "Бесплатная доставка ✓"}
        </p>
        <p className="numeric-lp text-[11px]" style={{ color: remaining > 0 ? "var(--lp-tertiary)" : "#34C759" }}>
          {total.toLocaleString("ru-RU")} / {FREE_SHIPPING_THRESHOLD.toLocaleString("ru-RU")} ₽
        </p>
      </div>
      <div className="h-[4px] rounded-full overflow-hidden" style={{ background: "var(--lp-soft)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress * 100}%`,
            background: remaining > 0 ? "var(--lp-accent)" : "#34C759",
          }}
        />
      </div>
    </div>
  );
}
