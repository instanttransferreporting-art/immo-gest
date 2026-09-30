import { z } from "zod";

export const restitutionCautionSchema = z
    .object({
        cautionId: z.string().min(1, { error: "La caution est requise." }),
        montantRendu: z.number({ error: "Le montant rendu est requis." }).nonnegative({ error: "Le montant ne peut pas être négatif." }),
        montantRetenu: z.number({ error: "Le montant retenu est requis." }).nonnegative({ error: "Le montant ne peut pas être négatif." }),
        notes: z.string().optional(),
    })
    .refine((data) => data.montantRendu + data.montantRetenu > 0, {
        error: "Veuillez indiquer un montant rendu et/ou retenu.",
        path: ["montantRendu"],
    });

export type RestitutionCautionFormValues = z.infer<typeof restitutionCautionSchema>;
