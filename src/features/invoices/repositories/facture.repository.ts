import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const FACTURE_SELECT = {
    id: true,
    numero: true,
    montant: true,
    penalites: true,
    totalDu: true,
    dateEmission: true,
    estSoldee: true,
    avisEnvoye: true,
    avisEnvoyeAt: true,
    echeance: {
        select: {
            id: true,
            contratId: true,
            dateEcheance: true,
            montantLoyer: true,
            montantCharges: true,
            montantTotal: true,
            soldeRestant: true,
            contrat: {
                select: {
                    id: true,
                    numeroContrat: true,
                    unite: {
                        select: { numero: true, immeuble: { select: { nom: true } } },
                    },
                    locataire: {
                        select: { nom: true, prenom: true, raisonSociale: true, email: true },
                    },
                },
            },
        },
    },
} as const;

export type FactureRaw = Prisma.FactureGetPayload<{ select: typeof FACTURE_SELECT }>;

export class FactureRepository {
    static async countByNumeroPrefix(organizationId: string, prefix: string) {
        return prisma.facture.count({
            where: { organizationId, numero: { startsWith: prefix } },
        });
    }

    static async findExistingForContratMonth(
        organizationId: string,
        contratId: string,
        monthStart: Date,
        monthEnd: Date,
        client: Prisma.TransactionClient = prisma
    ) {
        return client.facture.findFirst({
            where: {
                organizationId,
                echeance: {
                    contratId,
                    dateEcheance: { gte: monthStart, lt: monthEnd },
                },
            },
            select: { id: true },
        });
    }

    static async createEcheanceAndFacture(
        organizationId: string,
        data: {
            contratId: string;
            dateEcheance: Date;
            montantLoyer: number;
            montantCharges: number;
            numero: string;
        },
        client: Prisma.TransactionClient = prisma
    ): Promise<FactureRaw> {
        const montantTotal = data.montantLoyer + data.montantCharges;

        const echeance = await client.echeanceLoyer.create({
            data: {
                organizationId,
                contratId: data.contratId,
                dateEcheance: data.dateEcheance,
                montantLoyer: data.montantLoyer,
                montantCharges: data.montantCharges,
                montantTotal,
                soldeRestant: montantTotal,
            },
        });

        return client.facture.create({
            data: {
                organizationId,
                numero: data.numero,
                echeanceId: echeance.id,
                montant: montantTotal,
                totalDu: montantTotal,
            },
            select: FACTURE_SELECT,
        });
    }

    static async findAll(organizationId: string): Promise<FactureRaw[]> {
        return prisma.facture.findMany({
            where: { organizationId },
            select: FACTURE_SELECT,
            orderBy: { dateEmission: "desc" },
        });
    }

    static async findImpayes(organizationId: string): Promise<FactureRaw[]> {
        return prisma.facture.findMany({
            where: {
                organizationId,
                estSoldee: false,
                echeance: { dateEcheance: { lt: new Date() } },
            },
            select: FACTURE_SELECT,
            orderBy: { echeance: { dateEcheance: "asc" } },
        });
    }

    static async findById(
        id: string,
        organizationId: string,
        client: Prisma.TransactionClient = prisma
    ): Promise<FactureRaw | null> {
        return client.facture.findFirst({
            where: { id, organizationId },
            select: FACTURE_SELECT,
        });
    }

    static async updateAfterPayment(
        factureId: string,
        echeanceId: string,
        organizationId: string,
        data: { soldeRestant: number; estPaye: boolean; estSoldee: boolean },
        client: Prisma.TransactionClient = prisma
    ): Promise<FactureRaw | null> {
        await client.echeanceLoyer.updateMany({
            where: { id: echeanceId, organizationId },
            data: { soldeRestant: data.soldeRestant, estPaye: data.estPaye },
        });

        await client.facture.updateMany({
            where: { id: factureId, organizationId },
            data: { estSoldee: data.estSoldee },
        });

        return FactureRepository.findById(factureId, organizationId, client);
    }

    static async markAvisEnvoye(factureId: string, organizationId: string): Promise<void> {
        await prisma.facture.updateMany({
            where: { id: factureId, organizationId },
            data: { avisEnvoye: true, avisEnvoyeAt: new Date() },
        });
    }
}
