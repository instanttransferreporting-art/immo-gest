import { z } from "zod";

import { TypeLocataire } from "@/generated/prisma/enums";

const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

const baseLocataireSchema = z.object({
    nom: z.string().min(2, { error: "Le nom doit contenir au moins 2 caractères." }),
    prenom: z.string().min(1, { error: "Le prénom est requis." }),
    telephone: z
        .string()
        .min(1, { error: "Le téléphone est requis." })
        .regex(PHONE_REGEX, { error: "Format invalide. Utilisez l'indicatif pays, ex: +237690000000." }),
    email: z.string().min(1, { error: "L'email est requis." }).email({ error: "Adresse email invalide." }),
    adresse: z.string().min(1, { error: "L'adresse est requise." }),
    pieceIdentite: z.string().min(1, { error: "Le numéro de pièce d'identité est requis." }),
});

export const locatairePhysiqueSchema = baseLocataireSchema.extend({
    type: z.literal(TypeLocataire.PHYSIQUE),
    dateNaissance: z.coerce.date({ error: "Date de naissance invalide." }).optional(),
    profession: z.string().optional(),
    revenuMensuelMoyen: z
        .number({ error: "Le revenu mensuel moyen est obligatoire pour une personne physique." })
        .positive({ error: "Le revenu doit être positif." }),
});

export const locataireMoraleSchema = baseLocataireSchema.extend({
    type: z.literal(TypeLocataire.MORALE),
    raisonSociale: z.string().min(2, { error: "La raison sociale est requise." }),
    rccm: z.string().min(1, { error: "Le RCCM est requis." }),
    niu: z.string().min(1, { error: "Le NIU est requis." }),
    telephoneMoral: z
        .string()
        .min(1, { error: "Le téléphone de l'entreprise est requis." })
        .regex(PHONE_REGEX, { error: "Format invalide. Utilisez l'indicatif pays, ex: +237690000000." }),
    emailMoral: z.string().min(1, { error: "L'email de l'entreprise est requis." }).email({ error: "Adresse email invalide." }),
});

export const locataireSchema = z.discriminatedUnion("type", [
    locatairePhysiqueSchema,
    locataireMoraleSchema,
]);

export type LocataireFormValues = z.infer<typeof locataireSchema>;
