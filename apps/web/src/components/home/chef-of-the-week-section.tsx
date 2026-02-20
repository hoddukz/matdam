// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/home/chef-of-the-week-section.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

type ChefOfTheWeekSectionProps = {
  locale: string;
  name: string;
  description: string;
  avatarUrl: string;
  stats: {
    remixes: number;
    followers: number;
    location: string;
  };
  popularRemix: {
    title: string;
    description: string;
    slug: string;
  };
  t: {
    chefOfTheWeek: string;
    mostPopularRemix: string;
    remixes: string;
    followers: string;
    viewProfile: string;
  };
};

export function ChefOfTheWeekSection({
  locale,
  name,
  description,
  avatarUrl,
  stats,
  popularRemix,
  t,
}: ChefOfTheWeekSectionProps) {
  return (
    <section className="bg-matdam-cream">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Avatar / Image */}
          <div className="relative overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            <div className="absolute left-4 top-4">
              <span className="rounded-md bg-red-600 px-3 py-1 text-xs font-bold uppercase text-white">
                {t.chefOfTheWeek}
              </span>
            </div>
          </div>

          {/* Profile Info */}
          <div>
            <h2 className="font-heading-ko text-3xl font-bold text-foreground">{name}</h2>
            <p className="mt-2 text-muted-foreground">{description}</p>

            <div className="mt-6 flex gap-8">
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.remixes}</p>
                <p className="text-sm text-muted-foreground">{t.remixes}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.followers.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">{t.followers}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.location}</p>
              </div>
            </div>

            {/* Popular Remix */}
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.mostPopularRemix}
              </p>
              <Link
                href={`/${locale}/recipe/${popularRemix.slug}`}
                className="mt-3 block rounded-lg border border-border p-4 transition-colors hover:bg-accent"
              >
                <p className="font-semibold text-foreground">{popularRemix.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{popularRemix.description}</p>
              </Link>
            </div>

            <Button variant="outline" className="mt-6 rounded-full" asChild>
              <Link href={`/${locale}/profile`}>{t.viewProfile}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
