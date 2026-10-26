import { z } from "zod";
import { V } from "@/i18n/validation-keys";

export const organizationSchema = z.object({
    nom: z.string().min(1, { error: V.agencyNameRequired }),
    tauxCommissionDefaut: z
        .number({ error: V.commissionRateRequired })
        .min(0, { error: V.rateNonNegative })
        .max(100, { error: V.rateMax100 }),
    tauxPenaliteRetard: z
        .number({ error: V.penaltyRateRequired })
        .min(0, { error: V.rateNonNegative })
        .max(100, { error: V.rateMax100 }),
    adresse: z.string().optional(),
    ville: z.string().optional(),
    telephone: z.string().optional(),
    email: z.union([z.string().email({ error: V.emailInvalid }), z.literal("")]).optional(),
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
    .instanceof(File, { error: V.noFile })
    .refine((file) => file.size > 0, { error: V.emptyFile })
    .refine((file) => file.size <= LOGO_MAX_SIZE_BYTES, { error: V.logoTooLarge })
    .refine((file) => (LOGO_ACCEPTED_TYPES as readonly string[]).includes(file.type), {
        error: V.logoFormat,
    });
