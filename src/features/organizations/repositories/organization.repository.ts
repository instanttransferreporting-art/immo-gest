import { prisma } from "@/lib/prisma";

const ORGANIZATION_SELECT = {
    id: true,
    nom: true,
    logo: true,
    logoDocument: true,
    tauxCommissionDefaut: true,
    tauxPenaliteRetard: true,
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
            tauxCommissionDefaut: number;
            tauxPenaliteRetard: number;
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

    static async setLogo(id: string, field: "logo" | "logoDocument", value: string | null) {
        return prisma.organization.update({
            where: { id },
            data: { [field]: value },
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

    static async findAllActiveIds(): Promise<{ id: string }[]> {
        return prisma.organization.findMany({
            where: { isActive: true },
            select: { id: true },
        });
    }
}
