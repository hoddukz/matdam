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

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-5 py-16 text-center sm:px-6 sm:py-24 md:py-32 lg:px-8 lg:py-40">
        <span className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-matdam-gold sm:mb-6 sm:text-xs">
          {t.heroTagline}
        </span>

        <h1 className="max-w-3xl font-heading-ko text-3xl font-bold leading-tight text-matdam-cream sm:text-4xl md:text-5xl lg:text-6xl">
          {t.heroTitle}
          <br />
          <em className="not-italic text-matdam-gold">{t.heroTitleAccent}</em>
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-matdam-cream/80 sm:mt-6 sm:text-base md:text-lg">
          {t.heroDescription}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
          <Button
            asChild
            size="lg"
            className="w-full rounded-full bg-matdam-gold px-8 font-semibold text-matdam-dark hover:bg-matdam-gold/90 sm:w-auto"
          >
            <Link href={`/${locale}/explore`}>{t.exploreRecipes}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full rounded-full border-2 border-matdam-cream px-8 text-matdam-cream hover:bg-matdam-cream/10 hover:text-matdam-cream sm:w-auto"
          >
            <Link href={`/${locale}/create`}>{t.createRecipe}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
