import type { Prisma } from "@/generated/prisma/client";
import type { StatutCaution } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const CAUTION_SELECT = {
    id: true,
    contratId: true,
    montantInitial: true,
    montantRetenu: true,
    montantRendu: true,
    statut: true,
    dateRestitution: true,
    notes: true,
    createdAt: true,
} as const;

const CAUTION_EXPORT_SELECT = {
    id: true,
    montantInitial: true,
    montantRetenu: true,
    montantRendu: true,
    statut: true,
    dateRestitution: true,
    createdAt: true,
    contrat: {
        select: {
            numeroContrat: true,
            unite: { select: { numero: true, immeuble: { select: { nom: true } } } },
            locataire: { select: { nom: true, prenom: true, raisonSociale: true } },
        },
    },
} as const;

export class CautionRepository {
    static async create(
        organizationId: string,
        data: { contratId: string; montantInitial: number },
        client: Prisma.TransactionClient = prisma
    ) {
        return client.caution.create({
            data: { ...data, organizationId },
            select: CAUTION_SELECT,
        });
    }

    static async findByContrat(contratId: string, organizationId: string) {
        return prisma.caution.findFirst({
            where: { contratId, organizationId },
            select: CAUTION_SELECT,
        });
    }

    static async findById(id: string, organizationId: string, client: Prisma.TransactionClient = prisma) {
        return client.caution.findFirst({
            where: { id, organizationId },
            select: CAUTION_SELECT,
        });
    }

    static async findAllForExport(organizationId: string) {
        return prisma.caution.findMany({
            where: { organizationId },
            select: CAUTION_EXPORT_SELECT,
            orderBy: { createdAt: "desc" },
        });
    }

    static async updateRestitution(
        id: string,
        organizationId: string,
        data: {
            montantRendu: number;
            montantRetenu: number;
            statut: StatutCaution;
            notes?: string;
        },
        client: Prisma.TransactionClient = prisma
    ) {
        await client.caution.updateMany({
            where: { id, organizationId },
            data: {
                montantRendu: data.montantRendu,
                montantRetenu: data.montantRetenu,
                statut: data.statut,
                notes: data.notes,
                dateRestitution: new Date(),
            },
        });

        return CautionRepository.findById(id, organizationId, client);
    }
}
