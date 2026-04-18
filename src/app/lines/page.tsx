import Link from "next/link";
import { faceLines } from "@/lib/data";

export default function LinesPage() {
  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-28">
      <p className="eyebrow mb-3">Коллекции</p>
      <h1 className="heading-xl mb-3">Линии для лица</h1>
      <p className="body-lp muted mb-8">Подберите линию по возрасту и задаче кожи</p>

      <div className="paper-card flat" style={{ padding: 0, overflow: "hidden" }}>
        {faceLines.map((line, i) => (
          <Link
            key={line.id}
            href={`/lines/${line.id}`}
            className="flex items-center justify-between px-5 py-4 tap"
            style={i > 0 ? { borderTop: "1px solid var(--lp-line)" } : undefined}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="w-11 h-11 flex items-center justify-center shrink-0"
                style={{ backgroundColor: `#${line.color}15`, borderRadius: "50%" }}
              >
                <span className="numeric-lp text-[12px]" style={{ color: `#${line.color}`, letterSpacing: "0.04em" }}>
                  {line.ageRange}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-medium" style={{ color: `#${line.color}`, letterSpacing: "0.02em" }}>
                  {line.name}
                </p>
                <p className="text-[12px] line-clamp-1 mt-0.5" style={{ color: "var(--lp-muted)" }}>{line.tagline}</p>
              </div>
            </div>
            <svg className="w-3.5 h-3.5 shrink-0 ml-2" style={{ color: "var(--lp-tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
