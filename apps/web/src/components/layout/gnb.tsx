// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/layout/gnb.tsx

"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
export function GNB() {
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
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
    window.location.href = "/";
  }

  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-matdam-gold shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-matdam-dark"
              aria-hidden="true"
            >
              <path
                d="M5 12.5C5 8.36 8.36 5 12.5 5H16V7H12.5C9.46 7 7 9.46 7 12.5S9.46 18 12.5 18H13V20H12.5C8.36 20 5 16.64 5 12.5Z"
                fill="currentColor"
              />
              <path
                d="M16 3C16 3 16 7 16 8C16 9.1 16.9 10 18 10H20V12H18C15.79 12 14 10.21 14 8V3H16Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="font-heading-ko text-xl font-bold text-matdam-dark">맛담</span>
          <span className="hidden font-body-en text-sm text-matdam-brown sm:inline">MatDam</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/explore"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {t("explore")}
          </Link>
          <Link
            href="/glossary"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {t("glossary")}
          </Link>
          <Button asChild size="sm" className="gap-1">
            <Link href="/create">
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
                      {user?.email?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">{t("profile")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile?tab=bookmarks">{t("bookmarks")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">{t("settings")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>{t("signOut")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">{t("signIn")}</Link>
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
            <Link
              href="/explore"
              className="text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {t("explore")}
            </Link>
            <Link
              href="/glossary"
              className="text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {t("glossary")}
            </Link>
            <Link
              href="/create"
              className="text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {t("create")}
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="text-sm font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("profile")}
                </Link>
                <button
                  className="text-left text-sm font-medium text-destructive"
                  onClick={handleSignOut}
                >
                  {t("signOut")}
                </button>
              </>
            ) : (
              <Link
                href="/login"
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
