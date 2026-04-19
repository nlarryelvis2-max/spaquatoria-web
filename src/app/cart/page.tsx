"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getCart, addToCart, removeFromCart, deleteFromCart, clearCart,
  getCartTotal, getCartCount, CartItem,
} from "@/lib/cart";
import { products, routines, getComplementaryProducts } from "@/lib/data";
import { loadAccount, loadProfile, loadAgeGroup } from "@/lib/store";
import {
  Product, DoshaProfile, getDominantDosha, DOSHA_NAMES, DOSHA_COLORS,
  STEP_NAMES, StepType, DoshaType, AgeGroup,
} from "@/lib/types";
import { getCurrentSeason } from "@/lib/content";

type DeliveryMethod = "pickup" | "delivery";

interface CheckoutForm {
  name: string;
  phone: string;
  email: string;
  delivery: DeliveryMethod;
  comment: string;
}

// ─── Care step order for ritual builder ────────────
const STEP_ORDER: StepType[] = ["cleansing", "toner", "exfoliation", "serum", "eyeCream", "cream", "mask"];
const STEP_ICONS: Record<StepType, string> = {
  cleansing: "1", toner: "2", serum: "3", cream: "4",
  eyeCream: "5", mask: "6", exfoliation: "7",
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [profile, setProfile] = useState<DoshaProfile | null>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [form, setForm] = useState<CheckoutForm>({
    name: "", phone: "", email: "", delivery: "pickup", comment: "",
  });

  const refresh = useCallback(() => {
    setCart(getCart());
    setTotal(getCartTotal());
    setCount(getCartCount());
  }, []);

  useEffect(() => {
    refresh();
    setProfile(loadProfile());
    setAgeGroup(loadAgeGroup());
    const account = loadAccount();
    if (account) {
      setForm(f => ({
        ...f,
        name: account.name || f.name,
        phone: account.phone || f.phone,
        email: account.email || f.email,
      }));
    }
    window.addEventListener("cart-updated", refresh);
    return () => window.removeEventListener("cart-updated", refresh);
  }, [refresh]);

  const dosha = profile ? getDominantDosha(profile) : null;

  // ─── Smart analysis of cart products ──────────────
  const cartProducts = useMemo(() => {
    return cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      const volume = product?.volumes.find(v => v.id === item.volumeId);
      return { item, product, volume };
    }).filter(c => c.product && c.volume) as {
      item: CartItem; product: Product; volume: { id: string; volume: string; retailPrice: number; sku: string };
    }[];
  }, [cart]);

  // ─── Ritual builder: group products by care step ──
  const ritual = useMemo(() => {
    if (cartProducts.length === 0) return null;

    const matchedRoutine = dosha && ageGroup
      ? routines.find(r => r.dosha === dosha && r.ageGroup === ageGroup && r.zone === "face")
      : null;

    const productStepMap = new Map<string, { stepType: StepType; timeOfDay: "morning" | "evening"; order: number; title: string }[]>();

    if (matchedRoutine) {
      for (const step of matchedRoutine.steps) {
        const entries = productStepMap.get(step.productId) || [];
        entries.push({ stepType: step.type, timeOfDay: step.timeOfDay, order: step.order, title: step.title });
        productStepMap.set(step.productId, entries);
      }
    }

    const morning: { product: Product; stepType: StepType; order: number; tip: string }[] = [];
    const evening: { product: Product; stepType: StepType; order: number; tip: string }[] = [];

    for (const { product } of cartProducts) {
      const routineSteps = productStepMap.get(product.id);
      if (routineSteps) {
        for (const rs of routineSteps) {
          const entry = { product, stepType: rs.stepType, order: rs.order, tip: rs.title };
          if (rs.timeOfDay === "morning") morning.push(entry);
          else evening.push(entry);
        }
      } else {
        const guessedStep = guessStepType(product);
        if (guessedStep) {
          const ord = STEP_ORDER.indexOf(guessedStep);
          morning.push({ product, stepType: guessedStep, order: ord, tip: "" });
          evening.push({ product, stepType: guessedStep, order: ord + 10, tip: "" });
        }
      }
    }

    morning.sort((a, b) => a.order - b.order);
    evening.sort((a, b) => a.order - b.order);

    const coveredSteps = new Set([...morning.map(m => m.stepType), ...evening.map(e => e.stepType)]);
    const essentialSteps: StepType[] = ["cleansing", "serum", "cream"];
    const missing = essentialSteps.filter(s => !coveredSteps.has(s));

    return { morning, evening, missing, hasRoutine: morning.length > 0 || evening.length > 0 };
  }, [cartProducts, dosha, ageGroup]);

  // ─── Complementary product suggestions ────────────
  const suggestions = useMemo(() => {
    const cartIds = cartProducts.map(c => c.product.id);
    if (cartIds.length === 0) return [];
    const complementary = getComplementaryProducts(cartIds);
    const filtered = complementary.filter(p => {
      if (cartIds.includes(p.id)) return false;
      if (dosha && p.doshaAffinity.length > 0 && !p.doshaAffinity.includes(dosha)) return false;
      return true;
    });
    return filtered.slice(0, 2);
  }, [cartProducts, dosha]);

  // ─── Personalized tip ─────────────────────────────
  const smartTip = useMemo(() => {
    if (cartProducts.length === 0) return null;
    const season = getCurrentSeason();
    const purposes = new Set(cartProducts.flatMap(c => c.product.purposes));

    if (dosha === "vata" && purposes.has("moisturizing")) {
      return { text: "Отличный выбор для Ваты: глубокое увлажнение защитит от сухости", icon: "💧" };
    }
    if (dosha === "pitta" && purposes.has("antiAge")) {
      return { text: "Anti-age для Питты: выбирайте мягкие текстуры, избегая перегрева кожи", icon: "🌿" };
    }
    if (dosha === "kapha" && purposes.has("detox")) {
      return { text: "Детокс-уход для Капхи: лёгкие текстуры для тонуса и свежести", icon: "✨" };
    }
    if (purposes.has("antiAge") && purposes.has("moisturizing")) {
      return { text: "Увлажнение + anti-age — базовая комбинация для сохранения молодости кожи", icon: "💎" };
    }
    if (season.name === "Грешма" || season.name === "Варша") {
      return { text: `Сезон ${season.name}: добавьте SPF-защиту и лёгкие текстуры`, icon: "☀️" };
    }
    return { text: "Комбинируйте утренний и вечерний уход для максимального эффекта", icon: "🌙" };
  }, [cartProducts, dosha]);

  function handleSubmit() {
    const lines: string[] = ["Заказ SPAquatoria", ""];
    for (const { item, product, volume } of cartProducts) {
      lines.push(`${product.name} (${volume.volume}) x${item.quantity} — ${(volume.retailPrice * item.quantity).toLocaleString("ru-RU")} ₽`);
    }
    lines.push("", `Итого: ${total.toLocaleString("ru-RU")} ₽`, "");
    lines.push(`Имя: ${form.name}`, `Телефон: ${form.phone}`);
    if (form.email) lines.push(`Email: ${form.email}`);
    lines.push(`Доставка: ${form.delivery === "pickup" ? "Самовывоз" : "Доставка"}`);
    if (form.comment) lines.push(`Комментарий: ${form.comment}`);
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/79296753322?text=${text}`, "_blank");
    clearCart();
    setSubmitted(true);
  }

  /* ═══ SUCCESS STATE ═══════════════════════════════ */
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-5 py-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--lp-soft)" }}>
            <svg className="w-8 h-8" style={{ color: "var(--brand)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="heading-md mb-2">Заказ отправлен</h1>
          <p className="body-lp muted mb-8">Свяжемся с вами в WhatsApp</p>
          <Link href="/catalog" className="btn-lp">В каталог</Link>
        </div>
      </div>
    );
  }

  /* ═══ EMPTY STATE ═════════════════════════════════ */
  if (cart.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-5 py-6 pb-28">
        <span className="eyebrow mb-3 block">Заказ</span>
        <h1 className="heading-xl mb-10">Корзина</h1>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <svg className="w-10 h-10 mb-5" style={{ color: "var(--lp-tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <p className="heading-md mb-2" style={{ fontWeight: 400 }}>Корзина пуста</p>
          <p className="body-lp muted mb-8">Добавьте товары из каталога</p>
          <Link href="/catalog" className="btn-lp">В каталог</Link>
        </div>
      </div>
    );
  }

  /* ═══ CART WITH ITEMS ═════════════════════════════ */
  return (
    <div className="max-w-lg mx-auto px-5 py-5 pb-40">
      <span className="eyebrow mb-3 block">Заказ</span>
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="heading-xl">Корзина</h1>
        <span className="eyebrow" style={{ color: "var(--lp-tertiary)" }}>{count} {count === 1 ? "товар" : count < 5 ? "товара" : "товаров"}</span>
      </div>

      {/* ═══ ITEMS ═══════════════════════════════════ */}
      <div className="paper-card flat overflow-hidden mb-6">
        {cartProducts.map(({ item, product, volume }, i) => {
          const mainImage = product.images.find(img => img.isMain) || product.images[0];
          return (
            <div key={`${item.productId}-${item.volumeId}`}
              className="flex gap-4 p-4"
              style={i > 0 ? { borderTop: "1px solid var(--lp-line-soft)" } : undefined}>
              <Link href={`/catalog/${product.id}`}
                className="shrink-0 w-[72px] h-[90px] overflow-hidden relative" style={{ background: "var(--lp-soft)", borderRadius: "6px" }}>
                {mainImage ? (
                  <Image src={mainImage.url} alt={product.name} fill sizes="72px" className="object-cover product-img" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="heading-md" style={{ color: "var(--lp-tertiary)" }}>S</span>
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/catalog/${product.id}`}>
                  <p className="body-lp text-[14px] line-clamp-1 leading-tight" style={{ fontWeight: 500 }}>{product.name}</p>
                </Link>
                <p className="eyebrow mt-1" style={{ color: "var(--lp-tertiary)" }}>{volume.volume}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => removeFromCart(item.productId, item.volumeId)}
                      className="w-7 h-7 rounded-full flex items-center justify-center tap" style={{ background: "var(--lp-soft)", color: "var(--lp-muted)" }}>
                      <span className="text-[15px]">−</span>
                    </button>
                    <span className="numeric-lp text-[15px]" style={{ fontWeight: 500 }}>{item.quantity}</span>
                    <button onClick={() => addToCart(item.productId, item.volumeId)}
                      className="w-7 h-7 rounded-full flex items-center justify-center tap" style={{ background: "var(--lp-soft)", color: "var(--lp-muted)" }}>
                      <span className="text-[15px]">+</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="numeric-lp text-[15px]" style={{ color: "var(--lp-ink)" }}>{(volume.retailPrice * item.quantity).toLocaleString("ru-RU")} ₽</span>
                    <button onClick={() => deleteFromCart(item.productId, item.volumeId)} className="tap p-1">
                      <svg className="w-4 h-4" style={{ color: "var(--lp-tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ SMART TIP ══════════════════════════════ */}
      {smartTip && (
        <div className="flex items-start gap-3 mb-6 px-1">
          <span className="text-[16px] shrink-0 mt-0.5">{smartTip.icon}</span>
          <p className="body-lp muted text-[13px]" style={{ lineHeight: 1.5 }}>{smartTip.text}</p>
        </div>
      )}

      {/* ═══ RITUAL BUILDER ═════════════════════════ */}
      {ritual && ritual.hasRoutine && (
        <section className="mb-6">
          <span className="eyebrow mb-4 block">Ваш ритуал из корзины</span>
          <div className="paper-card flat p-5">
            <div className="flex gap-5">
              {/* Morning */}
              {ritual.morning.length > 0 && (
                <div className="flex-1 min-w-0">
                  <span className="eyebrow mb-3 block" style={{ color: "var(--lp-tertiary)" }}>Утро</span>
                  <div className="space-y-2.5">
                    {ritual.morning.map((step, i) => (
                      <div key={`m-${i}`} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "var(--brand)", color: "#fff", fontSize: "9px", fontWeight: 500 }}>
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="body-lp text-[12px] truncate" style={{ fontWeight: 500 }}>{STEP_NAMES[step.stepType]}</p>
                          <p className="text-[10px] truncate" style={{ color: "var(--lp-tertiary)" }}>{step.product.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              {ritual.morning.length > 0 && ritual.evening.length > 0 && (
                <div className="w-px" style={{ background: "var(--lp-line-soft)" }} />
              )}

              {/* Evening */}
              {ritual.evening.length > 0 && (
                <div className="flex-1 min-w-0">
                  <span className="eyebrow mb-3 block" style={{ color: "var(--lp-tertiary)" }}>Вечер</span>
                  <div className="space-y-2.5">
                    {ritual.evening.map((step, i) => (
                      <div key={`e-${i}`} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "var(--lp-tertiary)", color: "#fff", fontSize: "9px", fontWeight: 500 }}>
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="body-lp text-[12px] truncate" style={{ fontWeight: 500 }}>{STEP_NAMES[step.stepType]}</p>
                          <p className="text-[10px] truncate" style={{ color: "var(--lp-tertiary)" }}>{step.product.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Missing steps */}
            {ritual.missing.length > 0 && (
              <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--lp-line-soft)" }}>
                <p className="eyebrow mb-2" style={{ color: "var(--lp-tertiary)" }}>Для полного ритуала</p>
                <div className="flex gap-2">
                  {ritual.missing.map(step => (
                    <Link key={step} href="/catalog" className="pill-chip tap" style={{ padding: "6px 12px" }}>
                      + {STEP_NAMES[step]}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══ COMPLEMENT SUGGESTION ══════════════════ */}
      {suggestions.length > 0 && (
        <section className="mb-8">
          <span className="eyebrow mb-4 block">
            {dosha ? `Дополните для ${DOSHA_NAMES[dosha]}` : "Дополните ритуал"}
          </span>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5">
            {suggestions.map(product => {
              const img = product.images.find(i => i.isMain) || product.images[0];
              const vol = product.volumes[0];
              return (
                <div key={product.id} className="shrink-0 w-[180px] paper-card flat overflow-hidden" style={{ padding: 0 }}>
                  {img && (
                    <div className="h-[100px] overflow-hidden" style={{ background: "var(--lp-soft)" }}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="body-lp text-[12px] line-clamp-1" style={{ fontWeight: 500 }}>{product.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="numeric-lp text-[14px]" style={{ color: "var(--lp-ink)" }}>{vol.retailPrice.toLocaleString("ru-RU")} ₽</span>
                      <button onClick={() => { addToCart(product.id, vol.id); }}
                        className="w-7 h-7 rounded-full flex items-center justify-center tap" style={{ background: "var(--brand)" }}>
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══ TOTAL ══════════════════════════════════ */}
      <div className="flex justify-between items-baseline mb-6 px-1">
        <span className="body-lp" style={{ color: "var(--lp-muted)" }}>{count} {count === 1 ? "товар" : count < 5 ? "товара" : "товаров"}</span>
        <span className="heading-lg">{total.toLocaleString("ru-RU")} ₽</span>
      </div>

      {/* ═══ CHECKOUT ══════════════════════════════= */}
      {!showCheckout ? (
        <button onClick={() => setShowCheckout(true)} className="btn-lp w-full">
          Оформить заказ
        </button>
      ) : (
        <section>
          <span className="eyebrow mb-4 block">Оформление</span>
          <div className="paper-card flat overflow-hidden">
            {[
              { label: "Имя", type: "text", value: form.name, key: "name", placeholder: "Ваше имя", required: true },
              { label: "Телефон", type: "tel", value: form.phone, key: "phone", placeholder: "+7 (___) ___-__-__", required: true },
              { label: "Email", type: "email", value: form.email, key: "email", placeholder: "email@example.com", required: false },
            ].map((field, i) => (
              <div key={field.key} className="px-5 py-3"
                style={i > 0 ? { borderTop: "1px solid var(--lp-line-soft)" } : undefined}>
                <label className="eyebrow mb-1 block" style={{ color: "var(--lp-tertiary)" }}>
                  {field.label}{field.required && " *"}
                </label>
                <input
                  type={field.type} value={field.value}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full body-lp text-[15px] bg-transparent outline-none"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
            <div className="px-5 py-3" style={{ borderTop: "1px solid var(--lp-line-soft)" }}>
              <label className="eyebrow mb-2 block" style={{ color: "var(--lp-tertiary)" }}>Получение</label>
              <div className="flex gap-2">
                {(["pickup", "delivery"] as DeliveryMethod[]).map(d => (
                  <button key={d} onClick={() => setForm({ ...form, delivery: d })}
                    className={`flex-1 pill-chip tap ${form.delivery === d ? "accent" : ""}`}
                    style={form.delivery === d ? { background: "var(--brand)", borderColor: "var(--brand)", color: "#fff" } : undefined}>
                    {d === "pickup" ? "Самовывоз" : "Доставка"}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-5 py-3" style={{ borderTop: "1px solid var(--lp-line-soft)" }}>
              <label className="eyebrow mb-1 block" style={{ color: "var(--lp-tertiary)" }}>Комментарий</label>
              <textarea value={form.comment}
                onChange={e => setForm({ ...form, comment: e.target.value })}
                className="w-full body-lp text-[14px] bg-transparent outline-none resize-none h-14"
                placeholder="Пожелания к заказу" />
            </div>
            <div className="p-5" style={{ borderTop: "1px solid var(--lp-line-soft)" }}>
              <button onClick={handleSubmit}
                disabled={!form.name.trim() || !form.phone.trim()}
                className="btn-lp w-full disabled:opacity-40">
                Отправить заказ
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────
function guessStepType(product: Product): StepType | null {
  const name = product.name.toLowerCase();
  const purposes = product.purposes;

  if (name.includes("очищ") || name.includes("гель") || name.includes("пенк") || name.includes("мицелляр") || purposes.includes("cleansing")) return "cleansing";
  if (name.includes("тоник") || name.includes("лосьон")) return "toner";
  if (name.includes("сыворот") || name.includes("серум") || name.includes("эликсир")) return "serum";
  if (name.includes("крем") && (name.includes("глаз") || name.includes("век"))) return "eyeCream";
  if (name.includes("крем") || name.includes("бальзам")) return "cream";
  if (name.includes("маск")) return "mask";
  if (name.includes("пилинг") || name.includes("скраб") || name.includes("эксфоли")) return "exfoliation";

  return null;
}
