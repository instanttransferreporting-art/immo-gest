import { z } from "zod";

const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

export const telephoneSchema = z.object({
    numero: z
        .string()
        .min(1, { error: "Le numéro est requis." })
        .regex(PHONE_REGEX, {
            error: "Format invalide. Utilisez l'indicatif pays, ex: +237690000000.",
        }),
    estPrincipal: z.boolean(),
});

export const emailProSchema = z.object({
    email: z.string().min(1, { error: "L'email est requis." }).email({ error: "Adresse email invalide." }),
    estPrincipal: z.boolean(),
});

export const proprietaireSchema = z.object({
    nom: z.string().min(2, { error: "Le nom doit contenir au moins 2 caractères." }),
    prenom: z.string().optional(),
    adresse: z.string().min(1, { error: "L'adresse est requise." }),
    ville: z.string().min(1, { error: "La ville est requise." }),
    tauxCommission: z
        .number({ error: "Le taux de commission est requis." })
        .min(0, { error: "Le taux ne peut pas être négatif." })
        .max(100, { error: "Le taux ne peut pas dépasser 100." }),
    telephones: z
        .array(telephoneSchema)
        .min(1, { error: "Au moins un numéro de téléphone est requis." }),
    emails: z.array(emailProSchema),
});

export type ProprietaireFormValues = z.infer<typeof proprietaireSchema>;

export const immeubleSchema = z.object({
    nom: z.string().min(2, { error: "Le nom doit contenir au moins 2 caractères." }),
    adresse: z.string().min(1, { error: "L'adresse est requise." }),
    ville: z.string().min(1, { error: "La ville est requise." }),
    nombreNiveaux: z
        .number({ error: "Nombre entier requis." })
        .int({ error: "Nombre entier requis." })
        .min(1, { error: "Doit être au moins 1." }),
    nombreLogements: z
        .number({ error: "Nombre entier requis." })
        .int({ error: "Nombre entier requis." })
        .min(1, { error: "Doit être au moins 1." }),
    valeurEstimative: z
        .number()
        .min(0, { error: "La valeur ne peut pas être négative." })
        .optional(),
    proprietaireId: z.string().min(1, { error: "Veuillez sélectionner un propriétaire." }),
});

export type ImmeubleFormValues = z.infer<typeof immeubleSchema>;

// Schema de mise à jour : identique au schema de création
// (proprietaireId reste modifiable via le select dans le modal)
export const immeubleUpdateSchema = immeubleSchema;
export type ImmeubleUpdateFormValues = ImmeubleFormValues;
