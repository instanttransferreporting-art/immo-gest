import { z } from "zod";
import { V } from "@/i18n/validation-keys";

export const genererReversementSchema = z.object({
    proprietaireId: z.string().min(1, { error: V.ownerIdRequired }),
    mois: z.number().int().min(1).max(12),
    annee: z.number().int().min(2000).max(2100),
});

export type GenererReversementInput = z.infer<typeof genererReversementSchema>;

export const validerReversementSchema = z.object({
    reversementId: z.string().min(1, { error: V.payoutRequired }),
});

export type ValiderReversementInput = z.infer<typeof validerReversementSchema>;
