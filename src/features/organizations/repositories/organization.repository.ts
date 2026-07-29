import { prisma } from "@/lib/prisma";

const ORGANIZATION_SELECT = {
    id: true,
    nom: true,
    logo: true,
    tauxCommissionDefaut: true,
    adresse: true,
    ville: true,
    telephone: true,
    email: true,
    isActive: true,
    updatedAt: true,
} as const;

export class OrganizationRepository {
    static async findById(id: string) {
        return prisma.organization.findUnique({
            where: { id },
            select: ORGANIZATION_SELECT,
        });
    }

    static async update(
        id: string,
        data: {
            nom: string;
            logo?: string;
            tauxCommissionDefaut: number;
            adresse?: string;
            ville?: string;
            telephone?: string;
            email?: string;
        }
    ) {
        return prisma.organization.update({
            where: { id },
            data,
            select: ORGANIZATION_SELECT,
        });
    }

    static async setActive(id: string, isActive: boolean) {
        return prisma.organization.update({
            where: { id },
            data: { isActive },
            select: ORGANIZATION_SELECT,
        });
    }
}
