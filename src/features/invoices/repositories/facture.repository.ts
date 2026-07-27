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
                        select: { nom: true, prenom: true, raisonSociale: true },
                    },
                },
            },
        },
    },
} as const;

export type FactureRaw = Prisma.FactureGetPayload<{ select: typeof FACTURE_SELECT }>;

export class FactureRepository {
    static async countByNumeroPrefix(prefix: string) {
        return prisma.facture.count({
            where: { numero: { startsWith: prefix } },
        });
    }

    static async findExistingForContratMonth(
        contratId: string,
        monthStart: Date,
        monthEnd: Date,
        client: Prisma.TransactionClient = prisma
    ) {
        return client.facture.findFirst({
            where: {
                echeance: {
                    contratId,
                    dateEcheance: { gte: monthStart, lt: monthEnd },
                },
            },
            select: { id: true },
        });
    }

    static async createEcheanceAndFacture(
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
                numero: data.numero,
                echeanceId: echeance.id,
                montant: montantTotal,
                totalDu: montantTotal,
            },
            select: FACTURE_SELECT,
        });
    }

    static async findAll(): Promise<FactureRaw[]> {
        return prisma.facture.findMany({
            select: FACTURE_SELECT,
            orderBy: { dateEmission: "desc" },
        });
    }

    static async findById(id: string, client: Prisma.TransactionClient = prisma): Promise<FactureRaw | null> {
        return client.facture.findUnique({
            where: { id },
            select: FACTURE_SELECT,
        });
    }

    static async updateAfterPayment(
        factureId: string,
        echeanceId: string,
        data: { soldeRestant: number; estPaye: boolean; estSoldee: boolean },
        client: Prisma.TransactionClient = prisma
    ): Promise<FactureRaw> {
        await client.echeanceLoyer.update({
            where: { id: echeanceId },
            data: { soldeRestant: data.soldeRestant, estPaye: data.estPaye },
        });

        return client.facture.update({
            where: { id: factureId },
            data: { estSoldee: data.estSoldee },
            select: FACTURE_SELECT,
        });
    }
}
