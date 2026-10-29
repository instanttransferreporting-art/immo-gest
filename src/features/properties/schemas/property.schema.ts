import { z } from "zod";
import { V } from "@/i18n/validation-keys";

const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

export const telephoneSchema = z.object({
    numero: z
        .string()
        .min(1, { error: V.phoneNumberRequired })
        .regex(PHONE_REGEX, {
            error: V.invalidPhone,
        }),
    estPrincipal: z.boolean(),
});

export const emailProSchema = z.object({
    email: z.string().min(1, { error: V.emailRequired }).email({ error: V.emailInvalid }),
    estPrincipal: z.boolean(),
});

export const proprietaireSchema = z.object({
    nom: z.string().min(2, { error: V.nameMin2 }),
    prenom: z.string().optional(),
    adresse: z.string().min(1, { error: V.addressRequired }),
    ville: z.string().min(1, { error: V.cityRequired }),
    tauxCommission: z
        .number({ error: V.commissionRateRequired })
        .min(0, { error: V.rateNonNegative })
        .max(100, { error: V.rateMax100 }),
    telephones: z
        .array(telephoneSchema)
        .min(1, { error: V.atLeastOnePhone }),
    emails: z.array(emailProSchema),
});

export type ProprietaireFormValues = z.infer<typeof proprietaireSchema>;

export const immeubleSchema = z.object({
    nom: z.string().min(2, { error: V.nameMin2 }),
    adresse: z.string().min(1, { error: V.addressRequired }),
    ville: z.string().min(1, { error: V.cityRequired }),
    nombreNiveaux: z
        .number({ error: V.integerRequired })
        .int({ error: V.integerRequired })
        .min(1, { error: V.atLeastOne }),
    valeurEstimative: z
        .number()
        .min(0, { error: V.valueNonNegative })
        .optional(),
    proprietaireId: z.string().optional(), // vide = géré directement par l'organisation
});

export type ImmeubleFormValues = z.infer<typeof immeubleSchema>;

// Schema de mise à jour : identique au schema de création
// (proprietaireId reste modifiable via le select dans le modal)
export const immeubleUpdateSchema = immeubleSchema;
export type ImmeubleUpdateFormValues = ImmeubleFormValues;
