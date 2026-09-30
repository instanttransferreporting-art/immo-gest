import type { Prisma } from "@/generated/prisma/client";
import { RoleType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const ORGANIZATION_SUMMARY_SELECT = {
    id: true,
    nom: true,
    logo: true,
    tauxCommissionDefaut: true,
    tauxPenaliteRetard: true,
    adresse: true,
    ville: true,
    telephone: true,
    email: true,
    createdAt: true,
    isActive: true,
    _count: { select: { immeubles: true, users: true } },
} as const;

export class PlatformRepository {
    static async countOrganizations(): Promise<number> {
        return prisma.organization.count();
    }

    static async countImmeubles(): Promise<number> {
        return prisma.immeuble.count();
    }

    static async countUnites(): Promise<number> {
        return prisma.unite.count();
    }

    static async countUsers(): Promise<number> {
        return prisma.user.count({ where: { role: { not: RoleType.SUPER_ADMIN } } });
    }

    static async findAllOrganizations() {
        return prisma.organization.findMany({
            select: ORGANIZATION_SUMMARY_SELECT,
            orderBy: { createdAt: "desc" },
        });
    }

    static async createOrganization(
        data: { nom: string; tauxCommissionDefaut: number },
        client: Prisma.TransactionClient = prisma
    ) {
        return client.organization.create({
            data,
            select: { id: true, nom: true, ville: true, createdAt: true },
        });
    }
}
