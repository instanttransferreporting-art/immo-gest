import type { StatutIncident } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { IncidentFormValues } from "@/features/incidents/schemas/incident.schema";

const INCIDENT_SELECT = {
    id: true,
    titre: true,
    description: true,
    priorite: true,
    statut: true,
    prestataire: true,
    dateSignalement: true,
    dateResolution: true,
    unite: {
        select: {
            id: true,
            numero: true,
            immeubleId: true,
            immeuble: { select: { id: true, nom: true } },
        },
    },
    immeuble: {
        select: { id: true, nom: true },
    },
} as const;

export class IncidentRepository {
    static async create(data: IncidentFormValues) {
        return prisma.incident.create({
            data: {
                titre: data.titre,
                description: data.description,
                priorite: data.priorite,
                uniteId: data.uniteId || undefined,
                immeubleId: data.immeubleId || undefined,
                prestataire: data.prestataire || undefined,
            },
            select: INCIDENT_SELECT,
        });
    }

    static async findAll() {
        return prisma.incident.findMany({
            select: INCIDENT_SELECT,
            orderBy: { dateSignalement: "desc" },
        });
    }

    static async updateStatut(id: string, statut: StatutIncident) {
        return prisma.incident.update({
            where: { id },
            data: {
                statut,
                dateResolution: statut === "RESOLU" ? new Date() : null,
            },
            select: INCIDENT_SELECT,
        });
    }

    static async updatePrestataire(id: string, prestataire: string) {
        return prisma.incident.update({
            where: { id },
            data: { prestataire },
            select: INCIDENT_SELECT,
        });
    }
}
