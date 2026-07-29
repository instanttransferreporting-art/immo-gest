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

const UNITE_OPTION_SELECT = {
    id: true,
    numero: true,
    immeuble: {
        select: { id: true, nom: true },
    },
} as const;

export class UniteRepository {
    static async create(organizationId: string, data: UniteFormValues) {
        return prisma.unite.create({
            data: { ...data, organizationId },
            select: UNITE_SELECT,
        });
    }

    static async findByImmeuble(immeubleId: string, organizationId: string) {
        return prisma.unite.findMany({
            where: { immeubleId, organizationId },
            select: UNITE_SELECT,
            orderBy: { numero: "asc" },
        });
    }

    static async findById(id: string, organizationId: string, client: Prisma.TransactionClient = prisma) {
        return client.unite.findFirst({
            where: { id, organizationId },
            select: UNITE_SELECT,
        });
    }

    static async findAllLibreOptions(organizationId: string) {
        return prisma.unite.findMany({
            where: { organizationId, etat: EtatUnite.LIBRE },
            select: UNITE_LIBRE_OPTION_SELECT,
            orderBy: { numero: "asc" },
        });
    }

    static async findAllOptions(organizationId: string) {
        return prisma.unite.findMany({
            where: { organizationId },
            select: UNITE_OPTION_SELECT,
            orderBy: { numero: "asc" },
        });
    }

    static async updateEtat(
        id: string,
        etat: EtatUnite,
        organizationId: string,
        client: Prisma.TransactionClient = prisma
    ) {
        await client.unite.updateMany({
            where: { id, organizationId },
            data: { etat },
        });

        return UniteRepository.findById(id, organizationId, client);
    }
}
