import { prisma } from "@/lib/prisma";

const REVERSEMENT_SELECT = {
    id: true,
    proprietaireId: true,
    mois: true,
    annee: true,
    totalEncaisse: true,
    tauxCommission: true,
    commission: true,
    netAPayer: true,
    statut: true,
    dateGeneration: true,
    dateValidation: true,
    proprietaire: {
        select: { id: true, nom: true, prenom: true },
    },
} as const;

export class ReversementRepository {
    static async sumEncaisseForProprietaireMonth(
        organizationId: string,
        proprietaireId: string,
        monthStart: Date,
        monthEnd: Date
    ): Promise<number> {
        const factures = await prisma.facture.findMany({
            where: {
                organizationId,
                echeance: {
                    dateEcheance: { gte: monthStart, lt: monthEnd },
                    contrat: {
                        unite: {
                            immeuble: { proprietaireId },
                        },
                    },
                },
            },
            select: {
                totalDu: true,
                echeance: { select: { soldeRestant: true } },
            },
        });

        return factures.reduce((sum, facture) => sum + (facture.totalDu - facture.echeance.soldeRestant), 0);
    }

    static async findFacturesEncaisseesForProprietaireMonth(
        organizationId: string,
        proprietaireId: string,
        monthStart: Date,
        monthEnd: Date
    ) {
        return prisma.facture.findMany({
            where: {
                organizationId,
                echeance: {
                    dateEcheance: { gte: monthStart, lt: monthEnd },
                    contrat: {
                        unite: {
                            immeuble: { proprietaireId },
                        },
                    },
                },
            },
            select: {
                id: true,
                numero: true,
                totalDu: true,
                echeance: {
                    select: {
                        soldeRestant: true,
                        dateEcheance: true,
                        contrat: {
                            select: {
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
            },
            orderBy: { echeance: { dateEcheance: "asc" } },
        });
    }

    static async findExisting(organizationId: string, proprietaireId: string, mois: number, annee: number) {
        return prisma.reversement.findFirst({
            where: { organizationId, proprietaireId, mois, annee },
            select: { id: true },
        });
    }

    static async create(
        organizationId: string,
        data: {
            proprietaireId: string;
            mois: number;
            annee: number;
            totalEncaisse: number;
            tauxCommission: number;
            commission: number;
            netAPayer: number;
        }
    ) {
        return prisma.reversement.create({
            data: { ...data, organizationId },
            select: REVERSEMENT_SELECT,
        });
    }

    static async findById(id: string, organizationId: string) {
        return prisma.reversement.findFirst({
            where: { id, organizationId },
            select: REVERSEMENT_SELECT,
        });
    }

    static async markValide(id: string, organizationId: string) {
        await prisma.reversement.updateMany({
            where: { id, organizationId },
            data: { statut: "VALIDE", dateValidation: new Date() },
        });

        return ReversementRepository.findById(id, organizationId);
    }

    static async findByProprietaire(proprietaireId: string, organizationId: string) {
        return prisma.reversement.findMany({
            where: { proprietaireId, organizationId },
            select: REVERSEMENT_SELECT,
            orderBy: [{ annee: "desc" }, { mois: "desc" }],
        });
    }
}
