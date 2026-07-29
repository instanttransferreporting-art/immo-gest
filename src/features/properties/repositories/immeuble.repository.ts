import { prisma } from "@/lib/prisma";
import type { ImmeubleFormValues } from "@/features/properties/schemas/property.schema";

const IMMEUBLE_SELECT = {
    id: true,
    reference: true,
    nom: true,
    adresse: true,
    ville: true,
    nombreNiveaux: true,
    nombreLogements: true,
    valeurEstimative: true,
    proprietaireId: true,
    createdAt: true,
    proprietaire: {
        select: { id: true, nom: true, prenom: true },
    },
} as const;

export class ImmeubleRepository {
    static async countByReferencePrefix(organizationId: string, prefix: string) {
        return prisma.immeuble.count({
            where: { organizationId, reference: { startsWith: prefix } },
        });
    }

    static async create(organizationId: string, data: ImmeubleFormValues & { reference: string }) {
        return prisma.immeuble.create({
            data: {
                organizationId,
                reference: data.reference,
                nom: data.nom,
                adresse: data.adresse,
                ville: data.ville,
                nombreNiveaux: data.nombreNiveaux,
                nombreLogements: data.nombreLogements,
                valeurEstimative: data.valeurEstimative,
                proprietaireId: data.proprietaireId,
            },
            select: IMMEUBLE_SELECT,
        });
    }

    static async findAll(organizationId: string) {
        return prisma.immeuble.findMany({
            where: { organizationId },
            select: IMMEUBLE_SELECT,
            orderBy: { createdAt: "desc" },
        });
    }

    static async findById(id: string, organizationId: string) {
        return prisma.immeuble.findFirst({
            where: { id, organizationId },
            select: IMMEUBLE_SELECT,
        });
    }

    static async findAllOptions(organizationId: string) {
        return prisma.immeuble.findMany({
            where: { organizationId },
            select: { id: true, nom: true },
            orderBy: { nom: "asc" },
        });
    }
}
