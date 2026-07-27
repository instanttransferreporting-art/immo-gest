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
    enregistrePar: {
        select: { nom: true, prenom: true },
    },
} as const;

export class PaiementRepository {
    static async create(
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
            data,
            select: PAIEMENT_SELECT,
        });
    }

    static async findByFacture(factureId: string) {
        return prisma.paiement.findMany({
            where: { factureId, estAnnule: false },
            select: PAIEMENT_SELECT,
            orderBy: { datePaiement: "asc" },
        });
    }
}
