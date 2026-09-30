import { z } from "zod";

export const genererReversementSchema = z.object({
    proprietaireId: z.string().min(1, { error: "Le propriétaire est requis." }),
    mois: z.number().int().min(1).max(12),
    annee: z.number().int().min(2000).max(2100),
});

export type GenererReversementInput = z.infer<typeof genererReversementSchema>;

export const validerReversementSchema = z.object({
    reversementId: z.string().min(1, { error: "Le reversement est requis." }),
});

export type ValiderReversementInput = z.infer<typeof validerReversementSchema>;
