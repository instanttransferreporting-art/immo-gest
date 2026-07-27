import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, { error: "L'email est requis." })
        .email({ error: "Adresse email invalide." }),
    password: z
        .string()
        .min(8, { error: "Le mot de passe doit contenir au moins 8 caractères." }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
