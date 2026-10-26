import { z } from "zod";

import { V } from "@/i18n/validation-keys";

export const loginSchema = z.object({
    email: z.string().min(1, { error: V.emailRequired }).email({ error: V.emailInvalid }),
    password: z.string().min(8, { error: V.passwordMin }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
