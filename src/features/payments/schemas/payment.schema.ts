import { z } from "zod";

import { ModePaiement } from "@/generated/prisma/enums";

export const paiementSchema = z.object({
    factureId: z.string().min(1, { error: "La facture est requise." }),
    mode: z.enum(ModePaiement, { error: "Le mode de paiement est requis." }),
    montant: z.number({ error: "Le montant est requis." }).positive({ error: "Le montant doit être positif." }),
    reference: z.string().optional(),
});

export type PaiementFormValues = z.infer<typeof paiementSchema>;
