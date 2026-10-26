import { z } from "zod";
import { V } from "@/i18n/validation-keys";

export const CIVILITES = ["Monsieur", "Madame"] as const;

/** Périodicités de paiement prévues par le modèle de bail. */
export const PERIODICITES_BAIL = ["MENSUEL", "TRIMESTRIEL", "SEMESTRIEL", "ANNUEL"] as const;

export type PeriodiciteBail = (typeof PERIODICITES_BAIL)[number];

export const PERIODICITE_BAIL_LABELS: Readonly<Record<PeriodiciteBail, string>> = {
    MENSUEL: "Mensuelle",
    TRIMESTRIEL: "Trimestrielle",
    SEMESTRIEL: "Semestrielle",
    ANNUEL: "Annuelle",
};

const requiredText = (message: (typeof V)[keyof typeof V]) => z.string({ error: message }).trim().min(1, { error: message });

export const contratDocumentSchema = z.object({
    // Preneur
    civilite: z.enum(CIVILITES, { error: V.civiliteRequired }),
    locataireNom: requiredText(V.tenantNameRequired),
    nationalite: requiredText(V.nationalityRequired),
    pieceIdentite: requiredText(V.cniRequired),
    pieceDelivreeLe: requiredText(V.cniIssueDateRequired),
    pieceDelivreeA: requiredText(V.cniIssuePlaceRequired),
    telephone: requiredText(V.phoneRequired),

    // Local loué
    localisation: requiredText(V.locationRequired),
    surface: z.number({ error: V.surfaceRequired }).positive({ error: V.surfacePositive }),
    composition: requiredText(V.compositionRequired),

    // Durée
    dateDebut: z.coerce.date({ error: V.effectiveDateInvalid }),
    reconductionAuto: z.boolean(),
    genererContratSuivant: z.boolean(),

    // Loyer & paiement
    loyer: z.number({ error: V.rentRequired }).positive({ error: V.rentPositive }),
    periodicite: z.enum(PERIODICITES_BAIL, { error: V.periodicityRequired }),
    moisAvance: z
        .number({ error: V.advanceMonthsRequired })
        .int({ error: V.integerRequired })
        .min(1, { error: V.atLeastOneMonth }),

    // Dépôt de garantie
    depotMois: z
        .number({ error: V.depositMonthsRequired })
        .int({ error: V.integerRequired })
        .min(1, { error: V.atLeastOneMonth }),
    depotMontant: z.number({ error: V.depositAmountRequired }).nonnegative({ error: V.invalidAmount }),

    // Charges
    chargesMontant: z.number({ error: V.chargesAmountRequired }).nonnegative({ error: V.invalidAmount }),
    natureCharges: z.string().trim().optional(),

    // Pénalités de retard
    tauxPenalite: z
        .number({ error: V.penaltyRateRequired })
        .min(0, { error: V.invalidRate })
        .max(100, { error: V.invalidRate }),
    delaiPenaliteJours: z
        .number({ error: V.delayRequired })
        .int({ error: V.integerRequired })
        .min(1, { error: V.atLeastOneDay }),

    // Signature
    dateSignature: z.coerce.date({ error: V.signatureDateInvalid }),
});

export type ContratDocumentValues = z.infer<typeof contratDocumentSchema>;

export const contratDocumentRequestSchema = z.object({
    values: contratDocumentSchema,
    /** 1 = bail de l'année de prise d'effet, 2 = bail de l'année suivante. */
    index: z.union([z.literal(1), z.literal(2)]),
    format: z.enum(["docx", "pdf"]),
});
