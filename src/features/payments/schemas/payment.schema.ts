import { z } from "zod";

import { ModePaiement } from "@/generated/prisma/enums";
import { V } from "@/i18n/validation-keys";

export const paiementSchema = z.object({
    factureId: z.string().min(1, { error: V.invoiceRequired }),
    mode: z.enum(ModePaiement, { error: V.paymentModeRequired }),
    montant: z.number({ error: V.amountRequired }).positive({ error: V.amountPositive }),
    reference: z.string().optional(),
});

export type PaiementFormValues = z.infer<typeof paiementSchema>;

export const annulerPaiementSchema = z.object({
    paiementId: z.string().min(1, { error: V.paymentRequired }),
    motif: z.string().min(5, { error: V.reasonMin5 }),
});

export type AnnulerPaiementFormValues = z.infer<typeof annulerPaiementSchema>;
