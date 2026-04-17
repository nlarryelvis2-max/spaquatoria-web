"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { products, getProduct, getImbalanceAdvice } from "@/lib/data";
import {
  loadProfile, loadAgeGroup, loadName, saveAgeGroup,
  loadAccount, saveAccount, UserAccount, SKIN_CONCERN_OPTIONS,
  getProductUsages, saveProductUsage, removeProductUsage, ProductUsage,
  estimateRemainingPercent, estimateDaysLeft,
  getSkinLogs, addSkinLog, SkinLogEntry,
  checkAndAwardBadges, BADGE_DEFINITIONS,
  loadVikritiProfile, saveVikritiProfile, getImbalance,
  addLoyaltyPoints, getLoyaltyHistory, getCurrentLevel, getTotalPoints,
  getStreakDays, calculateSkinScore,
  savePollAnswer, getPollHistory, loadDealerAccount,
} from "@/lib/store";
import {
  INGREDIENT_STORIES, AYURVEDA_TIPS, DOSHA_GREETINGS,
  getCurrentSeason, getUpcomingEvents,
  SOCIAL_REVIEWS, QUICK_POLLS, SALON_PROTOCOLS,
} from "@/lib/content";
import { vikritiQuestions } from "@/lib/questions";
import { hapticLight, hapticMedium, hapticSuccess } from "@/lib/haptics";
import {
  DoshaProfile, getDominantDosha, DOSHA_NAMES, DOSHA_COLORS,
  AGE_NAMES, AGE_SUBTITLES, AgeGroup,
} from "@/lib/types";

type RegStep = "name" | "contacts" | "skin" | "age";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [profile, setProfile] = useState<DoshaProfile | null>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [name, setName] = useState("");
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
  const todayPoll = QUICK_POLLS[dayOfYear % QUICK_POLLS.length];
  const todayReview = SOCIAL_REVIEWS[dayOfYear % SOCIAL_REVIEWS.length];

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

  // Personalized products
  const recommendedProducts = useMemo(() => {
    if (!dosha) return products.filter(p => p.images.length > 0).slice(0, 6);
    return products
      .filter(p => p.doshaAffinity.includes(dosha) && p.images.length > 0)
      .slice(0, 8);
  }, [dosha]);

  // Personalized daily message
  const personalMessage = useMemo(() => {
    if (!dosha) return null;
    const msgs = DOSHA_GREETINGS[dosha] || DOSHA_GREETINGS.vata;
    return msgs[dayOfYear % msgs.length];
  }, [dosha, dayOfYear]);

  // Products running low
  const lowProducts = useMemo(() => {
    return usages
      .map(u => ({ usage: u, product: getProduct(u.productId), remaining: estimateRemainingPercent(u), daysLeft: estimateDaysLeft(u) }))
      .filter(x => x.product && x.remaining <= 30)
      .sort((a, b) => a.remaining - b.remaining);
  }, [usages]);

  // Vikriti imbalance (used by result modal)
  const imbalance = useMemo(() => {
    if (!profile || !vikriti) return [];
    return getImbalance(profile, vikriti);
  }, [profile, vikriti]);

  const imbalanceAdvice = useMemo(() => {
    if (imbalance.length === 0) return null;
    return getImbalanceAdvice(imbalance);
  }, [imbalance]);

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
  // EDITORIAL BRAND HOME
  // ═══════════════════════════════════════════════
  const userName = name || account.name;
  const season = getCurrentSeason();
  const upcomingEvents = getUpcomingEvents(2);
  const todayEvent = upcomingEvents.find(e => e.daysUntil === 0);

  return (
    <div className="max-w-lg mx-auto px-5 pt-4 pb-28">

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

      {/* ── Audience router (three doors) ────────── */}
      <div className="flex items-center gap-1.5 mb-10 text-[11px]" style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}>
        <span className="px-3 py-1.5 rounded-full" style={{ background: "var(--brand)", color: "#fff" }}>Клиент</span>
        <Link href="/dealers" className="px-3 py-1.5 rounded-full tap" style={{ color: "var(--lp-muted)", border: "1px solid var(--lp-line-soft)" }}>Салон</Link>
        <Link href="/b2b" className="px-3 py-1.5 rounded-full tap" style={{ color: "var(--lp-muted)", border: "1px solid var(--lp-line-soft)" }}>Партнёр</Link>
      </div>

      {/* ═══ EDITORIAL HERO ═══════════════════════ */}
      <header className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <span className="eyebrow">{timeGreeting}, {userName}</span>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="eyebrow tap px-2 py-0.5 -mr-2" style={{ color: "var(--lp-tertiary)" }}>Выйти</button>
        </div>

        <div className="relative overflow-hidden mb-8 -mx-5" style={{ borderRadius: "0 0 28px 28px" }}>
          <img src="/brand/hero/face-care.jpg" alt=""
            className="w-full h-[220px] object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--lp-bg) 0%, transparent 60%)" }} />
        </div>

        <h1 className="heading-xl mb-6">
          Ритуал кожи,<br/>
          <span style={{ color: "var(--lp-muted)", fontStyle: "italic" }}>настроенный вами</span>
        </h1>

        {dosha ? (
          <div className="flex items-center gap-3 flex-wrap">
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

        {personalMessage && (
          <p className="body-lp muted mt-6" style={{ maxWidth: "42ch" }}>{personalMessage}</p>
        )}
      </header>

      {/* ═══ IN FOCUS — Ingredient of the Day ═══════ */}
      <section className="mb-14">
        <span className="eyebrow mb-4 block">В фокусе · Ингредиент</span>
        <Link href={`/lines/${ingredientStory.lineId}`} className="block tap">
          <div className="paper-card" style={{ borderLeft: `2px solid ${ingredientStory.color}` }}>
            <h2 className="heading-lg mb-2" style={{ color: ingredientStory.color }}>
              {ingredientStory.title}
            </h2>
            <p className="eyebrow mb-5" style={{ color: "var(--lp-muted)" }}>{ingredientStory.subtitle}</p>
            <p className="body-lp" style={{ lineHeight: 1.7 }}>{ingredientStory.text}</p>
            <div className="flex items-center gap-2 mt-6">
              <span className="eyebrow" style={{ color: ingredientStory.color }}>Читать далее</span>
              <svg className="w-3 h-3" style={{ color: ingredientStory.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </div>
        </Link>
      </section>

      {/* ═══ FROM THE COLLECTION — 3 products ══════ */}
      {recommendedProducts.length >= 3 && (
        <section className="mb-14">
          <div className="flex items-baseline justify-between mb-6">
            <span className="eyebrow">
              {dosha ? `Для ${DOSHA_NAMES[dosha].toLowerCase()}` : "Из коллекции"}
            </span>
            <Link href="/catalog" className="eyebrow tap" style={{ color: "var(--brand)" }}>Вся коллекция →</Link>
          </div>
          <div className="space-y-5">
            {recommendedProducts.slice(0, 3).map((product) => (
              <Link key={product.id} href={`/catalog/${product.id}`} className="flex gap-5 tap group">
                {product.images[0] && (
                  <div className="w-[108px] h-[140px] shrink-0 overflow-hidden" style={{ background: "var(--lp-soft)" }}>
                    <img src={`https://spaquatoria.ru${product.images[0].url}`} alt=""
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                )}
                <div className="flex-1 min-w-0 py-1">
                  <p className="eyebrow mb-2" style={{ color: "var(--lp-tertiary)" }}>
                    {product.purposes?.[0] === "antiAge" ? "Anti-age" :
                     product.purposes?.[0] === "moisturizing" ? "Увлажнение" :
                     product.purposes?.[0] === "nourishing" ? "Питание" :
                     product.purposes?.[0] === "lifting" ? "Лифтинг" :
                     product.purposes?.[0] === "cleansing" ? "Очищение" :
                     "Уход"}
                  </p>
                  <h3 className="heading-md mb-2" style={{ fontWeight: 400 }}>{product.name}</h3>
                  <p className="body-lp muted line-clamp-2 text-[13px]" style={{ lineHeight: 1.5 }}>
                    {product.shortDescription}
                  </p>
                  {product.volumes[0] && (
                    <p className="numeric-lp mt-3 text-[15px]" style={{ color: "var(--lp-ink)" }}>
                      {product.volumes[0].retailPrice.toLocaleString("ru-RU")} ₽
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══ PHILOSOPHY OF THE SEASON ══════════════ */}
      <section className="mb-14">
        <span className="eyebrow mb-4 block">Философия сезона</span>
        <div className="paper-card flat">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="heading-md" style={{ fontWeight: 300, color: season.color }}>
              {season.name}
            </h2>
            <span className="eyebrow" style={{ color: season.color }}>{season.nameEn}</span>
          </div>
          <p className="body-lp mb-6" style={{ lineHeight: 1.7 }}>{season.skinTip}</p>
          <div className="grid grid-cols-2 gap-6 pt-6" style={{ borderTop: "1px solid var(--lp-line-soft)" }}>
            <div>
              <span className="eyebrow mb-2 block" style={{ color: "var(--lp-tertiary)" }}>Ритуал</span>
              <p className="body-lp text-[13px]" style={{ lineHeight: 1.55 }}>{season.ritualTip}</p>
            </div>
            <div>
              <span className="eyebrow mb-2 block" style={{ color: "var(--lp-tertiary)" }}>Питание</span>
              <p className="body-lp text-[13px]" style={{ lineHeight: 1.55 }}>{season.foodTip}</p>
            </div>
          </div>
          <Link href="/season" className="flex items-center gap-2 mt-6 tap">
            <span className="eyebrow" style={{ color: season.color }}>Шесть сезонов Ритучарьи</span>
            <svg className="w-3 h-3" style={{ color: season.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>

        {todayEvent && (
          <div className="mt-4 rounded-[28px] overflow-hidden" style={{ background: todayEvent.gradient }}>
            <div className="p-6">
              <span className="eyebrow mb-2 block" style={{ color: "rgba(255,255,255,0.75)" }}>Сегодня</span>
              <p className="heading-md text-white mb-2" style={{ fontWeight: 400 }}>{todayEvent.title}</p>
              <p className="text-[13px] text-white/80 leading-relaxed">{todayEvent.tip}</p>
            </div>
          </div>
        )}
      </section>

      {/* ═══ FROM THE DIARIES — pull quote ═════════ */}
      <section className="mb-14">
        <span className="eyebrow mb-6 block">Из дневников</span>
        <figure className="px-2">
          <blockquote className="heading-lg mb-6" style={{ fontStyle: "italic", fontWeight: 300, lineHeight: 1.25 }}>
            <span style={{ color: todayReview.doshaColor, fontSize: "1.2em", lineHeight: 0 }}>"</span>
            {todayReview.quote}
            <span style={{ color: todayReview.doshaColor, fontSize: "1.2em", lineHeight: 0 }}>"</span>
          </blockquote>
          <figcaption className="flex items-center gap-3">
            <div className="w-8 h-[1px]" style={{ background: todayReview.doshaColor }} />
            <div>
              <p className="eyebrow" style={{ color: "var(--lp-ink)" }}>{todayReview.name}</p>
              <p className="text-[12px] mt-1" style={{ color: "var(--lp-muted)" }}>
                {todayReview.dosha} · {todayReview.product}
              </p>
            </div>
          </figcaption>
        </figure>
      </section>

      {/* ═══ SCIENCE OF YOUR CARE (conditional) ════ */}
      {sharedIngredients.length >= 2 && (
        <section className="mb-14">
          <span className="eyebrow mb-4 block">Наука вашего ухода</span>
          <p className="heading-md mb-5" style={{ fontWeight: 300, maxWidth: "36ch" }}>
            {usages.length} средств работают в синергии —
            усиливая друг друга в {sharedIngredients.length} направлениях.
          </p>
          <div className="flex flex-wrap gap-2">
            {sharedIngredients.slice(0, 5).map(([purpose, count]) => {
              const purposeNames: Record<string, string> = {
                moisturizing: "Увлажнение", antiAge: "Anti-age", detox: "Детокс",
                nourishing: "Питание", lifting: "Лифтинг", cleansing: "Очищение",
                relaxation: "Релаксация", sunProtection: "SPF", antiCellulite: "Антицеллюлит",
              };
              return (
                <span key={purpose} className="pill-chip soft">
                  {purposeNames[purpose] || purpose}
                  <span className="numeric-lp ml-2" style={{ color: "var(--lp-muted)" }}>×{count}</span>
                </span>
              );
            })}
          </div>
          <Link href="/ingredients" className="inline-flex items-center gap-2 mt-6 tap">
            <span className="eyebrow" style={{ color: "var(--brand)" }}>Об ингредиентах</span>
            <svg className="w-3 h-3" style={{ color: "var(--brand)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </section>
      )}

      {/* ═══ VOICE OF AYURVEDA ═════════════════════ */}
      <section className="mb-14">
        <span className="eyebrow mb-4 block">Голос аюрведы</span>
        <div className="paper-card flat">
          <h3 className="heading-md mb-3" style={{ fontWeight: 400 }}>{ayurvedaTip.title}</h3>
          <p className="body-lp" style={{ lineHeight: 1.7 }}>{ayurvedaTip.text}</p>
        </div>
      </section>

      {/* ═══ TODAY — single subtle interaction ═════ */}
      <section className="mb-14">
        <span className="eyebrow mb-4 block">Сегодня</span>
        <p className="heading-md mb-5" style={{ fontWeight: 300 }}>{todayPoll.question}</p>
        {!pollAnswer ? (
          <div className="flex flex-wrap gap-2">
            {todayPoll.options.map(opt => (
              <button key={opt.id} onClick={() => handlePollVote(opt.id)}
                className="pill-chip tap" style={{ padding: "10px 18px" }}>
                <span className="mr-2">{opt.emoji}</span>
                {opt.text}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {todayPoll.options.map(opt => {
              const isSelected = opt.id === pollAnswer;
              return (
                <div key={opt.id} className="relative overflow-hidden h-[40px]" style={{ borderBottom: "1px solid var(--lp-line-soft)" }}>
                  <div className="absolute inset-y-0 left-0 transition-all"
                    style={{
                      width: `${opt.simulatedPct}%`,
                      background: isSelected ? "var(--lp-soft)" : "transparent",
                    }} />
                  <div className="relative flex items-center justify-between h-full">
                    <span className="text-[14px]">
                      <span className="mr-2">{opt.emoji}</span>
                      {opt.text}
                      {isSelected && <span className="eyebrow ml-3" style={{ color: "var(--brand)" }}>·вы</span>}
                    </span>
                    <span className="numeric-lp text-[14px]" style={{ color: "var(--lp-muted)" }}>{opt.simulatedPct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══ DEALER STRIP (conditional, discreet) ══ */}
      {isDealer && (
        <section className="mb-14">
          <div className="paper-card flat" style={{ borderLeft: "2px solid var(--brand)" }}>
            <span className="eyebrow mb-2 block" style={{ color: "var(--brand)" }}>Для партнёров</span>
            <p className="heading-md mb-2" style={{ fontWeight: 400 }}>Протокол недели</p>
            <p className="body-lp muted text-[14px] mb-4">
              {`${SALON_PROTOCOLS[dayOfYear % SALON_PROTOCOLS.length].title} — ${SALON_PROTOCOLS[dayOfYear % SALON_PROTOCOLS.length].duration}`}
            </p>
            <Link href="/dealers" className="inline-flex items-center gap-2 tap">
              <span className="eyebrow" style={{ color: "var(--brand)" }}>Портал дилера</span>
              <svg className="w-3 h-3" style={{ color: "var(--brand)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* ═══ REORDER STRIP (conditional, subtle) ═══ */}
      {lowProducts.length > 0 && (
        <section className="mb-14">
          <span className="eyebrow mb-4 block" style={{ color: "var(--brand-coral, #D24B3E)" }}>Пора обновить</span>
          <div className="space-y-3">
            {lowProducts.slice(0, 2).map(({ usage, product, remaining, daysLeft }) => product && (
              <Link key={usage.productId} href={`/catalog/${product.id}`}
                className="flex items-center gap-4 tap" style={{ paddingBottom: 12, borderBottom: "1px solid var(--lp-line-soft)" }}>
                {product.images[0] && (
                  <div className="w-[48px] h-[48px] shrink-0 overflow-hidden" style={{ background: "var(--lp-soft)" }}>
                    <img src={`https://spaquatoria.ru${product.images[0].url}`} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] line-clamp-1">{product.name}</p>
                  <p className="eyebrow mt-1" style={{ color: "var(--lp-tertiary)" }}>
                    <span className="numeric-lp">{remaining}%</span> · {daysLeft} дн. осталось
                  </p>
                </div>
                <span className="eyebrow" style={{ color: "var(--brand)" }}>Заказать →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══ STATUS PILL — thin footer link to profile ═══ */}
      {(streak.current > 0 || skinScore.hasData || (loyaltyInfo && getTotalPoints() > 0)) && (
        <Link href="/profile" className="block mb-6 tap">
          <div className="flex items-center gap-4 py-4 text-[12px]"
            style={{ borderTop: "1px solid var(--lp-line-soft)", borderBottom: "1px solid var(--lp-line-soft)" }}>
            {streak.current > 0 && (
              <span className="flex items-baseline gap-1.5">
                <span className="numeric-lp text-[18px]" style={{ color: "var(--lp-ink)" }}>{streak.current}</span>
                <span className="eyebrow" style={{ color: "var(--lp-tertiary)" }}>
                  {streak.current === 1 ? "день" : streak.current < 5 ? "дня" : "дней"}
                </span>
              </span>
            )}
            {skinScore.hasData && (
              <span className="flex items-baseline gap-1.5">
                <span className="numeric-lp text-[18px]"
                  style={{ color: skinScore.score >= 75 ? "var(--brand-green, #6A8E5F)" : skinScore.score >= 50 ? "var(--brand-orange, #C98B4F)" : "var(--brand-coral, #D24B3E)" }}>
                  {skinScore.score}
                </span>
                <span className="eyebrow" style={{ color: "var(--lp-tertiary)" }}>score</span>
              </span>
            )}
            {loyaltyInfo && getTotalPoints() > 0 && (
              <span className="flex items-baseline gap-1.5">
                <span className="numeric-lp text-[18px]" style={{ color: "var(--lp-ink)" }}>{getTotalPoints().toLocaleString("ru-RU")}</span>
                <span className="eyebrow" style={{ color: "var(--lp-tertiary)" }}>баллов</span>
              </span>
            )}
            <span className="ml-auto eyebrow" style={{ color: "var(--lp-muted)" }}>Мой путь →</span>
          </div>
        </Link>
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
