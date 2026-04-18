"use client";

import { DoshaProfile, AgeGroup } from "./types";

const PROFILE_KEY = "doshaProfile";
const AGE_KEY = "ageGroup";
const FAVORITES_KEY = "favorites";
const OWNED_KEY = "owned";
const ONBOARDING_KEY = "hasCompletedOnboarding";
const NAME_KEY = "userName";
const ACCOUNT_KEY = "userAccount";

export interface UserAccount {
  name: string;
  email: string;
  phone: string;
  city: string;
  birthdate: string;
  skinConcerns: string[];
  registeredAt: string;
}

const SKIN_CONCERN_OPTIONS = [
  "Сухость", "Жирность", "Акне", "Пигментация",
  "Морщины", "Чувствительность", "Тусклость", "Отёчность",
  "Расширенные поры", "Купероз",
] as const;

export { SKIN_CONCERN_OPTIONS };

export function saveAccount(account: UserAccount) {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  localStorage.setItem(NAME_KEY, account.name);
  localStorage.setItem(ONBOARDING_KEY, "true");
}

export function loadAccount(): UserAccount | null {
  const raw = localStorage.getItem(ACCOUNT_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAccount() {
  localStorage.removeItem(ACCOUNT_KEY);
}

export function saveName(name: string) {
  localStorage.setItem(NAME_KEY, name);
}

export function loadName(): string | null {
  return localStorage.getItem(NAME_KEY);
}

export function saveProfile(profile: DoshaProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem(ONBOARDING_KEY, "true");
}

export function loadProfile(): DoshaProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveAgeGroup(group: AgeGroup) {
  localStorage.setItem(AGE_KEY, group);
}

export function loadAgeGroup(): AgeGroup | null {
  return localStorage.getItem(AGE_KEY) as AgeGroup | null;
}

export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(AGE_KEY);
  localStorage.removeItem(ONBOARDING_KEY);
}

export function toggleFavorite(id: string) {
  const favs = getFavorites();
  const set = new Set(favs);
  set.has(id) ? set.delete(id) : set.add(id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...set]));
}

export function getFavorites(): string[] {
  const raw = localStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

export function toggleOwned(id: string) {
  const owned = getOwned();
  const set = new Set(owned);
  set.has(id) ? set.delete(id) : set.add(id);
  localStorage.setItem(OWNED_KEY, JSON.stringify([...set]));
}

export function getOwned(): string[] {
  const raw = localStorage.getItem(OWNED_KEY);
  return raw ? JSON.parse(raw) : [];
}

// ─── Product usage tracking ─────────────────────
const USAGE_KEY = "productUsage";
const SKIN_LOG_KEY = "skinLog";

export interface ProductUsage {
  productId: string;
  addedDate: string;
  volumeMl: number;
  usesPerDay: number;        // 1 = утро, 2 = утро+вечер
  mlPerUse: number;          // ~1-3ml per use
  lastUsedDate: string;
  totalUses: number;
  notes: string;
}

export interface SkinLogEntry {
  date: string;
  hydration: number;   // 1-5
  clarity: number;     // 1-5
  comfort: number;     // 1-5
  glow: number;        // 1-5
  note: string;
}

// Typical ml per use by product type
export const ML_PER_USE: Record<string, number> = {
  cleansing: 3, toner: 2, serum: 1, cream: 1.5, eyeCream: 0.5, mask: 5, exfoliation: 3,
};

// Typical shelf life in days by volume
export function estimateDaysLeft(usage: ProductUsage): number {
  const dailyMl = usage.mlPerUse * usage.usesPerDay;
  if (dailyMl === 0) return 999;
  const totalDays = usage.volumeMl / dailyMl;
  const daysSinceAdded = Math.floor((Date.now() - new Date(usage.addedDate).getTime()) / 86400000);
  return Math.max(0, Math.round(totalDays - daysSinceAdded));
}

export function estimateRemainingPercent(usage: ProductUsage): number {
  const dailyMl = usage.mlPerUse * usage.usesPerDay;
  if (dailyMl === 0) return 100;
  const totalDays = usage.volumeMl / dailyMl;
  const daysSinceAdded = Math.floor((Date.now() - new Date(usage.addedDate).getTime()) / 86400000);
  return Math.max(0, Math.min(100, Math.round(((totalDays - daysSinceAdded) / totalDays) * 100)));
}

export function saveProductUsage(usage: ProductUsage) {
  const all = getProductUsages();
  const idx = all.findIndex(u => u.productId === usage.productId);
  if (idx >= 0) all[idx] = usage; else all.push(usage);
  localStorage.setItem(USAGE_KEY, JSON.stringify(all));
}

export function getProductUsages(): ProductUsage[] {
  const raw = localStorage.getItem(USAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function removeProductUsage(productId: string) {
  const all = getProductUsages().filter(u => u.productId !== productId);
  localStorage.setItem(USAGE_KEY, JSON.stringify(all));
}

export function addSkinLog(entry: SkinLogEntry) {
  const all = getSkinLogs();
  all.push(entry);
  if (all.length > 30) all.splice(0, all.length - 30);
  localStorage.setItem(SKIN_LOG_KEY, JSON.stringify(all));
}

export function getSkinLogs(): SkinLogEntry[] {
  const raw = localStorage.getItem(SKIN_LOG_KEY);
  return raw ? JSON.parse(raw) : [];
}

// ─── Vikriti (current state) ─────────────────────
const VIKRITI_KEY = "vikritiProfile";

export function saveVikritiProfile(profile: DoshaProfile) {
  localStorage.setItem(VIKRITI_KEY, JSON.stringify(profile));
}

export function loadVikritiProfile(): DoshaProfile | null {
  const raw = localStorage.getItem(VIKRITI_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getImbalance(prakriti: DoshaProfile, vikriti: DoshaProfile): { dosha: string; delta: number }[] {
  return (["vata", "pitta", "kapha"] as const)
    .map(d => ({ dosha: d, delta: Math.round((vikriti[d] - prakriti[d]) * 100) }))
    .filter(x => Math.abs(x.delta) >= 5)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

// ─── Badges / Gamification ──────────────────────
const BADGES_KEY = "earnedBadges";
const VIEWED_INGREDIENTS_KEY = "viewedIngredients";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  earnedAt: string | null;
}

export const BADGE_DEFINITIONS: Omit<Badge, "earnedAt">[] = [
  { id: "first-ritual", name: "Первый ритуал", description: "Добавьте первое средство на полку", icon: "✨" },
  { id: "shelf-5", name: "Коллекционер", description: "5 средств на полке", icon: "🧴" },
  { id: "diary-7", name: "7 дней подряд", description: "7 записей в дневнике кожи", icon: "📝" },
  { id: "diary-30", name: "Дневник месяца", description: "30 записей в дневнике кожи", icon: "📖" },
  { id: "ingredients-20", name: "Эксперт ингредиентов", description: "Изучено 20+ ингредиентов", icon: "🔬" },
  { id: "full-line", name: "Полная линия", description: "Все продукты одной линии на полке", icon: "💎" },
  { id: "vikriti-test", name: "Самопознание", description: "Пройден тест Викрити", icon: "🧘" },
  { id: "skin-glow", name: "Сияние 5/5", description: "Оценка сияния 5 в дневнике", icon: "🌟" },
];

export function getBadges(): Badge[] {
  const raw = localStorage.getItem(BADGES_KEY);
  const earned: Record<string, string> = raw ? JSON.parse(raw) : {};
  return BADGE_DEFINITIONS.map(b => ({
    ...b,
    earnedAt: earned[b.id] || null,
  }));
}

export function checkAndAwardBadges(): string | null {
  const raw = localStorage.getItem(BADGES_KEY);
  const earned: Record<string, string> = raw ? JSON.parse(raw) : {};
  const usages = getProductUsages();
  const logs = getSkinLogs();
  const viewedCount = getViewedIngredientsCount();
  const vikriti = loadVikritiProfile();
  let newBadge: string | null = null;

  function award(id: string) {
    if (!earned[id]) {
      earned[id] = new Date().toISOString();
      newBadge = id;
    }
  }

  if (usages.length >= 1) award("first-ritual");
  if (usages.length >= 5) award("shelf-5");
  if (logs.length >= 7) award("diary-7");
  if (logs.length >= 30) award("diary-30");
  if (viewedCount >= 20) award("ingredients-20");
  if (vikriti) award("vikriti-test");
  if (logs.some(l => l.glow === 5)) award("skin-glow");

  localStorage.setItem(BADGES_KEY, JSON.stringify(earned));
  return newBadge;
}

export function trackIngredientView(ingredientId: string) {
  const raw = localStorage.getItem(VIEWED_INGREDIENTS_KEY);
  const set: Set<string> = raw ? new Set(JSON.parse(raw)) : new Set();
  set.add(ingredientId);
  localStorage.setItem(VIEWED_INGREDIENTS_KEY, JSON.stringify([...set]));
}

export function getViewedIngredientsCount(): number {
  const raw = localStorage.getItem(VIEWED_INGREDIENTS_KEY);
  return raw ? JSON.parse(raw).length : 0;
}

// ─── Dealer account ──────────────────────────────
const DEALER_KEY = "dealerAccount";

export interface DealerAccount {
  dealerId: string;
  login: string;
  companyName: string;
  status: "silver" | "gold" | "platinum";
  balance: number;
  totalPurchases: number;
  lastOrderDate: string;
  ordersCount: number;
  discount: number;
  managerName: string;
  managerPhone: string;
}

export function saveDealerAccount(account: DealerAccount) {
  localStorage.setItem(DEALER_KEY, JSON.stringify(account));
}

export function loadDealerAccount(): DealerAccount | null {
  const raw = localStorage.getItem(DEALER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearDealerAccount() {
  localStorage.removeItem(DEALER_KEY);
}

// ─── Loyalty Program ────────────────────────────
const LOYALTY_KEY = "loyaltyHistory";

export interface LoyaltyAction {
  type: "registration" | "doshaTest" | "skinLog" | "purchase" | "review" | "ritual" | "ingredient" | "referral";
  points: number;
  date: string;
  description: string;
}

export type LoyaltyLevel = "newcomer" | "expert" | "guru" | "master";

export const LOYALTY_LEVELS: { level: LoyaltyLevel; name: string; minPoints: number; icon: string; benefits: string }[] = [
  { level: "newcomer", name: "Новичок", minPoints: 0, icon: "\u{1F331}", benefits: "Базовые бонусы" },
  { level: "expert", name: "Знаток", minPoints: 500, icon: "\u{1F33F}", benefits: "Скидка 5%" },
  { level: "guru", name: "Гуру", minPoints: 2000, icon: "\u{1F333}", benefits: "Скидка 10% + подарки" },
  { level: "master", name: "Мастер", minPoints: 5000, icon: "\u{1F48E}", benefits: "Скидка 15% + эксклюзивы" },
];

export const POINTS_CONFIG = {
  registration: 100,
  doshaTest: 200,
  skinLog: 50,
  purchase: 1,
  review: 75,
  ritual: 30,
  ingredient: 10,
  referral: 500,
};

export function addLoyaltyPoints(type: LoyaltyAction["type"], points: number, description: string): void {
  const history = getLoyaltyHistory();
  history.push({ type, points, date: new Date().toISOString(), description });
  localStorage.setItem(LOYALTY_KEY, JSON.stringify(history));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("loyalty-updated"));
  }
}

export function getLoyaltyHistory(): LoyaltyAction[] {
  const raw = localStorage.getItem(LOYALTY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getTotalPoints(): number {
  return getLoyaltyHistory().reduce((sum, a) => sum + a.points, 0);
}

// ─── Skin Streak (consecutive diary days) ──────
export function getStreakDays(): { current: number; best: number; todayLogged: boolean } {
  const logs = getSkinLogs();
  if (logs.length === 0) return { current: 0, best: 0, todayLogged: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get unique dates (sorted descending)
  const dates = [...new Set(logs.map(l => {
    const d = new Date(l.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }))].sort((a, b) => b - a);

  const todayLogged = dates[0] === today.getTime();

  // Calculate current streak
  let current = 0;
  const startDate = todayLogged ? today.getTime() : today.getTime() - 86400000;
  for (let i = 0; i < dates.length; i++) {
    const expected = startDate - i * 86400000;
    if (dates[i] === expected) {
      current++;
    } else break;
  }

  // Calculate best streak
  let best = 1;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    if (dates[i - 1] - dates[i] === 86400000) {
      streak++;
      best = Math.max(best, streak);
    } else {
      streak = 1;
    }
  }

  return { current, best: Math.max(best, current), todayLogged };
}

// ─── Skin Score (0-100 aggregate) ──────────────
export function calculateSkinScore(): { score: number; trend: number; hasData: boolean } {
  const logs = getSkinLogs();
  if (logs.length === 0) return { score: 0, trend: 0, hasData: false };

  // Last 7 entries → current score
  const recent = logs.slice(-7);
  const avg = recent.reduce((sum, l) => sum + (l.hydration + l.clarity + l.comfort + l.glow) / 4, 0) / recent.length;
  const score = Math.round((avg / 5) * 100);

  // Previous 7 entries → trend
  let trend = 0;
  if (logs.length >= 14) {
    const prev = logs.slice(-14, -7);
    const prevAvg = prev.reduce((sum, l) => sum + (l.hydration + l.clarity + l.comfort + l.glow) / 4, 0) / prev.length;
    trend = Math.round(((avg - prevAvg) / 5) * 100);
  } else if (logs.length >= 2) {
    const prevEntry = logs[logs.length - 2];
    const prevAvg = (prevEntry.hydration + prevEntry.clarity + prevEntry.comfort + prevEntry.glow) / 4;
    trend = Math.round(((avg - prevAvg) / 5) * 100);
  }

  return { score, trend, hasData: true };
}

// ─── Referral ──────────────────────────────────
const REFERRAL_KEY = "referralCode";

export function getReferralCode(): string {
  let code = localStorage.getItem(REFERRAL_KEY);
  if (!code) {
    code = "SPA" + Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem(REFERRAL_KEY, code);
  }
  return code;
}

// ─── Quick Polls ──────────────────────────────
const POLL_KEY = "pollAnswers";

export function savePollAnswer(pollId: string, answer: string): void {
  const history = getPollHistory();
  history[pollId] = answer;
  localStorage.setItem(POLL_KEY, JSON.stringify(history));
}

export function getPollHistory(): Record<string, string> {
  const raw = localStorage.getItem(POLL_KEY);
  return raw ? JSON.parse(raw) : {};
}

// ─── Journey Timeline ─────────────────────────
export function getJourneyMilestones(): { date: string; label: string; icon: string }[] {
  const milestones: { date: string; label: string; icon: string }[] = [];

  const account = loadAccount();
  if (account?.registeredAt) {
    milestones.push({ date: account.registeredAt, label: "Регистрация", icon: "🎉" });
  }

  const profile = loadProfile();
  if (profile) {
    // Use account registration or fallback to a marker
    const profileDate = account?.registeredAt || new Date().toISOString();
    milestones.push({ date: profileDate, label: "Доша-тест пройден", icon: "🧬" });
  }

  const usages = getProductUsages();
  if (usages.length > 0) {
    const first = usages.reduce((a, b) =>
      new Date(a.addedDate) < new Date(b.addedDate) ? a : b
    );
    milestones.push({ date: first.addedDate, label: "Первое средство добавлено", icon: "✨" });
  }

  const logs = getSkinLogs();
  if (logs.length > 0) {
    milestones.push({ date: logs[0].date, label: "Первый дневник кожи", icon: "📝" });
  }

  const badges = getBadges().filter(b => b.earnedAt);
  badges.forEach(b => {
    milestones.push({ date: b.earnedAt!, label: b.name, icon: b.icon });
  });

  const vikriti = loadVikritiProfile();
  if (vikriti) {
    const vikritiDate = badges.find(b => b.id === "vikriti-test")?.earnedAt || new Date().toISOString();
    milestones.push({ date: vikritiDate, label: "Викрити-тест пройден", icon: "🧘" });
  }

  return milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// ─── Salon Client Tests (Dealer) ──────────────
const SALON_TESTS_KEY = "salonClientTests";

export interface SalonClientTest {
  date: string;
  clientName: string;
  dosha: DoshaProfile;
  notes: string;
}

export function saveSalonClientTest(result: SalonClientTest): void {
  const all = getSalonClientTests();
  all.push(result);
  localStorage.setItem(SALON_TESTS_KEY, JSON.stringify(all));
}

export function getSalonClientTests(): SalonClientTest[] {
  const raw = localStorage.getItem(SALON_TESTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getCurrentLevel(): {
  level: LoyaltyLevel;
  name: string;
  icon: string;
  benefits: string;
  progress: number;
  nextLevel: typeof LOYALTY_LEVELS[number] | null;
} {
  const total = getTotalPoints();
  let currentIdx = 0;
  for (let i = LOYALTY_LEVELS.length - 1; i >= 0; i--) {
    if (total >= LOYALTY_LEVELS[i].minPoints) {
      currentIdx = i;
      break;
    }
  }
  const current = LOYALTY_LEVELS[currentIdx];
  const next = currentIdx < LOYALTY_LEVELS.length - 1 ? LOYALTY_LEVELS[currentIdx + 1] : null;
  const progress = next
    ? (total - current.minPoints) / (next.minPoints - current.minPoints)
    : 1;
  return {
    level: current.level,
    name: current.name,
    icon: current.icon,
    benefits: current.benefits,
    progress: Math.min(1, Math.max(0, progress)),
    nextLevel: next,
  };
}
