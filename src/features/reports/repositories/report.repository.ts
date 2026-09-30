import { StatutBail } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export class ReportRepository {
    static async getLocatairesSummary(organizationId: string) {
        const count = await prisma.locataire.count({ where: { organizationId } });
        return { count, total: null };
    }

    static async getBiensSummary(organizationId: string) {
        const count = await prisma.unite.count({ where: { organizationId } });
        return { count, total: null };
    }

    static async getContratsSummary(organizationId: string, statuts: StatutBail[]) {
        const count = await prisma.contratBail.count({ where: { organizationId, statut: { in: statuts } } });
        return { count, total: null };
    }

    static async getLoyersFacturesSummary(organizationId: string) {
        const [count, aggregate] = await Promise.all([
            prisma.facture.count({ where: { organizationId } }),
            prisma.facture.aggregate({ where: { organizationId }, _sum: { totalDu: true } }),
        ]);

        return { count, total: aggregate._sum.totalDu ?? 0 };
    }

    static async getLoyersEncaissesSummary(organizationId: string) {
        const [count, aggregate] = await Promise.all([
            prisma.paiement.count({ where: { organizationId, estAnnule: false } }),
            prisma.paiement.aggregate({ where: { organizationId, estAnnule: false }, _sum: { montant: true } }),
        ]);

        return { count, total: aggregate._sum.montant ?? 0 };
    }

    static async getImpayesSummary(organizationId: string) {
        const [count, aggregate] = await Promise.all([
            prisma.facture.count({ where: { organizationId, estSoldee: false } }),
            prisma.facture.aggregate({ where: { organizationId, estSoldee: false }, _sum: { totalDu: true } }),
        ]);

        return { count, total: aggregate._sum.totalDu ?? 0 };
    }

    static async getCautionsSummary(organizationId: string) {
        const [count, aggregate] = await Promise.all([
            prisma.caution.count({ where: { organizationId } }),
            prisma.caution.aggregate({ where: { organizationId }, _sum: { montantInitial: true } }),
        ]);

        return { count, total: aggregate._sum.montantInitial ?? 0 };
    }

    static async getChargesSummary(organizationId: string) {
        const [count, aggregate] = await Promise.all([
            prisma.contratBail.count({ where: { organizationId, statut: StatutBail.ACTIF } }),
            prisma.contratBail.aggregate({
                where: { organizationId, statut: StatutBail.ACTIF },
                _sum: { charges: true },
            }),
        ]);

        return { count, total: aggregate._sum.charges ?? 0 };
    }
}
