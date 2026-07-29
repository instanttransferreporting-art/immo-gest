import { z } from "zod";

export const organizationSchema = z.object({
    nom: z.string().min(1, { error: "Le nom de l'agence est requis." }),
    logo: z.string().optional(),
    tauxCommissionDefaut: z
        .number({ error: "Le taux de commission est requis." })
        .min(0, { error: "Le taux ne peut pas être négatif." })
        .max(100, { error: "Le taux ne peut pas dépasser 100%." }),
    adresse: z.string().optional(),
    ville: z.string().optional(),
    telephone: z.string().optional(),
    email: z.union([z.string().email({ error: "L'email est invalide." }), z.literal("")]).optional(),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;
