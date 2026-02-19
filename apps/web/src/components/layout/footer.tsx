// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/layout/footer.tsx

import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-matdam-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <span className="font-heading-ko text-lg font-bold text-matdam-dark">맛담</span>
            <p className="mt-2 text-sm text-matdam-brown">{t("tagline")}</p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Navigate</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/explore"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t("explore")}
                </Link>
              </li>
              <li>
                <Link
                  href="/glossary"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t("glossary")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                  {t("terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {year} {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
