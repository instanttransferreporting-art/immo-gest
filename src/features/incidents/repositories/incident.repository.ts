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
    static async create(organizationId: string, data: IncidentFormValues) {
        return prisma.incident.create({
            data: {
                organizationId,
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

    static async findAll(organizationId: string) {
        return prisma.incident.findMany({
            where: { organizationId },
            select: INCIDENT_SELECT,
            orderBy: { dateSignalement: "desc" },
        });
    }

    static async updateStatut(id: string, organizationId: string, statut: StatutIncident) {
        await prisma.incident.updateMany({
            where: { id, organizationId },
            data: {
                statut,
                dateResolution: statut === "RESOLU" ? new Date() : null,
            },
        });

        return prisma.incident.findFirst({ where: { id, organizationId }, select: INCIDENT_SELECT });
    }

    static async updatePrestataire(id: string, organizationId: string, prestataire: string) {
        await prisma.incident.updateMany({
            where: { id, organizationId },
            data: { prestataire },
        });

        return prisma.incident.findFirst({ where: { id, organizationId }, select: INCIDENT_SELECT });
    }
}
