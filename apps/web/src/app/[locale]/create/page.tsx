// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/[locale]/create/page.tsx

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { RecipeForm } from "@/components/recipe/recipe-form";

export default async function CreateRecipePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const t = await getTranslations("recipe");

  return (
    <div>
      <title>{t("createTitle")}</title>
      <RecipeForm />
    </div>
  );
}
