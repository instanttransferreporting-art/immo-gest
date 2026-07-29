import type { NiveauRelance } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const RELANCE_SELECT = {
    id: true,
    echeanceId: true,
    niveau: true,
    dateEnvoi: true,
    details: true,
} as const;

const ECHEANCE_CONTEXT_SELECT = {
    id: true,
    dateEcheance: true,
    soldeRestant: true,
    contrat: {
        select: {
            unite: {
                select: { numero: true, immeuble: { select: { nom: true } } },
            },
            locataire: {
                select: { nom: true, prenom: true, raisonSociale: true, email: true },
            },
        },
    },
    factures: {
        select: { numero: true },
        orderBy: { dateEmission: "desc" as const },
        take: 1,
    },
} as const;

export class RelanceRepository {
    static async findEcheanceContext(echeanceId: string, organizationId: string) {
        return prisma.echeanceLoyer.findFirst({
            where: { id: echeanceId, organizationId },
            select: ECHEANCE_CONTEXT_SELECT,
        });
    }

    static async findAllByEcheance(echeanceId: string, organizationId: string) {
        return prisma.relance.findMany({
            where: { echeanceId, organizationId },
            select: RELANCE_SELECT,
            orderBy: { dateEnvoi: "asc" },
        });
    }

    static async findAllByEcheanceIds(echeanceIds: readonly string[], organizationId: string) {
        if (echeanceIds.length === 0) {
            return [];
        }

        return prisma.relance.findMany({
            where: { echeanceId: { in: [...echeanceIds] }, organizationId },
            select: RELANCE_SELECT,
            orderBy: { dateEnvoi: "asc" },
        });
    }

    static async create(
        organizationId: string,
        data: { echeanceId: string; niveau: NiveauRelance; details?: string }
    ) {
        return prisma.relance.create({
            data: { ...data, organizationId },
            select: RELANCE_SELECT,
        });
    }
}
