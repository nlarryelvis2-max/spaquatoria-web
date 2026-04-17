"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dealers, products } from "@/lib/data";
import { loadDealerAccount, saveDealerAccount, clearDealerAccount, DealerAccount } from "@/lib/store";
import {
  SALON_PROTOCOLS, getCurrentSeason, INGREDIENT_STORIES,
  FACTORY_INVENTORY, getDealerRecommendations, getDealerInsights,
  DealerRecommendation,
} from "@/lib/content";
import { DOSHA_NAMES } from "@/lib/types";

// Demo dealer data
const DEMO_DEALERS: Record<string, DealerAccount> = {
  "demo": {
    dealerId: "d1", login: "demo", companyName: "СПА-Салон \"Гармония\"",
    status: "gold", balance: 184_500, totalPurchases: 2_870_000,
    lastOrderDate: "2026-04-01", ordersCount: 47, discount: 25,
    managerName: "Отдел продаж SPAquatoria", managerPhone: "+7 (495) 773-30-99",
  },
  "partner": {
    dealerId: "d2", login: "partner", companyName: "Beauty Space Moscow",
    status: "platinum", balance: 412_000, totalPurchases: 7_340_000,
    lastOrderDate: "2026-04-10", ordersCount: 124, discount: 35,
    managerName: "Отдел продаж SPAquatoria", managerPhone: "+7 (929) 675-33-22",
  },
};

const STATUS_CONFIG = {
  silver: { label: "Silver", color: "#8E8E93", next: "Gold", threshold: "1 000 000 ₽", thresholdNum: 1_000_000 },
  gold: { label: "Gold", color: "#FFD60A", next: "Platinum", threshold: "5 000 000 ₽", thresholdNum: 5_000_000 },
  platinum: { label: "Platinum", color: "#E5A6FF", next: null, threshold: null, thresholdNum: 10_000_000 },
};

const RECENT_ORDERS = [
  { id: "ORD-2047", date: "01.04.2026", amount: 87_400, items: 12, status: "delivered" as const },
  { id: "ORD-2031", date: "15.03.2026", amount: 124_600, items: 18, status: "delivered" as const },
  { id: "ORD-2019", date: "28.02.2026", amount: 63_200, items: 8, status: "delivered" as const },
  { id: "ORD-2008", date: "10.02.2026", amount: 95_800, items: 14, status: "delivered" as const },
  { id: "ORD-1994", date: "25.01.2026", amount: 142_300, items: 21, status: "delivered" as const },
  { id: "ORD-1978", date: "08.01.2026", amount: 78_500, items: 10, status: "delivered" as const },
];

// Monthly sales data (last 6 months)
const MONTHLY_SALES = [
  { month: "Ноя", amount: 156_000 },
  { month: "Дек", amount: 234_000 },
  { month: "Янв", amount: 220_800 },
  { month: "Фев", amount: 159_000 },
  { month: "Мар", amount: 124_600 },
  { month: "Апр", amount: 87_400 },
];

// Top products by revenue
const TOP_PRODUCTS = [
  { productId: "497", qty: 84, revenue: 412_000, trend: 12 },
  { productId: "981", qty: 67, revenue: 356_000, trend: -5 },
  { productId: "982", qty: 52, revenue: 298_000, trend: 8 },
  { productId: "983", qty: 48, revenue: 276_000, trend: 22 },
  { productId: "984", qty: 41, revenue: 234_000, trend: -3 },
];

// ABC analysis
const ABC_DATA = {
  A: { count: 18, revenue: 68, description: "Хиты — 80% выручки" },
  B: { count: 45, revenue: 24, description: "Середняки — стабильный спрос" },
  C: { count: 210, revenue: 8, description: "Длинный хвост" },
};

const ORDER_STATUS_CONFIG = {
  pending: { label: "В обработке", color: "#FF9500", bg: "#FF950015" },
  shipped: { label: "В пути", color: "#007AFF", bg: "#007AFF15" },
  delivered: { label: "Доставлен", color: "#34C759", bg: "#34C75915" },
  cancelled: { label: "Отменён", color: "#FF3B30", bg: "#FF3B3015" },
};

type Tab = "dashboard" | "protocols" | "analytics" | "orders" | "catalog" | "manager";

export default function DealersPage() {
  const [mounted, setMounted] = useState(false);
  const [account, setAccount] = useState<DealerAccount | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAccount(loadDealerAccount());
  }, []);

  function handleLogin() {
    const demo = DEMO_DEALERS[loginInput.toLowerCase()];
    if (demo) {
      saveDealerAccount(demo);
      setAccount(demo);
      setLoginError("");
    } else {
      setLoginError("Неверный логин. Попробуйте: demo или partner");
    }
  }

  function handleLogout() {
    clearDealerAccount();
    setAccount(null);
    setShowLogout(false);
    setTab("dashboard");
  }

  // Forecasting
  const forecast = useMemo(() => {
    const recent3 = MONTHLY_SALES.slice(-3);
    const avg = recent3.reduce((s, m) => s + m.amount, 0) / 3;
    const trend = (recent3[2].amount - recent3[0].amount) / recent3[0].amount;
    const nextMonth = Math.round(avg * (1 + trend * 0.3));
    const nextQuarter = nextMonth * 3;
    return { nextMonth, nextQuarter, trend: Math.round(trend * 100) };
  }, []);

  // Smart recommendations
  const recommendations = useMemo(() => {
    if (!account) return [];
    const topIds = TOP_PRODUCTS.map(tp => tp.productId);
    return getDealerRecommendations(topIds, account.discount, Math.round(account.totalPurchases / account.ordersCount));
  }, [account]);

  // Dealer insights
  const insights = useMemo(() => {
    if (!account) return [];
    return getDealerInsights(account.totalPurchases, account.ordersCount, account.discount);
  }, [account]);

  const maxSale = Math.max(...MONTHLY_SALES.map(m => m.amount));

  if (!mounted) return null;

  // ─── Public dealer list (not logged in) ────────
  if (!account) {
    return (
      <div className="max-w-lg mx-auto px-5 py-6">
        <div className="relative -mx-5 mb-6 overflow-hidden" style={{ borderRadius: "0 0 28px 28px" }}>
          <img src="/brand/hero/training.jpg" alt=""
            className="w-full h-[160px] object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--lp-bg) 0%, transparent 50%)" }} />
        </div>
        <p className="eyebrow mb-3">Партнёры</p>
        <h1 className="heading-xl mb-3">Дилеры</h1>
        <p className="body-lp muted mb-8">Где купить SPAquatoria</p>

        {/* Dealer login */}
        <div className="glass-card p-5 mb-5">
          <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-3">Вход для дилеров</p>
          <div className="flex gap-2 mb-2">
            <input
              type="text" value={loginInput}
              onChange={e => { setLoginInput(e.target.value); setLoginError(""); }}
              placeholder="Логин дилера"
              className="flex-1 px-4 py-2.5 rounded-2xl text-[15px] outline-none bg-fill"
              onKeyDown={e => e.key === "Enter" && loginInput && handleLogin()}
            />
            <button onClick={handleLogin} disabled={!loginInput}
              className="bg-brand text-white px-5 py-2.5 rounded-full text-[15px] font-semibold tap disabled:opacity-40">
              Войти
            </button>
          </div>
          {loginError && <p className="text-[13px] text-brand-coral">{loginError}</p>}
        </div>

        {/* Public dealer list */}
        <div className="glass-card overflow-hidden">
          {dealers.map((dealer, i) => (
            <div key={dealer.id} className="px-4 py-4"
              style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}>
              <h3 className="text-[15px] font-semibold text-brand">{dealer.companyName}</h3>
              <p className="text-[13px] text-fg-secondary mt-0.5">{dealer.address}, {dealer.city}</p>
              <div className="flex flex-wrap gap-3 mt-2.5">
                {dealer.phones.map(phone => (
                  <a key={phone} href={`tel:${phone}`} className="text-[13px] text-brand tap">{phone}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 glass-card p-4 text-center">
          <p className="text-[13px] text-fg-secondary mb-2">Хотите стать дилером?</p>
          <Link href="/b2b" className="text-[15px] text-brand font-semibold tap">Оставить заявку</Link>
        </div>
      </div>
    );
  }

  // ─── Dealer Portal (logged in) ────────────────
  const statusCfg = STATUS_CONFIG[account.status];
  const avgOrder = Math.round(account.totalPurchases / account.ordersCount);
  const ordersPerMonth = +(account.ordersCount / 12).toFixed(1);

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-28">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="eyebrow mb-1">Кабинет дилера</p>
          <h1 className="heading-md leading-tight">{account.companyName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusCfg.color }} />
            <span className="text-[13px] font-semibold" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
            <span className="text-[13px] text-fg-tertiary">·</span>
            <span className="text-[13px] text-fg-secondary">скидка {account.discount}%</span>
          </div>
        </div>
        <button onClick={() => setShowLogout(true)} className="text-[13px] text-fg-tertiary tap mt-1">Выйти</button>
      </div>

      {/* Tab scroll */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar -mx-5 px-5 mb-5">
        {([
          { key: "dashboard" as Tab, label: "Обзор" },
          { key: "protocols" as Tab, label: "Протоколы" },
          { key: "analytics" as Tab, label: "Аналитика" },
          { key: "orders" as Tab, label: "Заказы" },
          { key: "catalog" as Tab, label: "Каталог" },
          { key: "manager" as Tab, label: "Менеджер" },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`shrink-0 px-4 py-[7px] rounded-full text-[13px] font-semibold transition-all tap ${
              tab === t.key ? "bg-brand text-white" : "bg-fill text-fg-secondary"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ DASHBOARD ═══════════════════════════ */}
      {tab === "dashboard" && (
        <div className="space-y-4">
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="paper-card" style={{ padding: 16 }}>
              <p className="eyebrow">Баланс</p>
              <p className="numeric-lp text-[24px] mt-2" style={{ color: "var(--lp-ink)" }}>{account.balance.toLocaleString("ru-RU")} ₽</p>
            </div>
            <div className="paper-card" style={{ padding: 16 }}>
              <p className="eyebrow">Всего закупок</p>
              <p className="numeric-lp text-[24px] mt-2" style={{ color: "var(--lp-accent)" }}>{(account.totalPurchases / 1_000_000).toFixed(1)}M ₽</p>
            </div>
            <div className="paper-card" style={{ padding: 16 }}>
              <p className="eyebrow">Заказов</p>
              <p className="numeric-lp text-[24px] mt-2" style={{ color: "var(--lp-ink)" }}>{account.ordersCount}</p>
              <p className="text-[11px]" style={{ color: "var(--lp-muted)" }}>~{ordersPerMonth}/мес</p>
            </div>
            <div className="paper-card" style={{ padding: 16 }}>
              <p className="eyebrow">Ср. чек</p>
              <p className="numeric-lp text-[24px] mt-2" style={{ color: "var(--lp-ink)" }}>{(avgOrder / 1000).toFixed(0)}K ₽</p>
            </div>
          </div>

          {/* Status progress */}
          {statusCfg.next && (
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] font-semibold">До {statusCfg.next}</p>
                <p className="text-[13px] text-fg-secondary">{(account.totalPurchases / 1_000_000).toFixed(1)}M / {statusCfg.threshold}</p>
              </div>
              <div className="h-[6px] bg-fill rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{
                  width: `${Math.min(100, (account.totalPurchases / statusCfg.thresholdNum) * 100)}%`,
                  backgroundColor: statusCfg.color,
                }} />
              </div>
            </div>
          )}

          {/* Mini sales chart */}
          <div className="glass-card p-4">
            <p className="text-[13px] font-semibold mb-3">Динамика закупок</p>
            <div className="flex items-end gap-[4px] h-16">
              {MONTHLY_SALES.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="w-full rounded-[3px]" style={{
                    height: `${(m.amount / maxSale) * 100}%`,
                    backgroundColor: i === MONTHLY_SALES.length - 1 ? "var(--brand)" : "var(--fill-secondary)",
                    minHeight: 4,
                  }} />
                  <span className="text-[9px] text-fg-tertiary mt-1">{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Forecast card */}
          <div className="glass-card p-4 editorial-card" style={{ "--accent-color": forecast.trend >= 0 ? "var(--brand-green)" : "var(--brand-coral)" } as React.CSSProperties}>
            <div className="pl-3">
              <p className="eyebrow mb-2">Прогноз</p>
              <div className="flex items-baseline gap-3">
                <div>
                  <p className="text-[11px]" style={{ color: "var(--lp-muted)" }}>Май 2026</p>
                  <p className="numeric-lp text-[22px]">{(forecast.nextMonth / 1000).toFixed(0)}K ₽</p>
                </div>
                <div>
                  <p className="text-[11px]" style={{ color: "var(--lp-muted)" }}>Квартал</p>
                  <p className="numeric-lp text-[22px]">{(forecast.nextQuarter / 1000).toFixed(0)}K ₽</p>
                </div>
                <div className="ml-auto">
                  <p className={`numeric-lp text-[16px] ${forecast.trend >= 0 ? "text-brand-green" : "text-brand-coral"}`}>
                    {forecast.trend >= 0 ? "+" : ""}{forecast.trend}%
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--lp-tertiary)" }}>тренд</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Smart Recommendations ──────────────── */}
          {recommendations.length > 0 && (
            <div className="glass-card p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-fg-tertiary uppercase tracking-wide">Умные рекомендации</p>
                <span className="text-[11px] font-semibold text-brand px-2 py-0.5 rounded-full bg-brand/10">{recommendations.length}</span>
              </div>
              <div className="space-y-2">
                {recommendations.slice(0, 4).map((rec, i) => {
                  const typeConfig: Record<string, { icon: string; color: string }> = {
                    promo: { icon: "🏷", color: "#FF9500" },
                    restock: { icon: "⚠️", color: "#FF3B30" },
                    bundle: { icon: "📦", color: "#007AFF" },
                    gap: { icon: "🔍", color: "#8E8E93" },
                    seasonal: { icon: "🌿", color: "#34C759" },
                  };
                  const cfg = typeConfig[rec.type] || typeConfig.gap;
                  const product = rec.products[0] ? products.find(p => p.id === rec.products[0]) : null;
                  return (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-fill">
                      <span className="text-[16px] mt-0.5 shrink-0">{cfg.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-semibold leading-tight">{rec.title}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-[1px] rounded-full shrink-0 ${
                            rec.priority === "high" ? "bg-[#FF3B3015] text-[#FF3B30]" :
                            rec.priority === "medium" ? "bg-[#FF950015] text-[#FF9500]" :
                            "bg-fill-secondary text-fg-tertiary"
                          }`}>
                            {rec.priority === "high" ? "Важно" : rec.priority === "medium" ? "Совет" : "Идея"}
                          </span>
                        </div>
                        {product && (
                          <p className="text-[11px] text-brand font-medium mt-0.5">{product.name}</p>
                        )}
                        <p className="text-[11px] text-fg-secondary leading-snug mt-0.5">{rec.reason}</p>
                        {rec.savings && (
                          <p className="text-[11px] font-semibold mt-0.5" style={{ color: cfg.color }}>{rec.savings}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {recommendations.length > 4 && (
                <button onClick={() => setTab("analytics")} className="w-full text-center text-[13px] text-brand font-semibold mt-2 tap">
                  Все рекомендации →
                </button>
              )}
            </div>
          )}

          {/* ── Factory Stock Alerts ─────────────────── */}
          {(() => {
            const lowStock = FACTORY_INVENTORY.filter(s => s.stock < 50);
            const promos = FACTORY_INVENTORY.filter(s => s.promo);
            if (lowStock.length === 0 && promos.length === 0) return null;
            return (
              <div className="glass-card p-3">
                <p className="text-[11px] font-semibold text-fg-tertiary uppercase tracking-wide mb-2">Склад фабрики</p>
                <div className="space-y-1.5">
                  {lowStock.map(s => {
                    const product = products.find(p => p.id === s.productId);
                    return product ? (
                      <div key={s.productId} className="flex items-center justify-between py-1.5"
                        style={{ borderBottom: "0.5px solid var(--separator)" }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[12px]">⚠️</span>
                          <p className="text-[13px] font-medium truncate">{product.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[12px] font-bold text-brand-coral">{s.stock} шт.</p>
                          <p className="text-[10px] text-fg-tertiary">срок {s.leadTime + 14} дн.</p>
                        </div>
                      </div>
                    ) : null;
                  })}
                  {promos.map(s => {
                    const product = products.find(p => p.id === s.productId);
                    return product ? (
                      <div key={`promo-${s.productId}`} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[12px]">🏷</span>
                          <p className="text-[13px] font-medium truncate">{product.name}</p>
                        </div>
                        <span className="text-[12px] font-bold text-brand-green shrink-0">−{s.promoDiscount}% доп.</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            );
          })()}

          {/* What your clients see */}
          {(() => {
            const season = getCurrentSeason();
            const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
            const todayIngredient = INGREDIENT_STORIES[dayOfYear % INGREDIENT_STORIES.length];
            return (
              <div className="glass-card p-4">
                <p className="text-[11px] font-semibold text-fg-tertiary uppercase tracking-wide mb-2">Что видят ваши клиенты сегодня</p>
                <div className="flex gap-3">
                  <div className="flex-1 rounded-xl bg-fill p-3">
                    <p className="text-[10px] text-fg-tertiary uppercase tracking-wide mb-1">Сезон</p>
                    <p className="text-[13px] font-semibold">{season.name}</p>
                    <p className="text-[11px] text-fg-secondary">{DOSHA_NAMES[season.dosha]}</p>
                  </div>
                  <div className="flex-1 rounded-xl bg-fill p-3">
                    <p className="text-[10px] text-fg-tertiary uppercase tracking-wide mb-1">Ингредиент дня</p>
                    <p className="text-[13px] font-semibold">{todayIngredient.title}</p>
                    <p className="text-[11px] text-fg-secondary">{todayIngredient.subtitle}</p>
                  </div>
                </div>
                <p className="text-[12px] text-fg-secondary leading-snug mt-2 italic">
                  Используйте эту информацию при презентации продуктов клиентам
                </p>
              </div>
            );
          })()}

          {/* Quick actions */}
          <div className="glass-card overflow-hidden">
            <button onClick={() => setTab("protocols")} className="w-full flex items-center justify-between px-4 py-3.5 tap">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <span className="text-[15px] font-semibold">Протоколы процедур</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-fg-tertiary">{SALON_PROTOCOLS.length}</span>
                <svg className="w-4 h-4 text-fg-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>
            <button onClick={() => setTab("catalog")} className="w-full flex items-center justify-between px-4 py-3.5 tap"
              style={{ borderTop: "0.5px solid var(--separator)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <span className="text-[15px] font-semibold">Новый заказ</span>
              </div>
              <svg className="w-4 h-4 text-fg-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <button onClick={() => setTab("analytics")} className="w-full flex items-center justify-between px-4 py-3.5 tap"
              style={{ borderTop: "0.5px solid var(--separator)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <span className="text-[15px] font-semibold">Аналитика продаж</span>
              </div>
              <svg className="w-4 h-4 text-fg-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <button onClick={() => setTab("manager")} className="w-full flex items-center justify-between px-4 py-3.5 tap"
              style={{ borderTop: "0.5px solid var(--separator)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <span className="text-[15px] font-semibold">Ваш менеджер</span>
              </div>
              <svg className="w-4 h-4 text-fg-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ═══ PROTOCOLS ═══════════════════════════ */}
      {tab === "protocols" && (
        <div className="space-y-4">
          <p className="text-[15px] text-fg-secondary leading-snug">
            Готовые SPA-протоколы для вашего салона. Каждый включает пошаговую инструкцию и список продуктов.
          </p>

          {SALON_PROTOCOLS.map(proto => {
            const diffColors = { basic: "#34C759", advanced: "#FF9500", master: "#FF3B30" };
            const diffLabels = { basic: "Базовый", advanced: "Продвинутый", master: "Мастер" };
            return (
              <div key={proto.id} className="glass-card overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-[17px] font-bold leading-tight">{proto.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${diffColors[proto.difficulty]}15`, color: diffColors[proto.difficulty] }}>
                          {diffLabels[proto.difficulty]}
                        </span>
                        <span className="text-[12px] text-fg-secondary">{proto.duration}</span>
                        {proto.doshaFocus !== "all" && (
                          <span className="text-[12px] text-fg-tertiary">{DOSHA_NAMES[proto.doshaFocus]}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="mt-3 space-y-1.5">
                    {proto.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-[13px] text-fg leading-snug">{step}</p>
                      </div>
                    ))}
                  </div>

                  {/* Price + tip */}
                  <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: "0.5px solid var(--separator)" }}>
                    <div>
                      <p className="text-[11px] text-fg-tertiary uppercase tracking-wide">Рекомендуемая цена</p>
                      <p className="text-[15px] font-bold text-brand">{proto.priceSuggestion}</p>
                    </div>
                  </div>
                  <p className="text-[12px] text-fg-secondary leading-snug mt-2 italic">{proto.tip}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ ANALYTICS ═══════════════════════════ */}
      {tab === "analytics" && (
        <div className="space-y-4">

          {/* ── Dealer Insights ──────────────────────── */}
          {insights.length > 0 && (
            <div className="glass-card p-3">
              <p className="text-[11px] font-semibold text-fg-tertiary uppercase tracking-wide mb-2">Ваш профиль</p>
              <div className="grid grid-cols-2 gap-2">
                {insights.map(ins => (
                  <div key={ins.label} className="rounded-xl bg-fill p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[14px]">{ins.icon}</span>
                      <p className="text-[10px] font-semibold text-fg-tertiary uppercase tracking-wide">{ins.label}</p>
                    </div>
                    <p className="text-[15px] font-bold" style={{ color: ins.color }}>{ins.value}</p>
                    <p className="text-[10px] text-fg-secondary leading-tight mt-0.5">{ins.subtext}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── All Recommendations ──────────────────── */}
          {recommendations.length > 0 && (
            <div className="glass-card p-3">
              <p className="text-[11px] font-semibold text-fg-tertiary uppercase tracking-wide mb-2">Рекомендации · {recommendations.length}</p>
              <div className="space-y-2">
                {recommendations.map((rec, i) => {
                  const typeConfig: Record<string, { icon: string; color: string; label: string }> = {
                    promo: { icon: "🏷", color: "#FF9500", label: "Акция" },
                    restock: { icon: "⚠️", color: "#FF3B30", label: "Дефицит" },
                    bundle: { icon: "📦", color: "#007AFF", label: "Комплект" },
                    gap: { icon: "🔍", color: "#8E8E93", label: "Рост" },
                    seasonal: { icon: "🌿", color: "#34C759", label: "Сезон" },
                  };
                  const cfg = typeConfig[rec.type] || typeConfig.gap;
                  return (
                    <div key={i} className="p-2.5 rounded-xl" style={{ backgroundColor: `${cfg.color}08`, borderLeft: `3px solid ${cfg.color}` }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[14px]">{cfg.icon}</span>
                        <p className="text-[13px] font-semibold flex-1">{rec.title}</p>
                        <span className="text-[9px] font-bold px-1.5 py-[1px] rounded-full"
                          style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-fg-secondary leading-snug">{rec.description}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[11px] text-fg-tertiary italic">{rec.reason}</p>
                        {rec.savings && (
                          <p className="text-[11px] font-bold shrink-0" style={{ color: cfg.color }}>{rec.savings}</p>
                        )}
                      </div>
                      {rec.products.length > 0 && (
                        <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                          {rec.products.map(pid => {
                            const p = products.find(pr => pr.id === pid);
                            return p ? (
                              <Link key={pid} href={`/catalog/${pid}`} className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-fill tap">
                                {p.images[0] && <img src={p.images[0].url} alt="" className="w-5 h-5 rounded object-cover" />}
                                <span className="text-[11px] font-medium">{p.name.split(" ").slice(0, 2).join(" ")}</span>
                              </Link>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sales chart full */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-fg-secondary">Продажи по месяцам</p>
              <p className="text-[13px] text-fg-tertiary">6 мес.</p>
            </div>
            <div className="flex items-end gap-[6px] h-28">
              {MONTHLY_SALES.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <p className="text-[10px] font-bold text-fg-secondary mb-1">{(m.amount / 1000).toFixed(0)}K</p>
                  <div className="w-full rounded-[4px]" style={{
                    height: `${(m.amount / maxSale) * 80}%`,
                    backgroundColor: i === MONTHLY_SALES.length - 1 ? "var(--brand)" : "var(--brand-muted)",
                    minHeight: 4,
                  }} />
                  <span className="text-[10px] text-fg-tertiary mt-1.5">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "0.5px solid var(--separator)" }}>
              <div>
                <p className="text-[11px] text-fg-secondary">Всего за период</p>
                <p className="text-[17px] font-bold">{(MONTHLY_SALES.reduce((s, m) => s + m.amount, 0) / 1000).toFixed(0)}K ₽</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-fg-secondary">Среднее/мес</p>
                <p className="text-[17px] font-bold">{(MONTHLY_SALES.reduce((s, m) => s + m.amount, 0) / MONTHLY_SALES.length / 1000).toFixed(0)}K ₽</p>
              </div>
            </div>
          </div>

          {/* Forecast */}
          <div className="glass-card p-4">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-fg-secondary mb-3">Прогноз</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-fill rounded-2xl p-3 text-center">
                <p className="text-[11px] text-fg-secondary">Май</p>
                <p className="text-[17px] font-bold">{(forecast.nextMonth / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-fill rounded-2xl p-3 text-center">
                <p className="text-[11px] text-fg-secondary">Квартал</p>
                <p className="text-[17px] font-bold">{(forecast.nextQuarter / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-fill rounded-2xl p-3 text-center">
                <p className="text-[11px] text-fg-secondary">Тренд</p>
                <p className={`text-[17px] font-bold ${forecast.trend >= 0 ? "text-brand-green" : "text-brand-coral"}`}>
                  {forecast.trend >= 0 ? "+" : ""}{forecast.trend}%
                </p>
              </div>
            </div>
            <p className="text-[12px] text-fg-tertiary mt-2">
              На основе скользящего среднего за 3 месяца с коррекцией на тренд
            </p>
          </div>

          {/* ABC analysis */}
          <div className="glass-card p-4">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-fg-secondary mb-3">ABC-анализ ассортимента</p>
            {(["A", "B", "C"] as const).map((grade) => {
              const d = ABC_DATA[grade];
              const colors = { A: "var(--brand-green)", B: "var(--brand-orange)", C: "var(--brand-coral)" };
              return (
                <div key={grade} className="flex items-center gap-3 py-2.5"
                  style={grade !== "A" ? { borderTop: "0.5px solid var(--separator)" } : undefined}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0"
                    style={{ backgroundColor: colors[grade] }}>
                    {grade}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[15px] font-semibold">{d.count} позиций</p>
                      <p className="text-[15px] font-bold">{d.revenue}% выручки</p>
                    </div>
                    <p className="text-[12px] text-fg-secondary">{d.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top products */}
          <div className="glass-card p-4">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-fg-secondary mb-3">Топ-5 продуктов</p>
            {TOP_PRODUCTS.map((tp, i) => {
              const product = products.find(p => p.id === tp.productId);
              if (!product) return null;
              return (
                <Link key={tp.productId} href={`/catalog/${tp.productId}`}
                  className="flex items-center gap-3 py-3 tap"
                  style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}>
                  <span className="text-[17px] font-bold text-fg-tertiary w-5 text-center shrink-0">{i + 1}</span>
                  {product.images[0] && (
                    <div className="w-10 h-10 rounded-[10px] overflow-hidden shrink-0 bg-fill">
                      <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium line-clamp-1">{product.name}</p>
                    <p className="text-[12px] text-fg-secondary">{tp.qty} шт · {(tp.revenue / 1000).toFixed(0)}K ₽</p>
                  </div>
                  <span className={`text-[13px] font-bold shrink-0 ${tp.trend >= 0 ? "text-brand-green" : "text-brand-coral"}`}>
                    {tp.trend >= 0 ? "+" : ""}{tp.trend}%
                  </span>
                </Link>
              );
            })}
          </div>

          {/* KPIs */}
          <div className="glass-card p-4">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-fg-secondary mb-3">Ключевые показатели</p>
            {[
              { label: "Средний чек", value: `${(avgOrder / 1000).toFixed(0)}K ₽`, trend: "+8%" },
              { label: "Заказов в месяц", value: `${ordersPerMonth}`, trend: "+2%" },
              { label: "Повторные закупки", value: "94%", trend: "+1%" },
              { label: "Оборачиваемость", value: "18 дней", trend: "-3 дня" },
              { label: "Маржинальность", value: `${account.discount + 15}%`, trend: "—" },
            ].map((kpi, i) => (
              <div key={kpi.label} className="flex items-center justify-between py-2.5"
                style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}>
                <span className="text-[14px] text-fg-secondary">{kpi.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold">{kpi.value}</span>
                  <span className="text-[11px] text-brand-green font-medium">{kpi.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ ORDERS ══════════════════════════════ */}
      {tab === "orders" && (
        <div className="space-y-4">
          {/* Order summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="paper-card text-center" style={{ padding: 12 }}>
              <p className="numeric-lp text-[22px]">{account.ordersCount}</p>
              <p className="eyebrow mt-1">Всего</p>
            </div>
            <div className="paper-card text-center" style={{ padding: 12 }}>
              <p className="numeric-lp text-[22px] text-brand-green">46</p>
              <p className="eyebrow mt-1">Доставлено</p>
            </div>
            <div className="paper-card text-center" style={{ padding: 12 }}>
              <p className="numeric-lp text-[22px] text-brand-orange">1</p>
              <p className="eyebrow mt-1">В пути</p>
            </div>
          </div>

          {/* Order list */}
          <div className="glass-card overflow-hidden">
            {RECENT_ORDERS.map((order, i) => {
              const statusCfg = ORDER_STATUS_CONFIG[order.status];
              return (
                <div key={order.id} className="px-4 py-3.5"
                  style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[15px] font-semibold">{order.id}</span>
                    <span className="text-[15px] font-bold">{order.amount.toLocaleString("ru-RU")} ₽</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-fg-secondary">{order.date} · {order.items} позиций</span>
                    <span className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full"
                      style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ CATALOG ══════════════════════════════ */}
      {tab === "catalog" && (
        <div className="space-y-4">
          <div className="glass-card p-5 text-center">
            <svg className="w-10 h-10 text-brand mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            <p className="text-[17px] font-bold mb-1">Оптовый каталог</p>
            <p className="text-[13px] text-fg-secondary mb-4">Ваша скидка: <span className="font-bold text-brand">{account.discount}%</span></p>
            <Link href="/catalog"
              className="inline-block bg-brand text-white px-6 py-3 rounded-full text-[15px] font-semibold tap">
              Перейти в каталог
            </Link>
          </div>

          <div className="glass-card p-4">
            <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-2">Условия заказа</p>
            {[
              { label: "Минимальный заказ", value: "30 000 ₽" },
              { label: "Бесплатная доставка", value: "от 50 000 ₽" },
              { label: "Срок доставки", value: "2-5 рабочих дней" },
              { label: "Оплата", value: "Предоплата / Постоплата 14 дн." },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center justify-between py-2.5"
                style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}>
                <span className="text-[14px] text-fg-secondary">{item.label}</span>
                <span className="text-[14px] font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ MANAGER ══════════════════════════════ */}
      {tab === "manager" && (
        <div className="space-y-4">
          {/* Manager card */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-brand-subtle flex items-center justify-center shrink-0">
                <span className="numeric-lp text-[22px] text-brand">{account.managerName.charAt(0)}</span>
              </div>
              <div>
                <p className="text-[17px] font-bold">{account.managerName}</p>
                <p className="text-[13px] text-fg-secondary">Персональный менеджер</p>
              </div>
            </div>

            <div className="space-y-2">
              <a href={`tel:${account.managerPhone}`}
                className="flex items-center gap-3 bg-brand text-white rounded-2xl px-4 py-3 tap">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <span className="text-[15px] font-semibold">{account.managerPhone}</span>
              </a>
              <a href={`mailto:b2b@spaquatoria.ru`}
                className="flex items-center gap-3 bg-fill rounded-2xl px-4 py-3 tap">
                <svg className="w-5 h-5 text-fg-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span className="text-[15px] font-medium text-fg-secondary">b2b@spaquatoria.ru</span>
              </a>
            </div>
          </div>

          {/* Working hours */}
          <div className="glass-card p-4">
            <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-2">Режим работы</p>
            {[
              { day: "Пн — Пт", time: "9:00 — 18:00" },
              { day: "Сб", time: "10:00 — 15:00" },
              { day: "Вс", time: "Выходной" },
            ].map((item, i) => (
              <div key={item.day} className="flex items-center justify-between py-2"
                style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}>
                <span className="text-[14px]">{item.day}</span>
                <span className="text-[14px] text-fg-secondary">{item.time}</span>
              </div>
            ))}
          </div>

          {/* Support topics */}
          <div className="glass-card overflow-hidden">
            <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide px-4 pt-3 pb-2">Помощь</p>
            {[
              "Вопрос по заказу",
              "Возврат / обмен",
              "Маркетинговые материалы",
              "Обучение персонала",
              "Претензия по качеству",
            ].map((topic, i) => (
              <button key={topic} className="w-full flex items-center justify-between px-4 py-3 tap text-left"
                style={{ borderTop: "0.5px solid var(--separator)" }}>
                <span className="text-[15px]">{topic}</span>
                <svg className="w-4 h-4 text-fg-tertiary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Logout confirm */}
      {showLogout && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center" onClick={() => setShowLogout(false)}>
          <div className="absolute inset-0 bg-black/20" style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} />
          <div className="glass-card p-6 mx-8 relative text-center max-w-lg" style={{ animation: "scale-in 0.2s ease-out" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-[17px] font-semibold mb-2">Выйти из кабинета?</h3>
            <p className="text-[13px] text-fg-secondary mb-5">{account.companyName}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)}
                className="flex-1 py-2.5 rounded-full glass-card text-[15px] font-semibold tap">Отмена</button>
              <button onClick={handleLogout}
                className="flex-1 py-2.5 rounded-full bg-brand text-white text-[15px] font-semibold tap">Выйти</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
