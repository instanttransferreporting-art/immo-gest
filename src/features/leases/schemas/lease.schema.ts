import { z } from "zod";

import { FrequenceEcheance } from "@/generated/prisma/enums";
import { V } from "@/i18n/validation-keys";

export const contratSchema = z
    .object({
        uniteId: z.string().min(1, { error: V.unitRequired }),
        locataireId: z.string().min(1, { error: V.tenantRequired }),
        dateDebut: z.date({ error: V.startDateInvalid }),
        dateFin: z.date({ error: V.endDateInvalid }),
        loyerBase: z.number({ error: V.baseRentRequired }).positive({ error: V.rentPositive }),
        charges: z.number({ error: V.chargesRequired }).nonnegative({ error: V.chargesNonNegative }),
        depotGarantie: z
            .number({ error: V.depositRequired })
            .nonnegative({ error: V.depositNonNegative }),
        frequence: z.enum(FrequenceEcheance, { error: V.frequencyRequired }),
        // Nature du logement choisie à la création (met à jour l'unité si elle diffère)
        isMeuble: z.boolean().optional(),
        // Pour les baux à la nuitée (frequence = QUOTIDIEN)
        nombreNuitees: z
            .number({ error: V.nightsRequired })
            .int({ error: V.integerRequired })
            .positive({ error: V.atLeastOne })
            .optional(),
        // Montant total calculé (nuitées × tarif) — override manuel possible
        montantTotalOverride: z
            .number({ error: V.invalidAmount })
            .positive({ error: V.amountPositive })
            .optional(),
    })
    .refine((data) => data.dateFin > data.dateDebut, {
        error: V.endAfterStart,
        path: ["dateFin"],
    })
    .refine(
        (data) =>
            data.frequence !== FrequenceEcheance.QUOTIDIEN ||
            (data.nombreNuitees !== undefined && data.nombreNuitees > 0),
        {
            error: V.nightsRequiredForNightly,
            path: ["nombreNuitees"],
        }
    );

export type ContratFormValues = z.infer<typeof contratSchema>;

export const resiliationSchema = z.object({
    contratId: z.string().min(1, { error: V.leaseRequired }),
    dateFin: z.date({ error: V.exitDateRequired }),
    motif: z.string().optional(),
});

export type ResiliationFormValues = z.infer<typeof resiliationSchema>;

export const suspensionSchema = z.object({
    contratId: z.string().min(1, { error: V.leaseRequired }),
});

export type SuspensionFormValues = z.infer<typeof suspensionSchema>;

export const renouvellementSchema = z.object({
    contratId: z.string().min(1, { error: V.leaseRequired }),
    loyerBase: z.number().positive({ error: V.rentPositive }).optional(),
    charges: z.number().nonnegative({ error: V.chargesNonNegative }).optional(),
    depotGarantie: z.number().nonnegative({ error: V.depositNonNegative }).optional(),
});

export type RenouvellementFormValues = z.infer<typeof renouvellementSchema>;
