"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCartCount } from "@/lib/cart";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function update() {
      setCartCount(getCartCount());
    }
    update();
    window.addEventListener("cart-updated", update);
    return () => window.removeEventListener("cart-updated", update);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass" : "bg-transparent"
      }`}
    >
      <div className="max-w-lg mx-auto px-5 h-12 flex items-center justify-between">
        <Link href="/" className="font-brand text-[17px] tracking-[3px] text-brand">
          SPAQUATORIA
        </Link>
        <Link href="/cart" className="relative tap p-1">
          <svg className="w-[22px] h-[22px] text-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-1 min-w-[18px] h-[18px] bg-brand-coral text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
