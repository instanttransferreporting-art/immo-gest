import { z } from "zod";

import { ASSIGNABLE_ROLES } from "@/features/users/constants/user.constants";
import { V } from "@/i18n/validation-keys";

const passwordField = z.string().min(8, { error: V.passwordMin });

export const createUserSchema = z.object({
    prenom: z.string().trim().min(1, { error: V.firstNameRequired }),
    nom: z.string().trim().min(1, { error: V.lastNameRequired }),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .min(1, { error: V.emailRequired })
        .email({ error: V.emailInvalid }),
    role: z.enum(ASSIGNABLE_ROLES, { error: V.roleInvalid }),
    password: passwordField,
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.pick({ prenom: true, nom: true, role: true });

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export const resetPasswordSchema = z.object({
    password: passwordField,
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
