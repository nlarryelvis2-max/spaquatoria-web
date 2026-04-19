import { notFound } from "next/navigation";
import Link from "next/link";
import { faceLines, ingredients, getProductsForCollection } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";

export function generateStaticParams() {
  return faceLines.map((l) => ({ id: l.id }));
}

export default async function FaceLinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const line = faceLines.find((l) => l.id === id);
  if (!line) notFound();

  const keyIngredients = line.keyIngredientIds
    .map((iid) => ingredients.find((i) => i.id === iid))
    .filter(Boolean);
  const lineProducts = getProductsForCollection(line.id);

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      {/* Hero image */}
      <div className="relative -mx-5 mb-8 overflow-hidden" style={{ borderRadius: "0 0 8px 8px" }}>
        <img src={`/about/lines/${line.id}.jpg`} alt={line.name}
          className="w-full h-[200px] object-cover" style={{ objectPosition: "top" }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, var(--lp-bg) 0%, transparent 50%)` }} />
        <div className="absolute bottom-4 left-5">
          <span className="eyebrow" style={{ color: "rgba(255,255,255,0.8)" }}>Линия для лица</span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-[28px] font-bold tracking-wide mb-1" style={{ color: `#${line.color}` }}>
          {line.name}
        </h1>
        <p className="text-[22px] font-bold opacity-20 mb-3" style={{ color: `#${line.color}` }}>
          {line.ageRange}
        </p>
        <p className="text-[15px] text-fg-secondary leading-relaxed max-w-md mx-auto">{line.tagline}</p>
      </div>

      {/* Philosophy */}
      <div className="glass-card p-5 mb-5">
        <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-2">Философия</p>
        <p className="text-[15px] text-fg-secondary leading-relaxed">{line.philosophy}</p>
      </div>

      {/* Key ingredients */}
      {keyIngredients.length > 0 && (
        <div className="mb-5">
          <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-3">Ключевые ингредиенты</p>
          <div className="glass-card overflow-hidden">
            {keyIngredients.map((ing, i) => (
              <Link key={ing!.id} href={`/ingredients#${ing!.id}`}
                className="flex items-center gap-3.5 px-4 py-3.5 tap"
                style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `#${line.color}12` }}
                >
                  <svg className="w-4 h-4" style={{ color: `#${line.color}` }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium">{ing!.name}</p>
                  <p className="text-[13px] text-fg-secondary line-clamp-1">{ing!.description}</p>
                </div>
                <svg className="w-4 h-4 text-fg-tertiary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Indications */}
      <div className="mb-5">
        <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-3">Показания</p>
        <div className="glass-card overflow-hidden">
          {line.indications.map((ind, i) => (
            <div key={ind} className="flex items-center gap-3 px-4 py-3"
              style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke={`#${line.color}`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[15px] text-fg-secondary">{ind}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Products */}
      {lineProducts.length > 0 && (
        <div className="mt-6">
          <div className="relative -mx-5 mb-4 overflow-hidden rounded-lg mx-0">
            <img src={`/brand/collections/${line.id}.jpg`} alt={`${line.name} коллекция`}
              className="w-full h-[120px] object-cover rounded-lg" style={{ objectPosition: "top" }} />
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide">Средства линии</p>
            <span className="text-[13px] font-semibold" style={{ color: `#${line.color}` }}>
              {lineProducts.length}
            </span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
            {lineProducts.map((product) => (
              <div key={product.id} className="shrink-0 w-[150px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
