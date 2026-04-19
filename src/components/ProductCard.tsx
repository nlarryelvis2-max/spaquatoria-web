import Link from "next/link";
import Image from "next/image";
import { Product, DOSHA_COLORS } from "@/lib/types";
import { getProductScore } from "@/lib/data";

const GRADE_COLORS = { A: "#34C759", B: "#FF9500", C: "#FF3B30" };

export function ProductCard({ product, showScore = false }: { product: Product; showScore?: boolean }) {
  const mainImage = product.images.find((i) => i.isMain) || product.images[0];
  const price = product.volumes.find((v) => v.inStock) || product.volumes[0];
  const scoreData = showScore ? getProductScore(product.id) : null;

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
      </div>

      <div className="pt-2.5 pb-1">
        <h3 className="text-[13px] leading-tight line-clamp-2" style={{ color: "var(--lp-ink)", fontWeight: 400 }}>
          {product.name}
        </h3>
        {price && (
          <p className="numeric-lp text-[13px] mt-1" style={{ color: "var(--lp-muted)" }}>
            {price.retailPrice.toLocaleString("ru-RU")} ₽
          </p>
        )}
      </div>
    </Link>
  );
}
