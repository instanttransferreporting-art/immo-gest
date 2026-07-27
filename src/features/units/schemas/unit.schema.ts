import { z } from "zod";

import { TypeCharges, TypeUnite } from "@/generated/prisma/enums";

export const uniteSchema = z
    .object({
        immeubleId: z.string().min(1, { error: "L'immeuble est requis." }),
        numero: z.string().min(1, { error: "Le numéro est requis." }),
        type: z.enum(TypeUnite, { error: "Le type d'unité est requis." }),
        surface: z.number({ error: "La surface est requise." }).positive({ error: "La surface doit être positive." }),
        nombrePieces: z
            .number({ error: "Le nombre de pièces est requis." })
            .int({ error: "Nombre entier requis." })
            .positive({ error: "Doit être au moins 1." }),
        loyerMensuel: z
            .number({ error: "Le loyer mensuel est requis." })
            .positive({ error: "Le loyer doit être positif." }),
        typeCharges: z.enum(TypeCharges, { error: "Le type de charges est requis." }),
        valeurCharges: z
            .number({ error: "La valeur des charges est requise." })
            .nonnegative({ error: "La valeur ne peut pas être négative." }),
        caution: z.number({ error: "La caution est requise." }).nonnegative({ error: "La caution ne peut pas être négative." }),
    })
    .refine(
        (data) => data.typeCharges !== TypeCharges.POURCENTAGE || data.valeurCharges <= 100,
        {
            error: "Le pourcentage de charges ne peut pas dépasser 100.",
            path: ["valeurCharges"],
        }
    );

export type UniteFormValues = z.infer<typeof uniteSchema>;
