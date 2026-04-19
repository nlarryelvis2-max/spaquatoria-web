"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/ScrollReveal";
import { loadProfile } from "@/lib/store";
import { DoshaProfile, getDominantDosha, DOSHA_NAMES, DOSHA_COLORS, DoshaType } from "@/lib/types";

/* ─── Stories ─── */

interface StoryItem {
  id: string;
  title: string;
  cover: string;
  color: string;
  slides: { heading: string; body: string; photo?: string }[];
}

const STORIES: StoryItem[] = [
  {
    id: "s1", title: "Светлана", cover: "/about/founders/svetlana-portrait.jpg", color: "var(--brand)",
    slides: [
      { heading: "К.х.н. Светлана Эдгаровна Мухтарова", body: "Создатель SPAquatoria. Химик-технолог, руководитель научного центра «Лаборатория Живая косметика-про». Автор всех формул бренда с 1996 года.", photo: "/about/founders/svetlana-portrait.jpg" },
      { heading: "Династия", body: "Отец — Эдгар Илалович Мухтаров — разработал технологии экстракции биоактивных веществ из лекарственных растений в советское время. Патенты НПО «Техкон» — семейное наследие.", photo: "/about/founders/svetlana-main.jpg" },
      { heading: "Книга «Красивый бизнес от души»", body: "Издательство АСТ, 2024. О сервисе, вере, ценностях и духовном смысле в бизнесе. О том, как создать дело «от сердца к сердцу».", photo: "/about/events/master-class.jpg" },
      { heading: "Доктор Танмай Госвами", body: "Удупи, Индия, Министерство AYUSH. Изучали протоколы Панчакармы. «Вы соединяете тысячелетние знания с современной дерматологией».", photo: "/about/events/healing-space.jpg" },
    ],
  },
  {
    id: "s2", title: "Наука", cover: "/about/factory/1.jpg", color: "#7B5D8A",
    slides: [
      { heading: "НПО «Техкон» с 1989", body: "4 лаборатории в научном центре. Технологии экстракции биоактивных веществ из лекарственных растений. Патент RU2302423C2 — выделение антоцианинов.", photo: "/about/factory/1.jpg" },
      { heading: "98,9% натуральность", body: "Без парабенов, SLS, силиконов, синтетических отдушек. Без компонентов животного происхождения, добытых насилием. Без тестирования на животных.", photo: "/about/factory/3.jpg" },
      { heading: "Формулы", body: "Каждая проходит до 30 итераций. Светлана Мухтарова — автор ВСЕХ формул бренда. Полный цикл: от разработки до производства на собственной фабрике.", photo: "/about/factory/2.jpg" },
    ],
  },
  {
    id: "s3", title: "Ритуал", cover: "/about/products/yoga-1.jpg", color: "#B84B8C",
    slides: [
      { heading: "Масляная маска", body: "Масло-эликсир на корни за 30 мин до мытья. Массируй 5 минут. Тёплое полотенце усиливает эффект.", photo: "/about/products/yoga-1.jpg" },
      { heading: "Точки Марма", body: "107 энергетических точек. При нанесении крема надавливай на точки вокруг глаз и висков — усиливает впитывание.", photo: "/about/products/pearl-2.jpg" },
    ],
  },
  {
    id: "s4", title: "Аюрведа", cover: "/about/events/yoga-day.jpg", color: "#C8956E",
    slides: [
      { heading: "5000 лет знаний", body: "Три доши (Вата, Питта, Капха) определяют тип кожи, метаболизм, предрасположенности. Зная свою дошу — выбираешь уход, который понимает твою природу.", photo: "/about/events/yoga-day.jpg" },
      { heading: "Yoga Line", body: "Линия аромаэссенций для кинезиодиагностики чакр. Соединение аюрведы с йога-практиками. Музыкальная терапия — индийские раги как канал воздействия.", photo: "/about/lines/yoga-line.jpg" },
    ],
  },
  {
    id: "s5", title: "Выставки", cover: "/about/events/intercharm-2018.png", color: "#5EBB6E",
    slides: [
      { heading: "InterCHARM", body: "Главная beauty-выставка России. SPAquatoria — постоянный участник с 2016. Мастер-классы, миолифтинг-массаж, антицеллюлитные техники.", photo: "/about/events/intercharm-2018.png" },
      { heading: "Healing Space", body: "Конференция массажных техник и оздоровительных практик. Основана SPAquatoria в 2018. Международные спикеры: Индия, Швейцария, Россия.", photo: "/about/events/healing-space.jpg" },
      { heading: "Награды", body: "Guide Mag Russian Awards 2020 — «Бренд года». SWIC конгрессы в Москве и Баку. Baltic SWIC 2025.", photo: "/about/events/swan-grace-launch.jpg" },
    ],
  },
  {
    id: "s6", title: "Команда", cover: "/about/founders/denis.jpg", color: "#FF8B5E",
    slides: [
      { heading: "Денис Данилов — CEO", body: "Генеральный директор, со-основатель и идейный вдохновитель SPAquatoria. Управляет экосистемой: фабрика → дилеры → салоны → потребитель.", photo: "/about/founders/denis.jpg" },
      { heading: "Денис Демидов — тренер", body: "Ведущий мастер-классов по миолифтинг-массажу лица и антицеллюлитным техникам. Выступает на InterCHARM, обучает косметологов в регионах.", photo: "/about/trainers/demidov.jpg" },
      { heading: "Роман Головченко — тренер", body: "Массажные техники, протоколы SPA-процедур, работа с телом. Международные семинары и Healing Space.", photo: "/about/trainers/golovchenko.jpg" },
      { heading: "30+ дилеров", body: "Россия, Беларусь, международные SPA-центры. Образовательный центр с 2016. Выездные семинары по всей России.", photo: "/about/events/master-class.jpg" },
    ],
  },
];

/* ─── Journal entries ─── */

const JOURNAL: { date: string; title?: string; body: string; detail?: string; links?: { label: string; section: string }[]; tag: string; color: string; photo?: string; photoAlt?: string }[] = [
  {
    date: "10 апр 2026", title: "Подготовка к InterCHARM Spring", tag: "событие", color: "#5EBB6E",
    body: "Готовим новые протоколы для выставки. Три мастер-класса: миолифтинг-массаж лица, антицеллюлитная программа и аюрведическая кинезиодиагностика.",
    detail: "InterCHARM — наш дом с 2016 года. Каждый раз привозим новое: в этом году покажем обновлённые протоколы Pearl Endorphin и Grand Cru Elixir. Тренеры Денис Демидов и Татьяна Захарова проведут живые мастер-классы. Для косметологов — сертификаты и спецусловия на оборудование. Приходите на стенд, покажем всё лично.",
    links: [{ label: "Наши выставки", section: "events" }, { label: "Команда тренеров", section: "stories-s6" }],
    photo: "/about/events/intercharm-2016.jpg", photoAlt: "SPAquatoria на InterCHARM",
  },
  {
    date: "28 мар 2026", tag: "философия", color: "var(--brand)",
    body: "Каждая формула — это архитектура. Компоненты не просто «добавлены» — они усиливают друг друга. 30 итераций одной формулы.",
    detail: "Мой отец, Эдгар Илалович, научил меня: в экстракции важна не сила, а точность. Технологии НПО «Техкон» с 1989 года — это фундамент. Патент RU2302423C2 на выделение антоцианинов — наша семейная гордость. Когда я создаю формулу, я думаю не о маркетинге. Я думаю о молекулах. 98,9% натуральных компонентов — это не рекламный слоган, это химическая честность.",
    links: [{ label: "История НПО «Техкон»", section: "timeline" }, { label: "О Светлане", section: "stories-s1" }],
    photo: "/about/factory/2.jpg", photoAlt: "Фабрика НПО Техкон",
  },
  {
    date: "15 мар 2026", title: "Новая линия SREDA", tag: "разработка", color: "#4DA6C9",
    body: "Работаем над линией SREDA — средства для повседневной жизни в городе. Экологичные, компактные.",
    detail: "SREDA — это ответ на запрос: «Хочу качественный уход, но без 10 банок на полке». Компактные форматы, мультифункциональные текстуры. Вата-тип оценит — масляные компоненты в лёгкой форме. Питта — охлаждающий гель-крем 2-в-1. Капха — тонизирующий спрей-тоник. Показывать буду сначала дилерам на весеннем слёте, потом — на InterCHARM.",
    links: [{ label: "Три доши", section: "doshas" }, { label: "Основы ухода", section: "care" }],
    photo: "/about/lines/sreda.jpg", photoAlt: "Линия SREDA",
  },
  {
    date: "1 мар 2026", tag: "философия", color: "var(--brand)",
    body: "«Тело — храм, в котором живёт душа». Это первая строка моей книги. И это то, во что я верю все 30 лет.",
    detail: "Когда доктор Госвами в Удупи сказал: «Лечи причину, не симптом» — всё встало на место. Аюрведа — не мода. Это система, которой 5000 лет. Мы просто переводим её на язык современной дерматологии. Книга «Красивый бизнес от души» — об этом пути. О том, как бизнес может быть настоящим, от сердца к сердцу.",
    links: [{ label: "Книга «Красивый бизнес от души»", section: "events" }, { label: "Аюрведа", section: "stories-s4" }],
    photo: "/about/events/yoga-day.jpg", photoAlt: "День йоги SPAquatoria",
  },
  {
    date: "14 фев 2026", title: "Healing Space 2026 — скоро анонс", tag: "событие", color: "#FF8B5E",
    body: "Конференцию мы запустили в 2018. В этом году — международные спикеры из 4 стран.",
    detail: "Healing Space — наша гордость. В 2022 к нам приезжал доктор Танмай Госвами из Индии (Министерство AYUSH) и Марио Эль-Хамули из Швейцарии (IMAS academy). В этом году расширяем программу: массажные техники, аюрведическая диагностика, музыкальная терапия, кинезиодиагностика чакр через Yoga Line. Место — Москва. Следите за анонсом в Telegram.",
    links: [{ label: "Telegram канал", section: "socials" }, { label: "Healing Space в истории", section: "timeline" }],
    photo: "/about/events/healing-space.jpg", photoAlt: "Healing Space конференция",
  },
  {
    date: "27 фев 2024", title: "Книга вышла!", tag: "книга", color: "#7B5D8A",
    body: "«Красивый бизнес от души» — в продаже. Издательство АСТ. О том, как создать дело от сердца к сердцу.",
    detail: "ISBN 978-5-17-159861-7. Доступна в бумаге, электронном и аудио формате (читает Екатерина Финевич). О сервисе, вере, ценностях и духовном смысле в бизнесе. Это не учебник по косметологии — это мой путь. 30 лет от лаборатории в Химках до 350+ средств в 8+ странах. Купить можно на Литрес, Лабиринт, Читай-город.",
    links: [{ label: "Наша история", section: "story" }, { label: "Ценности", section: "values" }],
    photo: "/about/founders/svetlana-main.jpg", photoAlt: "Светлана Мухтарова — автор книги",
  },
];

/* ─── Social links ─── */

const SOCIALS = [
  { name: "Telegram", url: "https://t.me/spaquatoriaprofessional", abbr: "TG" },
  { name: "VKontakte", url: "https://vk.com/spaquatoriaofficial", abbr: "VK" },
  { name: "Instagram", url: "https://www.instagram.com/spaquatoria_professional/", abbr: "IG" },
  { name: "RuTube", url: "https://rutube.ru/channel/63529730", abbr: "RT" },
  { name: "spaquatoria.ru", url: "https://spaquatoria.ru", abbr: "WEB" },
];

/* ─── FAQ ─── */

const FAQ = [
  { q: "Кто создал SPAquatoria?", a: "К.х.н. Светлана Эдгаровна Мухтарова — химик-технолог, руководитель научного центра. Автор всех формул бренда с 1996 года." },
  { q: "Как определить свою дошу?", a: "Доша-тест в приложении: 15 вопросов, 3 минуты. Для точной диагностики — SPA-салон с аюрведическим консультантом." },
  { q: "Что значит 98,9% натуральность?", a: "Доля натуральных ингредиентов. 1,1% — разрешённые консерванты. Без парабенов, SLS, силиконов, синтетических отдушек. Без тестирования на животных." },
  { q: "Где производится косметика?", a: "Д. Поярково, Солнечногорский р-н, МО. Фабрика АО НПО «Техкон», 4 лаборатории. Полный цикл от разработки до производства." },
  { q: "Есть ли обучение для косметологов?", a: "Образовательный центр с 2016. Семинары, мастер-классы, выездное обучение, сертификаты. Расписание: spaquatoria.ru/education" },
  { q: "Как стать дилером?", a: "Заявка на вкладке B2B или WhatsApp +7 929 675-33-22. Обучение, поддержка, индивидуальные условия." },
];

/* ─── Component ─── */

export default function AboutPage() {
  const [profile, setProfile] = useState<DoshaProfile | null>(null);
  const [activeStory, setActiveStory] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openJournal, setOpenJournal] = useState<number | null>(null);

  useEffect(() => { setProfile(loadProfile()); }, []);

  const dosha = profile ? getDominantDosha(profile) : null;
  const activeStoryData = STORIES.find(s => s.id === activeStory);

  function toggleStory(id: string) {
    setActiveStory(activeStory === id ? null : id);
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-28">

      {/* ── HERO ──────────────────────────────── */}
      <div className="relative overflow-hidden -mx-5 mb-10" style={{ borderRadius: "0 0 8px 8px" }}>
        <img src="/about/founders/svetlana-main.jpg" alt="Светлана Мухтарова — создатель SPAquatoria"
          className="w-full h-[320px] object-cover" style={{ objectPosition: "top" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(22,18,12,0.75) 0%, transparent 55%)" }} />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className="eyebrow mb-3 block" style={{ color: "rgba(255,255,255,0.6)" }}>Создатель · автор всех формул</span>
          <p className="text-white text-[18px] font-light" style={{ letterSpacing: "0.08em" }}>
            Светлана Мухтарова
          </p>
        </div>
      </div>

      <span className="eyebrow mb-3 block">SPAquatoria · Est. 1996</span>
      <h1 className="heading-xl mb-5">О&nbsp;бренде</h1>
      <p className="body-lp muted mb-10" style={{ maxWidth: "42ch" }}>
        Российский бренд профессиональной SPA-косметики, объединяющий аюрведические традиции и современные биотехнологии
      </p>

      {/* ── STORIES BAR ────────────────────────── */}
      <div id="stories-bar" className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-5 px-5 mb-6">
        {STORIES.map(s => (
          <button key={s.id} onClick={() => toggleStory(s.id)}
            className="flex flex-col items-center gap-1 shrink-0 tap">
            <div className={`w-14 h-14 rounded-full p-[2px] transition-all ${activeStory === s.id ? "ring-2 ring-offset-2" : ""}`}
              style={{ background: s.color, ringColor: s.color } as React.CSSProperties}>
              <div className="w-full h-full rounded-full overflow-hidden">
                <img src={s.cover} alt={s.title} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-[10px] font-medium" style={{ color: "var(--lp-muted)" }}>{s.title}</span>
          </button>
        ))}
      </div>

      {/* ── INLINE STORY CARD (journal-style) ──── */}
      {activeStoryData && (
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="eyebrow" style={{ color: "var(--lp-ink)" }}>
              {activeStoryData.title}
            </span>
            <span style={{ width: "1px", height: "10px", background: "var(--lp-line-strong)", display: "inline-block" }} />
            <span className="eyebrow" style={{ color: "var(--lp-tertiary)" }}>
              {activeStoryData.slides.length} разделов
            </span>
            <button onClick={() => setActiveStory(null)}
              className="ml-auto text-[10px] font-normal uppercase tracking-[0.18em] tap" style={{ color: "var(--lp-muted)" }}>
              Закрыть ×
            </button>
          </div>
          <div className="paper-card flat overflow-hidden">
            {activeStoryData.slides.map((slide, i) => (
              <div key={i} className="px-4 py-3.5"
                style={i > 0 ? { borderTop: "1px solid var(--lp-line-soft)" } : undefined}>
                <div className="flex gap-3">
                  {slide.photo && (
                    <div className="relative w-[72px] h-[72px] shrink-0 overflow-hidden bg-fill">
                      <Image
                        src={slide.photo}
                        alt={slide.heading}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="lp-name text-[14px] leading-tight mb-1.5" style={{ color: activeStoryData.color }}>
                      {slide.heading}
                    </p>
                    <p className="body-lp text-[13px] muted">{slide.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DOSHA GREETING ─────────────────────── */}
      {dosha && (
        <div className="flex items-center gap-3 mb-10">
          <span className="pill-chip" style={{ color: DOSHA_COLORS[dosha], borderColor: DOSHA_COLORS[dosha] }}>
            <span className="w-[5px] h-[5px] rounded-full mr-1.5" style={{ backgroundColor: DOSHA_COLORS[dosha] }} />
            {DOSHA_NAMES[dosha]}
          </span>
          <span className="eyebrow" style={{ color: "var(--lp-muted)" }}>
            {dosha === "vata" ? "масло · тепло · питание" :
             dosha === "pitta" ? "охлаждение · лёгкость · баланс" :
             "тонус · детокс · стимуляция"}
          </span>
        </div>
      )}

      {/* ── FOUNDERS ───────────────────────────── */}
      <ScrollReveal>
        <div className="mb-14">
          <p className="eyebrow mb-4">Основатели</p>
          <div className="paper-card flat overflow-hidden">
            {/* Светлана */}
            <div className="p-4">
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 shrink-0 overflow-hidden">
                  <Image
                    src="/about/founders/svetlana-portrait.jpg"
                    alt="Светлана Мухтарова"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="lp-name mb-1">Светлана Эдгаровна Мухтарова</p>
                  <p className="eyebrow mb-2" style={{ color: "var(--lp-tertiary)" }}>к.х.н. · создатель SPAquatoria</p>
                  <p className="body-lp text-[13px] muted">
                    Руководитель научного центра «Лаборатория Живая косметика-про». Автор книги «Красивый бизнес от души» (АСТ, 2024). Бизнес-ментор в космецевтике.
                  </p>
                </div>
              </div>
            </div>
            {/* Денис */}
            <div className="p-4" style={{ borderTop: "1px solid var(--lp-line-soft)" }}>
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 shrink-0 overflow-hidden">
                  <Image
                    src="/about/founders/denis.jpg"
                    alt="Денис Данилов"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="lp-name mb-1">Денис Вячеславович Данилов</p>
                  <p className="eyebrow mb-2" style={{ color: "var(--lp-tertiary)" }}>ген. директор · со-основатель</p>
                  <p className="body-lp text-[13px] muted">
                    Идейный вдохновитель SPAquatoria. Экосистема: фабрика в Поярково → 30+ дилеров → салоны → потребитель.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── ЖИВОЙ ЖУРНАЛ ───────────────────────── */}
      <ScrollReveal>
        <div className="mb-14" id="journal">
          <div className="flex items-center gap-2 mb-4">
            <p className="eyebrow">Живой журнал</p>
            <span className="eyebrow" style={{ color: "var(--lp-tertiary)" }}>· Светлана Мухтарова</span>
          </div>
          <div className="paper-card flat overflow-hidden">
            {JOURNAL.map((j, i) => {
              const isOpen = openJournal === i;
              return (
                <div key={i} style={i > 0 ? { borderTop: "1px solid var(--lp-line-soft)" } : undefined}>
                  <button onClick={() => setOpenJournal(isOpen ? null : i)}
                    className="w-full text-left px-4 py-3.5 tap">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="eyebrow" style={{ color: "var(--lp-muted)" }}>{j.tag}</span>
                      <span style={{ width: "1px", height: "10px", background: "var(--lp-line-strong)", display: "inline-block" }} />
                      <span className="eyebrow" style={{ color: "var(--lp-tertiary)" }}>{j.date}</span>
                      <svg className={`w-3.5 h-3.5 ml-auto shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        style={{ color: "var(--lp-tertiary)" }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                    <div className="flex gap-3">
                      {j.photo && !isOpen && (
                        <div className="relative w-[72px] h-[72px] shrink-0 overflow-hidden bg-fill">
                          <Image
                            src={j.photo}
                            alt={j.photoAlt || j.body}
                            fill
                            sizes="72px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {j.title && <p className="lp-name text-[14px] leading-tight mb-2">{j.title}</p>}
                        <p className="body-lp text-[13px] muted">{j.body}</p>
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && j.detail && (
                    <div className="px-4 pb-3.5" style={{ borderTop: "1px solid var(--lp-line-soft)" }}>
                      {j.photo && (
                        <div className="relative -mx-4 aspect-[16/10] overflow-hidden mt-3 mb-4">
                          <Image
                            src={j.photo}
                            alt={j.photoAlt || j.body}
                            fill
                            sizes="(max-width: 512px) 100vw, 512px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <p className="body-lp text-[13px] muted mt-3">{j.detail}</p>

                      {/* Cross-links to other sections */}
                      {j.links && j.links.length > 0 && (
                        <div className="flex flex-wrap gap-4 mt-4">
                          {j.links.map(link => (
                            <button key={link.label}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (link.section.startsWith("stories-")) {
                                  toggleStory(link.section.replace("stories-", ""));
                                  document.getElementById("stories-bar")?.scrollIntoView({ behavior: "smooth", block: "center" });
                                } else {
                                  document.getElementById(link.section)?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }
                              }}
                              className="text-[10px] font-normal uppercase tracking-[0.18em] text-brand border-b border-brand pb-[2px] tap">
                              {link.label} →
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* ── ИСТОРИЯ ────────────────────────────── */}
      <ScrollReveal>
        <div className="mb-14" id="story">
          <p className="eyebrow mb-4">История</p>
          <div className="paper-card flat p-5">
            <div className="space-y-4 body-lp text-[14px] muted">
              <p>
                SPAquatoria родилась в НПО «Техкон» — биотехнологической лаборатории, основанной в 1989 году
                в Химках. Эдгар Мухтаров разработал технологии экстракции биоактивных веществ из лекарственных растений.
                В 1996 году его дочь Светлана Мухтарова создала первые косметические формулы, соединив химию и аюрведу.
              </p>
              <p>
                Каждое средство подбирается на основе вашей доши — уникального баланса Вата, Питта и Капха.
                Формулы разработаны совместно с практикующими аюрведическими врачами, включая доктора Танмая Госвами
                из Удупи (Индия, Министерство AYUSH). Без синтетических отдушек, парабенов и сульфатов.
              </p>
              <p>
                Сегодня SPAquatoria — 350+ средств для лица, тела и волос. Линии Yoga Line, SREDA,
                Pearl Endorphin, Grand Cru Elixir, Swan Grace. Музыкальная терапия. 8+ стран.
                Собственная фабрика, 4 лаборатории, образовательный центр.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── TIMELINE ───────────────────────────── */}
      <ScrollReveal>
        <div className="mb-14" id="timeline">
          <p className="eyebrow mb-4">Ключевые даты</p>
          <div className="paper-card flat overflow-hidden">
            {[
              { year: "1989", text: "АО НПО «Техкон» — биотехнологическая лаборатория. Эдгар Мухтаров: экстракция из лекарственных растений" },
              { year: "1996", text: "Первые косметические формулы. Светлана Мухтарова соединяет химию и аюрведу" },
              { year: "2005", text: "Патент RU2302423C2 — метод выделения биоактивных антоцианинов" },
              { year: "2016", text: "Открытие образовательного центра. Первое участие в InterCHARM" },
              { year: "2018", text: "Healing Space — собственная конференция массажных техник" },
              { year: "2020", text: "Guide Mag Russian Awards — «Бренд года»" },
              { year: "2024", text: "Книга «Красивый бизнес от души» (АСТ). 350+ средств" },
            ].map((t, i) => (
              <div key={t.year} className="flex items-start gap-4 px-4 py-3.5"
                style={i > 0 ? { borderTop: "1px solid var(--lp-line-soft)" } : undefined}>
                <span className="numeric-lp text-[16px] text-brand shrink-0 w-12">{t.year}</span>
                <p className="body-lp text-[13px] muted">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ── ЦЕННОСТИ ───────────────────────────── */}
      <ScrollReveal>
        <div className="mb-14" id="values">
          <p className="eyebrow mb-4">Ценности</p>
          <div className="paper-card flat overflow-hidden">
            {[
              { title: "Аюрведический подход", desc: "Каждый продукт создан с учётом трёх дош. Ваша кожа уникальна" },
              { title: "Морские активы", desc: "Коллагены, альгинаты, морской кальций — лучшие компоненты океана" },
              { title: "Без компромиссов", desc: "Без парабенов, SLS, синтетических отдушек. Без тестирования на животных" },
              { title: "Из SPA — домой", desc: "Формулы для SPA-центров, адаптированные для домашнего использования" },
            ].map((v, i) => (
              <div key={v.title} className="px-4 py-4"
                style={i > 0 ? { borderTop: "1px solid var(--lp-line-soft)" } : undefined}>
                <p className="lp-name mb-1.5">{v.title}</p>
                <p className="body-lp text-[13px] muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ── ТРИ ДОШИ ───────────────────────────── */}
      <ScrollReveal>
        <div className="mb-14" id="doshas">
          <p className="eyebrow mb-4">Три доши</p>
          <p className="body-lp text-[14px] muted mb-4">
            В аюрведе каждый человек — уникальная комбинация трёх энергий.
            Тип кожи, её потребности и реакции определяются этим балансом.
          </p>
          <div className="space-y-2">
            {([
              { name: "Вата", key: "vata" as DoshaType, sub: "Воздух + Эфир", color: "#7EC8E3", desc: "Тонкая, сухая кожа. Глубокое питание и защита", traits: ["Чувствительность к холоду", "Склонность к шелушению", "Тонкие поры"] },
              { name: "Питта", key: "pitta" as DoshaType, sub: "Огонь + Вода", color: "#FF8B5E", desc: "Чувствительная кожа. Успокоение и баланс", traits: ["Реактивность кожи", "Склонность к воспалениям", "Нормальные поры"] },
              { name: "Капха", key: "kapha" as DoshaType, sub: "Земля + Вода", color: "#5EBB6E", desc: "Плотная кожа. Детокс и тонизирование", traits: ["Расширенные поры", "Жирный блеск", "Медленная регенерация"] },
            ]).map(d => (
              <div key={d.name} className={`paper-card flat p-4 ${dosha === d.key ? "ring-1" : ""}`}
                style={dosha === d.key ? { borderColor: d.color, ringColor: d.color } as React.CSSProperties : undefined}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <h3 className="text-[14px] uppercase" style={{ color: d.color, letterSpacing: "0.15em", fontWeight: 400 }}>{d.name}</h3>
                  <span className="eyebrow ml-auto" style={{ color: "var(--lp-muted)" }}>{d.sub}</span>
                  {dosha === d.key && (
                    <span className="eyebrow px-2 py-0.5 text-white text-[9px]" style={{ backgroundColor: d.color, borderRadius: "3px" }}>
                      ваша
                    </span>
                  )}
                </div>
                <p className="body-lp text-[13px] muted mb-3">{d.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {d.traits.map(t => (
                    <span key={t} className="text-[10px] uppercase tracking-[0.12em] px-2 py-[3px] rounded-sm bg-fill font-light" style={{ color: "var(--lp-muted)" }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {!profile && (
            <Link href="/test" className="btn-lp w-full mt-6">
              Определить свою дошу
            </Link>
          )}
        </div>
      </ScrollReveal>

      {/* ── ЛИНИИ ──────────────────────────────── */}
      <ScrollReveal>
        <div className="mb-14" id="lines">
          <p className="eyebrow mb-4">Наши линии</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { slug: "pearl-endorphin", name: "Pearl Endorphin", desc: "Anti-age, жемчуг, endorphin-peptides", img: "/about/lines/pearl-endorphin.jpg" },
              { slug: "grand-cru-elixir", name: "Grand Cru Elixir", desc: "Ростки винограда, anti-age", img: "/about/lines/grand-cru-elixir.jpg" },
              { slug: "swan-grace", name: "Swan Grace", desc: "Шея · декольте · уход", img: "/about/lines/swan-grace.jpg" },
              { slug: "yoga-line", name: "Yoga Line", desc: "Аромаэссенции · чакры", img: "/about/lines/yoga-line.jpg" },
              { slug: "sreda", name: "SREDA", desc: "Городской ритм, компактно", img: "/about/lines/sreda.jpg" },
              { slug: "berry-glow", name: "Berry Glow", desc: "Ягодные активы, тело", img: "/about/lines/berry-glow.jpg" },
            ].map(line => (
              <Link href={`/lines/${line.slug}`} key={line.slug} className="group block tap">
                <div className="relative aspect-[4/5] overflow-hidden bg-fill">
                  <Image
                    src={line.img}
                    alt={line.name}
                    fill
                    sizes="(max-width: 512px) 50vw, 256px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="pt-3 pb-1">
                  <p className="lp-name text-[13px] leading-tight">{line.name}</p>
                  <p className="eyebrow mt-1.5" style={{ color: "var(--lp-tertiary)" }}>{line.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ── ФАБРИКА ────────────────────────────── */}
      <ScrollReveal>
        <div className="mb-14">
          <div className="flex items-baseline justify-between mb-4">
            <p className="eyebrow">Фабрика</p>
            <span className="eyebrow" style={{ color: "var(--lp-tertiary)" }}>Поярково · МО</span>
          </div>
          <div className="relative -mx-5 aspect-[16/9] overflow-hidden mb-2">
            <Image
              src="/about/factory/1.jpg"
              alt="Фабрика SPAquatoria"
              fill
              sizes="(max-width: 512px) 100vw, 512px"
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 -mx-5">
            <div className="relative aspect-square overflow-hidden">
              <Image src="/about/factory/2.jpg" alt="Лаборатория" fill sizes="50vw" className="object-cover" />
            </div>
            <div className="relative aspect-square overflow-hidden">
              <Image src="/about/factory/3.jpg" alt="Производство" fill sizes="50vw" className="object-cover" />
            </div>
          </div>
          <p className="body-lp text-[13px] muted mt-4 px-1">
            АО НПО «Техкон». 4 лаборатории, полный цикл от разработки до упаковки. Патент RU2302423C2 на выделение антоцианинов — семейное наследие Мухтаровых с 1989 года.
          </p>
        </div>
      </ScrollReveal>

      {/* ── ВЫСТАВКИ ───────────────────────────── */}
      <ScrollReveal>
        <div className="mb-14" id="events">
          <p className="eyebrow mb-4">Выставки и события</p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
            {[
              { year: "2022", title: "Healing Space", desc: "Др. Госвами, Марио Эль-Хамули", color: "#FF8B5E", img: "/about/events/healing-space.jpg" },
              { year: "2020", title: "Swan Grace Launch", desc: "Презентация линии для шеи", color: "#5EBB6E", img: "/about/events/swan-grace-launch.jpg" },
              { year: "2018", title: "InterCHARM + HS", desc: "Первая конференция Healing Space", color: "#4DA6C9", img: "/about/events/intercharm-2018.png" },
              { year: "2017", title: "Pearl Endorphin", desc: "Запуск линии, мастер-класс", color: "#B84B8C", img: "/about/events/master-class.jpg" },
              { year: "2016", title: "InterCHARM debut", desc: "Первое участие в главной выставке", color: "#7B5D8A", img: "/about/events/intercharm-2016.jpg" },
            ].map(e => (
              <div key={e.year} className="shrink-0 w-[220px] paper-card flat overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={e.img}
                    alt={e.title}
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-[3px] bg-white/90 backdrop-blur-sm">
                    <span className="numeric-lp text-[11px]" style={{ color: e.color }}>{e.year}</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="lp-name text-[13px] leading-tight">{e.title}</p>
                  <p className="body-lp text-[11px] muted mt-1.5">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ── ОСНОВЫ УХОДА ───────────────────────── */}
      <ScrollReveal>
        <div className="mb-14" id="care">
          <p className="eyebrow mb-4">Основы ухода</p>
          <div className="paper-card flat overflow-hidden">
            {[
              { step: "1", title: "Очищение", desc: "Удаление загрязнений без нарушения баланса" },
              { step: "2", title: "Тонизирование", desc: "Восстановление pH, подготовка к активным средствам" },
              { step: "3", title: "Сыворотка", desc: "Концентрированные активы: увлажнение, лифтинг, anti-age" },
              { step: "4", title: "Крем", desc: "Утром — лёгкий с SPF, вечером — питательный" },
              { step: "5", title: "Маска", desc: "Интенсивный уход 1-2 раза в неделю" },
            ].map((s, i) => (
              <div key={s.step} className="flex items-start gap-4 px-4 py-4"
                style={i > 0 ? { borderTop: "1px solid var(--lp-line-soft)" } : undefined}>
                <span className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center text-[11px] font-light shrink-0 mt-0.5">
                  0{s.step}
                </span>
                <div>
                  <p className="lp-name mb-1">{s.title}</p>
                  <p className="body-lp text-[13px] muted">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/routine" className="btn-lp ghost w-full mt-6">
            Персональный ритуал
          </Link>
        </div>
      </ScrollReveal>

      {/* ── ОТЗЫВЫ ─────────────────────────────── */}
      <ScrollReveal>
        <div className="mb-14">
          <p className="eyebrow mb-4">Отзывы</p>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
            {[
              { name: "Анна К.", dosha: "Питта", color: "#FF8B5E", text: "Pearl Endorphin. Через месяц покраснения ушли. Вечерний ритуал — мои 20 минут спокойствия." },
              { name: "Дарья М.", dosha: "Вата", color: "#7EC8E3", text: "4 шага, 7 минут утром. Муж заметил разницу через 2 недели." },
              { name: "Марина В.", dosha: "Капха", color: "#5EBB6E", text: "Лёгкие текстуры, никакой плёнки. Тоник — свежесть на весь день." },
              { name: "Елена Т.", dosha: "Косметолог", color: "#7B5D8A", text: "Anti-age с Grand Cru Elixir — самая популярная услуга. 3 года на протоколах SPAquatoria." },
            ].map(r => (
              <div key={r.name} className="shrink-0 w-[240px] paper-card flat p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-light text-white"
                    style={{ backgroundColor: r.color }}>{r.name[0]}</span>
                  <div>
                    <p className="lp-name text-[12px] leading-tight">{r.name}</p>
                    <p className="eyebrow mt-0.5" style={{ color: "var(--lp-tertiary)" }}>{r.dosha}</p>
                  </div>
                </div>
                <p className="body-lp text-[13px] muted italic">«{r.text}»</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ── МЫ В СЕТИ ──────────────────────────── */}
      <ScrollReveal>
        <div className="mb-14" id="socials">
          <p className="eyebrow mb-4">Мы в сети</p>
          <div className="paper-card flat overflow-hidden">
            {SOCIALS.map((s, i) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-4 tap"
                style={i > 0 ? { borderTop: "1px solid var(--lp-line-soft)" } : undefined}>
                <div className="flex items-center gap-4">
                  <span className="w-9 h-9 rounded-sm flex items-center justify-center eyebrow" style={{ border: "1px solid var(--lp-line)", color: "var(--lp-muted)" }}>
                    {s.abbr}
                  </span>
                  <span className="lp-name text-[14px]">{s.name}</span>
                </div>
                <svg className="w-4 h-4" style={{ color: "var(--lp-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ── NUMBERS ────────────────────────────── */}
      <ScrollReveal>
        <div className="-mx-5 p-8 text-center mb-14" style={{ background: "var(--brand)", borderRadius: "8px" }}>
          <span className="eyebrow mb-6 block" style={{ color: "rgba(255,255,255,0.5)" }}>В цифрах</span>
          <div className="grid grid-cols-2 gap-6">
            {[
              { n: "350+", label: "средств" },
              { n: "98,9%", label: "натуральность" },
              { n: "30+", label: "лет науки" },
              { n: "8+", label: "стран" },
            ].map(s => (
              <div key={s.label}>
                <p className="numeric-lp text-[32px] text-white mb-1.5">{s.n}</p>
                <p className="text-[9px] text-white/60 uppercase tracking-[0.22em]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ── FAQ ─────────────────────────────────── */}
      <ScrollReveal>
        <div className="mb-14">
          <p className="eyebrow mb-4">Частые вопросы</p>
          <div className="paper-card flat overflow-hidden">
            {FAQ.map((item, i) => (
              <div key={i} style={i > 0 ? { borderTop: "1px solid var(--lp-line-soft)" } : undefined}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-4 py-4 flex items-start gap-3 tap">
                  <span className="lp-name text-[14px] text-fg flex-1 leading-snug">{item.q}</span>
                  <span className={`text-[14px] muted shrink-0 font-light transition-transform ${openFaq === i ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="body-lp text-[13px] muted">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
            <div className="px-4 py-3.5" style={{ borderTop: "1px solid var(--lp-line-soft)" }}>
              <a href="https://wa.me/79296753322?text=Здравствуйте!%20У%20меня%20вопрос%20о%20продукции%20SPAquatoria"
                target="_blank" rel="noopener noreferrer"
                className="btn-lp w-full">
                Задать вопрос
              </a>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── CTA LINKS ──────────────────────────── */}
      <section className="mb-14">
        <div className="space-y-3">
          {!profile && (
            <Link href="/test" className="btn-lp w-full">Определить свою дошу</Link>
          )}
          <Link href="/b2b" className="btn-lp ghost w-full">Стать партнёром</Link>
          <Link href="/routine" className="btn-lp ghost w-full">Мой ритуал ухода</Link>
        </div>
      </section>

      {/* ── BRAND FOOTER ───────────────────────── */}
      <div className="text-center pt-10" style={{ borderTop: "1px solid var(--lp-line-soft)" }}>
        <p className="heading-md mb-3" style={{ fontWeight: 300, letterSpacing: "0.18em" }}>SPAQUATORIA</p>
        <div className="w-8 h-[1px] mx-auto mb-3" style={{ background: "var(--lp-line)" }} />
        <p className="eyebrow" style={{ color: "var(--lp-muted)" }}>Est. 1996 · Российская Федерация</p>
      </div>
    </div>
  );
}
