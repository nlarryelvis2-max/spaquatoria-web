import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-5 py-20 text-center">
      <p className="font-brand text-[64px] text-brand mb-4">404</p>
      <h1 className="text-[22px] font-bold text-fg mb-2">Страница не найдена</h1>
      <p className="text-[15px] text-fg-secondary mb-8">
        Возможно, она была перемещена или удалена
      </p>
      <div className="flex gap-3 justify-center">
        <Link href="/" className="btn-lp">На главную</Link>
        <Link href="/catalog" className="btn-lp ghost">В каталог</Link>
      </div>
    </div>
  );
}
