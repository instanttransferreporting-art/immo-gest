import { z } from "zod";

import { PrioriteIncident, StatutIncident } from "@/generated/prisma/enums";
import { V } from "@/i18n/validation-keys";

export const incidentSchema = z
    .object({
        titre: z.string().min(1, { error: V.titleRequired }),
        description: z.string().min(1, { error: V.descriptionRequired }),
        priorite: z.enum(PrioriteIncident, { error: V.priorityRequired }),
        uniteId: z.string().optional(),
        immeubleId: z.string().optional(),
        prestataire: z.string().optional(),
    })
    .refine((data) => !(data.uniteId && data.immeubleId), {
        error: V.unitOrBuilding,
        path: ["uniteId"],
    });

export type IncidentFormValues = z.infer<typeof incidentSchema>;

export const updateStatutIncidentSchema = z.object({
    incidentId: z.string().min(1, { error: V.incidentRequired }),
    statut: z.enum(StatutIncident, { error: V.statusRequired }),
});

export type UpdateStatutIncidentInput = z.infer<typeof updateStatutIncidentSchema>;

export const assignPrestataireSchema = z.object({
    incidentId: z.string().min(1, { error: V.incidentRequired }),
    prestataire: z.string().min(1, { error: V.providerRequired }),
});

export type AssignPrestataireInput = z.infer<typeof assignPrestataireSchema>;
