// Coordonnées d'entreprise formatées pour les en-têtes imprimés (PDF et HTML).

/**
 * « Tél. … · email » à partir des coordonnées facultatives de l'entreprise.
 * `phoneLabel` : « Tél. » par défaut (documents en français), traduit pour l'interface.
 */
export function formatOrganizationContact(
    organization: { telephone: string | null; email: string | null },
    phoneLabel = "Tél."
): string | null {
    const parts = [organization.telephone && `${phoneLabel} ${organization.telephone}`, organization.email].filter(Boolean);
    return parts.length > 0 ? parts.join(" · ") : null;
}

/** Adresse complète « adresse, ville » à partir des champs facultatifs. */
export function formatOrganizationAdresse(organization: { adresse: string | null; ville: string | null }): string | null {
    const parts = [organization.adresse, organization.ville].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
}
