import { z } from "zod";

import { FrequencePaiement, TypeCharges, TypeUnite } from "@/generated/prisma/enums";

// Schéma objet de base (sans refine) pour pouvoir utiliser .omit()
const uniteBaseSchema = z.object({
    immeubleId: z.string().min(1, { error: "L'immeuble est requis." }),
    numero: z.string().min(1, { error: "Le numéro est requis." }),
    type: z.enum(TypeUnite, { error: "Le type d'unité est requis." }),
    surface: z.number({ error: "La surface est requise." }).positive({ error: "La surface doit être positive." }),
    nombrePieces: z
        .number({ error: "Le nombre de pièces est requis." })
        .int({ error: "Nombre entier requis." })
        .positive({ error: "Doit être au moins 1." }),
    loyerMensuel: z
        .number({ error: "Le loyer est requis." })
        .positive({ error: "Le loyer doit être positif." }),
    typeCharges: z.enum(TypeCharges, { error: "Le type de charges est requis." }),
    valeurCharges: z
        .number({ error: "La valeur des charges est requise." })
        .nonnegative({ error: "La valeur ne peut pas être négative." }),
    caution: z
        .number({ error: "La caution est requise." })
        .nonnegative({ error: "La caution ne peut pas être négative." }),
    isMeuble: z.boolean().default(false),
    frequencePaiement: z
        .enum(FrequencePaiement, { error: "La fréquence est requise." })
        .default(FrequencePaiement.MENSUEL),
    frequenceAutreTexte: z.string().optional(),
});

// Refinements partagés
function addRefines<T extends z.ZodType<{ typeCharges: TypeCharges; valeurCharges: number; frequencePaiement: FrequencePaiement; frequenceAutreTexte?: string | undefined }>>(schema: T) {
    return schema
        .refine(
            (data) => data.typeCharges !== TypeCharges.POURCENTAGE || data.valeurCharges <= 100,
            {
                error: "Le pourcentage de charges ne peut pas dépasser 100.",
                path: ["valeurCharges"],
            }
        )
        .refine(
            (data) =>
                data.frequencePaiement !== FrequencePaiement.AUTRE ||
                (data.frequenceAutreTexte && data.frequenceAutreTexte.length > 0),
            {
                error: "Précisez la fréquence personnalisée.",
                path: ["frequenceAutreTexte"],
            }
        );
}

// Schema création (avec immeubleId)
export const uniteSchema = addRefines(uniteBaseSchema);
export type UniteFormValues = z.infer<typeof uniteSchema>;

// Schema mise à jour (sans immeubleId — on omet sur l'objet de base avant les refine)
export const uniteUpdateSchema = addRefines(uniteBaseSchema.omit({ immeubleId: true }));
export type UniteUpdateFormValues = z.infer<typeof uniteUpdateSchema>;
