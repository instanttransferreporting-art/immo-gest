import { z } from "zod";

export const organizationSchema = z.object({
    nom: z.string().min(1, { error: "Le nom de l'agence est requis." }),
    tauxCommissionDefaut: z
        .number({ error: "Le taux de commission est requis." })
        .min(0, { error: "Le taux ne peut pas être négatif." })
        .max(100, { error: "Le taux ne peut pas dépasser 100%." }),
    tauxPenaliteRetard: z
        .number({ error: "Le taux de pénalité est requis." })
        .min(0, { error: "Le taux ne peut pas être négatif." })
        .max(100, { error: "Le taux ne peut pas dépasser 100%." }),
    adresse: z.string().optional(),
    ville: z.string().optional(),
    telephone: z.string().optional(),
    email: z.union([z.string().email({ error: "L'email est invalide." }), z.literal("")]).optional(),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;

/** Le logo est géré à part (téléversement), jamais via le formulaire des paramètres. */
/**
 * `sidebar` : logo carré (barre latérale, emails) — champ `logo`.
 * `document` : logo long en en-tête des documents imprimés — champ `logoDocument`.
 */
export const LOGO_KINDS = ["sidebar", "document"] as const;
export type LogoKind = (typeof LOGO_KINDS)[number];
export const logoKindSchema = z.enum(LOGO_KINDS);

export const LOGO_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const LOGO_MAX_SIZE_BYTES = 2 * 1024 * 1024;

export const logoFileSchema = z
    .instanceof(File, { error: "Aucun fichier reçu." })
    .refine((file) => file.size > 0, { error: "Le fichier est vide." })
    .refine((file) => file.size <= LOGO_MAX_SIZE_BYTES, { error: "Le logo ne doit pas dépasser 2 Mo." })
    .refine((file) => (LOGO_ACCEPTED_TYPES as readonly string[]).includes(file.type), {
        error: "Format non supporté : utilisez PNG, JPEG ou WebP.",
    });
