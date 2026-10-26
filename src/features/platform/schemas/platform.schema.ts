import { z } from "zod";
import { V } from "@/i18n/validation-keys";

export const createOrganizationSchema = z.object({
    nom: z.string().min(1, { error: V.companyNameRequired }),
    tauxCommissionDefaut: z
        .number({ error: V.commissionRateRequired })
        .min(0, { error: V.rateNonNegative })
        .max(100, { error: V.rateMax100 }),
    adminNom: z.string().min(1, { error: V.adminLastNameRequired }),
    adminPrenom: z.string().min(1, { error: V.adminFirstNameRequired }),
    adminEmail: z
        .string()
        .min(1, { error: V.adminEmailRequired })
        .email({ error: V.emailInvalid }),
    adminPassword: z
        .string()
        .min(8, { error: V.passwordMin }),
});

export type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;
