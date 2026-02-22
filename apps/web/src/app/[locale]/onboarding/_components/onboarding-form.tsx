// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/[locale]/onboarding/_components/onboarding-form.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface OnboardingFormProps {
  defaultDisplayName: string;
}

export function OnboardingForm({ defaultDisplayName }: OnboardingFormProps) {
  const supabaseRef = useRef(createClient());
  const t = useTranslations("onboarding");
  const router = useRouter();

  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = displayName.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      setError("2~30자로 입력해주세요.");
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabaseRef.current.auth.getUser();

    if (!user) {
      setSubmitting(false);
      return;
    }

    const { error: updateError } = await supabaseRef.current
      .from("users")
      .update({
        display_name: trimmed,
        preferences: { onboarding_complete: true },
      })
      .eq("user_id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">{t("displayNameLabel")}</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={t("displayNamePlaceholder")}
          minLength={2}
          maxLength={30}
          required
          autoFocus
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
