import { z } from "zod";

export const createOrganizationSchema = z.object({
    nom: z.string().min(1, { error: "Le nom de l'entreprise est requis." }),
    tauxCommissionDefaut: z
        .number({ error: "Le taux de commission est requis." })
        .min(0, { error: "Le taux ne peut pas être négatif." })
        .max(100, { error: "Le taux ne peut pas dépasser 100%." }),
    adminNom: z.string().min(1, { error: "Le nom de l'administrateur est requis." }),
    adminPrenom: z.string().min(1, { error: "Le prénom de l'administrateur est requis." }),
    adminEmail: z
        .string()
        .min(1, { error: "L'email de l'administrateur est requis." })
        .email({ error: "Adresse email invalide." }),
    adminPassword: z
        .string()
        .min(8, { error: "Le mot de passe doit contenir au moins 8 caractères." }),
});

export type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;
