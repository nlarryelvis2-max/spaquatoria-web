import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { products, ingredients, getProductsForCollection, getProductScore } from "@/lib/data";
import { DOSHA_NAMES, DOSHA_COLORS, PURPOSE_NAMES, CATEGORY_NAMES } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetail } from "@/components/ProductDetail";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  const mainImage = product.images.find((i) => i.isMain) || product.images[0];
  const activeIngredients = ingredients.filter((i) => i.faceLines.includes(product.collectionId));
  const relatedProducts = getProductsForCollection(product.collectionId)
    .filter((p) => p.id !== product.id).slice(0, 4);
  const productScore = getProductScore(product.id);
  const gradeColors = { A: "#34C759", B: "#FF9500", C: "#FF3B30" };
  const gradeLabels = { A: "Отлично", B: "Хорошо", C: "Базовый" };

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      <div className="space-y-6">
        {/* Image */}
        <div className="aspect-square rounded-3xl overflow-hidden relative glass-card">
          {mainImage ? (
            <Image src={mainImage.url} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-fill">
              <span className="font-brand text-5xl text-fg-tertiary">S</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {/* Dosha */}
          {product.doshaAffinity.length > 0 && (
            <div className="flex gap-1.5 mb-2">
              {product.doshaAffinity.map(d => (
                <span key={d} className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full"
                  style={{ backgroundColor: DOSHA_COLORS[d] + "15", color: DOSHA_COLORS[d] }}>
                  {DOSHA_NAMES[d]}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-[22px] font-bold text-fg leading-tight mb-2">{product.name}</h1>
          <p className="text-[15px] text-fg-secondary leading-relaxed mb-5">{product.shortDescription}</p>

          {/* Purposes */}
          {product.purposes.length > 0 && (
            <div className="mb-5">
              <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-2">Назначение</p>
              <div className="flex flex-wrap gap-1">
                {product.purposes.map(p => (
                  <span key={p} className="text-[11px] font-medium px-2.5 py-[3px] rounded-full bg-brand-green/10 text-brand-green">
                    {PURPOSE_NAMES[p]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ingredient score card */}
          <div className="glass-card p-4 mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide">Оценка состава</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white"
                  style={{ backgroundColor: gradeColors[productScore.grade] }}>
                  {productScore.grade}
                </div>
                <div>
                  <p className="text-[17px] font-bold" style={{ color: gradeColors[productScore.grade] }}>
                    {productScore.score}/100
                  </p>
                  <p className="text-[11px] text-fg-secondary">{gradeLabels[productScore.grade]}</p>
                </div>
              </div>
            </div>
            <div className="h-[6px] bg-fill rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${productScore.score}%`,
                backgroundColor: gradeColors[productScore.grade],
              }} />
            </div>
            {activeIngredients.length > 0 && (
              <p className="text-[12px] text-fg-tertiary mt-2">
                {activeIngredients.length} активных ингредиентов · средний рейтинг {Math.round(activeIngredients.reduce((s, i) => s + i.safetyScore, 0) / activeIngredients.length)}
              </p>
            )}
          </div>

          <ProductDetail product={product} />
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-8 glass-card p-5">
          <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-2">Описание</p>
          <p className="text-[15px] text-fg-secondary leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* Active ingredients */}
      {activeIngredients.length > 0 && (
        <div className="mt-6">
          <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-3">Ингредиенты</p>
          <div className="glass-card overflow-hidden">
            {activeIngredients.slice(0, 5).map((ing, i) => (
              <Link key={ing.id} href={`/ingredients#${ing.id}`}
                className="flex items-center justify-between px-4 py-3 tap"
                style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}
              >
                <div>
                  <p className="text-[15px] font-medium">{ing.name}</p>
                  <p className="text-[13px] text-fg-secondary line-clamp-1">{ing.description}</p>
                </div>
                <svg className="w-4 h-4 text-fg-tertiary shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* INCI */}
      {product.ingredients && (
        <div className="mt-6">
          <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-2">Состав</p>
          <p className="text-[12px] text-fg-tertiary leading-relaxed">{product.ingredients}</p>
        </div>
      )}

      {/* Related */}
      {relatedProducts.length > 0 && (
        <div className="mt-8">
          <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-3">Из коллекции</p>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
            {relatedProducts.map(p => (
              <div key={p.id} className="shrink-0 w-[150px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
