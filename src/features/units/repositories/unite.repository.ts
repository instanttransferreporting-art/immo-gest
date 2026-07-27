import type { Prisma } from "@/generated/prisma/client";
import { EtatUnite } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { UniteFormValues } from "@/features/units/schemas/unit.schema";

const UNITE_SELECT = {
    id: true,
    immeubleId: true,
    numero: true,
    type: true,
    surface: true,
    nombrePieces: true,
    loyerMensuel: true,
    typeCharges: true,
    valeurCharges: true,
    caution: true,
    etat: true,
    createdAt: true,
} as const;

const UNITE_LIBRE_OPTION_SELECT = {
    id: true,
    numero: true,
    loyerMensuel: true,
    caution: true,
    immeuble: {
        select: { id: true, nom: true },
    },
} as const;

export class UniteRepository {
    static async create(data: UniteFormValues) {
        return prisma.unite.create({
            data,
            select: UNITE_SELECT,
        });
    }

    static async findByImmeuble(immeubleId: string) {
        return prisma.unite.findMany({
            where: { immeubleId },
            select: UNITE_SELECT,
            orderBy: { numero: "asc" },
        });
    }

    static async findById(id: string, client: Prisma.TransactionClient = prisma) {
        return client.unite.findUnique({
            where: { id },
            select: UNITE_SELECT,
        });
    }

    static async findAllLibreOptions() {
        return prisma.unite.findMany({
            where: { etat: EtatUnite.LIBRE },
            select: UNITE_LIBRE_OPTION_SELECT,
            orderBy: { numero: "asc" },
        });
    }

    static async updateEtat(id: string, etat: EtatUnite, client: Prisma.TransactionClient = prisma) {
        return client.unite.update({
            where: { id },
            data: { etat },
            select: UNITE_SELECT,
        });
    }
}
