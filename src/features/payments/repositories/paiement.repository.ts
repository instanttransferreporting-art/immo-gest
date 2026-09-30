import type { Prisma } from "@/generated/prisma/client";
import type { ModePaiement } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const PAIEMENT_SELECT = {
    id: true,
    factureId: true,
    echeanceId: true,
    userId: true,
    mode: true,
    montant: true,
    reference: true,
    datePaiement: true,
    estAnnule: true,
    motifAnnulation: true,
    dateAnnulation: true,
    enregistrePar: {
        select: { nom: true, prenom: true },
    },
} as const;

export class PaiementRepository {
    static async create(
        organizationId: string,
        data: {
            factureId: string;
            echeanceId: string;
            userId: string;
            mode: ModePaiement;
            montant: number;
            reference?: string;
        },
        client: Prisma.TransactionClient = prisma
    ) {
        return client.paiement.create({
            data: { ...data, organizationId },
            select: PAIEMENT_SELECT,
        });
    }

    static async findByFacture(factureId: string, organizationId: string) {
        return prisma.paiement.findMany({
            where: { factureId, organizationId, estAnnule: false },
            select: PAIEMENT_SELECT,
            orderBy: { datePaiement: "asc" },
        });
    }

    static async findById(id: string, organizationId: string, client: Prisma.TransactionClient = prisma) {
        return client.paiement.findFirst({
            where: { id, organizationId },
            select: PAIEMENT_SELECT,
        });
    }

    static async annuler(
        id: string,
        organizationId: string,
        data: { motif: string; annuleParId: string },
        client: Prisma.TransactionClient = prisma
    ) {
        await client.paiement.updateMany({
            where: { id, organizationId, estAnnule: false },
            data: {
                estAnnule: true,
                motifAnnulation: data.motif,
                dateAnnulation: new Date(),
                annuleParId: data.annuleParId,
            },
        });

        return PaiementRepository.findById(id, organizationId, client);
    }
}
