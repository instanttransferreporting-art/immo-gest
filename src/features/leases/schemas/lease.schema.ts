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
        // Nature du logement choisie à la création (met à jour l'unité si elle diffère)
        isMeuble: z.boolean().optional(),
        // Pour les baux à la nuitée (frequence = QUOTIDIEN)
        nombreNuitees: z
            .number({ error: "Le nombre de nuitées est requis." })
            .int({ error: "Nombre entier requis." })
            .positive({ error: "Doit être au moins 1." })
            .optional(),
        // Montant total calculé (nuitées × tarif) — override manuel possible
        montantTotalOverride: z
            .number({ error: "Montant invalide." })
            .positive({ error: "Le montant doit être positif." })
            .optional(),
    })
    .refine((data) => data.dateFin > data.dateDebut, {
        error: "La date de fin doit être postérieure à la date de début.",
        path: ["dateFin"],
    })
    .refine(
        (data) =>
            data.frequence !== FrequenceEcheance.QUOTIDIEN ||
            (data.nombreNuitees !== undefined && data.nombreNuitees > 0),
        {
            error: "Le nombre de nuitées est requis pour un bail à la nuitée.",
            path: ["nombreNuitees"],
        }
    );

export type ContratFormValues = z.infer<typeof contratSchema>;

export const resiliationSchema = z.object({
    contratId: z.string().min(1, { error: "Le contrat est requis." }),
    dateFin: z.date({ error: "La date de sortie effective est requise." }),
    motif: z.string().optional(),
});

export type ResiliationFormValues = z.infer<typeof resiliationSchema>;

export const suspensionSchema = z.object({
    contratId: z.string().min(1, { error: "Le contrat est requis." }),
});

export type SuspensionFormValues = z.infer<typeof suspensionSchema>;

export const renouvellementSchema = z.object({
    contratId: z.string().min(1, { error: "Le contrat est requis." }),
    loyerBase: z.number().positive({ error: "Le loyer doit être positif." }).optional(),
    charges: z.number().nonnegative({ error: "Les charges ne peuvent pas être négatives." }).optional(),
    depotGarantie: z.number().nonnegative({ error: "La caution ne peut pas être négative." }).optional(),
});

export type RenouvellementFormValues = z.infer<typeof renouvellementSchema>;
