import Link from "next/link";

export function Footer() {
  return (
    <footer className="hidden md:block mt-auto glass" style={{ borderTop: "none" }}>
      <div className="max-w-lg mx-auto px-5 py-10">
        <div className="flex items-start justify-between gap-8">
          <div className="max-w-xs">
            <p className="font-brand text-brand tracking-[2px] mb-2">SPAQUATORIA</p>
            <p className="text-[12px] text-fg-secondary leading-relaxed">
              Живая косметика на основе аюрведической диагностики. 98,9% натуральных компонентов. НПО «Техкон» с 1989 г.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-3">Покупателям</p>
              <div className="flex flex-col gap-2 text-[13px]">
                <Link href="/test" className="text-fg-secondary hover:text-brand transition-colors">Доша-тест</Link>
                <Link href="/catalog" className="text-fg-secondary hover:text-brand transition-colors">Каталог</Link>
                <Link href="/lines" className="text-fg-secondary hover:text-brand transition-colors">Линии</Link>
                <Link href="/routine" className="text-fg-secondary hover:text-brand transition-colors">Ритуал</Link>
              </div>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-fg-secondary uppercase tracking-wide mb-3">Компания</p>
              <div className="flex flex-col gap-2 text-[13px]">
                <Link href="/about" className="text-fg-secondary hover:text-brand transition-colors">О бренде</Link>
                <Link href="/ingredients" className="text-fg-secondary hover:text-brand transition-colors">Ингредиенты</Link>
                <Link href="/dealers" className="text-fg-secondary hover:text-brand transition-colors">Дилеры</Link>
                <Link href="/b2b" className="text-fg-secondary hover:text-brand transition-colors">Партнёрам</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 flex items-center justify-between text-[11px] text-fg-tertiary" style={{ borderTop: "0.5px solid var(--separator)" }}>
          <span>&copy; {new Date().getFullYear()} SPAquatoria</span>
          <a href="https://spaquatoria.ru" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">
            spaquatoria.ru
          </a>
        </div>
      </div>
    </footer>
  );
}
