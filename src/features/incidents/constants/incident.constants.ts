import { PrioriteIncident, StatutIncident } from "@/generated/prisma/enums";

export const PRIORITE_INCIDENT_LABELS: Readonly<Record<PrioriteIncident, string>> = {
    BASSE: "Basse",
    MOYENNE: "Moyenne",
    HAUTE: "Haute",
};

export const PRIORITE_INCIDENT_STYLES: Readonly<Record<PrioriteIncident, string>> = {
    BASSE: "bg-muted text-muted-foreground",
    MOYENNE: "bg-amber-100 text-amber-700",
    HAUTE: "bg-red-100 text-red-700",
};

export const STATUT_INCIDENT_LABELS: Readonly<Record<StatutIncident, string>> = {
    NOUVEAU: "Nouveau",
    EN_COURS: "En cours",
    RESOLU: "Résolu",
};

export const STATUT_INCIDENT_STYLES: Readonly<Record<StatutIncident, string>> = {
    NOUVEAU: "bg-blue-100 text-blue-700",
    EN_COURS: "bg-amber-100 text-amber-700",
    RESOLU: "bg-emerald-100 text-emerald-700",
};

export const STATUT_INCIDENT_ORDER: readonly StatutIncident[] = ["NOUVEAU", "EN_COURS", "RESOLU"];
