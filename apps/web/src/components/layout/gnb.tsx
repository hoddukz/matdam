// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/layout/gnb.tsx

"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, Plus, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
export function GNB() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [myActivityOpen, setMyActivityOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    // Seed initial user state immediately to prevent flash of Sign In button
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabaseRef.current.auth.signOut();
    window.location.href = `/${locale}`;
  }

  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <svg
            viewBox="0 -960 960 960"
            className="h-7 w-7 text-matdam-gold"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M390-80q-101 0-177.5-67.5T120-315q-2-18 10-31.5t30-13.5h421l44-414q5-45 38.5-75.5T744-880q50 0 85 35t35 85v10q0 17-11.5 28.5T824-710q-17 0-28.5-11.5T784-750v-10q0-17-11.5-28.5T744-800q-16 0-27 10.5T704-764l-46 435q-11 106-87 177.5T390-80Zm0-80q59 0 106-33t68-87H213q23 54 70.5 87T390-160Zm0-120Z" />
            <path d="M247-420q-17 0-24-9.5t-5-25.5q1-9 1.5-14.5t.5-10.5q0-30-20-76t-20-69q0-9 1-18.5t6-18.5q4-8 11-13t15-5q16 0 24.5 9.5T242-645q-2 9-2 20 0 23 20 69t20 76q0 15-2 25t-5 17q-4 8-11 13t-15 5Z" />
            <path d="M377-420q-17 0-24-9.5t-5-25.5q1-9 1.5-14.5t.5-10.5q0-30-20-76t-20-69q0-9 1-18.5t6-18.5q4-8 11-13t15-5q16 0 24.5 9.5T372-645q-2 9-2 20 0 23 20 69t20 76q0 15-2 25t-5 17q-4 8-11 13t-15 5Z" />
            <path d="M507-420q-17 0-24-9.5t-5-25.5q1-9 1.5-14.5t.5-10.5q0-30-20-76t-20-69q0-9 1-18.5t6-18.5q4-8 11-13t15-5q16 0 24.5 9.5T502-645q-2 9-2 20 0 23 20 69t20 76q0 15-2 25t-5 17q-4 8-11 13t-15 5Z" />
          </svg>
          <span className="font-heading-ko text-xl font-bold text-matdam-dark">맛담</span>
          <span className="hidden font-body-en text-sm text-matdam-brown sm:inline">MatDam</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href={`/${locale}/explore`}
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {t("explore")}
          </Link>
          <Link
            href={`/${locale}/glossary`}
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {t("glossary")}
          </Link>
          <Link
            href={`/${locale}/fridge`}
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {t("fridge")}
          </Link>
          <Link
            href={`/${locale}/news`}
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {t("news")}
          </Link>
          <Button asChild size="sm" className="gap-1">
            <Link href={`/${locale}/create`}>
              <Plus className="h-4 w-4" />
              {t("create")}
            </Link>
          </Button>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-matdam-gold text-white">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/profile`}>{t("profile")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/profile?tab=bookmarks`}>{t("bookmarks")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/shopping-list`}>{t("shoppingList")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/settings`}>{t("settings")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>{t("signOut")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${locale}/login`}>{t("signIn")}</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </nav>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {/* 탐색 그룹 */}
            <Link
              href={`/${locale}/explore`}
              className="text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {t("explore")}
            </Link>
            <Link
              href={`/${locale}/glossary`}
              className="text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {t("glossary")}
            </Link>
            <Link
              href={`/${locale}/fridge`}
              className="text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {t("fridge")}
            </Link>
            <Link
              href={`/${locale}/news`}
              className="text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {t("news")}
            </Link>

            <div className="border-t border-border" />

            {isLoggedIn ? (
              <>
                {/* 내 활동 아코디언 */}
                <button
                  type="button"
                  className="flex items-center justify-between text-sm font-medium"
                  onClick={() => setMyActivityOpen(!myActivityOpen)}
                >
                  {t("myActivity")}
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${myActivityOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {myActivityOpen && (
                  <div className="flex flex-col gap-3 pl-3">
                    <Link
                      href={`/${locale}/create`}
                      className="text-sm font-medium text-foreground/80"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t("create")}
                    </Link>
                    <Link
                      href={`/${locale}/profile`}
                      className="text-sm font-medium text-foreground/80"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t("profile")}
                    </Link>
                    <Link
                      href={`/${locale}/profile?tab=bookmarks`}
                      className="text-sm font-medium text-foreground/80"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t("bookmarks")}
                    </Link>
                    <Link
                      href={`/${locale}/shopping-list`}
                      className="text-sm font-medium text-foreground/80"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t("shoppingList")}
                    </Link>
                    <Link
                      href={`/${locale}/settings`}
                      className="text-sm font-medium text-foreground/80"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t("settings")}
                    </Link>
                  </div>
                )}

                <div className="border-t border-border" />

                <button
                  className="text-left text-sm font-medium text-destructive"
                  onClick={handleSignOut}
                >
                  {t("signOut")}
                </button>
              </>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="text-sm font-medium text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {t("signIn")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
