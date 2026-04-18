"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { addToCart, getCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

interface Props {
  product: Product;
}

export function ProductDetail({ product }: Props) {
  const inStockVolumes = product.volumes.filter((v) => v.inStock);
  const [selectedVolumeId, setSelectedVolumeId] = useState(
    inStockVolumes[0]?.id ?? product.volumes[0]?.id ?? ""
  );
  const [inCart, setInCart] = useState(false);

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
    window.addEventListener("cart-updated", check);
    return () => window.removeEventListener("cart-updated", check);
  }, [product.id, selectedVolumeId]);

  const selectedVolume = product.volumes.find((v) => v.id === selectedVolumeId);

  function handleAdd() {
    addToCart(product.id, selectedVolumeId);
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
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors tap ${
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

      {/* Price */}
      {selectedVolume && (
        <p className="text-[22px] font-bold text-brand mb-4">
          {selectedVolume.retailPrice.toLocaleString("ru-RU")} &#8381;
        </p>
      )}

      {/* Add to cart / In cart */}
      {inCart ? (
        <Link
          href="/cart"
          className="block text-center bg-brand/10 text-brand py-3 rounded-full text-[15px] font-semibold tap w-full"
        >
          &#10003; В корзине
        </Link>
      ) : (
        <button
          onClick={handleAdd}
          disabled={!selectedVolume?.inStock}
          className="block text-center bg-brand text-white py-3 rounded-full text-[15px] font-semibold tap w-full disabled:opacity-40"
        >
          В корзину
        </button>
      )}
    </div>
  );
}
