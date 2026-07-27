import { RoleType } from "@/generated/prisma/enums";

export { RoleType };

export const ROLE_LABELS: Readonly<Record<RoleType, string>> = {
    ADMIN: "Administrateur",
    GESTIONNAIRE: "Gestionnaire Immobilier",
    COMPTABLE: "Comptable",
    DIRECTEUR_GENERAL: "Directeur Général",
};
