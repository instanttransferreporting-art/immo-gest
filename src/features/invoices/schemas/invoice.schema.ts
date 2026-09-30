import { z } from "zod";

export const genererFactureSchema = z.object({
    contratId: z.string().min(1, { error: "Le contrat est requis." }),
    mois: z.number().int().min(1).max(12),
    annee: z.number().int().min(2000).max(2100),
});

export type GenererFactureInput = z.infer<typeof genererFactureSchema>;

export const genererFacturesDuMoisSchema = z.object({
    mois: z.number().int().min(1).max(12),
    annee: z.number().int().min(2000).max(2100),
});

export type GenererFacturesDuMoisInput = z.infer<typeof genererFacturesDuMoisSchema>;
