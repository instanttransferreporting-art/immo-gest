import { z } from "zod";

import { NiveauRelance } from "@/generated/prisma/enums";

export const genererRelanceSchema = z.object({
    echeanceId: z.string().min(1, { error: "L'échéance est requise." }),
    niveau: z.enum(NiveauRelance, { error: "Le niveau de relance est requis." }),
    details: z.string().optional(),
});

export type GenererRelanceFormValues = z.infer<typeof genererRelanceSchema>;
