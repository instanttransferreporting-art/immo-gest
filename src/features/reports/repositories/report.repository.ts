import { StatutBail } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { prismaDateRange, prismaOverlapWhere, type ReportPeriod } from "@/features/reports/period";

/**
 * Chaque rapport filtre la période sur la date qui a un sens métier pour lui
 * (cf. `periodBasis` dans REPORT_DEFINITIONS) — les exports Excel appliquent
 * exactement les mêmes règles dans report-export.service.ts.
 */
export class ReportRepository {
    static async getLocatairesSummary(organizationId: string, period: ReportPeriod) {
        const count = await prisma.locataire.count({
            where: { organizationId, createdAt: prismaDateRange(period) },
        });
        return { count, total: null };
    }

    /** Instantané du parc : non filtré par la période. */
    static async getBiensSummary(organizationId: string) {
        const count = await prisma.unite.count({ where: { organizationId } });
        return { count, total: null };
    }

    static async getContratsActifsSummary(organizationId: string, period: ReportPeriod) {
        const count = await prisma.contratBail.count({
            where: { organizationId, statut: StatutBail.ACTIF, ...prismaOverlapWhere(period) },
        });
        return { count, total: null };
    }

    static async getContratsExpiresSummary(organizationId: string, statuts: StatutBail[], period: ReportPeriod) {
        const count = await prisma.contratBail.count({
            where: { organizationId, statut: { in: statuts }, dateFin: prismaDateRange(period) },
        });
        return { count, total: null };
    }

    static async getLoyersFacturesSummary(organizationId: string, period: ReportPeriod) {
        const where = { organizationId, echeance: { dateEcheance: prismaDateRange(period) } };
        const [count, aggregate] = await Promise.all([
            prisma.facture.count({ where }),
            prisma.facture.aggregate({ where, _sum: { totalDu: true } }),
        ]);

        return { count, total: aggregate._sum.totalDu ?? 0 };
    }

    static async getLoyersEncaissesSummary(organizationId: string, period: ReportPeriod) {
        const where = { organizationId, estAnnule: false, datePaiement: prismaDateRange(period) };
        const [count, aggregate] = await Promise.all([
            prisma.paiement.count({ where }),
            prisma.paiement.aggregate({ where, _sum: { montant: true } }),
        ]);

        return { count, total: aggregate._sum.montant ?? 0 };
    }

    static async getImpayesSummary(organizationId: string, period: ReportPeriod) {
        const where = { organizationId, estSoldee: false, echeance: { dateEcheance: prismaDateRange(period) } };
        const [count, aggregate] = await Promise.all([
            prisma.facture.count({ where }),
            prisma.facture.aggregate({ where, _sum: { totalDu: true } }),
        ]);

        return { count, total: aggregate._sum.totalDu ?? 0 };
    }

    static async getCautionsSummary(organizationId: string, period: ReportPeriod) {
        const where = { organizationId, createdAt: prismaDateRange(period) };
        const [count, aggregate] = await Promise.all([
            prisma.caution.count({ where }),
            prisma.caution.aggregate({ where, _sum: { montantInitial: true } }),
        ]);

        return { count, total: aggregate._sum.montantInitial ?? 0 };
    }

    static async getChargesSummary(organizationId: string, period: ReportPeriod) {
        const where = { organizationId, statut: StatutBail.ACTIF, ...prismaOverlapWhere(period) };
        const [count, aggregate] = await Promise.all([
            prisma.contratBail.count({ where }),
            prisma.contratBail.aggregate({ where, _sum: { charges: true } }),
        ]);

        return { count, total: aggregate._sum.charges ?? 0 };
    }
}
