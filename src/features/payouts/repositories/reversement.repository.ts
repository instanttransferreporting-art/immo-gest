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
        proprietaireId: string,
        monthStart: Date,
        monthEnd: Date
    ): Promise<number> {
        const factures = await prisma.facture.findMany({
            where: {
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

    static async findExisting(proprietaireId: string, mois: number, annee: number) {
        return prisma.reversement.findUnique({
            where: { proprietaireId_mois_annee: { proprietaireId, mois, annee } },
            select: { id: true },
        });
    }

    static async create(data: {
        proprietaireId: string;
        mois: number;
        annee: number;
        totalEncaisse: number;
        tauxCommission: number;
        commission: number;
        netAPayer: number;
    }) {
        return prisma.reversement.create({
            data,
            select: REVERSEMENT_SELECT,
        });
    }

    static async findById(id: string) {
        return prisma.reversement.findUnique({
            where: { id },
            select: REVERSEMENT_SELECT,
        });
    }

    static async markValide(id: string) {
        return prisma.reversement.update({
            where: { id },
            data: { statut: "VALIDE", dateValidation: new Date() },
            select: REVERSEMENT_SELECT,
        });
    }

    static async findByProprietaire(proprietaireId: string) {
        return prisma.reversement.findMany({
            where: { proprietaireId },
            select: REVERSEMENT_SELECT,
            orderBy: [{ annee: "desc" }, { mois: "desc" }],
        });
    }
}
