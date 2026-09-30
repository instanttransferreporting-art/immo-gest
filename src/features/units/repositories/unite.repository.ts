import type { Prisma } from "@/generated/prisma/client";
import { EtatUnite } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { UniteFormValues, UniteUpdateFormValues } from "@/features/units/schemas/unit.schema";

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
    isMeuble: true,
    frequencePaiement: true,
    frequenceAutreTexte: true,
    createdAt: true,
} as const;

const UNITE_LIBRE_OPTION_SELECT = {
    id: true,
    numero: true,
    loyerMensuel: true,
    caution: true,
    isMeuble: true,
    frequencePaiement: true,
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

const UNITE_EXPORT_SELECT = {
    id: true,
    numero: true,
    type: true,
    surface: true,
    nombrePieces: true,
    loyerMensuel: true,
    typeCharges: true,
    valeurCharges: true,
    caution: true,
    etat: true,
    isMeuble: true,
    immeuble: {
        select: { id: true, nom: true, ville: true },
    },
} as const;

export class UniteRepository {
    static async create(organizationId: string, data: UniteFormValues) {
        return prisma.unite.create({
            data: { ...data, organizationId },
            select: UNITE_SELECT,
        });
    }

    static async update(id: string, organizationId: string, data: UniteUpdateFormValues) {
        return prisma.unite.updateMany({
            where: { id, organizationId },
            data: {
                numero: data.numero,
                type: data.type,
                surface: data.surface,
                nombrePieces: data.nombrePieces,
                loyerMensuel: data.loyerMensuel,
                typeCharges: data.typeCharges,
                valeurCharges: data.valeurCharges,
                caution: data.caution,
                isMeuble: data.isMeuble,
                frequencePaiement: data.frequencePaiement,
                frequenceAutreTexte: data.frequenceAutreTexte ?? null,
            },
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

    static async findAllForExport(organizationId: string) {
        return prisma.unite.findMany({
            where: { organizationId },
            select: UNITE_EXPORT_SELECT,
            orderBy: [{ immeuble: { nom: "asc" } }, { numero: "asc" }],
        });
    }

    static async findAllWithImmeubleAndEtat(organizationId: string) {
        return prisma.unite.findMany({
            where: { organizationId },
            select: {
                id: true,
                etat: true,
                loyerMensuel: true,
                immeubleId: true,
                immeuble: { select: { id: true, nom: true, valeurEstimative: true } },
            },
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
