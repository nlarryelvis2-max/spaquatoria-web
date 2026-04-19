// Shared content used across Home, Dealer portal, and Journal
import { DoshaType } from "./types";

// ─── Ingredient Stories (rotate by day) ──────────
export interface IngredientStory {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  color: string;
  lineId: string;
  ingredientId: string;
}

export const INGREDIENT_STORIES: IngredientStory[] = [
  { id: "polynesian-pearl", title: "Полинезийский жемчуг", subtitle: "22 аминокислоты для сияния", text: "Таитянские жемчужницы формируют перламутр из 22 аминокислот и минералов. Экстракт жемчуга стимулирует синтез коллагена и дарит коже естественное свечение изнутри — эффект, который невозможно повторить декоративной косметикой.", color: "#E5A6FF", lineId: "pearl-endorphin", ingredientId: "polynesian-pearl" },
  { id: "red-grape", title: "Красный виноград", subtitle: "Ресвератрол против времени", text: "Французские виноградники Grand Cru дают не только великие вина. Экстракт красного винограда содержит ресвератрол — молекулу, которая замедляет оксидативный стресс и активирует белки сиртуины, отвечающие за клеточную молодость.", color: "#83C458", lineId: "grand-cru-elixir", ingredientId: "red-grape-extract" },
  { id: "swan-peptide", title: "Лебединый пептид", subtitle: "Архитектура шеи и декольте", text: "Эксклюзивный пептидный комплекс SPAquatoria, разработанный для зоны шеи и декольте. Укрепляет тонкую кожу, восстанавливает каркас и создаёт эффект лифтинга — грация лебединой шеи в каждом движении.", color: "#3C184B", lineId: "swan-grace", ingredientId: "swan-peptide" },
  { id: "edelweiss", title: "Стволовые клетки эдельвейса", subtitle: "Альпийская защита ДНК", text: "Эдельвейс выживает на высоте 3000 м под UV-излучением, которое разрушает обычные растения. Его стволовые клетки активируют теломеразу и защищают ДНК кожи от фотостарения — опыт тысячелетий эволюции в одной молекуле.", color: "#83C458", lineId: "grand-cru-elixir", ingredientId: "edelweiss-stem-cells" },
  { id: "marine-collagen", title: "Морской коллаген", subtitle: "Глубокое восстановление", text: "Коллаген из морских рыб усваивается в 1.5 раза эффективнее бычьего. Низкомолекулярные пептиды проникают в дерму и запускают собственный синтез коллагена — кожа восстанавливает упругость изнутри, а не маскирует потерю снаружи.", color: "#3C184B", lineId: "swan-grace", ingredientId: "marine-collagen" },
  { id: "hyaluronic", title: "Гиалуроновая кислота", subtitle: "Многоуровневое увлажнение", text: "Не просто гиалуронка. Мы используем комплекс из низкомолекулярной (проникает в дерму) и высокомолекулярной (создаёт барьер на поверхности) гиалуроновой кислоты. Двойной уровень увлажнения — глубина + защита.", color: "#E5A6FF", lineId: "pearl-endorphin", ingredientId: "hyaluronic-acid" },
  { id: "retinol", title: "Ретинол", subtitle: "Золотой стандарт anti-age", text: "Витамин А в активной форме — единственный ингредиент с доказанной эффективностью против морщин, пигментации и потери упругости. Мы используем инкапсулированный ретинол для постепенного высвобождения без раздражения.", color: "#83C458", lineId: "grand-cru-elixir", ingredientId: "retinol" },
];

export interface AyurvedaTip {
  title: string;
  text: string;
  icon: string;
}

export const AYURVEDA_TIPS: AyurvedaTip[] = [
  { title: "Утренний ритуал", text: "В аюрведе утро начинается с очищения. Умывание — не просто гигиена, а ритуал пробуждения кожи. Тёплая вода для Ваты, прохладная для Питты, контрастная для Капхи.", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" },
  { title: "Сезонный уход", text: "Весной кожа Капха-типа склонна к избыточной секреции. Добавьте лёгкие текстуры и детокс-маски. Питта-коже нужна защита от первого солнца. Вата требует интенсивного увлажнения после зимы.", icon: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" },
  { title: "Доша и питание", text: "Кожа отражает внутреннее состояние. Вата — полезны тёплые масла и орехи. Питта — охлаждающие продукты: огурец, кокос, мята. Капха — специи и лёгкая пища, стимулирующая метаболизм.", icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" },
  { title: "Вечерний ритуал", text: "Вечер в аюрведе — время восстановления. Двойное очищение снимает загрязнения дня. Сыворотка и крем работают ночью, когда клетки обновляются в 8 раз быстрее. Нанесите за 30 минут до сна.", icon: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" },
  { title: "Масла в аюрведе", text: "Абхьянга — ежедневный масляный массаж. Кунжутное масло согревает Вату, кокосовое охлаждает Питту, горчичное стимулирует Капху. Масло проникает через все 7 слоёв кожи за 15 минут.", icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.963-6.098A8.25 8.25 0 0112 21" },
  { title: "Точки Марма", text: "В аюрведе есть 107 энергетических точек на теле — Марма. При нанесении крема мягко надавливайте на точки вокруг глаз и на висках. Это усиливает кровообращение и проникновение активных компонентов.", icon: "M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" },
  { title: "Детокс кожи", text: "Раз в неделю делайте глиняную маску. Белая глина для чувствительной Питта-кожи, зелёная для жирной Капхи, розовая для сухой Ваты. Держите 10-15 минут, не давая высохнуть — сбрызгивайте тоником.", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
];

// ─── Dosha-personalized greetings ────────────────
export const DOSHA_GREETINGS: Record<string, string[]> = {
  vata: [
    "Твоя кожа сейчас особенно нуждается в тепле и питании",
    "Сегодня день для глубокого увлажнения — Вата благодарит за масла",
    "Сухой воздух — враг Ваты. Не забудь про сыворотку",
    "Вата любит ритуалы. Каждый шаг ухода — маленькая медитация",
  ],
  pitta: [
    "Твоя кожа благодарит за мягкость и прохладу",
    "Питта в балансе — сияние изнутри. Продолжай в том же духе",
    "Успокаивающие текстуры сегодня — то, что нужно Питте",
    "Защити кожу от раздражений — Питта ценит бережный уход",
  ],
  kapha: [
    "Время пробудить кожу — Капха любит лёгкие текстуры",
    "Детокс и тонус — формула для твоей Капхи сегодня",
    "Капха в балансе — кожа сияет здоровьем. Лёгкий уход — лучший уход",
    "Стимулируй обновление — твоя кожа готова к переменам",
  ],
};

export const CARE_INSIGHTS: Record<string, string> = {
  vata: "Вата-коже не хватает собственных липидов. Масла и баттеры — не роскошь, а необходимость.",
  pitta: "Питта-кожа реагирует на всё: стресс, солнце, острую еду. Минимум агрессии, максимум спокойствия.",
  kapha: "Капха-кожа самая стойкая, но склонна к застою. Регулярное очищение и лёгкие текстуры — союзники.",
};

// ─── Ritucharya (6 Ayurvedic seasons) ────────────
export interface SeasonInfo {
  name: string;
  nameEn: string;
  period: string;
  element: string;
  dosha: DoshaType;
  color: string;
  skinTip: string;
  ritualTip: string;
  foodTip: string;
}

export const RITUCHARYA: SeasonInfo[] = [
  { name: "Шишира", nameEn: "Поздняя зима", period: "янв — фев", element: "Воздух + Эфир", dosha: "vata", color: "#7EC8E3", skinTip: "Максимальное питание: масляные сыворотки, крем-баттеры, тёплые компрессы", ritualTip: "Абхьянга с кунжутным маслом перед душем — согревает и защищает", foodTip: "Тёплые супы, имбирный чай, топлёное масло, корица" },
  { name: "Васанта", nameEn: "Весна", period: "мар — апр", element: "Вода + Земля", dosha: "kapha", color: "#5EBB6E", skinTip: "Лёгкие текстуры, детокс-маски, энзимные пилинги — пробуждение после зимы", ritualTip: "Сухая щётка (гаршана) утром — выводит застой лимфы, тонизирует", foodTip: "Горькие салаты, куркума, имбирь, мёд с тёплой водой натощак" },
  { name: "Гришма", nameEn: "Лето", period: "май — июн", element: "Огонь", dosha: "pitta", color: "#FF8B5E", skinTip: "Охлаждающие гели, SPF, мицеллярная вода — защита от перегрева кожи", ritualTip: "Умывание розовой водой, алоэ-маски, минимум горячих процедур", foodTip: "Кокосовая вода, огурцы, мята, сладкие фрукты, избегать острого" },
  { name: "Варша", nameEn: "Сезон дождей", period: "июл — авг", element: "Вода + Огонь", dosha: "pitta", color: "#FF6B3D", skinTip: "Антибактериальные средства, лёгкие увлажняющие лосьоны, нимовые маски", ritualTip: "Сократи масляные процедуры, добавь глиняные маски для очищения пор", foodTip: "Лёгкая пища, тёплые специи, избегай тяжёлой и жирной еды" },
  { name: "Шарад", nameEn: "Осень", period: "сен — окт", element: "Огонь + Воздух", dosha: "pitta", color: "#C8956E", skinTip: "Восстановление после лета: успокаивающие сыворотки, сандаловые маски", ritualTip: "Вечерние маски с алоэ и жемчугом — охлаждают остаточную Питту", foodTip: "Сладкие и горькие вкусы, гранат, виноград, рис с шафраном" },
  { name: "Хеманта", nameEn: "Ранняя зима", period: "ноя — дек", element: "Вода + Земля", dosha: "vata", color: "#7B5D8A", skinTip: "Переход к питательным текстурам: кремы-суфле, масла-эликсиры, бальзамы", ritualTip: "Удлини вечерний ритуал — многослойное нанесение (тоник → сыворотка → крем → масло)", foodTip: "Согревающие каши, орехи, тёплое молоко с кардамоном, корнеплоды" },
];

export function getCurrentSeason(): SeasonInfo {
  const month = new Date().getMonth();
  if (month <= 1) return RITUCHARYA[0];
  if (month <= 3) return RITUCHARYA[1];
  if (month <= 5) return RITUCHARYA[2];
  if (month <= 7) return RITUCHARYA[3];
  if (month <= 9) return RITUCHARYA[4];
  return RITUCHARYA[5];
}

// ─── Calendar events ─────────────────────────────
export interface CalendarEvent {
  month: number;
  day: number;
  duration?: number;
  title: string;
  subtitle: string;
  tip: string;
  gradient: string;
  category: "beauty" | "wellness" | "nature" | "culture";
}

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { month: 0, day: 1, title: "Новый год — новый ритуал", subtitle: "Время обновить уход", tip: "Идеальный момент начать доша-тест и подобрать программу на год", gradient: "linear-gradient(135deg, #7B5D8A, #3C184B)", category: "culture" },
  { month: 0, day: 14, title: "Макар Санкранти", subtitle: "Аюрведический праздник солнца", tip: "День благодарности солнцу. В аюрведе — начало сезона детокса кунжутным маслом", gradient: "linear-gradient(135deg, #FF9500, #FF6B3D)", category: "culture" },
  { month: 1, day: 14, title: "День заботы о себе", subtitle: "Самый важный подарок — себе", tip: "Подари себе полный вечерний ритуал: масляная маска, сыворотка, крем — 30 минут тишины", gradient: "linear-gradient(135deg, #FF6B8A, #FF3B5C)", category: "beauty" },
  { month: 2, day: 8, title: "8 марта", subtitle: "Красота начинается с заботы", tip: "Набор для подруги: доша-тест + средство по типу кожи = идеальный подарок", gradient: "linear-gradient(135deg, #E5A6FF, #B84B8C)", category: "culture" },
  { month: 2, day: 20, title: "День весеннего равноденствия", subtitle: "Природа просыпается", tip: "Переходи на лёгкие текстуры. Капха-сезон: энзимный пилинг + тоник с нимом", gradient: "linear-gradient(135deg, #5EBB6E, #34C759)", category: "nature" },
  { month: 2, day: 22, title: "Всемирный день воды", subtitle: "Увлажнение = молодость", tip: "Гиалуроновая кислота удерживает в 1000 раз больше воды, чем весит сама", gradient: "linear-gradient(135deg, #7EC8E3, #4DA6C9)", category: "wellness" },
  { month: 3, day: 7, title: "Всемирный день здоровья", subtitle: "Кожа — зеркало здоровья", tip: "Начни вести дневник кожи: 4 метрики в день, и через неделю увидишь паттерны", gradient: "linear-gradient(135deg, #5EBB6E, #34C759)", category: "wellness" },
  { month: 3, day: 22, title: "День Земли", subtitle: "98,9% натуральных компонентов", tip: "Каждая формула SPAquatoria — без парабенов, SLS и синтетических отдушек", gradient: "linear-gradient(135deg, #34C759, #248A3D)", category: "nature" },
  { month: 4, day: 1, title: "Начало лета в аюрведе", subtitle: "Гришма — сезон огня", tip: "Питта начинает расти. Переходи на охлаждающие средства: Pearl Endorphin, гели", gradient: "linear-gradient(135deg, #FF8B5E, #FF6B3D)", category: "wellness" },
  { month: 4, day: 15, duration: 3, title: "InterCHARM Spring", subtitle: "Главная beauty-выставка России", tip: "SPAquatoria — постоянный участник с 2016 года", gradient: "linear-gradient(135deg, #3C184B, #7B5D8A)", category: "beauty" },
  { month: 5, day: 21, title: "Международный день йоги", subtitle: "Кожа и сознание связаны", tip: "10 минут пранаямы + вечерний ритуал = стресс-детокс для кожи", gradient: "linear-gradient(135deg, #FF9500, #C8956E)", category: "wellness" },
  { month: 5, day: 22, title: "День летнего солнцестояния", subtitle: "Пик Питты — максимум SPF", tip: "Самый длинный день. Наноси SPF каждые 2 часа, охлаждай розовой водой", gradient: "linear-gradient(135deg, #FF8B5E, #FF3B5C)", category: "nature" },
  { month: 6, day: 1, title: "Варша — сезон дождей", subtitle: "Очищение и лёгкость", tip: "Влажный сезон: глиняные маски 2 раза в неделю, минимум масляных средств", gradient: "linear-gradient(135deg, #7EC8E3, #4DA6C9)", category: "wellness" },
  { month: 7, day: 12, title: "Международный день молодёжи", subtitle: "Уход с 20 — инвестиция в 40", tip: "Увлажнение + SPF + антиоксиданты — минимум для 20+", gradient: "linear-gradient(135deg, #E5A6FF, #B84B8C)", category: "beauty" },
  { month: 8, day: 1, title: "Шарад — золотая осень", subtitle: "Восстановление после лета", tip: "Время восстановления: ресвератрол, витамин С, успокаивающие маски", gradient: "linear-gradient(135deg, #C8956E, #8B6914)", category: "wellness" },
  { month: 8, day: 9, title: "Всемирный день красоты", subtitle: "Красота по-аюрведически", tip: "Настоящая красота — это баланс. Пройди Викрити-тест", gradient: "linear-gradient(135deg, #E5A6FF, #FF6B8A)", category: "beauty" },
  { month: 9, day: 15, duration: 3, title: "InterCHARM Autumn", subtitle: "Осенняя beauty-выставка", tip: "Новые линии, эксклюзивные протоколы, обучение для косметологов", gradient: "linear-gradient(135deg, #3C184B, #7B5D8A)", category: "beauty" },
  { month: 9, day: 20, title: "Дивали — фестиваль света", subtitle: "Праздник обновления в аюрведе", tip: "Массаж с кунжутным маслом, зажечь свечу, нанести маску — ритуал света", gradient: "linear-gradient(135deg, #FF9500, #FFD60A)", category: "culture" },
  { month: 10, day: 1, title: "Хеманта — ранняя зима", subtitle: "Время глубокого питания", tip: "Переходи на масла-эликсиры и крем-суфле. Многослойность — ключ", gradient: "linear-gradient(135deg, #7B5D8A, #3C184B)", category: "wellness" },
  { month: 10, day: 19, title: "Международный мужской день", subtitle: "Уход — не только для женщин", tip: "Подари мужчине доша-тест и базовый набор: очищение + увлажнение", gradient: "linear-gradient(135deg, #4DA6C9, #2D6A8A)", category: "beauty" },
  { month: 11, day: 21, title: "Зимнее солнцестояние", subtitle: "Самая длинная ночь — максимум восстановления", tip: "Ночные маски и масляные обертывания — используй силу ночи", gradient: "linear-gradient(135deg, #1C1C3E, #7B5D8A)", category: "nature" },
  { month: 11, day: 31, title: "Итоги года ухода", subtitle: "Посмотри свой путь", tip: "Загляни в дневник кожи: сравни первую и последнюю запись", gradient: "linear-gradient(135deg, #FFD60A, #FF9500)", category: "culture" },
];

export function getUpcomingEvents(count: number): (CalendarEvent & { daysUntil: number; dateStr: string })[] {
  const now = new Date();
  const year = now.getFullYear();
  const today = new Date(year, now.getMonth(), now.getDate());

  const withDates = CALENDAR_EVENTS.map(ev => {
    let eventDate = new Date(year, ev.month, ev.day);
    if (eventDate < today) {
      eventDate = new Date(year + 1, ev.month, ev.day);
    }
    const diff = Math.floor((eventDate.getTime() - today.getTime()) / 86400000);
    const months = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
    const dateStr = ev.duration
      ? `${ev.day}–${ev.day + ev.duration} ${months[ev.month]}`
      : `${ev.day} ${months[ev.month]}`;
    return { ...ev, daysUntil: diff === 0 ? 0 : diff, dateStr };
  });

  return withDates.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, count);
}

// ─── Community stats (social proof) ──────────────
export interface CommunityStat {
  number: string;
  text: string;
  icon: string;
}

export const COMMUNITY_STATS: CommunityStat[] = [
  { number: "4,200+", text: "женщин ведут дневник кожи с SPAquatoria", icon: "📝" },
  { number: "87%", text: "замечают улучшение состояния кожи за 2 недели ухода", icon: "✨" },
  { number: "30+", text: "лет научных исследований НПО «Техкон»", icon: "🔬" },
  { number: "350+", text: "средств для лица, тела и волос", icon: "🧴" },
  { number: "98,9%", text: "натуральных компонентов в каждой формуле", icon: "🌿" },
  { number: "8+", text: "стран, где представлена SPAquatoria", icon: "🌍" },
  { number: "15 000+", text: "протоколов SPA-процедур проведено с нашей косметикой", icon: "💆" },
  { number: "92%", text: "косметологов рекомендуют повторный курс клиентам", icon: "👩‍⚕️" },
  { number: "3 нед.", text: "— средний срок до видимого улучшения по отзывам", icon: "📊" },
  { number: "1 200+", text: "салонов красоты используют SPAquatoria", icon: "💎" },
];

// ─── Social proof reviews ────────────────────────
export interface SocialReview {
  name: string;
  dosha: string;
  doshaColor: string;
  product: string;
  rating: number;
  quote: string;
  city: string;
}

export const SOCIAL_REVIEWS: SocialReview[] = [
  { name: "Анна К.", dosha: "Питта", doshaColor: "#FF8B5E", product: "Pearl Endorphin Cream", rating: 5, quote: "Покраснения ушли за 3 недели. Кожа наконец-то спокойная, без реакций на погоду и стресс.", city: "Москва" },
  { name: "Дарья М.", dosha: "Вата", doshaColor: "#7EC8E3", product: "Масло-эликсир Vata Balance", rating: 5, quote: "Муж заметил разницу через две недели. Кожа перестала стягиваться даже в мороз.", city: "Санкт-Петербург" },
  { name: "Елена В.", dosha: "Капха", doshaColor: "#5EBB6E", product: "Тоник Kapha Detox", rating: 4, quote: "Наконец нашла тоник, который не сушит. Поры стали менее заметны за месяц.", city: "Казань" },
  { name: "Марина С.", dosha: "Питта", doshaColor: "#FF8B5E", product: "Сыворотка Endorphin Glow", rating: 5, quote: "Использую 3 месяца. Пигментация заметно посветлела, а текстура стала ровнее.", city: "Краснодар" },
  { name: "Ольга Н.", dosha: "Вата", doshaColor: "#7EC8E3", product: "Крем-суфле Swan Grace", rating: 5, quote: "Зона шеи преобразилась. Подтянулась кожа, ушла дряблость. Как будто -5 лет.", city: "Екатеринбург" },
  { name: "Ирина Л.", dosha: "Капха", doshaColor: "#5EBB6E", product: "Маска Grand Cru Elixir", rating: 5, quote: "Делаю раз в неделю. Кожа после неё как после хорошего SPA — сияет и упругая.", city: "Новосибирск" },
  { name: "Светлана Г.", dosha: "Питта", doshaColor: "#FF8B5E", product: "Pearl Mist тоник", rating: 4, quote: "Приятный, лёгкий, не стягивает. Идеально перед сывороткой. Запах нежный, ненавязчивый.", city: "Нижний Новгород" },
  { name: "Наталья Д.", dosha: "Вата", doshaColor: "#7EC8E3", product: "Grand Cru Eye Cream", rating: 5, quote: "Тёмные круги не исчезли полностью, но кожа вокруг глаз стала заметно более увлажнённой и гладкой.", city: "Ростов-на-Дону" },
  { name: "Юлия П.", dosha: "Капха", doshaColor: "#5EBB6E", product: "Энзимный пилинг", rating: 5, quote: "Мягкий, не раздражает. После него кожа впитывает крем вдвое лучше. Стал частью моего ритуала.", city: "Самара" },
  { name: "Татьяна К.", dosha: "Питта", doshaColor: "#FF8B5E", product: "Масло для тела Pitta Cool", rating: 5, quote: "Использую после душа. Кожа тела стала мягче, менее реактивной. Люблю лёгкую текстуру.", city: "Сочи" },
  { name: "Алина Б.", dosha: "Вата", doshaColor: "#7EC8E3", product: "Набор Утренний ритуал", rating: 5, quote: "Подруга подарила. Теперь каждое утро — мои 7 минут для кожи. Зависимость в хорошем смысле.", city: "Уфа" },
  { name: "Косметолог Ева А.", dosha: "Питта", doshaColor: "#FF8B5E", product: "Линия Pearl Endorphin", rating: 5, quote: "Использую в салоне для чувствительной кожи. Клиенты возвращаются, потому что видят результат.", city: "Москва" },
];

// ─── Quick polls ─────────────────────────────────
export interface QuickPoll {
  id: string;
  question: string;
  options: { id: string; text: string; icon: string; simulatedPct: number }[];
}

export const QUICK_POLLS: QuickPoll[] = [
  { id: "time", question: "Когда ты ухаживаешь за кожей?", options: [
    { id: "morning", text: "Утром", icon: "morning", simulatedPct: 34 },
    { id: "evening", text: "Вечером", icon: "evening", simulatedPct: 48 },
    { id: "both", text: "Оба раза", icon: "both", simulatedPct: 18 },
  ]},
  { id: "priority", question: "Что важнее в уходе?", options: [
    { id: "hydration", text: "Увлажнение", icon: "hydration", simulatedPct: 42 },
    { id: "protection", text: "Защита", icon: "protection", simulatedPct: 31 },
    { id: "anti-age", text: "Anti-age", icon: "anti-age", simulatedPct: 27 },
  ]},
  { id: "texture", question: "Какая текстура тебе ближе?", options: [
    { id: "cream", text: "Крем", icon: "cream", simulatedPct: 38 },
    { id: "gel", text: "Гель", icon: "gel", simulatedPct: 24 },
    { id: "oil", text: "Масло", icon: "oil", simulatedPct: 38 },
  ]},
  { id: "mask", question: "Как часто делаешь маску?", options: [
    { id: "weekly", text: "Каждую неделю", icon: "weekly", simulatedPct: 35 },
    { id: "rare", text: "Иногда", icon: "rare", simulatedPct: 45 },
    { id: "never", text: "Не делаю", icon: "never", simulatedPct: 20 },
  ]},
  { id: "discover", question: "Как ты узнаёшь о новых средствах?", options: [
    { id: "salon", text: "В салоне", icon: "salon", simulatedPct: 41 },
    { id: "friends", text: "Подруги", icon: "friends", simulatedPct: 33 },
    { id: "self", text: "Сама ищу", icon: "self", simulatedPct: 26 },
  ]},
  { id: "feeling", question: "Как твоя кожа сегодня?", options: [
    { id: "great", text: "Отлично", icon: "great", simulatedPct: 28 },
    { id: "ok", text: "Нормально", icon: "ok", simulatedPct: 52 },
    { id: "meh", text: "Не очень", icon: "meh", simulatedPct: 20 },
  ]},
  { id: "season-fav", question: "Любимый сезон для кожи?", options: [
    { id: "spring", text: "Весна", icon: "spring", simulatedPct: 29 },
    { id: "summer", text: "Лето", icon: "summer", simulatedPct: 22 },
    { id: "autumn", text: "Осень", icon: "autumn", simulatedPct: 33 },
    { id: "winter", text: "Зима", icon: "winter", simulatedPct: 16 },
  ]},
  { id: "ritual-time", question: "Сколько времени на уход утром?", options: [
    { id: "5min", text: "До 5 мин", icon: "5min", simulatedPct: 45 },
    { id: "10min", text: "5-10 мин", icon: "10min", simulatedPct: 38 },
    { id: "15plus", text: "15+ мин", icon: "15plus", simulatedPct: 17 },
  ]},
];

// ─── Salon protocols (for dealers) ───────────────
export interface SalonProtocol {
  id: string;
  title: string;
  duration: string;
  line: string;
  difficulty: "basic" | "advanced" | "master";
  steps: string[];
  priceSuggestion: string;
  tip: string;
  doshaFocus: DoshaType | "all";
}

export const SALON_PROTOCOLS: SalonProtocol[] = [
  {
    id: "anti-age-gce", title: "Anti-age facial «Grand Cru»", duration: "45 мин", line: "grand-cru-elixir", difficulty: "advanced", doshaFocus: "pitta",
    steps: ["Демакияж молочком Grand Cru", "Энзимный пилинг (5 мин)", "Массаж лица с сывороткой ресвератрол (15 мин)", "Маска Grand Cru Elixir (15 мин)", "Финиш: крем + крем для глаз"],
    priceSuggestion: "3 500 — 5 000 ₽", tip: "Предложите курс из 6 процедур с интервалом 7-10 дней. Средний чек курса: 25 000 ₽.",
  },
  {
    id: "pitta-balance", title: "Питта-балансирование «Pearl Endorphin»", duration: "50 мин", line: "pearl-endorphin", difficulty: "basic", doshaFocus: "pitta",
    steps: ["Мицеллярное очищение", "Тоник Pearl Mist (компресс, 3 мин)", "Успокаивающая сыворотка Endorphin Glow", "Жемчужная маска (20 мин)", "Финиш: Pearl Endorphin крем"],
    priceSuggestion: "2 800 — 4 000 ₽", tip: "Идеально для клиентов с чувствительной кожей, розацеей. Покажите результат через 3 процедуры.",
  },
  {
    id: "vata-nourish", title: "Вата-питание: масляный ритуал", duration: "60 мин", line: "swan-grace", difficulty: "advanced", doshaFocus: "vata",
    steps: ["Мягкое очищение маслом", "Абхьянга лица с кунжутным маслом (20 мин)", "Тёплый компресс", "Питательная маска-суфле (15 мин)", "Масло-эликсир + крем-баттер"],
    priceSuggestion: "4 000 — 5 500 ₽", tip: "Зимой — самая востребованная процедура. Предложите домой масло-эликсир для поддержания результата.",
  },
  {
    id: "detox-body", title: "Детокс-обёртывание", duration: "40 мин", line: "grand-cru-elixir", difficulty: "basic", doshaFocus: "kapha",
    steps: ["Сухая щётка (гаршана) всего тела (10 мин)", "Глиняная маска на проблемные зоны", "Обёртывание плёнкой (20 мин)", "Лёгкий массаж с лосьоном"],
    priceSuggestion: "2 500 — 3 500 ₽", tip: "Продавайте курсами по 8-10 процедур. Весной спрос максимальный.",
  },
  {
    id: "kapha-tone", title: "Капха-тонус: пробуждение кожи", duration: "35 мин", line: "grand-cru-elixir", difficulty: "basic", doshaFocus: "kapha",
    steps: ["Контрастное умывание", "Стимулирующий тоник с розмарином", "Лёгкий массаж с гелем (10 мин)", "Маска с глиной и имбирём (10 мин)", "Финиш: лёгкий лосьон"],
    priceSuggestion: "2 200 — 3 000 ₽", tip: "Утренняя процедура. Клиенты отмечают эффект пробуждения и свежий цвет лица.",
  },
  {
    id: "swan-neck", title: "«Лебединая шея»: уход за шеей и декольте", duration: "30 мин", line: "swan-grace", difficulty: "master", doshaFocus: "all",
    steps: ["Нежное очищение зоны шеи и декольте", "Пептидная сыворотка Swan Grace", "Лифтинг-массаж (15 мин, техника спирали)", "Маска Swan Grace (10 мин)", "Финиш: крем + масло"],
    priceSuggestion: "3 000 — 4 500 ₽", tip: "Эксклюзив SPAquatoria. Конкурентов на рынке мало. Подчёркивайте уникальность пептидного комплекса.",
  },
  {
    id: "ayur-full", title: "«Аюрведическое омоложение»: комплекс", duration: "90 мин", line: "grand-cru-elixir", difficulty: "master", doshaFocus: "all",
    steps: ["Аюрведическая диагностика доши клиента", "Подбор масла по типу", "Абхьянга лица и шеи (20 мин)", "Широдхара — масло на лоб (15 мин, опционально)", "Маска по доше (15 мин)", "Финиш: полный ритуал по конституции"],
    priceSuggestion: "6 000 — 9 000 ₽", tip: "Premium-процедура. Проводите после обучения аюрведической диагностике. Самый высокий средний чек.",
  },
  {
    id: "express", title: "Экспресс-уход «5 шагов»", duration: "20 мин", line: "pearl-endorphin", difficulty: "basic", doshaFocus: "all",
    steps: ["Мицеллярное очищение", "Тоник по типу", "Экспресс-сыворотка", "Крем по доше", "SPF (утро) или масло (вечер)"],
    priceSuggestion: "1 200 — 1 800 ₽", tip: "Идеально как дополнение к другой услуге. Минимальные затраты времени, клиент пробует продукцию.",
  },
];

// ─── Factory Inventory (simulated) ─────────────────
export interface FactoryStock {
  productId: string;
  stock: number;        // units available
  production: number;   // units/month capacity
  leadTime: number;     // days to ship
  promo: boolean;       // factory promo active
  promoDiscount?: number;
}

export const FACTORY_INVENTORY: FactoryStock[] = [
  { productId: "497", stock: 340, production: 200, leadTime: 3, promo: true, promoDiscount: 10 },
  { productId: "981", stock: 180, production: 150, leadTime: 3, promo: false },
  { productId: "982", stock: 45, production: 120, leadTime: 5, promo: false },
  { productId: "983", stock: 210, production: 180, leadTime: 3, promo: true, promoDiscount: 15 },
  { productId: "984", stock: 95, production: 100, leadTime: 4, promo: false },
  { productId: "985", stock: 520, production: 250, leadTime: 2, promo: false },
  { productId: "986", stock: 12, production: 80, leadTime: 7, promo: false },
  { productId: "987", stock: 160, production: 140, leadTime: 3, promo: false },
  { productId: "988", stock: 280, production: 200, leadTime: 3, promo: true, promoDiscount: 8 },
  { productId: "989", stock: 70, production: 90, leadTime: 5, promo: false },
];

// ─── Smart Dealer Recommendations Engine ───────────
export interface DealerRecommendation {
  type: "restock" | "bundle" | "promo" | "gap" | "seasonal";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  products: string[];     // productIds
  savings?: string;       // estimated savings/revenue
  protocolId?: string;    // linked protocol
  reason: string;         // why this recommendation
}

// Generate smart recommendations based on dealer purchase data + factory stock
export function getDealerRecommendations(
  topProductIds: string[],        // dealer's top purchased products
  dealerDiscount: number,         // dealer's discount %
  avgOrderAmount: number,         // average order in ₽
): DealerRecommendation[] {
  const recs: DealerRecommendation[] = [];
  const inventory = FACTORY_INVENTORY;

  // 1. PROMO ALERTS — factory has active promotions
  inventory.filter(s => s.promo).forEach(s => {
    recs.push({
      type: "promo",
      priority: "high",
      title: `Акция фабрики: −${s.promoDiscount}% доп. скидка`,
      description: `Дополнительная скидка ${s.promoDiscount}% сверх вашей дилерской. Итого: ${dealerDiscount + (s.promoDiscount || 0)}%.`,
      products: [s.productId],
      savings: `${s.promoDiscount}% экономия`,
      reason: "Фабрика проводит акцию — выгодный момент для пополнения",
    });
  });

  // 2. LOW STOCK ALERTS — some products scarce on factory
  inventory.filter(s => s.stock < 50).forEach(s => {
    recs.push({
      type: "restock",
      priority: "high",
      title: "Ограниченный запас на складе",
      description: `Осталось ${s.stock} шт. Срок производства: ${s.leadTime + 14} дней. Рекомендуем заказать сейчас.`,
      products: [s.productId],
      reason: "Низкий запас на фабрике — риск дефицита при следующем заказе",
    });
  });

  // 3. PROTOCOL BUNDLES — suggest product sets for procedures
  const protocolBundles: { protocolId: string; title: string; productIds: string[]; revenue: string }[] = [
    { protocolId: "anti-age", title: "Набор «Anti-age facial»", productIds: ["497", "983", "985"], revenue: "3 500 — 5 000 ₽ с процедуры" },
    { protocolId: "pitta-balance", title: "Набор «Питта-баланс»", productIds: ["981", "988", "987"], revenue: "3 000 — 4 000 ₽ с процедуры" },
    { protocolId: "swan-neck", title: "Набор «Лебединая шея»", productIds: ["982", "984", "989"], revenue: "3 000 — 4 500 ₽ с процедуры" },
    { protocolId: "express", title: "Набор «Экспресс-уход»", productIds: ["985", "988", "981"], revenue: "1 200 — 1 800 ₽ с процедуры" },
  ];

  protocolBundles.forEach(bundle => {
    const missingFromTop = bundle.productIds.filter(id => !topProductIds.includes(id));
    if (missingFromTop.length > 0 && missingFromTop.length < bundle.productIds.length) {
      recs.push({
        type: "bundle",
        priority: "medium",
        title: bundle.title,
        description: `Вы закупаете ${bundle.productIds.length - missingFromTop.length} из ${bundle.productIds.length} продуктов для этого протокола. Добавьте остальные для полного комплекта.`,
        products: missingFromTop,
        protocolId: bundle.protocolId,
        savings: bundle.revenue,
        reason: "Неполный комплект для SPA-протокола — упущенная выручка салонов",
      });
    }
  });

  // 4. GAP ANALYSIS — lines dealer isn't buying
  const boughtLines = new Set(topProductIds);
  const allLines = new Set(inventory.map(s => s.productId));
  const unbought = [...allLines].filter(id => !boughtLines.has(id));
  if (unbought.length > 0) {
    recs.push({
      type: "gap",
      priority: "low",
      title: "Расширьте ассортимент",
      description: `${unbought.length} позиций в каталоге, которые вы ещё не заказывали. Расширение ассортимента увеличивает средний чек салона на 15-25%.`,
      products: unbought.slice(0, 3),
      reason: "Неохваченные позиции каталога — потенциал роста",
    });
  }

  // 5. SEASONAL — season-aligned suggestions
  const season = getCurrentSeason();
  const seasonalMap: Record<string, { products: string[]; tip: string }> = {
    "Грешма": { products: ["981", "988"], tip: "Лето: клиенты ищут увлажнение и защиту от солнца" },
    "Варша": { products: ["985", "987"], tip: "Сезон дождей: фокус на питание и восстановление барьера" },
    "Шарад": { products: ["497", "983"], tip: "Осень: anti-age и детокс после лета" },
    "Хеманта": { products: ["982", "984"], tip: "Ранняя зима: масляные уходы и глубокое питание" },
    "Шишира": { products: ["989", "986"], tip: "Зима: интенсивное восстановление и защита" },
    "Васанта": { products: ["983", "985"], tip: "Весна: обновление, пилинги и тонизирование" },
  };
  const seasonData = seasonalMap[season.name] || seasonalMap["Грешма"];
  recs.push({
    type: "seasonal",
    priority: "medium",
    title: `Сезон «${season.name}»: рекомендации`,
    description: seasonData.tip,
    products: seasonData.products,
    reason: `Аюрведический сезон ${season.name} — скорректируйте закупки под спрос`,
  });

  // Sort: high → medium → low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recs;
}

// ─── Dealer Performance Metrics ────────────────────
export interface DealerInsight {
  icon: string;
  label: string;
  value: string;
  subtext: string;
  color: string;
}

export function getDealerInsights(
  totalPurchases: number,
  ordersCount: number,
  discount: number,
): DealerInsight[] {
  const avgOrder = totalPurchases / ordersCount;
  const monthlyRate = ordersCount / 12;
  const estimatedMargin = discount + 15; // dealer margin approx
  const annualRevenue = totalPurchases;
  const potentialWithFullCatalog = annualRevenue * 1.25;

  return [
    {
      icon: "📊", label: "Эффективность закупок",
      value: avgOrder > 100_000 ? "Высокая" : avgOrder > 60_000 ? "Средняя" : "Низкая",
      subtext: avgOrder > 100_000
        ? "Крупные заказы — оптимальная логистика"
        : "Увеличьте объём заказа для снижения логистических расходов",
      color: avgOrder > 100_000 ? "#34C759" : avgOrder > 60_000 ? "#FF9500" : "#FF3B30",
    },
    {
      icon: "🔄", label: "Регулярность",
      value: `${monthlyRate.toFixed(1)} заказов/мес`,
      subtext: monthlyRate >= 4 ? "Отличная ритмичность" : "Рекомендуем увеличить частоту для стабильного наличия",
      color: monthlyRate >= 4 ? "#34C759" : "#FF9500",
    },
    {
      icon: "💰", label: "Потенциал роста",
      value: `+${((potentialWithFullCatalog - annualRevenue) / 1_000_000).toFixed(1)}M ₽/год`,
      subtext: "При расширении до полного каталога (+25% средний рост)",
      color: "#007AFF",
    },
    {
      icon: "📈", label: "Маржинальность",
      value: `~${estimatedMargin}%`,
      subtext: `Скидка ${discount}% + наценка салона ~15%`,
      color: "#34C759",
    },
  ];
}
