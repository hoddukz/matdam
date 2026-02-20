// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/home/essential-ingredients-section.tsx

import Link from "next/link";

type IngredientItem = {
  name: string;
  koreanName: string;
  description: string;
  slug: string;
  emoji: string;
};

type EssentialIngredientsSectionProps = {
  locale: string;
  items: IngredientItem[];
  t: {
    essentialIngredients: string;
    exploreFullGlossary: string;
  };
};

export function EssentialIngredientsSection({
  locale,
  items,
  t,
}: EssentialIngredientsSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-heading-ko text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t.essentialIngredients}
        </h2>
        <Link
          href={`/${locale}/glossary`}
          className="text-sm font-medium text-matdam-gold hover:underline"
        >
          {t.exploreFullGlossary} &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/${locale}/glossary#${item.slug}`}
            className="flex flex-col items-center rounded-xl border border-border p-4 text-center transition-colors hover:bg-accent"
          >
            <span className="text-4xl">{item.emoji}</span>
            <p className="mt-2 text-sm font-semibold text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.koreanName}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
