"use client";

import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { products, collections, faceLines, getProductScore } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { DoshaType, DoshaProfile, DOSHA_NAMES, DOSHA_COLORS, getDominantDosha, AGE_SUBTITLES, AgeGroup } from "@/lib/types";
import { loadProfile, loadAgeGroup } from "@/lib/store";

const doshas: DoshaType[] = ["vata", "pitta", "kapha"];

const CATEGORIES: { id: string; name: string; icon: string; desc: string; image?: string }[] = [
  { id: "ukhod-za-litsom", name: "Лицо", icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z", desc: "Очищение, тоники, сыворотки, кремы, маски", image: "/brand/hero/face-care.jpg" },
  { id: "ukhod-za-telom", name: "Тело", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z", desc: "Масла, скрабы, обёртывания, молочко", image: "/brand/hero/body-care.jpg" },
  { id: "domashnyaya-kollektsiya", name: "Домашняя", icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25", desc: "Для домашнего SPA-ритуала", image: "/brand/collections/home-care.jpg" },
  { id: "celebrity", name: "Celebrity", icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z", desc: "Премиальная парфюмерная линия", image: "/brand/collections/tree-of-love.jpg" },
  { id: "yoga-line", name: "Yoga", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z", desc: "Гармония тела и разума", image: "/brand/collections/yoga-line.jpg" },
  { id: "sreda", name: "SREDA", icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418", desc: "Экологичная коллекция", image: "/brand/collections/sreda.jpg" },
  { id: "sredstva-dlya-massazha", name: "Массаж", icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z", desc: "Масла и кремы для массажа", image: "/brand/hero/massage.jpg" },
  { id: "ukhod-za-volosami", name: "Волосы", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z", desc: "Шампуни, маски, масла для волос", image: "/brand/hero/hair-care.jpg" },
  { id: "spa-manicure-pedicure", name: "Руки и ноги", icon: "M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075-5.925v2.468m0-2.468a1.575 1.575 0 013.15 0V7.5M13.2 10.5v2.625m3.15-5.625v2.625m0 0a1.575 1.575 0 013.15 0V12M6.9 7.575V12m0 0a48.15 48.15 0 01-.9 8.362 1.056 1.056 0 00.793 1.284 48.058 48.058 0 006.414.866A48.16 48.16 0 0019.5 21.27a1.055 1.055 0 00.793-1.283 48.313 48.313 0 00-1.293-4.237", desc: "SPA-маникюр и педикюр" },
  { id: "podarochnye-nabory-i-upakovka", name: "Наборы", icon: "M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z", desc: "Подарочные наборы", image: "/brand/hero/gifts.jpg" },
];

/* ─── Personalization ─── */

const DOSHA_CATALOG_TIPS: Record<DoshaType, { heading: string; tip: string }> = {
  vata: { heading: "Вата-коже нужно питание", tip: "Выбирайте масла и кремы с плотной текстурой. Ваша кожа любит тепло и увлажнение." },
  pitta: { heading: "Питта-коже нужна мягкость", tip: "Ищите средства с охлаждающими компонентами. Избегайте агрессивных пилингов." },
  kapha: { heading: "Капха-коже нужна лёгкость", tip: "Лёгкие текстуры, детокс-маски, энзимные пилинги. Ваша кожа благодарна за стимуляцию." },
};

const CATEGORY_DOSHA_NOTES: Record<string, Record<DoshaType, string>> = {
  "ukhod-za-litsom": {
    vata: "Для Вата-кожи ключевое — глубокое увлажнение. Обратите внимание на масла и кремы-суфле.",
    pitta: "Для Питта-кожи важно успокоение. Средства с жемчугом, алоэ и охлаждающими пептидами.",
    kapha: "Для Капха-кожи нужно очищение и тонус. Пилинги, тоники с кислотами и лёгкие сыворотки.",
  },
  "ukhod-za-telom": {
    vata: "Сухую Вата-кожу тела спасут масляные обёртывания и кремы-баттеры.",
    pitta: "Питта-тело склонно к воспалениям. Нежные скрабы и молочко с охлаждающими травами.",
    kapha: "Капха-тело любит стимуляцию. Антицеллюлитные средства и солевые скрабы.",
  },
  "ukhod-za-volosami": {
    vata: "Вата-волосы тонкие и сухие. Масляные маски и мягкие шампуни без сульфатов.",
    pitta: "Питта-волосы быстро жирнеют у корней. Балансирующие шампуни.",
    kapha: "Капха-волосы густые, но тяжёлые. Средства для объёма.",
  },
  "domashnyaya-kollektsiya": {
    vata: "Для Ваты — кремы-баттеры и молочные серии. Плотные, питательные, согревающие.",
    pitta: "Для Питты — очищающие водопады и молочная роса. Мягко, нежно, без раздражения.",
    kapha: "Для Капхи — лёгкие текстуры из молочной росы. Увлажнение без утяжеления.",
  },
};

/* ─── Collection descriptions ─── */

const COLLECTION_IMAGES: Record<string, string> = {
  "swan-grace": "/brand/collections/swan-grace.jpg",
  "pearl-endorphin": "/brand/collections/pearl-endorphin.jpg",
  "grand-cru-elixir": "/brand/collections/grand-cru-elixir.jpg",
  "vanilnye-oblaka": "/brand/collections/vanilla-clouds.jpg",
  "berry-glow": "/brand/collections/berry-glow.jpg",
  "prana-okeana": "/brand/collections/ocean-prana.jpg",
  "hymalayah": "/brand/collections/himalayah.jpg",
  "grand-cru": "/brand/collections/grand-cru-therapy.jpg",
  "martsipanovyy-kapriz": "/brand/collections/marzipan.jpg",
  "pancha-amrita-5-nektarov": "/brand/collections/pancha-amrita.jpg",
  "marokkanskiy-khammam": "/brand/collections/moroccan-hammam.jpg",
  "sila-lyesa": "/brand/collections/forest-power.jpg",
  "celebrity": "/brand/collections/tree-of-love.jpg",
  "sreda": "/brand/collections/sreda.jpg",
  "aromamasla": "/brand/collections/lavananda.jpg",
  "aroma-essentsii": "/brand/collections/yoga-line.jpg",
};

const COLLECTION_DESCRIPTIONS: Record<string, string> = {
  "swan-grace": "Линия 45+. Лебединый пептид и стволовые клетки эдельвейса. Лифтинг и восстановление зрелой кожи.",
  "pearl-endorphin": "Линия 25+. Полинезийский жемчуг и пептидный комплекс. Сияние и профилактика первых морщин.",
  "grand-cru-elixir": "Линия 35+. Ресвератрол красного винограда из Бордо. Anti-age и антиоксидантная защита.",
  "vanilnye-oblaka": "Воздушные текстуры с бурбонской ванилью. Питание и комфорт для сухой кожи.",
  "zhivaya-rosa": "Гидролаты и живая вода. Мгновенное увлажнение и свежесть.",
  "algomineralnye-maski": "Альгинатные маски с морскими минералами. Интенсивный салонный уход.",
  "berry-glow": "Ягодные кислоты и антиоксиданты. Сияние и мягкий пилинг.",
  "skraby-i-pilingi": "28 текстур для обновления кожи. От мягких энзимных до интенсивных солевых.",
  "prana-okeana": "Энергия океана. Водоросли, морской коллаген и минералы глубин.",
  "martsipanovyy-kapriz": "Миндаль и марципан. Нежное питание с гурманским ароматом.",
  "pancha-amrita-5-nektarov": "Пять священных нектаров аюрведы. Древние рецепты в современных формулах.",
  "molochnye-vanny": "Молоко и мёд. Ритуал Клеопатры для мягкости и увлажнения.",
  "marokkanskiy-khammam": "Традиции хаммама: аргановое масло, рассул, чёрное мыло.",
  "hymalayah": "Гималайские минералы и травы. Детокс и энергия высокогорья.",
  "grand-cru": "Виноградная терапия для тела. Полифенолы и ресвератрол.",
  "sila-lyesa": "Хвойные экстракты и берёзовый сок. Сила сибирского леса.",
  "shokoladnoe-naslazhdenie": "Какао-бобы и шоколад. Антиоксиданты и удовольствие.",
  "creams-butters": "Плотные кремы-баттеры для интенсивного питания кожи тела.",
  "molochnaya-rosa": "Лёгкие молочные текстуры для ежедневного увлажнения.",
  "vodopady": "Гели и пенки для нежного очищения. Водопад свежести.",
  "aromamasla": "Натуральные аромамасла для профессионального и домашнего массажа.",
  "aroma-essentsii": "Ароматерапия для йога-практики. Эфирные масла и медитативные ноты.",
  "geli": "Гели для тела с аюрведическими экстрактами. Лёгкость и тонус.",
  "celebrity-perfume-oil": "Парфюмерные масла Celebrity. Роскошные ароматы для тела.",
  "celebrity": "Tree Of Love — парфюмерная коллекция с нотами сандала и розы.",
  "celebrity--spice-up-your-life": "Spice Up Your Life — яркие восточные специи в парфюмерии.",
  "syvorotki-maski": "Концентрированные сыворотки-маски для восстановления волос.",
  "syvorotki-shampuni": "Бессульфатные шампуни с сывороточными комплексами.",
  "spa-manicure": "Профессиональный SPA-уход за руками. Масла, кремы, скрабы.",
  "podarochnye-nabory-i-upakovka": "Готовые наборы для подарка. Красивая упаковка, проверенные сочетания.",
  "sreda": "Экологичная коллекция для тех, кто заботится о планете.",
};

/* ─── Journal micro-cards ─── */

const JOURNAL_CARDS = [
  { label: "Из лаборатории", text: "14 формул Grand Cru → победил ресвератрол из Бордо с 3x биодоступностью", color: "var(--fg)" },
  { label: "Основатель", text: "«Кашмирский шафран стоит $3000/кг, но аюрведа не работает с компромиссами»", color: "var(--brand)" },
  { label: "Ингредиент", text: "Полинезийский жемчуг: 18 мес роста → холодный помол 40°C → 23 аминокислоты", color: "#7EC8E3" },
  { label: "Наука", text: "Ресвератрол замедляет деградацию коллагена на 40% — Journal of Cosmetic Dermatology", color: "#8B2252" },
  { label: "Ритуал", text: "«После месяца с Pearl Endorphin покраснения ушли» — Анна К., тип Питта", color: "#FF8B5E" },
];

function JournalMicro({ index }: { index: number }) {
  const card = JOURNAL_CARDS[index % JOURNAL_CARDS.length];
  return (
    <Link href="/about" className="block">
      <div className="glass-card p-3.5 tap">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${card.color} 12%, transparent)` }}>
            <svg className="w-3.5 h-3.5" style={{ color: card.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: card.color }}>{card.label}</p>
            <p className="text-[13px] text-fg-secondary leading-snug">{card.text}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function getMinPrice(p: typeof products[0]): number {
  const inStock = p.volumes.filter(v => v.inStock);
  return (inStock.length > 0 ? inStock : p.volumes).reduce((min, v) => Math.min(min, v.retailPrice), Infinity);
}

type SortOption = "default" | "price-asc" | "price-desc" | "name";

/* ─── Collection Section ─── */

function CollectionSection({ collectionId, items, dominantDosha }: {
  collectionId: string;
  items: typeof products;
  dominantDosha: DoshaType | null;
}) {
  const coll = collections.find(c => c.id === collectionId);
  const name = coll?.name || collectionId;
  const desc = COLLECTION_DESCRIPTIONS[collectionId];
  const collImage = COLLECTION_IMAGES[collectionId];
  const doshaMatch = dominantDosha && coll?.doshaFocus === dominantDosha;

  const useCarousel = items.length <= 6;

  return (
    <div>
      {collImage && (
        <div className="mb-3 overflow-hidden" style={{ borderRadius: 18 }}>
          <img src={collImage} alt={name} className="w-full h-[120px] object-cover" style={{ objectPosition: "top" }} />
        </div>
      )}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-semibold text-fg">{name}</h3>
            {doshaMatch && (
              <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded" style={{ background: DOSHA_COLORS[dominantDosha] }}>
                {DOSHA_NAMES[dominantDosha]}
              </span>
            )}
          </div>
          {desc && <p className="text-[13px] text-fg-secondary leading-snug mt-0.5">{desc}</p>}
        </div>
        <span className="text-[12px] text-fg-tertiary shrink-0 mt-1 ml-2">{items.length}</span>
      </div>

      {/* Products */}
      {useCarousel ? (
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1 snap-x snap-mandatory">
          {items.map(p => (
            <div key={p.id} className="shrink-0 w-[140px] snap-start">
              <ProductCard product={p} showScore />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {items.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main ─── */

function CatalogInner() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat");

  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(initialCat);
  const [selectedDosha, setSelectedDosha] = useState<DoshaType | null>(null);
  const [sort, setSort] = useState<SortOption>("default");
  const [profile, setProfile] = useState<DoshaProfile | null>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);

  useEffect(() => {
    if (initialCat) setActiveCat(initialCat);
  }, [initialCat]);

  useEffect(() => {
    setProfile(loadProfile());
    setAgeGroup(loadAgeGroup());
  }, []);

  const dominantDosha = profile ? getDominantDosha(profile) : null;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => { counts[p.categoryId] = (counts[p.categoryId] || 0) + 1; });
    return counts;
  }, []);

  // Personalized picks
  const doshaTopPicks = useMemo(() => {
    if (!dominantDosha) return [];
    return products
      .filter(p => p.doshaAffinity.includes(dominantDosha))
      .sort((a, b) => getProductScore(b.id).score - getProductScore(a.id).score)
      .slice(0, 8);
  }, [dominantDosha]);

  // Filtered for search/all view
  const searchFiltered = useMemo(() => {
    let result = products;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q));
    }
    if (activeCat && activeCat !== "__all__") result = result.filter(p => p.categoryId === activeCat);
    if (selectedDosha) result = result.filter(p => p.doshaAffinity.includes(selectedDosha));
    if (sort === "price-asc") result = [...result].sort((a, b) => getMinPrice(a) - getMinPrice(b));
    else if (sort === "price-desc") result = [...result].sort((a, b) => getMinPrice(b) - getMinPrice(a));
    else if (sort === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name, "ru"));
    return result;
  }, [search, activeCat, selectedDosha, sort]);

  // Group products by collection for category view
  const collectionGroups = useMemo(() => {
    if (!activeCat || activeCat === "__all__" || search || selectedDosha || sort !== "default") return null;

    const catProducts = products.filter(p => p.categoryId === activeCat);
    const groups: { collectionId: string; items: typeof products }[] = [];
    const seen = new Set<string>();

    // Sort by collection size (largest first), prioritizing dosha-matched
    const collIds = [...new Set(catProducts.map(p => p.collectionId))];
    collIds.sort((a, b) => {
      const ca = catProducts.filter(p => p.collectionId === a);
      const cb = catProducts.filter(p => p.collectionId === b);
      // Dosha match first
      if (dominantDosha) {
        const aMatch = collections.find(c => c.id === a)?.doshaFocus === dominantDosha ? 1 : 0;
        const bMatch = collections.find(c => c.id === b)?.doshaFocus === dominantDosha ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
      }
      return cb.length - ca.length;
    });

    for (const collId of collIds) {
      if (seen.has(collId)) continue;
      seen.add(collId);
      const items = catProducts.filter(p => p.collectionId === collId);
      if (items.length > 0) groups.push({ collectionId: collId, items });
    }

    return groups;
  }, [activeCat, search, selectedDosha, sort, dominantDosha]);

  const [activeCollId, setActiveCollId] = useState<string | null>(null);
  const collectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pillsRef = useRef<HTMLDivElement>(null);

  const scrollToCollection = useCallback((collId: string) => {
    setActiveCollId(collId);
    const el = collectionRefs.current[collId];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    // Scroll pill into view
    const pill = document.getElementById(`pill-${collId}`);
    if (pill && pillsRef.current) {
      pill.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, []);

  // Track active collection on scroll
  useEffect(() => {
    if (!collectionGroups) return;
    function onScroll() {
      const entries = collectionGroups!.map(g => ({
        id: g.collectionId,
        el: collectionRefs.current[g.collectionId],
      })).filter(e => e.el);

      let active: string | null = null;
      for (const entry of entries) {
        const rect = entry.el!.getBoundingClientRect();
        if (rect.top <= 140) active = entry.id;
      }
      if (active) setActiveCollId(active);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [collectionGroups]);

  const showCategoryGrid = !activeCat && !search;
  const showGroupedView = collectionGroups !== null;
  const catMeta = CATEGORIES.find(c => c.id === activeCat);
  const catDoshaNote = activeCat && dominantDosha ? CATEGORY_DOSHA_NOTES[activeCat]?.[dominantDosha] : null;

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      {/* Header */}
      {dominantDosha && showCategoryGrid ? (
        <div className="mb-5">
          <h1 className="title-large text-fg mb-1">Каталог</h1>
          <p className="text-[15px] text-fg-secondary">
            {DOSHA_CATALOG_TIPS[dominantDosha].heading}
          </p>
        </div>
      ) : (
        <h1 className="title-large text-fg mb-4">Каталог</h1>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-fg-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); if (e.target.value) setActiveCat(null); }}
          placeholder="Поиск средств"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-[15px] outline-none glass-card"
          style={{ border: "none" }}
        />
      </div>

      {showCategoryGrid ? (
        /* ═══════ Category grid ═══════ */
        <div className="space-y-4">
          {/* Personalized recommendations */}
          {dominantDosha && doshaTopPicks.length > 0 && (
            <div className="paper-card flat" style={{ padding: 0, overflow: "hidden" }}>
              <div className="px-5 pt-5 pb-3">
                <span className="eyebrow" style={{ color: DOSHA_COLORS[dominantDosha] }}>Подобрано для вас</span>
                <p className="heading-md mt-2" style={{ fontSize: 18 }}>
                  {DOSHA_CATALOG_TIPS[dominantDosha].heading}
                </p>
                <p className="body-lp muted text-[13px] mt-1">
                  {DOSHA_CATALOG_TIPS[dominantDosha].tip}
                </p>
              </div>
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-5 pb-5 snap-x snap-mandatory">
                {doshaTopPicks.map(p => (
                  <div key={p.id} className="shrink-0 w-[130px] snap-start">
                    <ProductCard product={p} showScore />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Journal micro-card */}
          <JournalMicro index={new Date().getDate()} />

          {/* Category cards */}
          <div>
            <span className="eyebrow mb-4 block">Категории</span>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.filter(c => categoryCounts[c.id]).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className="relative overflow-hidden text-left tap group"
                  style={{ borderRadius: 8 }}
                >
                  {cat.image ? (
                    <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ borderRadius: 8 }}>
                      <img src={cat.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: "top" }} />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(22,18,12,0.88) 0%, rgba(22,18,12,0.55) 40%, rgba(22,18,12,0.15) 70%, transparent 100%)" }} />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-[16px] font-medium text-white" style={{ letterSpacing: "-0.01em", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{cat.name}</p>
                        <p className="text-[12px] text-white/75 leading-snug mt-1" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>{cat.desc}</p>
                        <p className="text-[11px] text-white/50 mt-1.5 font-medium">{categoryCounts[cat.id]} средств</p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[3/4] w-full flex flex-col justify-end p-4" style={{ borderRadius: 8, background: "var(--lp-soft)" }}>
                      <svg className="w-6 h-6 mb-3" style={{ color: "var(--lp-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                      </svg>
                      <p className="text-[16px] font-medium" style={{ color: "var(--lp-ink)" }}>{cat.name}</p>
                      <p className="text-[11px] leading-snug mt-1" style={{ color: "var(--lp-muted)" }}>{cat.desc}</p>
                      <p className="text-[11px] mt-1.5" style={{ color: "var(--lp-tertiary)" }}>{categoryCounts[cat.id]} средств</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveCat("__all__")}
            className="w-full glass-card px-4 py-3.5 flex items-center justify-between tap"
          >
            <div>
              <p className="text-[15px] font-semibold text-fg">Все средства</p>
              <p className="text-[13px] text-fg-secondary">{products.length} продуктов</p>
            </div>
            <svg className="w-4 h-4 text-fg-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Face lines */}
          <div>
            <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-2">Линии для лица</p>
            {ageGroup && (
              <p className="text-[13px] text-fg-secondary mb-2.5">
                Ваша линия — <span className="font-semibold text-brand">{AGE_SUBTITLES[ageGroup]}</span>
              </p>
            )}
            <div className="grid grid-cols-1 gap-2.5">
              {faceLines.map(line => {
                const isMyLine = ageGroup && AGE_SUBTITLES[ageGroup] === line.name;
                return (
                  <Link key={line.id} href={`/lines/${line.id}`}
                    className={`relative overflow-hidden tap ${isMyLine ? "ring-2" : ""}`}
                    style={{
                      borderRadius: 8,
                      background: "var(--lp-soft)",
                      ...(isMyLine ? { boxShadow: `0 0 0 2px #${line.color}30` } : {}),
                    }}
                  >
                    <div className="h-[100px] overflow-hidden relative">
                      <img src={`/about/lines/${line.id}.jpg`} alt={line.name}
                        className="w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, #${line.color}80)` }} />
                      <div className="absolute bottom-2 left-3 flex items-center gap-2">
                        <span className="text-[13px] font-bold text-white">{line.name}</span>
                        <span className="text-[11px] text-white/80">{line.ageRange}</span>
                        {isMyLine && (
                          <span className="text-[10px] font-bold text-white bg-white/25 px-2 py-0.5 rounded">ваша</span>
                        )}
                      </div>
                    </div>
                    <div className="px-3.5 py-2.5">
                      <p className="text-[12px] text-fg-secondary leading-snug">{line.tagline}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Ingredients link */}
          <Link href="/ingredients" className="glass-card px-4 py-3.5 flex items-center justify-between tap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand/8 flex items-center justify-center">
                <svg className="w-[18px] h-[18px] text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-semibold text-fg">Ингредиенты</p>
                <p className="text-[13px] text-fg-secondary">Справочник активных компонентов</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-fg-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>

          {/* CTA if no profile */}
          {!profile && (
            <Link href="/test" className="block">
              <div className="rounded-lg p-5" style={{ background: "linear-gradient(135deg, #3C184B 0%, #7B5D8A 100%)" }}>
                <h3 className="text-[17px] font-bold text-white mb-1">Персонализируйте каталог</h3>
                <p className="text-[14px] text-white/70 leading-snug mb-3">
                  Пройдите доша-тест — мы подберём средства именно для вашего типа кожи
                </p>
                <span className="inline-block bg-white/20 text-white text-[13px] font-semibold px-5 py-2 rounded">
                  Пройти тест
                </span>
              </div>
            </Link>
          )}
        </div>
      ) : showGroupedView ? (
        /* ═══════ Grouped by collection ═══════ */
        <>
          <button
            onClick={() => { setActiveCat(null); setSelectedDosha(null); setSort("default"); }}
            className="flex items-center gap-1.5 text-[15px] text-brand mb-3 tap"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Категории
          </button>

          {/* Category title + dosha note */}
          {catMeta && (
            <div className="mb-4">
              <h2 className="text-[22px] font-bold text-fg mb-0.5">{catMeta.name}</h2>
              <p className="text-[13px] text-fg-secondary">{catMeta.desc}</p>
              {catDoshaNote && (
                <div className="glass-card p-3.5 mt-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center" style={{ backgroundColor: DOSHA_COLORS[dominantDosha!] }}>
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </span>
                    <p className="text-[14px] text-fg-secondary leading-snug">{catDoshaNote}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collection pills — quick nav */}
          <div ref={pillsRef} className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1 mb-3 sticky top-12 z-40 pt-2" style={{ background: "linear-gradient(to bottom, var(--bg) 70%, transparent)" }}>
            {collectionGroups.map(g => {
              const coll = collections.find(c => c.id === g.collectionId);
              const name = coll?.name || g.collectionId;
              const isActive = activeCollId === g.collectionId;
              const doshaMatch = dominantDosha && coll?.doshaFocus === dominantDosha;
              return (
                <button
                  key={g.collectionId}
                  id={`pill-${g.collectionId}`}
                  onClick={() => scrollToCollection(g.collectionId)}
                  className={`shrink-0 px-3 py-[6px] rounded text-[12px] font-medium tap transition-all ${
                    isActive
                      ? "bg-brand text-white"
                      : doshaMatch
                        ? "text-brand bg-brand/8"
                        : "bg-fill text-fg-secondary"
                  }`}
                >
                  {name}
                  <span className="ml-1 opacity-50">{g.items.length}</span>
                </button>
              );
            })}
          </div>

          {/* Dosha/sort filters */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar -mx-5 px-5">
            {doshas.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDosha(selectedDosha === d ? null : d)}
                className="shrink-0 px-3 py-[6px] rounded text-[13px] font-medium transition-colors"
                style={selectedDosha === d
                  ? { backgroundColor: DOSHA_COLORS[d], color: "#fff" }
                  : { backgroundColor: "var(--fill)", color: "var(--fg-secondary)" }
                }
              >
                {DOSHA_NAMES[d]}
              </button>
            ))}
            <div className="flex-1" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="shrink-0 text-[13px] text-brand bg-transparent outline-none cursor-pointer"
            >
              <option value="default">По коллекциям</option>
              <option value="price-asc">Дешевле</option>
              <option value="price-desc">Дороже</option>
              <option value="name">По названию</option>
            </select>
          </div>

          {/* Collection groups with journal inserts */}
          <div className="space-y-6">
            {collectionGroups.map((group, i) => (
              <div
                key={group.collectionId}
                ref={el => { collectionRefs.current[group.collectionId] = el; }}
              >
                <CollectionSection
                  collectionId={group.collectionId}
                  items={group.items}
                  dominantDosha={dominantDosha}
                />
                {/* Journal micro-card after every 3rd collection */}
                {(i + 1) % 3 === 0 && i < collectionGroups.length - 1 && (
                  <div className="mt-4">
                    <JournalMicro index={i} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        /* ═══════ Flat list (search, all, filtered) ═══════ */
        <>
          {activeCat && (
            <button
              onClick={() => { setActiveCat(null); setSelectedDosha(null); setSort("default"); }}
              className="flex items-center gap-1.5 text-[15px] text-brand mb-3 tap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Категории
            </button>
          )}

          {catMeta && activeCat !== "__all__" && (
            <h2 className="text-[22px] font-bold text-fg mb-3">{catMeta.name}</h2>
          )}

          {/* Filters */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar -mx-5 px-5">
            {doshas.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDosha(selectedDosha === d ? null : d)}
                className="shrink-0 px-3 py-[6px] rounded text-[13px] font-medium transition-colors"
                style={selectedDosha === d
                  ? { backgroundColor: DOSHA_COLORS[d], color: "#fff" }
                  : { backgroundColor: "var(--fill)", color: "var(--fg-secondary)" }
                }
              >
                {DOSHA_NAMES[d]}
              </button>
            ))}
            <div className="flex-1" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="shrink-0 text-[13px] text-brand bg-transparent outline-none cursor-pointer"
            >
              <option value="default">По умолчанию</option>
              <option value="price-asc">Дешевле</option>
              <option value="price-desc">Дороже</option>
              <option value="name">По названию</option>
            </select>
          </div>

          <p className="text-[13px] text-fg-secondary mb-3">{searchFiltered.length} средств</p>

          {searchFiltered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[17px] text-fg-secondary">Ничего не найдено</p>
              <button
                onClick={() => { setSearch(""); setSelectedDosha(null); setActiveCat(null); setSort("default"); }}
                className="text-[15px] text-brand mt-3 tap"
              >
                Сбросить
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {searchFiltered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto px-5 py-6">
        <h1 className="title-large text-fg mb-4">Каталог</h1>
      </div>
    }>
      <CatalogInner />
    </Suspense>
  );
}
