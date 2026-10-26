"use client";

import { Building2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/client";

type OrganizationLogoImageProps = {
    logo: string | null;
    organizationNom: string;
    className?: string;
    iconClassName?: string;
};

/**
 * Logo d'entreprise sur un fond blanc fixe (les logos sont souvent conçus pour un
 * fond clair) — ou, à défaut, l'icône de marque par défaut.
 */
export function OrganizationLogoImage({ logo, organizationNom, className, iconClassName }: OrganizationLogoImageProps) {
    const { t } = useI18n();

    if (!logo) {
        return (
            <div
                className={cn(
                    "flex shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm",
                    className
                )}
            >
                <Building2 className={cn("h-6 w-6", iconClassName)} />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-1.5",
                className
            )}
        >
            {/* URL Supabase publique et dynamique : pas d'optimisation next/image nécessaire pour un logo. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt={t.admin.settings.logo.alt(organizationNom)} className="h-full w-full object-contain" />
        </div>
    );
}
