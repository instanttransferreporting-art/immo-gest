import { z } from "zod";

import { PrioriteIncident, StatutIncident } from "@/generated/prisma/enums";

export const incidentSchema = z
    .object({
        titre: z.string().min(1, { error: "Le titre est requis." }),
        description: z.string().min(1, { error: "La description est requise." }),
        priorite: z.enum(PrioriteIncident, { error: "La priorité est requise." }),
        uniteId: z.string().optional(),
        immeubleId: z.string().optional(),
        prestataire: z.string().optional(),
    })
    .refine((data) => !(data.uniteId && data.immeubleId), {
        error: "Choisissez soit une unité, soit un immeuble, pas les deux.",
        path: ["uniteId"],
    });

export type IncidentFormValues = z.infer<typeof incidentSchema>;

export const updateStatutIncidentSchema = z.object({
    incidentId: z.string().min(1, { error: "L'incident est requis." }),
    statut: z.enum(StatutIncident, { error: "Le statut est requis." }),
});

export type UpdateStatutIncidentInput = z.infer<typeof updateStatutIncidentSchema>;

export const assignPrestataireSchema = z.object({
    incidentId: z.string().min(1, { error: "L'incident est requis." }),
    prestataire: z.string().min(1, { error: "Le nom du prestataire est requis." }),
});

export type AssignPrestataireInput = z.infer<typeof assignPrestataireSchema>;
