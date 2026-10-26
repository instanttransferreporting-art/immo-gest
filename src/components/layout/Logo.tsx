"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useBranding } from "@/components/layout/BrandingContext";
import { OrganizationLogoImage } from "@/features/organizations/components/OrganizationLogoImage";

type LogoProps = {
    collapsed?: boolean;
    /** Barre latérale fixe : nom masqué sous le breakpoint lg (icône seule). */
    responsive?: boolean;
    /** Icône seule, sans marge (ex. en-tête mobile). */
    iconOnly?: boolean;
};

/** Icône carrée (logo de l'entreprise ou icône par défaut) + nom de l'entreprise à droite. */
export function Logo({ collapsed = false, responsive = false, iconOnly = false }: LogoProps) {
    const { logo, organizationNom } = useBranding();
    const nom = organizationNom ?? "ImmoGest";

    if (iconOnly) {
        return (
            <Link href={ROUTES.DASHBOARD} title={nom} className="shrink-0">
                <OrganizationLogoImage logo={logo} organizationNom={nom} className="h-10 w-10" />
            </Link>
        );
    }

    return (
        <Link
            href={ROUTES.DASHBOARD}
            title={collapsed || responsive ? nom : undefined}
            className={cn(
                "flex h-20 shrink-0 items-center gap-3 px-4 transition-colors hover:bg-muted",
                collapsed && "justify-center px-0",
                responsive && !collapsed && "justify-center px-0 lg:justify-start lg:px-4"
            )}
        >
            <OrganizationLogoImage logo={logo} organizationNom={nom} className="h-11 w-11" />

            {!collapsed && (
                <div className={cn("flex min-w-0 flex-col", responsive && "hidden lg:flex")}>
                    <span className="truncate text-base font-bold leading-tight tracking-tight text-foreground">
                        {nom}
                    </span>

                    <span className="truncate text-xs text-muted-foreground">Gestion immobilière</span>
                </div>
            )}
        </Link>
    );
}
