"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { products, faceLines, routines, getProduct, getComplementaryProducts, getBalancingProducts, getImbalanceAdvice } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import {
  loadProfile, loadAgeGroup, loadName, saveAgeGroup,
  getFavorites, getOwned,
  loadAccount, saveAccount, UserAccount, SKIN_CONCERN_OPTIONS,
  getProductUsages, saveProductUsage, removeProductUsage, ProductUsage,
  estimateRemainingPercent, estimateDaysLeft,
  getSkinLogs, addSkinLog, SkinLogEntry,
  checkAndAwardBadges, BADGE_DEFINITIONS,
  loadVikritiProfile, saveVikritiProfile, getImbalance,
  addLoyaltyPoints, getLoyaltyHistory, getCurrentLevel, getTotalPoints,
  getStreakDays, calculateSkinScore, getReferralCode,
  savePollAnswer, getPollHistory, loadDealerAccount,
} from "@/lib/store";
import {
  INGREDIENT_STORIES, AYURVEDA_TIPS, DOSHA_GREETINGS, CARE_INSIGHTS,
  getCurrentSeason, getUpcomingEvents,
  COMMUNITY_STATS, SOCIAL_REVIEWS, QUICK_POLLS, SALON_PROTOCOLS,
} from "@/lib/content";
import { vikritiQuestions } from "@/lib/questions";
import { hapticLight, hapticMedium, hapticSuccess } from "@/lib/haptics";
import {
  DoshaProfile, getDominantDosha, DOSHA_NAMES, DOSHA_SUBTITLES, DOSHA_SKIN, DOSHA_COLORS,
  AGE_NAMES, AGE_SUBTITLES, STEP_NAMES, AgeGroup, DoshaType,
} from "@/lib/types";

type RegStep = "name" | "contacts" | "skin" | "age";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [profile, setProfile] = useState<DoshaProfile | null>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [name, setName] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [usages, setUsages] = useState<ProductUsage[]>([]);
  const [skinLogs, setSkinLogs] = useState<SkinLogEntry[]>([]);
  const [showSkinCheck, setShowSkinCheck] = useState(false);
  const [skinForm, setSkinForm] = useState({ hydration: 3, clarity: 3, comfort: 3, glow: 3, note: "" });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [addProductSearch, setAddProductSearch] = useState("");
  const [badgeToast, setBadgeToast] = useState<string | null>(null);
  const [vikriti, setVikriti] = useState<DoshaProfile | null>(null);
  const [showVikritiTest, setShowVikritiTest] = useState(false);
  const [vikritiStep, setVikritiStep] = useState(0);
  const [vikritiAnswers, setVikritiAnswers] = useState<number[]>([]);
  const [showVikritiResult, setShowVikritiResult] = useState(false);
  const [loyaltyInfo, setLoyaltyInfo] = useState<ReturnType<typeof getCurrentLevel> | null>(null);
  const [streak, setStreak] = useState<ReturnType<typeof getStreakDays>>({ current: 0, best: 0, todayLogged: false });
  const [skinScore, setSkinScore] = useState<ReturnType<typeof calculateSkinScore>>({ score: 0, trend: 0, hasData: false });
  const [pollAnswer, setPollAnswer] = useState<string | null>(null);
  const [isDealer, setIsDealer] = useState(false);

  // Registration
  const [regStep, setRegStep] = useState<RegStep>("name");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCity, setRegCity] = useState("");
  const [regBirthdate, setRegBirthdate] = useState("");
  const [regConcerns, setRegConcerns] = useState<string[]>([]);
  const [regAge, setRegAge] = useState<AgeGroup | null>(null);

  useEffect(() => {
    setMounted(true);
    setAccount(loadAccount());
    setProfile(loadProfile());
    setAgeGroup(loadAgeGroup());
    setName(loadName() || "");
    setFavorites(getFavorites());
    setOwned(getOwned());
    setUsages(getProductUsages());
    setSkinLogs(getSkinLogs());
    setVikriti(loadVikritiProfile());
    setStreak(getStreakDays());
    setSkinScore(calculateSkinScore());
    setIsDealer(!!loadDealerAccount());
    // Check badges on load
    const newBadge = checkAndAwardBadges();
    if (newBadge) {
      setBadgeToast(newBadge);
      setTimeout(() => setBadgeToast(null), 4000);
    }
    // Award loyalty points for past actions (one-time)
    const history = getLoyaltyHistory();
    const acct = loadAccount();
    if (acct && !history.some(a => a.type === "registration")) {
      addLoyaltyPoints("registration", 100, "Регистрация");
    }
    const prof = loadProfile();
    if (prof && !history.some(a => a.type === "doshaTest")) {
      addLoyaltyPoints("doshaTest", 200, "Прохождение доша-теста");
    }
    setLoyaltyInfo(getCurrentLevel());

    const onLoyaltyUpdate = () => setLoyaltyInfo(getCurrentLevel());
    window.addEventListener("loyalty-updated", onLoyaltyUpdate);
    return () => window.removeEventListener("loyalty-updated", onLoyaltyUpdate);
  }, []);

  const dosha = profile ? getDominantDosha(profile) : null;

  // Day-based rotation for editorial content
  const dayOfYear = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now.getTime() - start.getTime()) / 86400000);
  }, []);

  const ingredientStory = INGREDIENT_STORIES[dayOfYear % INGREDIENT_STORIES.length];
  const ayurvedaTip = AYURVEDA_TIPS[dayOfYear % AYURVEDA_TIPS.length];
  const ayurvedaTip2 = AYURVEDA_TIPS[(dayOfYear + 3) % AYURVEDA_TIPS.length];
  const todayPoll = QUICK_POLLS[dayOfYear % QUICK_POLLS.length];
  const todayReview = SOCIAL_REVIEWS[dayOfYear % SOCIAL_REVIEWS.length];
  const todayStat = COMMUNITY_STATS[dayOfYear % COMMUNITY_STATS.length];

  // Load poll answer
  useEffect(() => {
    if (mounted) {
      const history = getPollHistory();
      setPollAnswer(history[todayPoll.id] || null);
    }
  }, [mounted, todayPoll.id]);

  // Time-based greeting
  const timeGreeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 6) return "Доброй ночи";
    if (h < 12) return "Доброе утро";
    if (h < 18) return "Добрый день";
    return "Добрый вечер";
  }, []);

  const isEvening = new Date().getHours() >= 18 || new Date().getHours() < 6;

  // Personalized products
  const recommendedProducts = useMemo(() => {
    if (!dosha) return products.filter(p => p.images.length > 0).slice(0, 6);
    return products
      .filter(p => p.doshaAffinity.includes(dosha) && p.images.length > 0)
      .slice(0, 8);
  }, [dosha]);

  // Popular products (top 3 by rating)
  const popularProducts = useMemo(() => {
    return products
      .filter(p => p.images.length > 0 && p.rating)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
  }, []);

  // Seasonal product (rotate weekly)
  const seasonalProduct = useMemo(() => {
    const week = Math.floor(dayOfYear / 7);
    const withImages = products.filter(p => p.images.length > 0 && p.rating);
    return withImages[week % withImages.length];
  }, [dayOfYear]);

  // Face line recommendation based on age
  const recommendedLine = useMemo(() => {
    if (!ageGroup) return faceLines[0];
    if (ageGroup === "young" || ageGroup === "active") return faceLines.find(l => l.id === "pearl-endorphin") || faceLines[0];
    if (ageGroup === "mature") return faceLines.find(l => l.id === "grand-cru-elixir") || faceLines[1];
    return faceLines.find(l => l.id === "swan-grace") || faceLines[2];
  }, [ageGroup]);

  // Routine
  const routine = dosha && ageGroup
    ? routines.find(r => r.dosha === dosha && r.ageGroup === ageGroup && r.zone === "face")
    : null;
  const ritualSteps = routine
    ? routine.steps
        .filter(s => isEvening ? s.timeOfDay === "evening" : s.timeOfDay === "morning")
        .sort((a, b) => a.order - b.order)
        .slice(0, 3)
    : [];

  // Personalized daily message
  const personalMessage = useMemo(() => {
    if (!dosha) return null;
    const msgs = DOSHA_GREETINGS[dosha] || DOSHA_GREETINGS.vata;
    return msgs[dayOfYear % msgs.length];
  }, [dosha, dayOfYear]);

  const careInsight = dosha ? CARE_INSIGHTS[dosha] : null;

  // Products running low
  const lowProducts = useMemo(() => {
    return usages
      .map(u => ({ usage: u, product: getProduct(u.productId), remaining: estimateRemainingPercent(u), daysLeft: estimateDaysLeft(u) }))
      .filter(x => x.product && x.remaining <= 30)
      .sort((a, b) => a.remaining - b.remaining);
  }, [usages]);

  // Skin score trend
  const skinTrend = useMemo(() => {
    if (skinLogs.length < 2) return null;
    const last = skinLogs[skinLogs.length - 1];
    const prev = skinLogs[skinLogs.length - 2];
    const lastAvg = (last.hydration + last.clarity + last.comfort + last.glow) / 4;
    const prevAvg = (prev.hydration + prev.clarity + prev.comfort + prev.glow) / 4;
    return { current: lastAvg, diff: lastAvg - prevAvg };
  }, [skinLogs]);

  // Complementary products (cross-sell)
  const bundleSuggestions = useMemo(() => {
    const ownedIds = usages.map(u => u.productId);
    return getComplementaryProducts(ownedIds);
  }, [usages]);

  // Vikriti imbalance
  const imbalance = useMemo(() => {
    if (!profile || !vikriti) return [];
    return getImbalance(profile, vikriti);
  }, [profile, vikriti]);

  const balancingProducts = useMemo(() => {
    if (imbalance.length === 0) return [];
    return getBalancingProducts(imbalance);
  }, [imbalance]);

  const imbalanceAdvice = useMemo(() => {
    if (imbalance.length === 0) return null;
    return getImbalanceAdvice(imbalance);
  }, [imbalance]);

  // Missing routine steps
  const missingSteps = useMemo(() => {
    if (!routine) return [];
    const usedProductIds = new Set(usages.map(u => u.productId));
    return routine.steps
      .filter(s => !usedProductIds.has(s.productId))
      .map(s => ({ step: s, product: getProduct(s.productId) }))
      .filter(x => x.product);
  }, [routine, usages]);

  // Shared ingredients
  const sharedIngredients = useMemo(() => {
    if (usages.length < 2) return [];
    const usedProducts = usages.map(u => getProduct(u.productId)).filter(Boolean);
    const purposeCounts: Record<string, number> = {};
    usedProducts.forEach(p => {
      p!.purposes.forEach(purpose => {
        purposeCounts[purpose] = (purposeCounts[purpose] || 0) + 1;
      });
    });
    return Object.entries(purposeCounts)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1]);
  }, [usages]);

  // Registration handlers
  function toggleConcern(c: string) {
    const set = new Set(regConcerns);
    set.has(c) ? set.delete(c) : set.add(c);
    setRegConcerns([...set]);
  }

  function handleSelectAge(ag: AgeGroup) {
    setRegAge(ag);
    saveAgeGroup(ag);
    setAgeGroup(ag);
  }

  function finishRegistration() {
    const acc: UserAccount = {
      name: regName, email: regEmail, phone: regPhone,
      city: regCity, birthdate: regBirthdate,
      skinConcerns: regConcerns, registeredAt: new Date().toISOString(),
    };
    saveAccount(acc);
    setAccount(acc);
    setName(regName);
  }

  // Product usage handlers
  function handleAddProductUsage(productId: string) {
    hapticMedium();
    const p = getProduct(productId);
    if (!p) return;
    const vol = p.volumes[0];
    const usage: ProductUsage = {
      productId, addedDate: new Date().toISOString(),
      volumeMl: vol ? parseInt(vol.volume) || 50 : 50,
      usesPerDay: 2, mlPerUse: 1.5,
      lastUsedDate: new Date().toISOString(),
      totalUses: 0, notes: "",
    };
    saveProductUsage(usage);
    setUsages(getProductUsages());
    setShowAddProduct(false);
    setAddProductSearch("");
    recheckBadges();
  }

  function handleRemoveUsage(productId: string) {
    removeProductUsage(productId);
    setUsages(getProductUsages());
  }

  function handleSkinLog() {
    hapticSuccess();
    const entry: SkinLogEntry = {
      date: new Date().toISOString(),
      ...skinForm,
    };
    addSkinLog(entry);
    setSkinLogs(getSkinLogs());
    setShowSkinCheck(false);
    setSkinForm({ hydration: 3, clarity: 3, comfort: 3, glow: 3, note: "" });
    setStreak(getStreakDays());
    setSkinScore(calculateSkinScore());
    recheckBadges();
    addLoyaltyPoints("skinLog", 50, "Запись в дневник кожи");
  }

  function recheckBadges() {
    const newBadge = checkAndAwardBadges();
    if (newBadge) {
      setBadgeToast(newBadge);
      setTimeout(() => setBadgeToast(null), 4000);
    }
  }

  function handleVikritiAnswer(answerId: number) {
    hapticLight();
    const newAnswers = [...vikritiAnswers, answerId];
    setVikritiAnswers(newAnswers);
    if (vikritiStep < vikritiQuestions.length - 1) {
      setVikritiStep(vikritiStep + 1);
    } else {
      let vata = 0, pitta = 0, kapha = 0, totalWeight = 0;
      vikritiQuestions.forEach((q, i) => {
        const answer = q.answers.find(a => a.id === newAnswers[i]);
        if (answer) {
          vata += answer.vataWeight * q.weight;
          pitta += answer.pittaWeight * q.weight;
          kapha += answer.kaphaWeight * q.weight;
          totalWeight += q.weight;
        }
      });
      const result: DoshaProfile = {
        vata: +(vata / totalWeight).toFixed(2),
        pitta: +(pitta / totalWeight).toFixed(2),
        kapha: +(kapha / totalWeight).toFixed(2),
      };
      saveVikritiProfile(result);
      setVikriti(result);
      setShowVikritiTest(false);
      setShowVikritiResult(true);
      setVikritiStep(0);
      setVikritiAnswers([]);
      recheckBadges();
    }
  }

  function handlePollVote(optionId: string) {
    hapticLight();
    savePollAnswer(todayPoll.id, optionId);
    setPollAnswer(optionId);
  }

  if (!mounted) return null;

  // ═══════════════════════════════════════════════
  // REGISTRATION FLOW (no account)
  // ═══════════════════════════════════════════════
  if (!account) {
    return (
      <div className="max-w-md mx-auto px-5 py-10">
        <div className="text-center mb-8">
          <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-2">SPAquatoria</p>
          <h1 className="title-large text-fg mb-3">Добро пожаловать</h1>
          <p className="text-[15px] text-fg-secondary leading-relaxed">
            Создай профиль и получи персональную программу ухода
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {(["name", "contacts", "skin", "age"] as RegStep[]).map((s, i) => (
            <div
              key={s}
              className="h-[6px] rounded-full transition-all"
              style={{
                width: regStep === s ? 24 : 6,
                backgroundColor: (["name", "contacts", "skin", "age"].indexOf(regStep) >= i) ? "var(--brand)" : "var(--fill-secondary)",
              }}
            />
          ))}
        </div>

        {regStep === "name" && (
          <div className="anim-fade-up">
            <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-3">Как тебя зовут?</p>
            <input type="text" value={regName} onChange={e => setRegName(e.target.value)}
              placeholder="Имя" autoFocus
              className="w-full px-4 py-3 rounded-2xl text-[17px] outline-none glass-card mb-4" style={{ border: "none" }}
              onKeyDown={e => e.key === "Enter" && regName && setRegStep("contacts")}
            />
            <button onClick={() => setRegStep("contacts")} disabled={!regName}
              className="w-full bg-brand text-white py-3.5 rounded-full text-[15px] font-semibold tap disabled:opacity-40">
              Далее
            </button>
          </div>
        )}

        {regStep === "contacts" && (
          <div className="anim-fade-up">
            <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-3">Контактные данные</p>
            <div className="space-y-3 mb-4">
              <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Email" autoFocus
                className="w-full px-4 py-3 rounded-2xl text-[17px] outline-none glass-card" style={{ border: "none" }} />
              <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="Телефон"
                className="w-full px-4 py-3 rounded-2xl text-[17px] outline-none glass-card" style={{ border: "none" }} />
              <input type="text" value={regCity} onChange={e => setRegCity(e.target.value)} placeholder="Город"
                className="w-full px-4 py-3 rounded-2xl text-[17px] outline-none glass-card" style={{ border: "none" }} />
              <input type="date" value={regBirthdate} onChange={e => setRegBirthdate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-[17px] outline-none glass-card text-fg" style={{ border: "none" }} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRegStep("name")} className="flex-1 py-3.5 rounded-full glass-card text-[15px] font-semibold tap">Назад</button>
              <button onClick={() => setRegStep("skin")} className="flex-1 bg-brand text-white py-3.5 rounded-full text-[15px] font-semibold tap">Далее</button>
            </div>
          </div>
        )}

        {regStep === "skin" && (
          <div className="anim-fade-up">
            <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-1">Что беспокоит?</p>
            <p className="text-[13px] text-fg-tertiary mb-4">Выбери все подходящие</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {SKIN_CONCERN_OPTIONS.map(c => (
                <button key={c} onClick={() => toggleConcern(c)}
                  className={`px-4 py-2 rounded-full text-[15px] font-medium tap transition-all ${regConcerns.includes(c) ? "bg-brand text-white" : "glass-card text-fg-secondary"}`}>
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRegStep("contacts")} className="flex-1 py-3.5 rounded-full glass-card text-[15px] font-semibold tap">Назад</button>
              <button onClick={() => setRegStep("age")} className="flex-1 bg-brand text-white py-3.5 rounded-full text-[15px] font-semibold tap">Далее</button>
            </div>
          </div>
        )}

        {regStep === "age" && (
          <div className="anim-fade-up">
            <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-3">Возраст кожи</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {(["young", "active", "mature", "premium"] as AgeGroup[]).map(ag => (
                <button key={ag} onClick={() => handleSelectAge(ag)}
                  className={`py-4 rounded-2xl text-center tap transition-all ${regAge === ag ? "bg-brand text-white" : "glass-card"}`}>
                  <p className="text-[17px] font-bold">{AGE_NAMES[ag]}</p>
                  <p className="text-[11px] opacity-60">{AGE_SUBTITLES[ag]}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRegStep("skin")} className="flex-1 py-3.5 rounded-full glass-card text-[15px] font-semibold tap">Назад</button>
              <button onClick={finishRegistration} disabled={!regAge}
                className="flex-1 bg-brand text-white py-3.5 rounded-full text-[15px] font-semibold tap disabled:opacity-40">Готово</button>
            </div>
            <Link href="/catalog" className="block text-center text-[13px] text-brand mt-4 tap">Пропустить</Link>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // PERSONALIZED LIVING FEED
  // ═══════════════════════════════════════════════
  const userName = name || account.name;
  const sorted: [DoshaType, number][] = profile
    ? ([["vata", profile.vata], ["pitta", profile.pitta], ["kapha", profile.kapha]] as [DoshaType, number][]).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="max-w-lg mx-auto px-5 pt-3 pb-28">

      {/* ── Badge toast ──────────────────────────── */}
      {badgeToast && (() => {
        const badge = BADGE_DEFINITIONS.find(b => b.id === badgeToast);
        return badge ? (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[80] glass-pill px-5 py-3 flex items-center gap-3 max-w-[calc(512px-40px)]"
            style={{ animation: "scale-in 0.3s ease-out", boxShadow: "var(--shadow-float)" }}>
            <span className="text-[24px]">{badge.icon}</span>
            <div>
              <p className="text-[13px] font-semibold">{badge.name}</p>
              <p className="text-[11px] text-fg-secondary">{badge.description}</p>
            </div>
          </div>
        ) : null;
      })()}

      {/* ═══ BLOCK A — FIXED TOP ═══════════════════ */}

      {/* ── Audience router (three doors) ────────── */}
      <div className="flex items-center gap-1.5 mb-5 text-[11px]" style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}>
        <span className="px-3 py-1.5 rounded-full" style={{ background: "var(--brand)", color: "#fff" }}>Клиент</span>
        <Link href="/dealers" className="px-3 py-1.5 rounded-full tap" style={{ color: "var(--lp-muted)", border: "1px solid var(--lp-line-soft)" }}>Салон</Link>
        <Link href="/b2b" className="px-3 py-1.5 rounded-full tap" style={{ color: "var(--lp-muted)", border: "1px solid var(--lp-line-soft)" }}>Партнёр</Link>
      </div>

      {/* ── 1. HERO + Care Insight (merged) ──────── */}
      <div className="mb-5">
        <div className="flex items-start justify-between mb-2">
          <span className="eyebrow">{timeGreeting}</span>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="eyebrow tap px-2 py-0.5 -mr-2" style={{ color: "var(--lp-tertiary)" }}>Выйти</button>
        </div>
        <h1 className="hero-greeting mb-3">{userName}</h1>

        {dosha ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="pill-chip" style={{ color: DOSHA_COLORS[dosha], borderColor: DOSHA_COLORS[dosha] }}>
              <span className="w-[6px] h-[6px] rounded-full mr-2" style={{ backgroundColor: DOSHA_COLORS[dosha] }} />
              {DOSHA_NAMES[dosha]}
            </span>
            {ageGroup && (
              <span className="eyebrow" style={{ color: "var(--lp-muted)" }}>{AGE_SUBTITLES[ageGroup]}</span>
            )}
          </div>
        ) : (
          <Link href="/test" className="btn-lp ghost">Определить свою дошу</Link>
        )}

        {/* Personal message + care insight merged */}
        {personalMessage && (
          <p className="body-lp muted mt-4">{personalMessage}</p>
        )}
      </div>

      {/* ── 2. ACTION BAR ────────────────────────── */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setShowSkinCheck(true)}
          className="flex-1 pill-chip justify-center tap relative" style={{ padding: "10px 14px" }}>
          Записать
          {!streak.todayLogged && streak.current > 0 && (
            <span className="w-[6px] h-[6px] rounded-full bg-brand-coral animate-pulse ml-2" />
          )}
        </button>
        <button onClick={() => setShowAddProduct(true)}
          className="flex-1 pill-chip justify-center tap" style={{ padding: "10px 14px" }}>
          Добавить
        </button>
        {profile ? (
          <button onClick={() => { setShowVikritiTest(true); setVikritiStep(0); setVikritiAnswers([]); }}
            className="flex-1 pill-chip justify-center tap" style={{ padding: "10px 14px" }}>
            Баланс
          </button>
        ) : (
          <Link href="/test"
            className="flex-1 pill-chip justify-center tap" style={{ padding: "10px 14px" }}>
            Доша-тест
          </Link>
        )}
      </div>

      {/* ── 3. STATUS PILL → Profile ─────────────── */}
      {(streak.current > 0 || skinScore.hasData || (loyaltyInfo && getTotalPoints() > 0)) && (
        <Link href="/profile" className="block mb-5 tap">
          <div className="glass-card px-3 py-2 flex items-center gap-3 text-[12px]">
            {streak.current > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-[14px]">🔥</span>
                <span className="font-semibold tabular-nums">{streak.current}</span>
                <span className="text-fg-tertiary">
                  {streak.current === 1 ? "день" : streak.current < 5 ? "дня" : "дней"}
                </span>
              </span>
            )}
            {skinScore.hasData && (
              <>
                {streak.current > 0 && <span className="text-fg-tertiary">·</span>}
                <span className="flex items-center gap-1">
                  <span className="text-fg-tertiary">Score</span>
                  <span className="font-semibold tabular-nums"
                    style={{ color: skinScore.score >= 75 ? "#34C759" : skinScore.score >= 50 ? "#FF9500" : "#FF3B30" }}>
                    {skinScore.score}
                  </span>
                </span>
              </>
            )}
            {loyaltyInfo && getTotalPoints() > 0 && (
              <>
                {(streak.current > 0 || skinScore.hasData) && <span className="text-fg-tertiary">·</span>}
                <span className="flex items-center gap-1">
                  <span>{loyaltyInfo.icon}</span>
                  <span className="font-semibold tabular-nums">{getTotalPoints().toLocaleString("ru-RU")}</span>
                </span>
              </>
            )}
            <span className="ml-auto text-fg-tertiary">Мой путь →</span>
          </div>
        </Link>
      )}

      {/* ═══ BLOCK B — PRIORITY (conditional) ═══════ */}

      {/* ── 4. REORDER ALERTS ────────────────────── */}
      {lowProducts.length > 0 && (
        <div className="mb-3">
          {lowProducts.slice(0, 2).map(({ usage, product, remaining, daysLeft }) => product && (
            <div key={usage.productId} className="glass-card p-3 mb-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF3B3015] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#FF3B30]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-fg truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-fill rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${remaining}%`, backgroundColor: remaining <= 10 ? "#FF3B30" : "#FF9500" }} />
                  </div>
                  <span className="text-[11px] text-fg-tertiary shrink-0">{remaining}% · {daysLeft} дн.</span>
                </div>
              </div>
              <Link href={`/catalog/${product.id}`} className="shrink-0 px-3 py-1.5 bg-brand text-white text-[12px] font-semibold rounded-full tap">
                Заказать
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ── 5. DAILY RITUAL ──────────────────────── */}
      {ritualSteps.length > 0 && (
        <div className="mb-3 anim-d1">
          <div className="glass-card p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[17px] font-bold">{isEvening ? "Вечерний ритуал" : "Утренний ритуал"}</h2>
              <Link href="/routine" className="text-[13px] text-brand font-medium tap">Все шаги</Link>
            </div>

            <div className="list-ios">
              {ritualSteps.map((step, i) => {
                const product = getProduct(step.productId);
                return (
                  <div key={step.order} className="flex items-center gap-3 px-4 py-2">
                    <span className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center text-[12px] font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold">{step.title}</p>
                      <p className="text-[13px] text-fg-secondary truncate">{product ? product.name : STEP_NAMES[step.type]}</p>
                    </div>
                    {product && (
                      <Link href={`/catalog/${product.id}`} className="tap">
                        <svg className="w-[18px] h-[18px] text-fg-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ BLOCK C — DYNAMIC FEED (daily rotation) ═══ */}

      {/* ── 6. QUICK POLL ────────────────────────── */}
      <div className="mb-3">
        <div className="glass-card p-3">
          <p className="text-[11px] font-semibold text-fg-tertiary uppercase tracking-wide mb-2">Опрос дня</p>
          <p className="text-[15px] font-bold mb-3">{todayPoll.question}</p>

          {!pollAnswer ? (
            <div className="flex flex-wrap gap-2">
              {todayPoll.options.map(opt => (
                <button key={opt.id} onClick={() => handlePollVote(opt.id)}
                  className="flex-1 min-w-[80px] glass-card-interactive py-2 px-2 text-center tap">
                  <span className="text-[16px] block mb-1">{opt.emoji}</span>
                  <span className="text-[13px] font-medium">{opt.text}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {todayPoll.options.map(opt => {
                const isSelected = opt.id === pollAnswer;
                return (
                  <div key={opt.id} className="relative overflow-hidden rounded-xl h-[32px]">
                    <div className="absolute inset-0 rounded-xl bg-fill" />
                    <div className="absolute inset-y-0 left-0 rounded-xl transition-all"
                      style={{
                        width: `${opt.simulatedPct}%`,
                        backgroundColor: isSelected ? "var(--brand)" : "var(--fill-secondary)",
                        opacity: isSelected ? 0.2 : 1,
                      }} />
                    <div className="relative flex items-center justify-between h-full px-3">
                      <span className="text-[13px] font-medium flex items-center gap-1.5">
                        {opt.emoji} {opt.text}
                        {isSelected && <span className="text-[10px] text-brand font-bold">ты</span>}
                      </span>
                      <span className="text-[13px] font-bold tabular-nums">{opt.simulatedPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── 7. SOCIAL PROOF REVIEW ───────────────── */}
      <div className="mb-3">
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {[...Array(todayReview.rating)].map((_, i) => (
                <span key={i} className="text-[12px] text-[#FFD60A]">★</span>
              ))}
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${todayReview.doshaColor}15`, color: todayReview.doshaColor }}>
              {todayReview.dosha}
            </span>
          </div>
          <p className="text-[13px] leading-relaxed mb-2 italic text-fg-secondary">"{todayReview.quote}"</p>
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold">{todayReview.name}</p>
            <p className="text-[11px] text-fg-tertiary">{todayReview.product} · {todayReview.city}</p>
          </div>
        </div>
      </div>

      {/* ── 8. INGREDIENT OF THE DAY ─────────────── */}
      <div className="mb-3">
        <h2 className="section-header mb-2">Ингредиент дня</h2>
        <Link href={`/lines/${ingredientStory.lineId}`} className="block">
          <div className="glass-card-interactive overflow-hidden editorial-card" style={{ "--accent-color": ingredientStory.color } as React.CSSProperties}>
            <div className="p-3">
              <h3 className="text-[17px] font-bold mb-1" style={{ color: ingredientStory.color }}>
                {ingredientStory.title}
              </h3>
              <p className="text-[13px] font-medium text-fg-secondary mb-3">{ingredientStory.subtitle}</p>
              <p className="text-[13px] text-fg-secondary leading-relaxed">{ingredientStory.text}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* ── 9. COMMUNITY STAT ────────────────────── */}
      <div className="mb-3">
        <div className="glass-card p-3 flex items-center gap-3">
          <span className="text-[20px]">{todayStat.icon}</span>
          <span className="text-[17px] font-bold text-brand">{todayStat.number}</span>
          <span className="text-[13px] text-fg-secondary flex-1">{todayStat.text}</span>
        </div>
      </div>

      {/* ── 10. POPULAR NOW ──────────────────────── */}
      {popularProducts.length > 0 && (
        <div className="mb-3">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="section-header">Популярное</h2>
            <Link href="/catalog" className="text-[15px] text-brand font-medium tap">Все</Link>
          </div>
          <div className="flex gap-3">
            {popularProducts.map((product, i) => (
              <Link key={product.id} href={`/catalog/${product.id}`} className="flex-1 glass-card-interactive overflow-hidden tap">
                <div className="relative">
                  {product.images[0] && (
                    <div className="aspect-[4/3] bg-fill">
                      <img src={`https://spaquatoria.ru${product.images[0].url}`} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-brand text-white text-[12px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div className="p-2">
                  <p className="text-[12px] font-semibold line-clamp-2 leading-tight">{product.name}</p>
                  {product.volumes[0] && (
                    <p className="text-[12px] font-bold text-brand mt-1">{product.volumes[0].retailPrice.toLocaleString("ru-RU")} ₽</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── 11. MY SHELF ─────────────────────────── */}
      {usages.length > 0 && (
        <div className="mb-3">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="section-header">Моя полка</h2>
            <button onClick={() => setShowAddProduct(true)} className="text-[15px] text-brand font-medium tap">Добавить</button>
          </div>

          <div className="glass-card overflow-hidden">
            {usages.map((usage, i) => {
              const product = getProduct(usage.productId);
              if (!product) return null;
              const remaining = estimateRemainingPercent(usage);
              const daysLeft = estimateDaysLeft(usage);
              const isLow = remaining <= 25;
              const barColor = isLow ? "var(--brand-coral)" : remaining <= 50 ? "var(--brand-orange)" : "var(--brand-green)";
              return (
                <div key={usage.productId} className="px-4 py-3.5"
                  style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}>
                  <div className="flex items-center gap-3">
                    {product.images[0] && (
                      <Link href={`/catalog/${product.id}`} className="w-[52px] h-[52px] rounded-[14px] overflow-hidden shrink-0 bg-fill">
                        <img src={`https://spaquatoria.ru${product.images[0].url}`} alt="" className="w-full h-full object-cover" />
                      </Link>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/catalog/${product.id}`} className="text-[15px] font-semibold line-clamp-1 tap">{product.name}</Link>
                        <button onClick={() => handleRemoveUsage(usage.productId)} className="text-fg-tertiary tap p-0.5 -mr-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2.5 mt-2">
                        <div className="flex-1 h-[5px] bg-fill rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${remaining}%`, backgroundColor: barColor }} />
                        </div>
                        <span className="text-[13px] font-bold tabular-nums shrink-0" style={{ color: barColor }}>{remaining}%</span>
                      </div>
                      <p className="text-[13px] text-fg-secondary mt-1">
                        {isLow ? `Пора заказать · ~${daysLeft} дн.` : `~${daysLeft} дней`}
                        {" · "}{usage.usesPerDay === 2 ? "утро + вечер" : "раз в день"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ BLOCK D — DEPTH (personalization) ═════ */}

      {/* ── 12. SEASON + EVENTS ──────────────────── */}
      {(() => {
        const season = getCurrentSeason();
        const events = getUpcomingEvents(3);
        const todayEvent = events.find(e => e.daysUntil === 0);
        const upcoming = events.filter(e => e.daysUntil > 0).slice(0, 2);
        const seasonTip = dosha === season.dosha
          ? "Сейчас активен именно твой тип — уделяй особое внимание балансу"
          : dosha
            ? `Сезон ${DOSHA_NAMES[season.dosha]} — ${season.skinTip.toLowerCase()}`
            : season.skinTip;

        return (
          <div className="mb-3">
            <div className="glass-card overflow-hidden mb-3">
              <div className="h-1" style={{ background: season.color }} />
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${season.color}15` }}>
                      <svg className="w-4 h-4" style={{ color: season.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                      </svg>
                    </div>
                    <p className="text-[15px] font-semibold text-fg">{season.name} <span className="font-normal text-fg-secondary">— {season.nameEn}</span></p>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${season.color}15`, color: season.color }}>
                    {DOSHA_NAMES[season.dosha]}
                  </span>
                </div>
                <p className="text-[13px] text-fg-secondary leading-snug mb-2">{seasonTip}</p>
                <div className="flex gap-2">
                  <div className="flex-1 rounded-xl bg-fill p-2">
                    <p className="text-[10px] text-fg-tertiary uppercase tracking-wide mb-0.5">Ритуал</p>
                    <p className="text-[12px] text-fg leading-snug">{season.ritualTip}</p>
                  </div>
                  <div className="flex-1 rounded-xl bg-fill p-2">
                    <p className="text-[10px] text-fg-tertiary uppercase tracking-wide mb-0.5">Питание</p>
                    <p className="text-[12px] text-fg leading-snug">{season.foodTip}</p>
                  </div>
                </div>
                <Link href="/season" className="flex items-center justify-between mt-3 pt-3 tap" style={{ borderTop: "1px solid var(--lp-line-soft)" }}>
                  <span className="eyebrow" style={{ color: season.color }}>Шесть сезонов Ритучарьи</span>
                  <svg className="w-3 h-3" style={{ color: season.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </div>
            </div>

            {todayEvent && (
              <div className="rounded-2xl overflow-hidden mb-3" style={{ background: todayEvent.gradient }}>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold text-white/80 bg-white/20 px-2.5 py-0.5 rounded-full">Сегодня</span>
                  </div>
                  <p className="text-[17px] font-bold text-white leading-tight mb-1">{todayEvent.title}</p>
                  <p className="text-[13px] text-white/70 mb-2">{todayEvent.subtitle}</p>
                  <p className="text-[13px] text-white/90 leading-snug">{todayEvent.tip}</p>
                </div>
              </div>
            )}

            {upcoming.length > 0 && (
              <div className="flex gap-2">
                {upcoming.map(ev => (
                  <div key={`${ev.month}-${ev.day}`} className="flex-1 glass-card p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: ev.gradient }} />
                      <span className="text-[11px] text-fg-tertiary font-medium">
                        {ev.daysUntil === 1 ? "Завтра" : ev.daysUntil <= 7 ? `Через ${ev.daysUntil} дн.` : ev.dateStr}
                      </span>
                    </div>
                    <p className="text-[13px] font-semibold text-fg leading-tight mb-0.5">{ev.title}</p>
                    <p className="text-[11px] text-fg-secondary leading-snug line-clamp-2">{ev.subtitle}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── 13. COMPLETE YOUR RITUAL (missing steps + cross-sell merged) ── */}
      {(missingSteps.length > 0 || bundleSuggestions.length > 0) && usages.length > 0 && (
        <div className="mb-3">
          <h2 className="section-header mb-1 px-1">Дополни ритуал</h2>
          <p className="text-[13px] text-fg-secondary mb-3 px-1">
            {missingSteps.length > 0
              ? `${missingSteps.length} ${missingSteps.length === 1 ? "шаг" : "шага"} до идеальной программы`
              : "Средства, которые дополнят твой уход"}
          </p>

          {missingSteps.length > 0 && (
            <div className="glass-card overflow-hidden mb-3">
              {missingSteps.slice(0, 3).map(({ step, product }, i) => (
                <Link key={step.order} href={`/catalog/${product!.id}`}
                  className="flex items-center gap-3.5 px-3 py-2.5 tap"
                  style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}>
                  <div className="w-9 h-9 rounded-full bg-brand-subtle flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold">{step.title}</p>
                    <p className="text-[13px] text-fg-secondary truncate">{product!.name}</p>
                  </div>
                  <svg className="w-[18px] h-[18px] text-fg-tertiary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          )}

          {bundleSuggestions.length > 0 && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
              {bundleSuggestions.slice(0, 4).map(product => (
                <div key={product.id} className="shrink-0 w-[150px]">
                  <ProductCard product={product} showScore />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 14. DOSHA TEST CTA (only if no profile) ── */}
      {!profile && (
        <Link href="/test" className="block mb-3 anim-d1">
          <div className="glass-card-interactive p-4 text-center">
            <div className="w-11 h-11 rounded-full bg-brand-subtle mx-auto mb-3 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A18.07 18.07 0 0112 21.75a18.07 18.07 0 01-7.135-1.444c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <h2 className="text-[17px] font-bold mb-1">Узнай свою дошу</h2>
            <p className="text-[13px] text-fg-secondary leading-snug">12 вопросов — и мы подберём уход именно для твоей кожи</p>
          </div>
        </Link>
      )}

      {/* ── 16. INGREDIENT DEEP-DIVE (personalized) ── */}
      {sharedIngredients.length > 0 && (
        <div className="mb-3">
          <div className="glass-card p-3">
            <p className="text-[15px] leading-snug mb-3">
              Твои {usages.length} средств работают вместе и усиливают друг друга в {sharedIngredients.length} направлениях
            </p>
            <div className="flex flex-wrap gap-2">
              {sharedIngredients.slice(0, 5).map(([purpose, count]) => {
                const purposeNames: Record<string, string> = {
                  moisturizing: "Увлажнение", antiAge: "Anti-age", detox: "Детокс",
                  nourishing: "Питание", lifting: "Лифтинг", cleansing: "Очищение",
                  relaxation: "Релаксация", sunProtection: "SPF", antiCellulite: "Антицеллюлит",
                };
                return (
                  <div key={purpose} className="flex items-center gap-1.5 px-3 py-[6px] rounded-full"
                    style={{ backgroundColor: "var(--brand-subtle)" }}>
                    <span className="text-[13px] font-semibold text-brand">{purposeNames[purpose] || purpose}</span>
                    <span className="text-[11px] font-bold text-brand-muted">{count}x</span>
                  </div>
                );
              })}
            </div>
            <Link href="/ingredients" className="block text-[13px] text-brand font-medium mt-3 tap">Подробнее об ингредиентах</Link>
          </div>
        </div>
      )}

      {/* ── 17. PERSONALIZED PRODUCTS ────────────── */}
      {recommendedProducts.length > 0 && (
        <div className="mb-3">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="section-header">
              {dosha ? `Для твоей ${DOSHA_NAMES[dosha].toLowerCase()}` : "Рекомендуем"}
            </h2>
            <Link href="/catalog" className="text-[15px] text-brand font-medium tap">Все</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
            {recommendedProducts.slice(0, 6).map(product => (
              <div key={product.id} className="shrink-0 w-[160px]">
                <ProductCard product={product} showScore />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 18. WEEKLY PICK ──────────────────────── */}
      {seasonalProduct && (
        <div className="mb-3">
          <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-2.5 px-1">Выбор недели</p>
          <Link href={`/catalog/${seasonalProduct.id}`}>
            <div className="glass-card-interactive overflow-hidden">
              <div className="flex gap-4 p-3">
                {seasonalProduct.images[0] && (
                  <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden shrink-0 bg-fill">
                    <img src={`https://spaquatoria.ru${seasonalProduct.images[0].url}`} alt={seasonalProduct.name}
                      className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0 py-0.5">
                  <h3 className="text-[17px] font-bold line-clamp-2 leading-snug">{seasonalProduct.name}</h3>
                  <p className="text-[13px] text-fg-secondary line-clamp-2 mt-1 leading-snug">{seasonalProduct.shortDescription}</p>
                  {seasonalProduct.volumes[0] && (
                    <p className="text-[17px] font-bold text-brand mt-2">
                      {seasonalProduct.volumes[0].retailPrice.toLocaleString("ru-RU")} ₽
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ── 19. AYURVEDA TIPS ────────────────────── */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="section-header">Мир аюрведы</h2>
          <Link href="/about" className="text-[15px] text-brand font-medium tap">О бренде</Link>
        </div>
        <div className="space-y-3">
          {[ayurvedaTip, ayurvedaTip2].map((tip, idx) => (
            <div key={idx} className="glass-card p-3">
              <div className="flex items-start gap-3.5">
                <svg className="w-5 h-5 text-brand shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tip.icon} />
                </svg>
                <div>
                  <h3 className="text-[15px] font-bold mb-1">{tip.title}</h3>
                  <p className="text-[15px] text-fg-secondary leading-relaxed">{tip.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 20. DEALER TIPS (conditional) ─────────── */}
      {isDealer && (
        <div className="mb-3">
          <div className="glass-card p-3 editorial-card" style={{ "--accent-color": "var(--brand)" } as React.CSSProperties}>
            <div className="pl-3">
              <p className="text-[11px] font-semibold text-fg-tertiary uppercase tracking-wide mb-1">Для дилеров</p>
              <p className="text-[15px] font-semibold mb-1">Протокол недели</p>
              <p className="text-[13px] text-fg-secondary leading-snug">
                {`${SALON_PROTOCOLS[dayOfYear % SALON_PROTOCOLS.length].title} — ${SALON_PROTOCOLS[dayOfYear % SALON_PROTOCOLS.length].duration}`}
              </p>
              <Link href="/dealers" className="text-[13px] text-brand font-medium mt-2 block tap">Открыть портал дилера</Link>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD PRODUCT EMPTY STATE ──────────────── */}
      {usages.length === 0 && (
        <div className="mb-3">
          <button onClick={() => setShowAddProduct(true)} className="w-full glass-card-interactive p-4 text-center">
            <div className="w-11 h-11 rounded-full bg-brand-subtle mx-auto mb-3 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <p className="text-[17px] font-bold mb-1">Добавь первое средство</p>
            <p className="text-[13px] text-fg-secondary leading-snug">Мы будем отслеживать расход и подскажем, когда пора заказать новое</p>
          </button>
        </div>
      )}

      {/* ── RECOMMENDED LINE ─────────────────────── */}
      {recommendedLine && (
        <div className="mb-3">
          <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-2.5 px-1">Рекомендуем линию</p>
          <Link href={`/lines/${recommendedLine.id}`}>
            <div className="glass-card-interactive p-3">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `#${recommendedLine.color}12` }}>
                  <span className="text-[22px] font-bold" style={{ color: `#${recommendedLine.color}` }}>
                    {recommendedLine.ageRange.split("–")[0] || recommendedLine.ageRange.replace("+", "")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[17px] font-bold" style={{ color: `#${recommendedLine.color}` }}>
                    {recommendedLine.name}
                  </h3>
                  <p className="text-[13px] text-fg-secondary line-clamp-2 leading-snug mt-0.5">
                    {recommendedLine.tagline}
                  </p>
                </div>
                <svg className="w-[18px] h-[18px] text-fg-tertiary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ═══ MODALS ════════════════════════════════ */}

      {/* Skin check-in modal */}
      {showSkinCheck && (
        <div className="fixed inset-0 z-[70]" onClick={() => setShowSkinCheck(false)}>
          <div className="absolute inset-0 bg-black/30 anim-sheet-backdrop" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }} />
          <div className="absolute inset-0 max-w-lg mx-auto">
          <div className="absolute bottom-0 left-0 right-0 bg-bg-elevated rounded-t-[20px] anim-sheet-up"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 20px)" }}
            onClick={e => e.stopPropagation()}>
            <div className="drag-handle" />
            <div className="px-5 pb-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[17px] font-bold">Дневник кожи</h3>
                <button onClick={() => setShowSkinCheck(false)} className="text-[17px] text-brand tap">Закрыть</button>
              </div>
              {([
                { key: "hydration" as const, label: "Увлажнённость", low: "Сухо", high: "Отлично" },
                { key: "clarity" as const, label: "Чистота", low: "Высыпания", high: "Чисто" },
                { key: "comfort" as const, label: "Комфорт", low: "Раздражение", high: "Комфортно" },
                { key: "glow" as const, label: "Сияние", low: "Тусклость", high: "Сияет" },
              ]).map(({ key, label, low, high }) => (
                <div key={key} className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[15px] font-semibold">{label}</span>
                    <span className="text-[13px] font-medium" style={{ color: skinForm[key] >= 4 ? "var(--brand-green)" : skinForm[key] <= 2 ? "var(--brand-coral)" : "var(--fg-secondary)" }}>
                      {skinForm[key]}/5
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button key={v} onClick={() => setSkinForm({ ...skinForm, [key]: v })}
                        className="flex-1 h-[10px] rounded-full tap transition-all"
                        style={{ backgroundColor: v <= skinForm[key] ? "var(--brand)" : "var(--fill)" }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[11px] text-fg-tertiary">{low}</span>
                    <span className="text-[11px] text-fg-tertiary">{high}</span>
                  </div>
                </div>
              ))}
              <input
                type="text"
                value={skinForm.note}
                onChange={e => setSkinForm({ ...skinForm, note: e.target.value })}
                placeholder="Заметка (необязательно)"
                className="w-full px-4 py-3 rounded-2xl text-[15px] outline-none bg-fill mb-4"
              />
              <button onClick={handleSkinLog}
                className="w-full bg-brand text-white py-3.5 rounded-full text-[15px] font-semibold tap">
                Сохранить
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Vikriti test modal */}
      {showVikritiTest && (
        <div className="fixed inset-0 z-[70]" onClick={() => setShowVikritiTest(false)}>
          <div className="absolute inset-0 bg-black/30 anim-sheet-backdrop" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }} />
          <div className="absolute inset-0 max-w-lg mx-auto">
          <div className="absolute bottom-0 left-0 right-0 bg-bg-elevated rounded-t-[20px] anim-sheet-up"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 20px)" }}
            onClick={e => e.stopPropagation()}>
            <div className="drag-handle" />
            <div className="px-5 pb-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[17px] font-bold">Баланс дош</h3>
                <button onClick={() => setShowVikritiTest(false)} className="text-[17px] text-brand tap">Закрыть</button>
              </div>
              <div className="flex gap-1 mb-5">
                {vikritiQuestions.map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all"
                    style={{ backgroundColor: i <= vikritiStep ? "var(--brand)" : "var(--fill)" }} />
                ))}
              </div>
              <p className="text-[13px] text-fg-secondary mb-2">Вопрос {vikritiStep + 1} из {vikritiQuestions.length}</p>
              <h3 className="text-[20px] font-bold mb-5 leading-tight">{vikritiQuestions[vikritiStep].text}</h3>
              <div className="space-y-2.5">
                {vikritiQuestions[vikritiStep].answers.map(answer => (
                  <button key={answer.id} onClick={() => handleVikritiAnswer(answer.id)}
                    className="w-full glass-card-interactive p-4 text-left text-[15px] leading-snug">
                    {answer.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Vikriti result modal — harmony */}
      {showVikritiResult && !imbalanceAdvice && (
        <div className="fixed inset-0 z-[70]" onClick={() => setShowVikritiResult(false)}>
          <div className="absolute inset-0 bg-black/30 anim-sheet-backdrop" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }} />
          <div className="absolute inset-0 max-w-lg mx-auto">
          <div className="absolute bottom-0 left-0 right-0 bg-bg-elevated rounded-t-[20px] anim-sheet-up"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 20px)" }}
            onClick={e => e.stopPropagation()}>
            <div className="drag-handle" />
            <div className="px-5 pb-6 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-green/10 mx-auto mb-3 flex items-center justify-center">
                <svg className="w-8 h-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-[20px] font-bold mb-1">Доши в гармонии</h3>
              <p className="text-[15px] text-fg-secondary mb-5">Ваш текущий баланс близок к вашей конституции. Продолжайте ухаживать за собой!</p>
              <button onClick={() => setShowVikritiResult(false)}
                className="w-full bg-brand text-white py-3.5 rounded-full text-[15px] font-semibold tap">
                Отлично
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Vikriti result modal — imbalance */}
      {showVikritiResult && imbalanceAdvice && (
        <div className="fixed inset-0 z-[70]" onClick={() => setShowVikritiResult(false)}>
          <div className="absolute inset-0 bg-black/30 anim-sheet-backdrop" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }} />
          <div className="absolute inset-0 max-w-lg mx-auto">
          <div className="absolute bottom-0 left-0 right-0 bg-bg-elevated rounded-t-[20px] anim-sheet-up"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 20px)" }}
            onClick={e => e.stopPropagation()}>
            <div className="drag-handle" />
            <div className="px-5 pb-6">
              <div className="text-center mb-5">
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${DOSHA_COLORS[imbalanceAdvice.dosha]}15` }}>
                  <span className="text-[28px] font-bold" style={{ color: DOSHA_COLORS[imbalanceAdvice.dosha] }}>
                    {DOSHA_NAMES[imbalanceAdvice.dosha][0]}
                  </span>
                </div>
                <h3 className="text-[20px] font-bold mb-1">Результат теста</h3>
                <p className="text-[15px] text-fg-secondary">
                  {DOSHA_NAMES[imbalanceAdvice.dosha]} повышена — нужно {imbalanceAdvice.title.toLowerCase()}
                </p>
              </div>
              <div className="glass-card p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: DOSHA_COLORS[imbalanceAdvice.dosha] }} />
                  <span className="text-[15px] font-semibold">{imbalanceAdvice.title}</span>
                  <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    imbalanceAdvice.level === "strong" ? "bg-red-100 text-red-600" :
                    imbalanceAdvice.level === "moderate" ? "bg-orange-100 text-orange-600" :
                    "bg-green-100 text-green-600"
                  }`}>
                    {imbalanceAdvice.level === "strong" ? "выраженный" : imbalanceAdvice.level === "moderate" ? "умеренный" : "лёгкий"}
                  </span>
                </div>
                <p className="text-[13px] text-fg-secondary leading-snug">{imbalanceAdvice.description}</p>
              </div>
              <button onClick={() => setShowVikritiResult(false)}
                className="w-full bg-brand text-white py-3.5 rounded-full text-[15px] font-semibold tap">
                Понятно
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Add product modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-[70]" onClick={() => { setShowAddProduct(false); setAddProductSearch(""); }}>
          <div className="absolute inset-0 bg-black/30 anim-sheet-backdrop" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }} />
          <div className="absolute inset-0 max-w-lg mx-auto">
          <div className="absolute bottom-0 left-0 right-0 bg-bg-elevated rounded-t-[20px] anim-sheet-up"
            style={{ maxHeight: "75vh", paddingBottom: "env(safe-area-inset-bottom, 20px)" }}
            onClick={e => e.stopPropagation()}>
            <div className="drag-handle" />
            <div className="px-5 mb-3">
              <input
                type="text" value={addProductSearch} onChange={e => setAddProductSearch(e.target.value)}
                placeholder="Поиск средства" autoFocus
                className="w-full px-4 py-3 rounded-2xl text-[17px] outline-none bg-fill"
              />
            </div>
            <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: "calc(75vh - 90px)" }}>
              {products
                .filter(p => {
                  if (!addProductSearch) return true;
                  return p.name.toLowerCase().includes(addProductSearch.toLowerCase());
                })
                .filter(p => !usages.some(u => u.productId === p.id))
                .slice(0, 20)
                .map((p, i) => (
                  <button key={p.id} onClick={() => handleAddProductUsage(p.id)}
                    className="w-full flex items-center gap-3.5 py-3.5 tap text-left"
                    style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}>
                    {p.images[0] && (
                      <div className="w-11 h-11 rounded-[12px] overflow-hidden shrink-0 bg-fill">
                        <img src={`https://spaquatoria.ru${p.images[0].url}`} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium line-clamp-1">{p.name}</p>
                      <p className="text-[13px] text-fg-secondary">{p.volumes[0]?.volume || ""}</p>
                    </div>
                    <svg className="w-5 h-5 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                ))}
            </div>
          </div>
          </div>
        </div>
      )}

    </div>
  );
}
