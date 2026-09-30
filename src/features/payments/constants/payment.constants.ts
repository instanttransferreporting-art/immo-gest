import { ModePaiement } from "@/generated/prisma/enums";

export const MODE_PAIEMENT_LABELS: Readonly<Record<ModePaiement, string>> = {
    ESPECES: "Espèces",
    VIREMENT_BANCAIRE: "Virement bancaire",
    MOBILE_MONEY: "Mobile Money",
};
