"use client";

import { createContext, useContext, type ReactNode } from "react";

export type Branding = Readonly<{
    organizationNom: string | null;
    /** Logo carré : barre latérale. */
    logo: string | null;
    /** Logo long : en-tête des documents imprimés. */
    logoDocument: string | null;
    /** Coordonnées imprimées sous le nom (adresse, téléphone, email). */
    organizationAdresse: string | null;
    organizationContact: string | null;
}>;

const DEFAULT_BRANDING: Branding = {
    organizationNom: null,
    logo: null,
    logoDocument: null,
    organizationAdresse: null,
    organizationContact: null,
};

const BrandingContext = createContext<Branding>(DEFAULT_BRANDING);

/** Identité visuelle de l'entreprise courante (nom + logo), fournie par le layout serveur. */
export function BrandingProvider({ branding, children }: { branding: Branding; children: ReactNode }) {
    return <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>;
}

export function useBranding(): Branding {
    return useContext(BrandingContext);
}
