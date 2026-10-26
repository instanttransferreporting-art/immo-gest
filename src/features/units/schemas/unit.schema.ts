import { z } from "zod";

import { FrequencePaiement, TypeCharges, TypeUnite } from "@/generated/prisma/enums";
import { V } from "@/i18n/validation-keys";

// Schéma objet de base (sans refine) pour pouvoir utiliser .omit()
const uniteBaseSchema = z.object({
    immeubleId: z.string().min(1, { error: V.buildingRequired }),
    numero: z.string().min(1, { error: V.phoneNumberRequired }),
    type: z.enum(TypeUnite, { error: V.unitTypeRequired }),
    surface: z.number({ error: V.surfaceRequired }).positive({ error: V.surfacePositive }),
    nombrePieces: z
        .number({ error: V.roomsRequired })
        .int({ error: V.integerRequired })
        .positive({ error: V.atLeastOne }),
    loyerMensuel: z
        .number({ error: V.rentRequired })
        .positive({ error: V.rentPositive }),
    typeCharges: z.enum(TypeCharges, { error: V.chargesTypeRequired }),
    valeurCharges: z
        .number({ error: V.chargesValueRequired })
        .nonnegative({ error: V.valueNonNegative }),
    caution: z
        .number({ error: V.depositRequired })
        .nonnegative({ error: V.depositNonNegative }),
    isMeuble: z.boolean().default(false),
    frequencePaiement: z
        .enum(FrequencePaiement, { error: V.frequencyRequired })
        .default(FrequencePaiement.MENSUEL),
    frequenceAutreTexte: z.string().optional(),
});

// Refinements partagés
function addRefines<T extends z.ZodType<{ typeCharges: TypeCharges; valeurCharges: number; frequencePaiement: FrequencePaiement; frequenceAutreTexte?: string | undefined }>>(schema: T) {
    return schema
        .refine(
            (data) => data.typeCharges !== TypeCharges.POURCENTAGE || data.valeurCharges <= 100,
            {
                error: V.chargesPercentMax,
                path: ["valeurCharges"],
            }
        )
        .refine(
            (data) =>
                data.frequencePaiement !== FrequencePaiement.AUTRE ||
                (data.frequenceAutreTexte && data.frequenceAutreTexte.length > 0),
            {
                error: V.customFrequencyRequired,
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
