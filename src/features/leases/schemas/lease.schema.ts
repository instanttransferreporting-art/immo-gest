import { z } from "zod";

import { FrequenceEcheance } from "@/generated/prisma/enums";

export const contratSchema = z
    .object({
        uniteId: z.string().min(1, { error: "L'unité est requise." }),
        locataireId: z.string().min(1, { error: "Le locataire est requis." }),
        dateDebut: z.date({ error: "Date de début invalide." }),
        dateFin: z.date({ error: "Date de fin invalide." }),
        loyerBase: z.number({ error: "Le loyer de base est requis." }).positive({ error: "Le loyer doit être positif." }),
        charges: z.number({ error: "Les charges sont requises." }).nonnegative({ error: "Les charges ne peuvent pas être négatives." }),
        depotGarantie: z
            .number({ error: "La caution est requise." })
            .nonnegative({ error: "La caution ne peut pas être négative." }),
        frequence: z.enum(FrequenceEcheance, { error: "La fréquence est requise." }),
    })
    .refine((data) => data.dateFin > data.dateDebut, {
        error: "La date de fin doit être postérieure à la date de début.",
        path: ["dateFin"],
    });

export type ContratFormValues = z.infer<typeof contratSchema>;

export const resiliationSchema = z.object({
    contratId: z.string().min(1, { error: "Le contrat est requis." }),
    dateFin: z.date({ error: "La date de sortie effective est requise." }),
    motif: z.string().optional(),
});

export type ResiliationFormValues = z.infer<typeof resiliationSchema>;
