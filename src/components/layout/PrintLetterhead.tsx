"use client";

import { useBranding } from "@/components/layout/BrandingContext";

/**
 * En-tête des documents imprimés depuis le navigateur (quittance, compte rendu…) :
 * logo « documents » de l'entreprise (à défaut le logo carré) et ses coordonnées.
 * Pendant de `PdfLetterhead` pour les PDF générés côté serveur.
 */
export function PrintLetterhead() {
    const { organizationNom, logo, logoDocument, organizationAdresse, organizationContact } = useBranding();
    const logoUrl = logoDocument ?? logo;

    if (!organizationNom) {
        return null;
    }

    return (
        <div className="flex items-center justify-between gap-6 border-b border-border pb-4">
            {logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- URL Supabase publique, aucun intérêt à l'optimiser
                <img
                    src={logoUrl}
                    alt={`Logo ${organizationNom}`}
                    className="h-16 max-w-[240px] object-contain object-left"
                />
            )}

            <div className={logoUrl ? "text-right" : undefined}>
                <p className="text-base font-bold text-foreground">{organizationNom}</p>
                {organizationAdresse && <p className="text-xs text-muted-foreground">{organizationAdresse}</p>}
                {organizationContact && <p className="text-xs text-muted-foreground">{organizationContact}</p>}
            </div>
        </div>
    );
}
