import { EtatUnite } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const FACTURE_ALERTE_SELECT = {
    id: true,
    numero: true,
    totalDu: true,
    echeance: {
        select: {
            dateEcheance: true,
            contrat: {
                select: {
                    unite: { select: { numero: true, immeuble: { select: { nom: true } } } },
                    locataire: { select: { nom: true, prenom: true, raisonSociale: true } },
                },
            },
        },
    },
} as const;

const INCIDENT_ALERTE_SELECT = {
    id: true,
    titre: true,
    priorite: true,
    dateSignalement: true,
    unite: { select: { numero: true, immeuble: { select: { nom: true } } } },
    immeuble: { select: { nom: true } },
} as const;

export class DashboardRepository {
    static async getUniteCounts(organizationId: string): Promise<{ total: number; occupees: number }> {
        const [total, occupees] = await Promise.all([
            prisma.unite.count({ where: { organizationId } }),
            prisma.unite.count({ where: { organizationId, etat: EtatUnite.OCCUPE } }),
        ]);

        return { total, occupees };
    }

    static async getImpayes(
        organizationId: string,
        start: Date,
        end: Date
    ): Promise<{ total: number; count: number }> {
        const result = await prisma.facture.aggregate({
            where: {
                organizationId,
                estSoldee: false,
                paiements: { none: { estAnnule: false } },
                echeance: { dateEcheance: { gte: start, lt: end } },
            },
            _sum: { totalDu: true },
            _count: true,
        });

        return { total: result._sum.totalDu ?? 0, count: result._count };
    }

    static async getRevenuEncaisse(organizationId: string, start: Date, end: Date): Promise<number> {
        const result = await prisma.paiement.aggregate({
            where: { organizationId, estAnnule: false, datePaiement: { gte: start, lt: end } },
            _sum: { montant: true },
        });

        return result._sum.montant ?? 0;
    }

    static async findFacturesImpayeesUrgentes(organizationId: string, limit: number) {
        return prisma.facture.findMany({
            where: {
                organizationId,
                estSoldee: false,
                paiements: { none: { estAnnule: false } },
            },
            select: FACTURE_ALERTE_SELECT,
            orderBy: { echeance: { dateEcheance: "asc" } },
            take: limit,
        });
    }

    static async findIncidentsNonResolus(organizationId: string, limit: number) {
        return prisma.incident.findMany({
            where: { organizationId, statut: { in: ["NOUVEAU", "EN_COURS"] } },
            select: INCIDENT_ALERTE_SELECT,
            orderBy: { dateSignalement: "desc" },
            take: limit,
        });
    }
}
