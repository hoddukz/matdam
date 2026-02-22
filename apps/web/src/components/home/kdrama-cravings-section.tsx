// Tag: temp (대기 컴포넌트 — 기능 활성화 시 core로 변경)
// Path: apps/web/src/components/home/kdrama-cravings-section.tsx

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

type KDramaItem = {
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
  drama: string;
  cookTime: string;
  tags: string[];
};

type KDramaCravingsSectionProps = {
  locale: string;
  items: KDramaItem[];
  t: {
    kdramaTitle: string;
    kdramaTagline: string;
    kdramaDescription: string;
  };
};

export function KDramaCravingsSection({ locale, items, t }: KDramaCravingsSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {t.kdramaTagline}
        </span>
        <h2 className="mt-2 font-heading-ko text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t.kdramaTitle}
        </h2>
        <p className="mt-2 text-muted-foreground">{t.kdramaDescription}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link key={item.slug} href={`/${locale}/recipe/${item.slug}`}>
            <Card className="group overflow-hidden transition-shadow hover:shadow-md">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-xs text-white/80">{item.drama}</p>
                  <p className="text-lg font-bold text-white">{item.title}</p>
                </div>
              </div>
              <CardContent className="flex items-center gap-3 p-4 text-xs text-muted-foreground">
                <span>{item.cookTime}</span>
                {item.tags.map((tag) => (
                  <span key={tag}>&middot; {tag}</span>
                ))}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
