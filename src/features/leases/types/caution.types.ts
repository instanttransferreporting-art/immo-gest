import type { StatutCaution } from "@/generated/prisma/enums";

export type CautionDTO = Readonly<{
    id: string;
    contratId: string;
    montantInitial: number;
    montantRetenu: number;
    montantRendu: number;
    statut: StatutCaution;
    dateRestitution: Date | null;
    notes: string | null;
    createdAt: Date;
}>;
