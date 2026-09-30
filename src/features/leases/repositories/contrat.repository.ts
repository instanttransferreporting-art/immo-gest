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
    nombreNuitees: true,
    statut: true,
    motifResiliation: true,
    createdAt: true,
    unite: {
        select: {
            id: true,
            numero: true,
            isMeuble: true,
            frequencePaiement: true,
            immeuble: { select: { id: true, nom: true } },
        },
    },
    locataire: {
        select: { id: true, nom: true, prenom: true, raisonSociale: true },
    },
} as const;

const CONTRAT_EXPORT_SELECT = {
    id: true,
    numeroContrat: true,
    dateDebut: true,
    dateFin: true,
    loyerBase: true,
    charges: true,
    depotGarantie: true,
    frequence: true,
    nombreNuitees: true,
    statut: true,
    unite: {
        select: {
            numero: true,
            type: true,
            isMeuble: true,
            immeuble: {
                select: {
                    nom: true,
                    adresse: true,
                    ville: true,
                    proprietaire: { select: { nom: true, prenom: true } },
                },
            },
        },
    },
    locataire: {
        select: {
            nom: true,
            prenom: true,
            raisonSociale: true,
            telephone: true,
            email: true,
            pieceIdentite: true,
        },
    },
} as const;

export class ContratRepository {
    static async countByNumeroPrefix(organizationId: string, prefix: string) {
        return prisma.contratBail.count({
            where: { organizationId, numeroContrat: { startsWith: prefix } },
        });
    }

    static async create(
        organizationId: string,
        data: ContratFormValues & { numeroContrat: string },
        client: Prisma.TransactionClient = prisma
    ) {
        return client.contratBail.create({
            data: {
                organizationId,
                numeroContrat: data.numeroContrat,
                uniteId: data.uniteId,
                locataireId: data.locataireId,
                dateDebut: data.dateDebut,
                dateFin: data.dateFin,
                loyerBase: data.loyerBase,
                charges: data.charges,
                depotGarantie: data.depotGarantie,
                frequence: data.frequence,
                nombreNuitees: data.nombreNuitees ?? null,
            },
            select: CONTRAT_SELECT,
        });
    }

    static async findAll(organizationId: string) {
        return prisma.contratBail.findMany({
            where: { organizationId },
            select: CONTRAT_SELECT,
            orderBy: { createdAt: "desc" },
        });
    }

    static async findById(id: string, organizationId: string, client: Prisma.TransactionClient = prisma) {
        return client.contratBail.findFirst({
            where: { id, organizationId },
            select: CONTRAT_SELECT,
        });
    }

    static async findAllActive(organizationId: string) {
        return prisma.contratBail.findMany({
            where: { organizationId, statut: StatutBail.ACTIF },
            select: CONTRAT_SELECT,
            orderBy: { createdAt: "desc" },
        });
    }

    static async findByIdForExport(id: string, organizationId: string) {
        return prisma.contratBail.findFirst({
            where: { id, organizationId },
            select: CONTRAT_EXPORT_SELECT,
        });
    }

    static async findAllActiveForExport(organizationId: string) {
        return prisma.contratBail.findMany({
            where: { organizationId, statut: StatutBail.ACTIF },
            select: CONTRAT_EXPORT_SELECT,
            orderBy: { createdAt: "desc" },
        });
    }

    static async updateResiliation(
        id: string,
        organizationId: string,
        data: { dateFin: Date; motifResiliation?: string },
        client: Prisma.TransactionClient = prisma
    ) {
        await client.contratBail.updateMany({
            where: { id, organizationId, statut: StatutBail.ACTIF },
            data: {
                statut: StatutBail.RESILIE,
                dateFin: data.dateFin,
                motifResiliation: data.motifResiliation,
            },
        });

        return client.contratBail.findFirst({
            where: { id, organizationId },
            select: CONTRAT_SELECT,
        });
    }

    static async updateStatut(
        id: string,
        organizationId: string,
        statutActuel: StatutBail,
        nouveauStatut: StatutBail,
        client: Prisma.TransactionClient = prisma
    ) {
        await client.contratBail.updateMany({
            where: { id, organizationId, statut: statutActuel },
            data: { statut: nouveauStatut },
        });

        return client.contratBail.findFirst({
            where: { id, organizationId },
            select: CONTRAT_SELECT,
        });
    }
}
