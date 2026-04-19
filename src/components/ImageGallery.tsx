"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface GalleryImage {
  url: string;
  isMain: boolean;
}

interface Props {
  images: GalleryImage[];
  alt: string;
}

export function ImageGallery({ images, alt }: Props) {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const idx = Math.round(scrollLeft / clientWidth);
    setCurrent(idx);
  }, []);

  if (images.length === 0) {
    return (
      <div className="aspect-square overflow-hidden relative" style={{ borderRadius: "8px", background: "var(--lp-soft)" }}>
        <div className="w-full h-full flex items-center justify-center bg-fill">
          <span className="font-brand text-5xl text-fg-tertiary">S</span>
        </div>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="aspect-square overflow-hidden relative" style={{ borderRadius: "8px", background: "var(--lp-soft)" }}>
        <Image src={images[0].url} alt={alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover product-img" priority />
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar"
        style={{ borderRadius: "8px" }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="aspect-square w-full shrink-0 snap-center relative"
            style={{ background: "var(--lp-soft)" }}
          >
            <Image
              src={img.url}
              alt={`${alt} — фото ${i + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover product-img"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              scrollRef.current?.scrollTo({ left: i * (scrollRef.current?.clientWidth || 0), behavior: "smooth" });
            }}
            className="tap"
          >
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 16 : 6,
                height: 6,
                background: i === current ? "var(--lp-accent)" : "var(--lp-line)",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
