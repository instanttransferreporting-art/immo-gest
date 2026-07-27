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
    static async create(data: ProprietaireFormValues) {
        return prisma.proprietaire.create({
            data: {
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

    static async findById(id: string) {
        return prisma.proprietaire.findUnique({
            where: { id },
            select: PROPRIETAIRE_SELECT,
        });
    }

    static async findAll() {
        return prisma.proprietaire.findMany({
            select: PROPRIETAIRE_SELECT,
            orderBy: { createdAt: "desc" },
        });
    }

    static async findAllOptions() {
        return prisma.proprietaire.findMany({
            select: { id: true, nom: true, prenom: true },
            orderBy: { nom: "asc" },
        });
    }
}
