import { prisma } from "@/lib/prisma";
import type { ProprietaireFormValues } from "@/features/properties/schemas/property.schema";

const PROPRIETAIRE_SELECT = {
    id: true,
    nom: true,
    prenom: true,
    adresse: true,
    ville: true,
    tauxCommission: true,
    createdAt: true,
    telephones: {
        select: { id: true, numero: true, estPrincipal: true },
    },
    emails: {
        select: { id: true, email: true, estPrincipal: true },
    },
} as const;

export class ProprietaireRepository {
    static async create(organizationId: string, data: ProprietaireFormValues) {
        return prisma.proprietaire.create({
            data: {
                organizationId,
                nom: data.nom,
                prenom: data.prenom,
                adresse: data.adresse,
                ville: data.ville,
                tauxCommission: data.tauxCommission,
                telephones: {
                    create: data.telephones.map((telephone) => ({
                        numero: telephone.numero,
                        estPrincipal: telephone.estPrincipal,
                    })),
                },
                emails: {
                    create: data.emails.map((email) => ({
                        email: email.email,
                        estPrincipal: email.estPrincipal,
                    })),
                },
            },
            select: PROPRIETAIRE_SELECT,
        });
    }

    static async findById(id: string, organizationId: string) {
        return prisma.proprietaire.findFirst({
            where: { id, organizationId },
            select: PROPRIETAIRE_SELECT,
        });
    }

    static async findAll(organizationId: string) {
        return prisma.proprietaire.findMany({
            where: { organizationId },
            select: PROPRIETAIRE_SELECT,
            orderBy: { createdAt: "desc" },
        });
    }

    static async findAllOptions(organizationId: string) {
        return prisma.proprietaire.findMany({
            where: { organizationId },
            select: { id: true, nom: true, prenom: true },
            orderBy: { nom: "asc" },
        });
    }
}
