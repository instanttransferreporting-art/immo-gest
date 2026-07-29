import { RoleType } from "@/generated/prisma/enums";

/**
 * Matrice des permissions RBAC : pour chaque action métier, la liste des rôles autorisés.
 * Un rôle absent de la liste se voit refuser l'action (ForbiddenError via checkPermission).
 */
export const PERMISSIONS = {
    ORGANIZATION_CREATE: [RoleType.SUPER_ADMIN],
    ORGANIZATION_EDIT: [RoleType.SUPER_ADMIN],
    ORGANIZATION_SUSPEND: [RoleType.SUPER_ADMIN],
    ORGANIZATION_IMPERSONATE: [RoleType.SUPER_ADMIN],
    PROPRIETAIRE_CREATE: [RoleType.ADMIN, RoleType.GESTIONNAIRE],
    IMMEUBLE_CREATE: [RoleType.ADMIN, RoleType.GESTIONNAIRE],
    UNITE_CREATE: [RoleType.ADMIN, RoleType.GESTIONNAIRE],
    LOCATAIRE_CREATE: [RoleType.ADMIN, RoleType.GESTIONNAIRE],
    DOCUMENT_UPLOAD: [RoleType.ADMIN, RoleType.GESTIONNAIRE],
    CONTRAT_CREATE: [RoleType.ADMIN, RoleType.GESTIONNAIRE],
    CONTRAT_RESILIER: [RoleType.ADMIN, RoleType.GESTIONNAIRE],
    CAUTION_RESTITUER: [RoleType.ADMIN, RoleType.GESTIONNAIRE, RoleType.COMPTABLE],
    FACTURE_GENERER: [RoleType.ADMIN, RoleType.COMPTABLE],
    RELANCE_CREATE: [RoleType.ADMIN, RoleType.COMPTABLE],
    PAIEMENT_CREATE: [RoleType.ADMIN, RoleType.COMPTABLE],
    REVERSEMENT_GENERER: [RoleType.ADMIN, RoleType.COMPTABLE],
    REVERSEMENT_VALIDER: [RoleType.ADMIN, RoleType.DIRECTEUR_GENERAL],
    INCIDENT_CREATE: [RoleType.ADMIN, RoleType.GESTIONNAIRE],
    INCIDENT_UPDATE_STATUT: [RoleType.ADMIN, RoleType.GESTIONNAIRE],
    INCIDENT_ASSIGN_PRESTATAIRE: [RoleType.ADMIN, RoleType.GESTIONNAIRE],
    ORGANIZATION_MANAGE: [RoleType.ADMIN],
    REVERSEMENT_EXPORT: [RoleType.ADMIN, RoleType.COMPTABLE],
    PARC_EXPORT: [RoleType.ADMIN, RoleType.GESTIONNAIRE, RoleType.COMPTABLE, RoleType.DIRECTEUR_GENERAL],
} as const satisfies Record<string, readonly RoleType[]>;

export type PermissionKey = keyof typeof PERMISSIONS;
