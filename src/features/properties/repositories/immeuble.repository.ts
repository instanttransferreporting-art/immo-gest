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
    static async countByReferencePrefix(prefix: string) {
        return prisma.immeuble.count({
            where: { reference: { startsWith: prefix } },
        });
    }

    static async create(data: ImmeubleFormValues & { reference: string }) {
        return prisma.immeuble.create({
            data: {
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

    static async findAll() {
        return prisma.immeuble.findMany({
            select: IMMEUBLE_SELECT,
            orderBy: { createdAt: "desc" },
        });
    }

    static async findById(id: string) {
        return prisma.immeuble.findUnique({
            where: { id },
            select: IMMEUBLE_SELECT,
        });
    }

    static async findAllOptions() {
        return prisma.immeuble.findMany({
            select: { id: true, nom: true },
            orderBy: { nom: "asc" },
        });
    }
}
