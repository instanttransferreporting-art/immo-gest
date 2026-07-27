import type { ModePaiement } from "@/generated/prisma/enums";

export type PaiementDTO = Readonly<{
    id: string;
    factureId: string;
    echeanceId: string;
    userId: string;
    mode: ModePaiement;
    montant: number;
    reference: string | null;
    datePaiement: Date;
    estAnnule: boolean;
    enregistrePar: Readonly<{ nom: string; prenom: string }>;
}>;
