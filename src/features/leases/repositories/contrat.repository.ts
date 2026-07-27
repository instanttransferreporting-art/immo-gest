import type { Prisma } from "@/generated/prisma/client";
import { StatutBail } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { ContratFormValues } from "@/features/leases/schemas/lease.schema";

const CONTRAT_SELECT = {
    id: true,
    numeroContrat: true,
    uniteId: true,
    locataireId: true,
    dateDebut: true,
    dateFin: true,
    loyerBase: true,
    charges: true,
    depotGarantie: true,
    frequence: true,
    statut: true,
    createdAt: true,
    unite: {
        select: {
            id: true,
            numero: true,
            immeuble: { select: { id: true, nom: true } },
        },
    },
    locataire: {
        select: { id: true, nom: true, prenom: true, raisonSociale: true },
    },
} as const;

export class ContratRepository {
    static async countByNumeroPrefix(prefix: string) {
        return prisma.contratBail.count({
            where: { numeroContrat: { startsWith: prefix } },
        });
    }

    static async create(
        data: ContratFormValues & { numeroContrat: string },
        client: Prisma.TransactionClient = prisma
    ) {
        return client.contratBail.create({
            data: {
                numeroContrat: data.numeroContrat,
                uniteId: data.uniteId,
                locataireId: data.locataireId,
                dateDebut: data.dateDebut,
                dateFin: data.dateFin,
                loyerBase: data.loyerBase,
                charges: data.charges,
                depotGarantie: data.depotGarantie,
                frequence: data.frequence,
            },
            select: CONTRAT_SELECT,
        });
    }

    static async findAll() {
        return prisma.contratBail.findMany({
            select: CONTRAT_SELECT,
            orderBy: { createdAt: "desc" },
        });
    }

    static async findById(id: string) {
        return prisma.contratBail.findUnique({
            where: { id },
            select: CONTRAT_SELECT,
        });
    }

    static async findAllActive() {
        return prisma.contratBail.findMany({
            where: { statut: StatutBail.ACTIF },
            select: CONTRAT_SELECT,
            orderBy: { createdAt: "desc" },
        });
    }
}
