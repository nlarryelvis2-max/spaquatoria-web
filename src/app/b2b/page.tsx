"use client";

import { useState } from "react";
import Link from "next/link";

export default function B2BPage() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    city: "",
    type: "salon",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("B2B form:", formData);
    setSubmitted(true);
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-28">
      <div className="relative -mx-5 mb-8 overflow-hidden" style={{ borderRadius: "0 0 28px 28px" }}>
        <img src="/brand/team/about-main.jpg" alt=""
          className="w-full h-[200px] object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--lp-bg) 0%, transparent 50%)" }} />
      </div>

      <p className="eyebrow mb-3">Сотрудничество</p>
      <h1 className="heading-xl mb-3">Партнёрам</h1>
      <p className="body-lp muted mb-8">
        Станьте дилером SPAquatoria — профессиональная аюрведическая косметика
      </p>

      {/* Benefits */}
      <div className="mb-8">
        <p className="eyebrow mb-3">Преимущества</p>
        <div className="glass-card overflow-hidden">
          {[
            { title: "Уникальная ниша", desc: "Единственный российский бренд SPA-косметики с аюрведической диагностикой" },
            { title: "Высокая маржа", desc: "Оптовые цены от 40% ниже розницы. Повторные покупки 70%+" },
            { title: "Полная поддержка", desc: "Обучение персонала, POS-материалы, персональный менеджер" },
          ].map((b, i) => (
            <div key={b.title} className="px-4 py-3.5"
              style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}
            >
              <p className="text-[15px] font-semibold mb-0.5">{b.title}</p>
              <p className="text-[13px] text-fg-secondary leading-snug">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mb-8">
        <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-3">Этапы сотрудничества</p>
        <div className="glass-card overflow-hidden">
          {[
            { step: "1", title: "Заявка", desc: "Заполните форму — менеджер свяжется в течение 24 часов" },
            { step: "2", title: "Презентация", desc: "Покажем ассортимент, обсудим условия" },
            { step: "3", title: "Договор", desc: "Мин. заказ от 30 000 ₽. Доставка бесплатно от 50 000 ₽" },
            { step: "4", title: "Обучение", desc: "Бесплатный тренинг: техники, аюрведическая диагностика" },
            { step: "5", title: "Рост", desc: "Акции, новинки, маркетинг. Бонусная система за объём" },
          ].map((s, i) => (
            <div key={s.step} className="flex items-start gap-3 px-4 py-3.5"
              style={i > 0 ? { borderTop: "0.5px solid var(--separator)" } : undefined}
            >
              <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                {s.step}
              </span>
              <div>
                <p className="text-[15px] font-semibold mb-0.5">{s.title}</p>
                <p className="text-[13px] text-fg-secondary leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formats */}
      <div className="mb-8">
        <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-3">Кто работает с нами</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "SPA-центры", img: "/brand/hero/massage.jpg" },
            { label: "Салоны красоты", img: "/brand/hero/face-care.jpg" },
            { label: "Магазины косметики", img: "/brand/hero/body-care.jpg" },
            { label: "Маркетплейсы", img: "/brand/hero/subscribe-bg.png" },
          ].map(f => (
            <div key={f.label} className="glass-card py-3 text-center overflow-hidden">
              <img src={f.img} alt="" className="w-full h-[60px] object-cover rounded-lg mb-2 px-3" />
              <p className="text-[15px] font-medium">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contacts */}
      <div className="mb-8">
        <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-3">Контакты</p>
        <div className="glass-card overflow-hidden">
          <div className="px-4 py-3.5">
            <p className="text-[13px] text-fg-secondary">Email для партнёров</p>
            <a href="mailto:b2b@spaquatoria.ru" className="text-[15px] text-brand font-medium">b2b@spaquatoria.ru</a>
          </div>
          <div className="px-4 py-3.5" style={{ borderTop: "0.5px solid var(--separator)" }}>
            <p className="text-[13px] text-fg-secondary">Отдел продаж</p>
            <a href="tel:+74957733099" className="text-[15px] text-brand font-medium">+7 (495) 773-30-99</a>
          </div>
          <div className="px-4 py-3.5" style={{ borderTop: "0.5px solid var(--separator)" }}>
            <p className="text-[13px] text-fg-secondary">Время работы</p>
            <p className="text-[15px]">Пн-Пт, 9:00 — 18:00 (МСК)</p>
          </div>
          <Link href="/dealers" className="flex items-center justify-between px-4 py-3.5 tap"
            style={{ borderTop: "0.5px solid var(--separator)" }}
          >
            <p className="text-[15px] text-brand font-medium">Список дилеров</p>
            <svg className="w-4 h-4 text-fg-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="glass-card p-5">
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-[17px] font-semibold mb-1">Заявка отправлена</h3>
            <p className="text-[13px] text-fg-secondary">Менеджер свяжется в течение 24 часов</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-1">Заявка на сотрудничество</p>

            <div className="grid grid-cols-2 gap-2">
              <input required type="text" placeholder="Имя *"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="px-4 py-2.5 bg-fill rounded-2xl text-[15px] outline-none" />
              <input required type="text" placeholder="Компания *"
                value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}
                className="px-4 py-2.5 bg-fill rounded-2xl text-[15px] outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input required type="email" placeholder="Email *"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className="px-4 py-2.5 bg-fill rounded-2xl text-[15px] outline-none" />
              <input type="tel" placeholder="Телефон"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                className="px-4 py-2.5 bg-fill rounded-2xl text-[15px] outline-none" />
            </div>

            <input type="text" placeholder="Город"
              value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
              className="w-full px-4 py-2.5 bg-fill rounded-2xl text-[15px] outline-none" />

            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
              className="w-full px-4 py-2.5 bg-fill rounded-2xl text-[15px] outline-none cursor-pointer text-fg-secondary">
              <option value="salon">SPA-центр / Салон красоты</option>
              <option value="shop">Магазин косметики</option>
              <option value="marketplace">Маркетплейс</option>
              <option value="distributor">Дистрибьютор</option>
              <option value="other">Другое</option>
            </select>

            <textarea placeholder="Комментарий" rows={3}
              value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
              className="w-full px-4 py-2.5 bg-fill rounded-2xl text-[15px] outline-none resize-none" />

            <button type="submit"
              className="w-full bg-brand text-white py-3 rounded-full text-[15px] font-semibold tap">
              Отправить заявку
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
