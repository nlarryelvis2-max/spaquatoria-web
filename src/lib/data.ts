import type {
  Product,
  Collection,
  Ingredient,
  FaceLine,
  CareRoutine,
  Dealer,
  DoshaType,
} from "./types";

import productsJson from "./products.json";
import collectionsJson from "./collections.json";
import ingredientsJson from "./ingredients.json";
import facelinesJson from "./facelines.json";
import routinesJson from "./routines.json";
import dealersJson from "./dealers.json";

// Fix image URLs: spaquatoria.ru requires size suffix (.750) before extension
function fixImageUrl(url: string): string {
  // Already has size suffix like .391.jpeg or .750.jpg
  if (/\.\d+\.(jpe?g|png|webp)$/i.test(url)) return url;
  // Add .750 before extension: /1016/1016.jpg → /1016/1016.750.jpg
  return url.replace(/\.(jpe?g|png|webp)$/i, ".750.$1");
}

function fixProductImages(product: Product): Product {
  return {
    ...product,
    images: product.images.map((img) => ({ ...img, url: fixImageUrl(img.url) })),
  };
}

export const products: Product[] = (productsJson as Product[]).map(fixProductImages);
export const collections: Collection[] = collectionsJson as Collection[];
export const ingredients: Ingredient[] = ingredientsJson as Ingredient[];
export const faceLines: FaceLine[] = facelinesJson as FaceLine[];
export const routines: CareRoutine[] = routinesJson as CareRoutine[];
export const dealers: Dealer[] = dealersJson as Dealer[];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsForCollection(collectionId: string): Product[] {
  return products.filter((p) => p.collectionId === collectionId);
}

export function getIngredient(id: string): Ingredient | undefined {
  return ingredients.find((i) => i.id === id);
}

export function getFaceLine(id: string): FaceLine | undefined {
  return faceLines.find((l) => l.id === id);
}

// A1: Complementary products — products that share zone/purpose with owned but user doesn't have
export function getComplementaryProducts(ownedIds: string[]): Product[] {
  if (ownedIds.length === 0) return [];
  const ownedSet = new Set(ownedIds);
  const ownedProducts = ownedIds.map(id => getProduct(id)).filter(Boolean) as Product[];
  const zones = new Set(ownedProducts.map(p => p.bodyZone));
  const purposes = new Set(ownedProducts.flatMap(p => p.purposes));

  return products
    .filter(p => !ownedSet.has(p.id) && p.images.length > 0)
    .map(p => {
      const zoneMatch = zones.has(p.bodyZone) ? 1 : 0;
      const purposeOverlap = p.purposes.filter(pur => purposes.has(pur)).length;
      return { product: p, score: zoneMatch + purposeOverlap };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(x => x.product);
}

// A2: Ingredient-based product quality score (Yuka-style)
export function getProductScore(productId: string): { score: number; grade: "A" | "B" | "C" } {
  const product = getProduct(productId);
  if (!product) return { score: 0, grade: "C" };

  // Find matching ingredients by checking product's ingredients text
  const matchedIngredients = ingredients.filter(ing =>
    product.ingredients.toLowerCase().includes(ing.name.toLowerCase().split(" ")[0].toLowerCase())
  );

  if (matchedIngredients.length === 0) {
    // Fallback: products with more purposes tend to be higher quality
    const baseScore = Math.min(95, 75 + product.purposes.length * 5);
    return { score: baseScore, grade: baseScore >= 90 ? "A" : baseScore >= 75 ? "B" : "C" };
  }

  const avg = matchedIngredients.reduce((sum, ing) => sum + ing.safetyScore, 0) / matchedIngredients.length;
  const bonus = Math.min(10, matchedIngredients.length * 2); // more active ingredients = bonus
  const score = Math.min(100, Math.round(avg + bonus));
  const grade = score >= 90 ? "A" : score >= 75 ? "B" : "C" as const;
  return { score, grade };
}

/**
 * Given dosha imbalances, recommend products that help restore balance.
 * If a dosha is elevated (positive delta), products with that dosha in doshaAffinity
 * are designed to BALANCE it — so we recommend those.
 *
 * Scoring: matching purposes count + zone priority (face > body > hair)
 * Returns top 8 products, diversified across collections.
 */
export function getBalancingProducts(imbalances: { dosha: string; delta: number }[]): Product[] {
  // Find the most imbalanced dosha (highest positive delta)
  const elevated = imbalances
    .filter(x => x.delta > 0)
    .sort((a, b) => b.delta - a.delta);

  if (elevated.length === 0) return [];

  const targetDosha = elevated[0].dosha as DoshaType;

  // Balancing purposes by dosha
  const balancingPurposes: Record<DoshaType, string[]> = {
    vata: ["moisturizing", "nourishing", "relaxation"],
    pitta: ["moisturizing", "cleansing", "sunProtection"],
    kapha: ["detox", "cleansing", "lifting", "antiCellulite"],
  };

  const zonePriority: Record<string, number> = { face: 3, body: 2, hands: 1, feet: 1, hair: 1 };
  const desiredPurposes = new Set(balancingPurposes[targetDosha] || []);

  const scored = products
    .filter(p => p.doshaAffinity.includes(targetDosha) && p.images.length > 0)
    .map(p => {
      const purposeScore = p.purposes.filter(pur => desiredPurposes.has(pur)).length;
      const zoneScore = zonePriority[p.bodyZone] || 1;
      return { product: p, score: purposeScore * 2 + zoneScore };
    })
    .sort((a, b) => b.score - a.score);

  // Diversify across collections: max 2 per collection
  const result: Product[] = [];
  const collectionCount: Record<string, number> = {};

  for (const { product } of scored) {
    if (result.length >= 8) break;
    const cc = collectionCount[product.collectionId] || 0;
    if (cc >= 2) continue;
    collectionCount[product.collectionId] = cc + 1;
    result.push(product);
  }

  return result;
}

/**
 * Returns advice for the most imbalanced dosha.
 * Level: delta < 10 mild, < 20 moderate, >= 20 strong.
 * (delta values from getImbalance are already multiplied by 100)
 */
export function getImbalanceAdvice(imbalances: { dosha: string; delta: number }[]): {
  dosha: DoshaType;
  level: "mild" | "moderate" | "strong";
  title: string;
  description: string;
  tips: string[];
} | null {
  const elevated = imbalances
    .filter(x => x.delta > 0)
    .sort((a, b) => b.delta - a.delta);

  if (elevated.length === 0) return null;

  const { dosha, delta } = elevated[0];
  const absDelta = Math.abs(delta);
  const level: "mild" | "moderate" | "strong" = absDelta < 10 ? "mild" : absDelta < 20 ? "moderate" : "strong";

  const advice: Record<DoshaType, { title: string; description: string; tips: string[] }> = {
    vata: {
      title: "Увлажнение и питание",
      description: "Кожа сухая и обезвоженная, нуждается в маслах и плотных текстурах. Избегайте ветра и холода.",
      tips: [
        "Используйте тёплое масло для массажа лица и тела",
        "Избегайте ветра и сухого воздуха — увлажняйте помещение",
        "Добавьте в рацион тёплую, маслянистую пищу и орехи",
      ],
    },
    pitta: {
      title: "Охлаждение и успокоение",
      description: "Кожа склонна к воспалениям и покраснениям. Нужны охлаждающие, успокаивающие средства.",
      tips: [
        "Выбирайте прохладные средства с алоэ и огурцом",
        "Избегайте прямого солнца и агрессивных пилингов",
        "Ешьте больше свежих овощей и зелени, избегайте острого",
      ],
    },
    kapha: {
      title: "Очищение и стимуляция",
      description: "Кожа жирная и склонная к застою. Нужны лёгкие текстуры и активные компоненты.",
      tips: [
        "Используйте лёгкие гелевые текстуры вместо плотных кремов",
        "Делайте пилинги и детокс-маски 2 раза в неделю",
        "Добавьте в рацион специи и лёгкую пищу, стимулирующую метаболизм",
      ],
    },
  };

  const d = dosha as DoshaType;
  return {
    dosha: d,
    level,
    ...(advice[d] || advice.vata),
  };
}
