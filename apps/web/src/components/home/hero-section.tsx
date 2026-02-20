// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/home/hero-section.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

type HeroSectionProps = {
  locale: string;
  t: {
    heroTagline: string;
    heroTitle: string;
    heroTitleAccent: string;
    heroDescription: string;
    exploreRecipes: string;
    createRecipe: string;
  };
};

export function HeroSection({ locale, t }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-matdam-dark">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-matdam-dark/90 via-matdam-dark/70 to-matdam-dark" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <span className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-matdam-gold">
          {t.heroTagline}
        </span>

        <h1 className="max-w-3xl font-heading-ko text-4xl font-bold leading-tight text-matdam-cream sm:text-5xl lg:text-6xl">
          {t.heroTitle}
          <br />
          <em className="not-italic text-matdam-gold">{t.heroTitleAccent}</em>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-matdam-cream/80 sm:text-lg">
          {t.heroDescription}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-matdam-gold px-8 font-semibold text-matdam-dark hover:bg-matdam-gold/90"
          >
            <Link href={`/${locale}/explore`}>{t.exploreRecipes}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full border-matdam-cream/40 px-8 text-matdam-cream hover:bg-matdam-cream/10 hover:text-matdam-cream"
          >
            <Link href={`/${locale}/create`}>{t.createRecipe}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
