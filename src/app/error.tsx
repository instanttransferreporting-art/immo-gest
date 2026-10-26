"use client";

import { useEffect } from "react";

import { useI18n } from "@/i18n/client";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { t } = useI18n();

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
            <h2 className="text-xl font-semibold">{t.layout.errors.title}</h2>
            <p className="text-muted-foreground">{error.message || t.layout.errors.fallback}</p>
            <button
                onClick={() => reset()}
                className="rounded-lg bg-brand-600 px-4 py-2 text-white transition hover:bg-brand-700"
            >
                {t.common.retry}
            </button>
        </div>
    );
}
