"use client";

import { Loader2 } from "lucide-react";

import { useI18n } from "@/i18n/client";

/**
 * Indicateur de chargement des pages. Chaque dossier de route a son propre
 * `loading.tsx` qui l'affiche : un loading.tsx placé seulement au niveau du
 * groupe ne se réaffiche pas lors d'une navigation entre pages sœurs (le layout
 * partagé reste monté et l'ancienne page reste visible jusqu'au rendu de la nouvelle).
 */
export function PageLoader() {
    const { t } = useI18n();

    return (
        <div className="flex min-h-[60vh] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                <p className="text-sm font-medium text-muted-foreground">{t.common.loading}</p>
            </div>
        </div>
    );
}
