import Link from "next/link";

import { getI18n } from "@/i18n/server";

export default async function NotFound() {
    const { t } = await getI18n();

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold">{t.layout.errors.notFoundTitle}</h2>
            <p className="text-muted-foreground">{t.layout.errors.notFoundText}</p>
            <Link
                href="/dashboard"
                className="rounded-lg bg-brand-600 px-4 py-2 text-white transition hover:bg-brand-700"
            >
                {t.layout.errors.backHome}
            </Link>
        </div>
    );
}
