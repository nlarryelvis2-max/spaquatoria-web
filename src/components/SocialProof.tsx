"use client";

import { useState, useEffect } from "react";
import { getProductScore } from "@/lib/data";

export function SocialProof({ productId }: { productId: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const { grade, score } = getProductScore(productId);
    const seed = productId.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    const base = grade === "A" ? 15 : grade === "B" ? 5 : 2;
    const variance = (seed % 10) + 1;
    setCount(base + variance);
  }, [productId]);

  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2 py-2">
      <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#34C759" }} />
      <p className="text-[12px] text-fg-tertiary">
        {count} {count > 20 ? "человек смотрят" : count > 4 ? "человек смотрят" : "человека смотрят"} прямо сейчас
      </p>
    </div>
  );
}
