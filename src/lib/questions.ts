export interface DoshaAnswer {
  id: number;
  text: string;
  vataWeight: number;
  pittaWeight: number;
  kaphaWeight: number;
}

export interface DoshaQuestion {
  id: number;
  text: string;
  answers: DoshaAnswer[];
  category: string;
  weight: number;
}

export const questions: DoshaQuestion[] = [
  { id: 1, text: "Какой у вас тип кожи?", category: "Кожа", weight: 1.5, answers: [
    { id: 1, text: "Сухая, тонкая, шелушится", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 2, text: "Чувствительная, краснеет, воспаляется", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 3, text: "Жирная, плотная, поры расширены", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
  { id: 2, text: "Что беспокоит вашу кожу больше всего?", category: "Кожа", weight: 1.5, answers: [
    { id: 4, text: "Стянутость и обезвоженность", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 5, text: "Покраснения и раздражение", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 6, text: "Тусклость и отёчность", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
  { id: 3, text: "Как ваша кожа реагирует на холод?", category: "Кожа", weight: 1.5, answers: [
    { id: 7, text: "Сразу сохнет и трескается", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 8, text: "Появляются покраснения и купероз", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 9, text: "Практически не реагирует", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
  { id: 4, text: "Какие ароматы вам ближе?", category: "Предпочтения", weight: 1.0, answers: [
    { id: 10, text: "Тёплые, сладкие (ваниль, сандал)", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 11, text: "Свежие, цветочные (роза, лаванда)", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 12, text: "Пряные, бодрящие (имбирь, цитрус)", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
  { id: 5, text: "Какой уход вам нравится больше?", category: "Предпочтения", weight: 1.0, answers: [
    { id: 13, text: "Масла, баттеры — всё питательное", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 14, text: "Лёгкие кремы, гели, сыворотки", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 15, text: "Скрабы, пилинги, детокс-маски", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
  { id: 6, text: "Ваше телосложение?", category: "Конституция", weight: 1.0, answers: [
    { id: 16, text: "Стройное, лёгкое, узкие кости", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 17, text: "Среднее, пропорциональное", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 18, text: "Крупное, плотное, широкая кость", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
  { id: 7, text: "Как вы переносите температуру?", category: "Конституция", weight: 1.0, answers: [
    { id: 19, text: "Мёрзну, люблю тепло", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 20, text: "Плохо переношу жару", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 21, text: "Не люблю влажность и сырость", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
  { id: 8, text: "Ваше пищеварение?", category: "Конституция", weight: 1.0, answers: [
    { id: 22, text: "Нерегулярное, бывают вздутия", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 23, text: "Сильное, быстрое, не пропускаю приёмы", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 24, text: "Медленное, стабильное", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
  { id: 9, text: "Как вы реагируете на стресс?", category: "Образ жизни", weight: 1.0, answers: [
    { id: 25, text: "Тревога, беспокойство, суетливость", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 26, text: "Раздражение, гнев, нетерпение", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 27, text: "Замкнутость, нежелание действовать", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
  { id: 10, text: "Какой у вас сон?", category: "Образ жизни", weight: 1.0, answers: [
    { id: 28, text: "Лёгкий, часто просыпаюсь", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 29, text: "Умеренный, яркие сны", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 30, text: "Глубокий, тяжело просыпаюсь", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
  { id: 11, text: "Ваш уровень энергии в течение дня?", category: "Образ жизни", weight: 1.0, answers: [
    { id: 31, text: "Вспышками, быстро устаю", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 32, text: "Высокий, целенаправленный", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 33, text: "Стабильный, медленно раскачиваюсь", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
  { id: 12, text: "В какое время года кожа чувствует себя хуже?", category: "Сезонность", weight: 1.5, answers: [
    { id: 34, text: "Зимой — сухость, шелушение от ветра", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 35, text: "Летом — раздражение от солнца и жары", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 36, text: "Весной/осенью — тусклость от влажности", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
];

// A4: Vikriti — current state assessment (5 questions)
export const vikritiQuestions: DoshaQuestion[] = [
  { id: 101, text: "Как ваша кожа чувствует себя прямо сейчас?", category: "Текущее", weight: 1.5, answers: [
    { id: 101, text: "Сухая, стянутая, шелушится", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 102, text: "Раздражённая, красная, горячая", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 103, text: "Жирная, тяжёлая, забитые поры", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
  { id: 102, text: "Ваше эмоциональное состояние последнюю неделю?", category: "Текущее", weight: 1.0, answers: [
    { id: 104, text: "Тревожность, беспокойство, рассеянность", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 105, text: "Раздражительность, нетерпение, перфекционизм", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 106, text: "Апатия, лень, тяжесть на душе", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
  { id: 103, text: "Как вы спали последние несколько ночей?", category: "Текущее", weight: 1.0, answers: [
    { id: 107, text: "Плохо: бессонница, тревожные мысли", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 108, text: "Нормально, но с яркими снами", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 109, text: "Крепко, но трудно проснуться", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
  { id: 104, text: "Ваше пищеварение в последние дни?", category: "Текущее", weight: 1.0, answers: [
    { id: 110, text: "Газы, вздутие, нерегулярный стул", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 111, text: "Изжога, чувство жара после еды", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 112, text: "Тяжесть, медленное переваривание", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
  { id: 105, text: "Ваш уровень энергии сегодня?", category: "Текущее", weight: 1.0, answers: [
    { id: 113, text: "Скачет: то бодрость, то упадок", vataWeight: 1, pittaWeight: 0, kaphaWeight: 0 },
    { id: 114, text: "Высокий, но легко перегорю", vataWeight: 0, pittaWeight: 1, kaphaWeight: 0 },
    { id: 115, text: "Низкий, тяжело начать", vataWeight: 0, pittaWeight: 0, kaphaWeight: 1 },
  ]},
];
