import { z } from "zod";

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

const requiredText = (message: string) => z.string({ error: message }).trim().min(1, { error: message });

export const contratDocumentSchema = z.object({
    // Preneur
    civilite: z.enum(CIVILITES, { error: "La civilité est requise." }),
    locataireNom: requiredText("Le nom du locataire est requis."),
    nationalite: requiredText("La nationalité est requise."),
    pieceIdentite: requiredText("Le numéro de CNI est requis."),
    pieceDelivreeLe: requiredText("La date de délivrance de la CNI est requise."),
    pieceDelivreeA: requiredText("Le lieu de délivrance de la CNI est requis."),
    telephone: requiredText("Le téléphone est requis."),

    // Local loué
    localisation: requiredText("La localisation du local est requise."),
    surface: z.number({ error: "La surface est requise." }).positive({ error: "La surface doit être positive." }),
    composition: requiredText("La composition du local est requise."),

    // Durée
    dateDebut: z.coerce.date({ error: "La date de prise d'effet est invalide." }),
    reconductionAuto: z.boolean(),
    genererContratSuivant: z.boolean(),

    // Loyer & paiement
    loyer: z.number({ error: "Le loyer est requis." }).positive({ error: "Le loyer doit être positif." }),
    periodicite: z.enum(PERIODICITES_BAIL, { error: "La périodicité est requise." }),
    moisAvance: z
        .number({ error: "Le nombre de mois d'avance est requis." })
        .int({ error: "Nombre entier requis." })
        .min(1, { error: "Au moins 1 mois." }),

    // Dépôt de garantie
    depotMois: z
        .number({ error: "Le nombre de mois de garantie est requis." })
        .int({ error: "Nombre entier requis." })
        .min(1, { error: "Au moins 1 mois." }),
    depotMontant: z.number({ error: "Le montant du dépôt est requis." }).nonnegative({ error: "Montant invalide." }),

    // Charges
    chargesMontant: z.number({ error: "Le montant des charges est requis." }).nonnegative({ error: "Montant invalide." }),
    natureCharges: z.string().trim().optional(),

    // Pénalités de retard
    tauxPenalite: z
        .number({ error: "Le taux de pénalité est requis." })
        .min(0, { error: "Taux invalide." })
        .max(100, { error: "Taux invalide." }),
    delaiPenaliteJours: z
        .number({ error: "Le délai est requis." })
        .int({ error: "Nombre entier requis." })
        .min(1, { error: "Au moins 1 jour." }),

    // Signature
    dateSignature: z.coerce.date({ error: "La date de signature est invalide." }),
});

export type ContratDocumentValues = z.infer<typeof contratDocumentSchema>;

export const contratDocumentRequestSchema = z.object({
    values: contratDocumentSchema,
    /** 1 = bail de l'année de prise d'effet, 2 = bail de l'année suivante. */
    index: z.union([z.literal(1), z.literal(2)]),
    format: z.enum(["docx", "pdf"]),
});
