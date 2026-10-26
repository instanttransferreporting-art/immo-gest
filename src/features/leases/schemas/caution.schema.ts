import { z } from "zod";
import { V } from "@/i18n/validation-keys";

export const restitutionCautionSchema = z
    .object({
        cautionId: z.string().min(1, { error: V.depositRequired }),
        montantRendu: z.number({ error: V.returnedAmountRequired }).nonnegative({ error: V.amountNonNegative }),
        montantRetenu: z.number({ error: V.retainedAmountRequired }).nonnegative({ error: V.amountNonNegative }),
        notes: z.string().optional(),
    })
    .refine((data) => data.montantRendu + data.montantRetenu > 0, {
        error: V.returnedOrRetainedRequired,
        path: ["montantRendu"],
    });

export type RestitutionCautionFormValues = z.infer<typeof restitutionCautionSchema>;
