"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/client";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/i18n/config";
import { setLocale } from "@/i18n/actions";

/** Sélecteur FR / EN compact (en-tête, page de connexion). */
export function LanguageSwitcher({ className }: { className?: string }) {
    const router = useRouter();
    const { locale, t } = useI18n();
    const [isPending, startTransition] = useTransition();

    function change(next: Locale) {
        if (next === locale) {
            return;
        }

        startTransition(async () => {
            await setLocale(next);
            router.refresh();
        });
    }

    return (
        <div
            role="group"
            aria-label={t.common.language.change}
            className={cn(
                "flex h-10 items-center gap-0.5 rounded-full border border-border bg-card p-1 shadow-sm",
                className
            )}
        >
            {isPending ? (
                <Loader2 aria-hidden className="mx-1 h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
                <Languages aria-hidden className="mx-1 h-4 w-4 text-muted-foreground" />
            )}

            {LOCALES.map((option) => (
                <button
                    key={option}
                    type="button"
                    lang={option}
                    title={LOCALE_LABELS[option]}
                    aria-pressed={option === locale}
                    disabled={isPending}
                    onClick={() => change(option)}
                    className={cn(
                        "h-7 rounded-full px-2.5 text-xs font-semibold uppercase transition-colors",
                        option === locale
                            ? "bg-brand-600 text-white"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
