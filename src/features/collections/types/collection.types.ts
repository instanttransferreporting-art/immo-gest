import type { NiveauRelance } from "@/generated/prisma/enums";
import type { FactureDTO } from "@/features/invoices/types/invoice.types";

export type RelanceDTO = Readonly<{
    id: string;
    echeanceId: string;
    niveau: NiveauRelance;
    dateEnvoi: Date;
    details: string | null;
}>;

export type ImpayeDTO = FactureDTO &
    Readonly<{
        joursRetard: number;
        dernierNiveauRelance: NiveauRelance | null;
    }>;
