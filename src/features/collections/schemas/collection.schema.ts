import { z } from "zod";

import { NiveauRelance } from "@/generated/prisma/enums";
import { V } from "@/i18n/validation-keys";

export const genererRelanceSchema = z.object({
    echeanceId: z.string().min(1, { error: V.dueDateRequired }),
    niveau: z.enum(NiveauRelance, { error: V.reminderLevelRequired }),
    details: z.string().optional(),
});

export type GenererRelanceFormValues = z.infer<typeof genererRelanceSchema>;
