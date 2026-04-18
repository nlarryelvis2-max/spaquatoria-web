// Product
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  collectionId: string;
  categoryId: string;
  images: ProductImage[];
  volumes: ProductVolume[];
  ingredients: string;
  doshaAffinity: DoshaType[];
  bodyZone: BodyZone;
  purposes: Purpose[];
  isProfessional: boolean;
  rating: number | null;
  reviewCount: number;
}

export interface ProductImage {
  url: string;
  isMain: boolean;
}

export interface ProductVolume {
  id: string;
  volume: string;
  retailPrice: number;
  wholesalePrice: number | null;
  sku: string;
  inStock: boolean;
}

export type DoshaType = "vata" | "pitta" | "kapha";
export type BodyZone = "face" | "body" | "hair" | "hands" | "feet";
export type Purpose =
  | "moisturizing"
  | "antiAge"
  | "detox"
  | "antiCellulite"
  | "lifting"
  | "relaxation"
  | "nourishing"
  | "sunProtection"
  | "cleansing";

export type IngredientCategory =
  | "marine"
  | "botanical"
  | "oil"
  | "acid"
  | "peptide"
  | "vitamin"
  | "enzyme";

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  description: string;
  benefits: Purpose[];
  faceLines: string[];
  safetyScore: number; // 0-100 Yuka-style quality rating
}

// Vikriti — current state (same structure as Prakriti/DoshaProfile)
export type VikritiProfile = DoshaProfile;

export interface FaceLine {
  id: string;
  name: string;
  ageRange: string;
  tagline: string;
  philosophy: string;
  indications: string[];
  keyIngredientIds: string[];
  color: string;
  iconName: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  doshaFocus: DoshaType | null;
}

export interface CareRoutine {
  id: string;
  dosha: DoshaType;
  ageGroup: AgeGroup;
  zone: BodyZone;
  steps: CareStep[];
}

export interface CareStep {
  order: number;
  timeOfDay: "morning" | "evening";
  type: StepType;
  title: string;
  description: string;
  productId: string;
}

export type StepType =
  | "cleansing"
  | "toner"
  | "serum"
  | "cream"
  | "eyeCream"
  | "mask"
  | "exfoliation";

export type AgeGroup = "young" | "active" | "mature" | "premium";

export interface Dealer {
  id: string;
  companyName: string;
  city: string;
  address: string;
  phones: string[];
  email: string;
  website: string;
  latitude: number;
  longitude: number;
  contactPerson: string | null;
}

export interface DoshaProfile {
  vata: number;
  pitta: number;
  kapha: number;
}

// Display helpers
export const DOSHA_NAMES: Record<DoshaType, string> = {
  vata: "Вата",
  pitta: "Питта",
  kapha: "Капха",
};

export const DOSHA_SUBTITLES: Record<DoshaType, string> = {
  vata: "Воздух + Эфир",
  pitta: "Огонь + Вода",
  kapha: "Земля + Вода",
};

export const DOSHA_SKIN: Record<DoshaType, string> = {
  vata: "Сухая, тонкая, склонная к шелушению кожа. Нуждается в глубоком увлажнении и питании.",
  pitta:
    "Чувствительная, склонная к воспалениям и покраснениям. Нуждается в успокоении и защите.",
  kapha:
    "Жирная, плотная, склонная к расширенным порам. Нуждается в детоксе и тонизировании.",
};

export const DOSHA_COLORS: Record<DoshaType, string> = {
  vata: "#7EC8E3",
  pitta: "#FF8B5E",
  kapha: "#5EBB6E",
};

export const ZONE_NAMES: Record<BodyZone, string> = {
  face: "Лицо",
  body: "Тело",
  hair: "Волосы",
  hands: "Руки",
  feet: "Ноги",
};

export const PURPOSE_NAMES: Record<Purpose, string> = {
  moisturizing: "Увлажнение",
  antiAge: "Anti-age",
  detox: "Детокс",
  antiCellulite: "Антицеллюлит",
  lifting: "Лифтинг",
  relaxation: "Релаксация",
  nourishing: "Питание",
  sunProtection: "SPF защита",
  cleansing: "Очищение",
};

export const CATEGORY_NAMES: Record<IngredientCategory, string> = {
  marine: "Морские",
  botanical: "Растительные",
  oil: "Масла",
  acid: "Кислоты",
  peptide: "Пептиды",
  vitamin: "Витамины",
  enzyme: "Ферменты",
};

export const STEP_NAMES: Record<StepType, string> = {
  cleansing: "Очищение",
  toner: "Тоник",
  serum: "Сыворотка",
  cream: "Крем",
  eyeCream: "Крем для век",
  mask: "Маска",
  exfoliation: "Пилинг",
};

export const AGE_NAMES: Record<AgeGroup, string> = {
  young: "18–24",
  active: "25–34",
  mature: "35–44",
  premium: "45+",
};

export const AGE_SUBTITLES: Record<AgeGroup, string> = {
  young: "Базовый уход",
  active: "Pearl Endorphin",
  mature: "Grand Cru Elixir",
  premium: "Swan Grace",
};

export function getDominantDosha(profile: DoshaProfile): DoshaType {
  if (profile.vata >= profile.pitta && profile.vata >= profile.kapha)
    return "vata";
  if (profile.pitta >= profile.vata && profile.pitta >= profile.kapha)
    return "pitta";
  return "kapha";
}
