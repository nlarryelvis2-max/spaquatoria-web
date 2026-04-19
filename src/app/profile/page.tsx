"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { products } from "@/lib/data";
import {
  loadAccount, UserAccount, saveAccount, clearAccount, SKIN_CONCERN_OPTIONS,
  loadProfile, loadAgeGroup, clearProfile,
  getFavorites, getOwned, loadName,
  getBadges, Badge,
  getCurrentLevel, getTotalPoints, getLoyaltyHistory, LOYALTY_LEVELS, POINTS_CONFIG, LoyaltyAction,
  getStreakDays, calculateSkinScore, getSkinLogs, getReferralCode,
  getProductUsages, getViewedIngredientsCount,
  loadVikritiProfile, getImbalance,
  loadDealerAccount,
  getJourneyMilestones,
} from "@/lib/store";
import {
  DoshaProfile, getDominantDosha, DOSHA_NAMES, DOSHA_SUBTITLES, DOSHA_COLORS,
  AGE_SUBTITLES, AgeGroup, DoshaType,
} from "@/lib/types";

// Progress hints for locked badges
function getBadgeProgress(badgeId: string, ctx: {
  usages: number; logs: number; viewedIngredients: number; vikriti: boolean; skinGlowMax: number;
}): string | null {
  switch (badgeId) {
    case "first-ritual": return ctx.usages >= 1 ? null : "Добавь первое средство";
    case "shelf-5": return ctx.usages >= 5 ? null : `Ещё ${5 - ctx.usages} до 5`;
    case "diary-7": return ctx.logs >= 7 ? null : `Ещё ${7 - ctx.logs} записей`;
    case "diary-30": return ctx.logs >= 30 ? null : `Ещё ${30 - ctx.logs} записей`;
    case "ingredients-20": return ctx.viewedIngredients >= 20 ? null : `Ещё ${20 - ctx.viewedIngredients} ингредиентов`;
    case "full-line": return "Собери линию";
    case "vikriti-test": return ctx.vikriti ? null : "Пройди Викрити";
    case "skin-glow": return ctx.skinGlowMax >= 5 ? null : "Достигни сияния 5/5";
    default: return null;
  }
}

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [profile, setProfile] = useState<DoshaProfile | null>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UserAccount | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loyaltyInfo, setLoyaltyInfo] = useState<ReturnType<typeof getCurrentLevel> | null>(null);
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyAction[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showLoyaltyDetail, setShowLoyaltyDetail] = useState(false);
  const [streak, setStreak] = useState<ReturnType<typeof getStreakDays>>({ current: 0, best: 0, todayLogged: false });
  const [skinScore, setSkinScore] = useState<ReturnType<typeof calculateSkinScore>>({ score: 0, trend: 0, hasData: false });
  const [referralCode, setReferralCode] = useState("");
  const [referralCopied, setReferralCopied] = useState(false);
  const [skinLogs, setSkinLogs] = useState<ReturnType<typeof getSkinLogs>>([]);
  const [vikriti, setVikriti] = useState<DoshaProfile | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [ownedCount, setOwnedCount] = useState(0);
  const [viewedIngredients, setViewedIngredients] = useState(0);
  const [isDealer, setIsDealer] = useState(false);
  const [milestones, setMilestones] = useState<ReturnType<typeof getJourneyMilestones>>([]);

  useEffect(() => {
    setMounted(true);
    setAccount(loadAccount());
    setProfile(loadProfile());
    setAgeGroup(loadAgeGroup());
    setFavorites(getFavorites());
    setBadges(getBadges());
    setLoyaltyInfo(getCurrentLevel());
    setLoyaltyHistory(getLoyaltyHistory());
    setTotalPoints(getTotalPoints());
    setStreak(getStreakDays());
    setSkinScore(calculateSkinScore());
    setReferralCode(getReferralCode());
    setSkinLogs(getSkinLogs());
    setVikriti(loadVikritiProfile());
    setUsageCount(getProductUsages().length);
    setOwnedCount(getOwned().length);
    setViewedIngredients(getViewedIngredientsCount());
    setIsDealer(!!loadDealerAccount());
    setMilestones(getJourneyMilestones());
  }, []);

  const dosha = profile ? getDominantDosha(profile) : null;

  const favoriteProducts = useMemo(() =>
    products.filter(p => favorites.includes(p.id)), [favorites]);

  const imbalance = useMemo(() => {
    if (!profile || !vikriti) return [];
    return getImbalance(profile, vikriti);
  }, [profile, vikriti]);

  const earnedBadges = badges.filter(b => b.earnedAt);
  const ritualCount = useMemo(() => loyaltyHistory.filter(a => a.type === "ritual").length, [loyaltyHistory]);
  const skinGlowMax = useMemo(() => skinLogs.reduce((m, l) => Math.max(m, l.glow), 0), [skinLogs]);
  const skinImprovement = useMemo(() => {
    if (skinLogs.length < 14) return 0;
    const first = skinLogs.slice(0, 7);
    const last = skinLogs.slice(-7);
    const avg = (arr: typeof skinLogs) =>
      arr.reduce((s, l) => s + (l.hydration + l.clarity + l.comfort + l.glow) / 4, 0) / arr.length;
    const start = avg(first);
    const end = avg(last);
    if (start === 0) return 0;
    return Math.round(((end - start) / start) * 100);
  }, [skinLogs]);

  function startEdit() {
    setForm(account ? { ...account } : null);
    setEditing(true);
  }

  function saveEdit() {
    if (!form) return;
    saveAccount(form);
    setAccount(form);
    setEditing(false);
  }

  function handleClearAll() {
    clearAccount();
    clearProfile();
    localStorage.removeItem("favorites");
    localStorage.removeItem("owned");
    localStorage.removeItem("userName");
    window.location.href = "/";
  }

  function toggleConcern(c: string) {
    if (!form) return;
    const set = new Set(form.skinConcerns);
    set.has(c) ? set.delete(c) : set.add(c);
    setForm({ ...form, skinConcerns: [...set] });
  }

  if (!mounted) return null;

  if (!account) {
    return (
      <div className="max-w-md mx-auto px-5 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-fill mx-auto mb-3 flex items-center justify-center">
          <svg className="w-8 h-8 text-fg-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <h1 className="text-[20px] font-bold text-fg mb-1">Профиль</h1>
        <p className="text-[14px] text-fg-secondary mb-5">Зарегистрируйся для персональных рекомендаций</p>
        <Link href="/" className="inline-block bg-brand text-white px-8 py-3 rounded text-[15px] font-semibold tap">
          Зарегистрироваться
        </Link>
      </div>
    );
  }

  if (editing && form) {
    return (
      <div className="max-w-md mx-auto px-5 py-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setEditing(false)} className="text-[17px] text-brand tap">Отмена</button>
          <h1 className="text-[17px] font-semibold">Редактирование</h1>
          <button onClick={saveEdit} className="text-[17px] text-brand font-semibold tap">Готово</button>
        </div>
        <div className="glass-card overflow-hidden">
          {[
            { label: "Имя", type: "text", value: form.name, key: "name" },
            { label: "Email", type: "email", value: form.email, key: "email" },
            { label: "Телефон", type: "tel", value: form.phone, key: "phone" },
            { label: "Город", type: "text", value: form.city, key: "city" },
            { label: "Дата рождения", type: "date", value: form.birthdate, key: "birthdate" },
          ].map((field, i) => (
            <div key={field.key} className="px-4 py-2.5" style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}>
              <label className="text-[11px] font-semibold text-fg-secondary uppercase tracking-wide">{field.label}</label>
              <input
                type={field.type}
                value={field.value}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                className="w-full mt-0.5 text-[16px] bg-transparent outline-none"
              />
            </div>
          ))}
        </div>
        <div className="mt-3">
          <p className="text-[11px] font-semibold text-fg-secondary uppercase tracking-wide mb-2 px-1">Проблемы кожи</p>
          <div className="flex flex-wrap gap-1.5">
            {SKIN_CONCERN_OPTIONS.map(c => (
              <button key={c} onClick={() => toggleConcern(c)}
                className={`px-3 py-1.5 rounded text-[12px] font-medium tap ${
                  form.skinConcerns.includes(c) ? "bg-brand text-white" : "glass-card text-fg-secondary"
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sorted: [DoshaType, number][] = profile
    ? ([["vata", profile.vata], ["pitta", profile.pitta], ["kapha", profile.kapha]] as [DoshaType, number][]).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="max-w-md mx-auto px-5 py-5 pb-28">

      {/* ── 1. HERO: Banner + Avatar + Name + Dosha ───── */}
      <div className="mb-6">
        <div className="relative overflow-hidden -mx-5 mb-5" style={{ borderRadius: "0 0 8px 8px" }}>
          <img src="/brand/hero/body-care.jpg" alt="" className="w-full h-[180px] object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--lp-bg) 0%, transparent 55%)" }} />
        </div>

        <div className="flex items-center gap-4 -mt-12 relative">
          <div className="w-16 h-16 flex items-center justify-center shrink-0"
            style={{ background: dosha ? `${DOSHA_COLORS[dosha]}18` : "var(--lp-soft)", borderRadius: "50%", border: "3px solid var(--lp-bg)" }}>
            <span className="text-[22px] font-light" style={{ color: dosha ? DOSHA_COLORS[dosha] : "var(--lp-muted)", letterSpacing: "0.04em" }}>
              {account.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="heading-md mb-1.5">{account.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              {dosha && (
                <span className="pill-chip" style={{ color: DOSHA_COLORS[dosha], borderColor: DOSHA_COLORS[dosha], padding: "4px 10px", fontSize: "11px" }}>
                  <span className="w-[5px] h-[5px] rounded-full mr-1.5" style={{ backgroundColor: DOSHA_COLORS[dosha] }} />
                  {DOSHA_NAMES[dosha]}
                </span>
              )}
              {ageGroup && <span className="text-[11px]" style={{ color: "var(--lp-muted)", letterSpacing: "0.02em" }}>{AGE_SUBTITLES[ageGroup]}</span>}
              {loyaltyInfo && (
                <span className="text-[11px] flex items-center gap-1" style={{ color: "var(--lp-muted)" }}>
                  <span>{loyaltyInfo.icon}</span>{loyaltyInfo.name}
                </span>
              )}
            </div>
          </div>
          <button onClick={startEdit} className="tap p-2">
            <svg className="w-[18px] h-[18px]" style={{ color: "var(--lp-tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── 2. BY THE NUMBERS — 4 stat cards ───────── */}
      <div className="mb-3">
        <p className="text-[11px] font-semibold text-fg-secondary uppercase tracking-wide mb-2 px-0.5">В цифрах</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: usageCount + ownedCount, l: "средств попробовано", icon: "🧴" },
            { v: skinLogs.length, l: "дней дневника", icon: "📝" },
            { v: viewedIngredients, l: "ингредиентов изучено", icon: "🔬" },
            { v: ritualCount, l: "ритуалов пройдено", icon: "✨" },
          ].map(s => (
            <div key={s.l} className="glass-card p-3">
              <div className="flex items-baseline gap-1.5 mb-0.5">
                <span className="text-[16px]">{s.icon}</span>
                <span className="numeric-lp text-[22px] font-bold tabular-nums">{s.v}</span>
              </div>
              <p className="text-[10px] text-fg-tertiary leading-tight">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. JOURNEY TIMELINE ──────────────────── */}
      {milestones.length > 0 && (
        <div className="glass-card p-4 mb-3">
          <p className="text-[11px] font-semibold text-fg-secondary uppercase tracking-wide mb-3">Твоя история</p>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px" style={{ backgroundColor: "var(--separator)" }} />
            {milestones.map((m, i) => (
              <div key={i} className="relative flex items-start gap-3 pb-3 last:pb-0">
                <div className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--lp-soft)" }}>
                  <span className="text-[12px]">{m.icon}</span>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[13px] font-medium">{m.label}</p>
                  <p className="text-[10px] text-fg-tertiary">
                    {new Date(m.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. SKIN PROGRESS (merged: score + streak + 30d chart) ── */}
      {(skinScore.hasData || skinLogs.length > 0) && (
        <div className="glass-card p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-fg-secondary uppercase tracking-wide">Прогресс кожи</p>
            {skinImprovement !== 0 && skinLogs.length >= 14 && (
              <span className={`text-[11px] font-semibold ${skinImprovement > 0 ? "text-brand-green" : "text-brand-coral"}`}>
                {skinImprovement > 0 ? "↑" : "↓"}{Math.abs(skinImprovement)}% с начала
              </span>
            )}
          </div>

          {/* Score + Streak row */}
          <div className="flex items-center gap-4 mb-3">
            {skinScore.hasData ? (
              <div className="relative w-16 h-16 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--fill-secondary)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none"
                    stroke={skinScore.score >= 75 ? "#34C759" : skinScore.score >= 50 ? "#FF9500" : "#FF3B30"}
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${(skinScore.score / 100) * 97.4} 97.4`} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[18px] font-bold tabular-nums">{skinScore.score}</span>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-fill flex items-center justify-center shrink-0">
                <span className="text-[11px] text-fg-tertiary font-semibold">—</span>
              </div>
            )}
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-fg-secondary">Skin Score</p>
              {skinScore.trend !== 0 && (
                <p className={`text-[11px] font-medium ${skinScore.trend > 0 ? "text-brand-green" : "text-brand-coral"}`}>
                  {skinScore.trend > 0 ? "↑" : "↓"}{Math.abs(skinScore.trend)} за неделю
                </p>
              )}
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <span className="text-[18px]">{streak.current > 0 ? "🔥" : "📝"}</span>
                <span className="numeric-lp text-[22px] font-bold tabular-nums">{streak.current}</span>
              </div>
              <p className="text-[10px] text-fg-tertiary">
                streak · best {streak.best}
              </p>
            </div>
          </div>

          {/* 30-day chart */}
          {skinLogs.length >= 3 && (
            <>
              <div className="flex items-end gap-[2px] h-14">
                {skinLogs.slice(-30).map((log, i) => {
                  const avg = (log.hydration + log.clarity + log.comfort + log.glow) / 4;
                  const h = (avg / 5) * 100;
                  const color = avg >= 4 ? "#34C759" : avg >= 3 ? "var(--brand)" : "#FF3B30";
                  return <div key={i} className="flex-1 rounded-[2px]" style={{ height: `${h}%`, backgroundColor: color, minHeight: 3 }} />;
                })}
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[9px] text-fg-tertiary">
                  {new Date(skinLogs[Math.max(0, skinLogs.length - 30)].date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                </span>
                <span className="text-[9px] text-fg-tertiary">{skinLogs.length} записей · сегодня</span>
              </div>
            </>
          )}
          {skinLogs.length < 3 && (
            <p className="text-[11px] text-fg-tertiary text-center py-3">
              Записывай в дневник каждый день — через неделю здесь появится график
            </p>
          )}
        </div>
      )}

      {/* ── 5. DOSHA JOURNEY (Prakriti + Vikriti) ──── */}
      {profile && dosha && (
        <div className="glass-card p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-fg-secondary uppercase tracking-wide">Доша-путь</p>
            <Link href="/test" className="text-[11px] text-brand tap">{vikriti ? "Обновить" : "Викрити"}</Link>
          </div>

          <div className="flex items-center gap-4 mb-3">
            {/* Prakriti rings */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {sorted.map(([d, value], i) => {
                    const r = i === 0 ? 15.5 : i === 1 ? 11 : 6.5;
                    const c = 2 * Math.PI * r;
                    return (
                      <g key={d}>
                        <circle cx="18" cy="18" r={r} fill="none" stroke={`${DOSHA_COLORS[d]}22`} strokeWidth="2.5" />
                        <circle cx="18" cy="18" r={r} fill="none" stroke={DOSHA_COLORS[d]} strokeWidth="2.5" strokeLinecap="round"
                          strokeDasharray={`${value * c} ${c}`} />
                      </g>
                    );
                  })}
                </svg>
              </div>
              <p className="text-[10px] font-semibold text-fg-secondary">Пракрити</p>
            </div>

            {vikriti && (
              <>
                <div className="text-[18px] text-fg-tertiary">→</div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="relative w-16 h-16">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      {(["vata", "pitta", "kapha"] as DoshaType[])
                        .map(d => ({ d, v: vikriti[d] }))
                        .sort((a, b) => b.v - a.v)
                        .map(({ d, v }, i) => {
                          const r = i === 0 ? 15.5 : i === 1 ? 11 : 6.5;
                          const c = 2 * Math.PI * r;
                          return (
                            <g key={d}>
                              <circle cx="18" cy="18" r={r} fill="none" stroke={`${DOSHA_COLORS[d]}22`} strokeWidth="2.5" />
                              <circle cx="18" cy="18" r={r} fill="none" stroke={DOSHA_COLORS[d]} strokeWidth="2.5" strokeLinecap="round"
                                strokeDasharray={`${v * c} ${c}`} />
                            </g>
                          );
                        })}
                    </svg>
                  </div>
                  <p className="text-[10px] font-semibold text-fg-secondary">Викрити</p>
                </div>
              </>
            )}

            {!vikriti && (
              <div className="flex-1">
                <p className="text-[11px] text-fg-secondary mb-1">Проверь текущий баланс</p>
                <Link href="/test" className="text-[11px] text-brand font-semibold tap">Пройти Викрити →</Link>
              </div>
            )}
          </div>

          {/* Dosha percentages / deltas */}
          {vikriti ? (
            <div className="flex gap-1.5">
              {(["vata", "pitta", "kapha"] as DoshaType[]).map(d => {
                const pVal = Math.round(profile[d] * 100);
                const vVal = Math.round(vikriti[d] * 100);
                const delta = vVal - pVal;
                return (
                  <div key={d} className="flex-1 rounded-lg bg-fill p-2 text-center">
                    <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: DOSHA_COLORS[d] }} />
                    <p className="text-[10px] font-semibold" style={{ color: DOSHA_COLORS[d] }}>{DOSHA_NAMES[d]}</p>
                    <p className="text-[12px] font-bold tabular-nums">{pVal}→{vVal}%</p>
                    {delta !== 0 && (
                      <p className={`text-[10px] font-bold ${delta > 0 ? "text-brand-coral" : "text-brand-green"}`}>
                        {delta > 0 ? `↑${delta}` : `↓${Math.abs(delta)}`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex gap-1.5">
              {sorted.map(([d, value]) => (
                <div key={d} className="flex-1 rounded-lg bg-fill p-2 text-center">
                  <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: DOSHA_COLORS[d] }} />
                  <p className="text-[10px] font-semibold" style={{ color: DOSHA_COLORS[d] }}>{DOSHA_NAMES[d]}</p>
                  <p className="text-[13px] font-bold tabular-nums">{Math.round(value * 100)}%</p>
                </div>
              ))}
            </div>
          )}

          {imbalance.length > 0 && (
            <div className="mt-2.5 px-3 py-2 rounded-lg" style={{ background: "var(--lp-soft)" }}>
              <p className="text-[11px] text-fg-secondary">
                <span className="font-semibold">Рекомендация:</span>{" "}
                {imbalance[0].dosha === "vata" && "снизь Вату — масляные сыворотки, тёплые процедуры"}
                {imbalance[0].dosha === "pitta" && "снизь Питту — охлаждающий уход, жемчужные формулы"}
                {imbalance[0].dosha === "kapha" && "снизь Капху — пилинги, стимулирующие маски"}
              </p>
            </div>
          )}
        </div>
      )}

      {!profile && (
        <Link href="/test" className="glass-card p-4 mb-3 flex items-center gap-3 tap">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--lp-soft)" }}>
            <span className="text-[20px]">🧬</span>
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold">Узнай свою дошу</p>
            <p className="text-[11px] text-fg-tertiary">7 вопросов · 2 минуты</p>
          </div>
          <svg className="w-4 h-4 text-fg-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      )}

      {/* ── 6. LOYALTY PROGRAM ───────────────────── */}
      {loyaltyInfo && (
        <button onClick={() => setShowLoyaltyDetail(!showLoyaltyDetail)}
          className="w-full glass-card p-3 mb-2 tap text-left">
          <div className="flex items-center gap-3">
            <span className="text-[24px]">{loyaltyInfo.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-semibold">{loyaltyInfo.name}</p>
                <p className="text-[14px] font-bold text-brand tabular-nums">{totalPoints.toLocaleString("ru-RU")}</p>
              </div>
              {loyaltyInfo.nextLevel && (
                <div className="mt-1.5">
                  <div className="h-[4px] bg-fill rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full" style={{ width: `${loyaltyInfo.progress * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-fg-tertiary mt-0.5">
                    до {loyaltyInfo.nextLevel.name}: {(loyaltyInfo.nextLevel.minPoints - totalPoints).toLocaleString("ru-RU")} баллов
                  </p>
                </div>
              )}
            </div>
            <svg className={`w-3.5 h-3.5 text-fg-tertiary shrink-0 transition-transform ${showLoyaltyDetail ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </button>
      )}

      {showLoyaltyDetail && loyaltyInfo && (
        <div className="glass-card overflow-hidden mb-2" style={{ animation: "scale-in 0.15s ease-out" }}>
          <div className="flex gap-0.5 px-3 pt-3 pb-2">
            {LOYALTY_LEVELS.map(lvl => {
              const isActive = totalPoints >= lvl.minPoints;
              const isCurrent = loyaltyInfo.level === lvl.level;
              return (
                <div key={lvl.level} className="flex-1 text-center">
                  <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center ${isCurrent ? "ring-2 ring-brand" : ""}`}
                    style={{ backgroundColor: isActive ? "var(--brand-subtle)" : "var(--fill)" }}>
                    <span className={`text-[14px] ${!isActive ? "opacity-30" : ""}`}>{lvl.icon}</span>
                  </div>
                  <p className={`text-[9px] font-semibold mt-0.5 ${isCurrent ? "text-brand" : "text-fg-tertiary"}`}>{lvl.name}</p>
                </div>
              );
            })}
          </div>
          {loyaltyHistory.length > 0 && loyaltyHistory.slice(-3).reverse().map((action, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2"
              style={{ borderTop: "0.5px solid var(--separator)" }}>
              <div>
                <p className="text-[13px]">{action.description}</p>
                <p className="text-[10px] text-fg-tertiary">{new Date(action.date).toLocaleDateString("ru-RU")}</p>
              </div>
              <span className="text-[13px] font-semibold text-brand-green">+{action.points}</span>
            </div>
          ))}
          <div className="px-3 py-2" style={{ borderTop: "0.5px solid var(--separator)" }}>
            <p className="text-[10px] text-fg-tertiary">
              {[
                `Дневник +${POINTS_CONFIG.skinLog}`,
                `Тест +${POINTS_CONFIG.doshaTest}`,
                `Отзыв +${POINTS_CONFIG.review}`,
                `Ритуал +${POINTS_CONFIG.ritual}`,
              ].join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* ── 7. ACHIEVEMENTS with progress hints ───── */}
      {badges.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <p className="text-[11px] font-semibold text-fg-secondary uppercase tracking-wide">
              Достижения · {earnedBadges.length}/{badges.length}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {badges.map(badge => {
              const earned = !!badge.earnedAt;
              const hint = earned ? null : getBadgeProgress(badge.id, {
                usages: usageCount, logs: skinLogs.length,
                viewedIngredients, vikriti: !!vikriti, skinGlowMax,
              });
              return (
                <div key={badge.id}
                  className={`glass-card py-2 px-1 text-center ${!earned ? "opacity-60" : ""}`}>
                  <span className={`text-[22px] block ${!earned ? "grayscale" : ""}`}>{badge.icon}</span>
                  <p className="text-[9px] font-semibold mt-0.5 line-clamp-1 px-0.5">{badge.name}</p>
                  {hint && <p className="text-[8px] text-fg-tertiary mt-0.5 line-clamp-2 leading-tight">{hint}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 8. FAVORITES GALLERY (2-column grid) ──── */}
      {favoriteProducts.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <p className="text-[11px] font-semibold text-fg-secondary uppercase tracking-wide">Избранное · {favoriteProducts.length}</p>
            <Link href="/catalog" className="text-[11px] text-brand tap">Каталог →</Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {favoriteProducts.slice(0, 6).map(product => (
              <Link key={product.id} href={`/catalog/${product.id}`}
                className="glass-card overflow-hidden tap">
                {product.images[0] && (
                  <img src={product.images[0].url} alt="" className="w-full h-28 object-cover product-img" />
                )}
                <div className="p-2">
                  <p className="text-[11px] font-medium line-clamp-2 leading-tight">{product.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── 9. REFERRAL CARD ─────────────────────── */}
      {referralCode && (
        <div className="glass-card p-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold">Пригласи подругу</p>
              <p className="text-[10px] text-fg-tertiary">+500 баллов обеим</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-mono font-bold tracking-wider text-fg-secondary">{referralCode}</span>
              <button onClick={() => {
                navigator.clipboard.writeText(`Попробуй SPAquatoria! Мой код: ${referralCode}`);
                setReferralCopied(true);
                setTimeout(() => setReferralCopied(false), 2000);
              }} className="px-3 py-1.5 bg-brand text-white rounded-lg text-[12px] font-semibold tap shrink-0">
                {referralCopied ? "✓" : "Копировать"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 10. PERSONAL INFO (with concerns) ─────── */}
      <div className="glass-card overflow-hidden mb-2">
        {[
          { label: "Email", value: account.email || "—" },
          { label: "Телефон", value: account.phone || "—" },
          { label: "Город", value: account.city || "—" },
          { label: "Дата рождения", value: account.birthdate ? new Date(account.birthdate).toLocaleDateString("ru-RU") : "—" },
        ].map((item, i) => (
          <div key={item.label} className="flex items-center justify-between px-3 py-2.5"
            style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}>
            <span className="text-[14px] text-fg-secondary">{item.label}</span>
            <span className="text-[14px]">{item.value}</span>
          </div>
        ))}
        {account.skinConcerns.length > 0 && (
          <div className="px-3 py-2.5 flex flex-wrap gap-1.5" style={{ borderTop: "0.5px solid var(--separator)" }}>
            {account.skinConcerns.map(c => (
              <span key={c} className="px-2 py-0.5 rounded text-[11px] font-medium bg-brand/10 text-brand">{c}</span>
            ))}
          </div>
        )}
        <button onClick={startEdit} className="w-full px-3 py-2.5 text-left tap"
          style={{ borderTop: "0.5px solid var(--separator)" }}>
          <span className="text-[14px] text-brand font-medium">Изменить данные</span>
        </button>
      </div>

      {/* ── 11-12. DEALER LINK + DELETE DATA ─────── */}
      <div className="glass-card overflow-hidden mb-2">
        {isDealer && (
          <Link href="/dealers" className="flex items-center justify-between px-3 py-2.5 tap">
            <span className="text-[14px]">Кабинет дилера</span>
            <svg className="w-4 h-4 text-fg-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        )}
        <button onClick={() => setShowConfirmClear(true)}
          className="w-full text-left px-3 py-2.5 tap"
          style={isDealer ? { borderTop: "0.5px solid var(--separator)" } : undefined}>
          <span className="text-[14px] text-brand-coral">Удалить все данные</span>
        </button>
      </div>

      <p className="text-center text-[10px] text-fg-tertiary mt-4">
        С {new Date(account.registeredAt).toLocaleDateString("ru-RU")}
      </p>

      {/* Confirm dialog */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center" onClick={() => setShowConfirmClear(false)}>
          <div className="absolute inset-0 bg-black/20" style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} />
          <div className="glass-card p-5 mx-8 relative text-center max-w-lg" style={{ animation: "scale-in 0.2s ease-out" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-[17px] font-semibold mb-1">Удалить все данные?</h3>
            <p className="text-[13px] text-fg-secondary mb-4">Профиль, тесты, избранное и средства будут удалены</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmClear(false)}
                className="flex-1 py-2.5 rounded glass-card text-[15px] font-semibold tap">
                Отмена
              </button>
              <button onClick={handleClearAll}
                className="flex-1 py-2.5 rounded bg-brand-coral text-white text-[15px] font-semibold tap">
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
