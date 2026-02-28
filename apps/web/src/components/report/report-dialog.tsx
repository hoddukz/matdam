// Tag: core
// Path: apps/web/src/components/report/report-dialog.tsx

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Flag } from "lucide-react";

type ReportReason = "inappropriate" | "spam" | "copyright" | "other";

interface ReportDialogProps {
  targetType: "recipe" | "comment" | "user";
  targetId: string;
  isLoggedIn: boolean;
  hasReported: boolean;
}

export function ReportDialog({ targetType, targetId, isLoggedIn, hasReported }: ReportDialogProps) {
  const t = useTranslations("report");
  const locale = useLocale();
  const router = useRouter();
  const supabaseRef = useRef(createClient());

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(hasReported);

  function handleOpen(isOpen: boolean) {
    if (isOpen && !isLoggedIn) {
      router.push(`/${locale}/login`);
      return;
    }
    setOpen(isOpen);
  }

  async function handleSubmit() {
    if (!reason) return;
    if (reason === "other" && !description.trim()) return;

    setSubmitting(true);
    try {
      const supabase = supabaseRef.current;
      const { error } = await supabase.from("reports").insert({
        reporter_id: (await supabase.auth.getUser()).data.user!.id,
        target_type: targetType,
        target_id: targetId,
        reason,
        description: description.trim() || null,
      });

      if (error) {
        // 23505 = unique_violation (중복 신고)
        if (error.code === "23505") {
          setSubmitted(true);
          setOpen(false);
          return;
        }
        throw error;
      }

      setSubmitted(true);
      setOpen(false);
    } catch {
      // silent fail — user sees no change
    } finally {
      setSubmitting(false);
    }
  }

  // 이미 신고한 경우 비활성 배지
  if (submitted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1 border-destructive/30 text-destructive/60"
        disabled
      >
        <Flag className="h-4 w-4" />
        {t("reported")}
      </Button>
    );
  }

  const reasons: ReportReason[] = ["inappropriate", "spam", "copyright", "other"];

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 border-destructive/40 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
        >
          <Flag className="h-4 w-4" />
          {t("report")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <RadioGroup
            value={reason}
            onValueChange={(v) => setReason(v as ReportReason)}
            className="space-y-2"
          >
            {reasons.map((r) => (
              <div key={r} className="flex items-center space-x-2">
                <RadioGroupItem value={r} id={`reason-${r}`} />
                <Label htmlFor={`reason-${r}`} className="cursor-pointer text-sm">
                  {t(`reason_${r}`)}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="space-y-1.5">
            <Label className="text-sm">
              {t("detailLabel")}
              {reason === "other" && <span className="text-destructive"> *</span>}
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("detailPlaceholder")}
              className="min-h-[80px] resize-none"
              maxLength={1000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!reason || (reason === "other" && !description.trim()) || submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? t("submitting") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
