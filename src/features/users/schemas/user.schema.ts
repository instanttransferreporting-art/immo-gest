import { z } from "zod";

import { ASSIGNABLE_ROLES } from "@/features/users/constants/user.constants";

const passwordField = z.string().min(8, { error: "Le mot de passe doit contenir au moins 8 caractères." });

export const createUserSchema = z.object({
    prenom: z.string().trim().min(1, { error: "Le prénom est requis." }),
    nom: z.string().trim().min(1, { error: "Le nom est requis." }),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .min(1, { error: "L'email est requis." })
        .email({ error: "Adresse email invalide." }),
    role: z.enum(ASSIGNABLE_ROLES, { error: "Rôle invalide." }),
    password: passwordField,
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.pick({ prenom: true, nom: true, role: true });

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export const resetPasswordSchema = z.object({
    password: passwordField,
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
