import { z } from "zod";

import { TypeLocataire } from "@/generated/prisma/enums";
import { V } from "@/i18n/validation-keys";

const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

const baseLocataireSchema = z.object({
    nom: z.string().min(2, { error: V.nameMin2 }),
    prenom: z.string().min(1, { error: V.firstNameRequired }),
    telephone: z
        .string()
        .min(1, { error: V.phoneRequired })
        .regex(PHONE_REGEX, { error: V.invalidPhone }),
    email: z.string().min(1, { error: V.emailRequired }).email({ error: V.emailInvalid }),
    adresse: z.string().min(1, { error: V.addressRequired }),
    pieceIdentite: z.string().min(1, { error: V.idNumberRequired }),
});

export const locatairePhysiqueSchema = baseLocataireSchema.extend({
    type: z.literal(TypeLocataire.PHYSIQUE),
    dateNaissance: z.coerce.date({ error: V.birthDateInvalid }).optional(),
    profession: z.string().optional(),
    revenuMensuelMoyen: z
        .number({ error: V.monthlyIncomeRequired })
        .positive({ error: V.incomePositive }),
});

export const locataireMoraleSchema = baseLocataireSchema.extend({
    type: z.literal(TypeLocataire.MORALE),
    raisonSociale: z.string().min(2, { error: V.companyLegalNameRequired }),
    rccm: z.string().min(1, { error: V.rccmRequired }),
    niu: z.string().min(1, { error: V.niuRequired }),
    telephoneMoral: z
        .string()
        .min(1, { error: V.companyPhoneRequired })
        .regex(PHONE_REGEX, { error: V.invalidPhone }),
    emailMoral: z.string().min(1, { error: V.companyEmailRequired }).email({ error: V.emailInvalid }),
});

export const locataireSchema = z.discriminatedUnion("type", [
    locatairePhysiqueSchema,
    locataireMoraleSchema,
]);

export type LocataireFormValues = z.infer<typeof locataireSchema>;

// Schemas de mise à jour (identiques mais servant comme alias explicites)
export const locatairePhysiqueUpdateSchema = locatairePhysiqueSchema;
export const locataireMoraleUpdateSchema = locataireMoraleSchema;
export const locataireUpdateSchema = locataireSchema;
export type LocataireUpdateFormValues = LocataireFormValues;
