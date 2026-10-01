import { RoleType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const TEAM_MEMBER_SELECT = {
    id: true,
    nom: true,
    prenom: true,
    email: true,
    role: true,
    isActive: true,
    createdAt: true,
} as const;

/**
 * Accès aux comptes utilisateurs d'une entreprise. Toutes les requêtes sont
 * scopées par `organizationId` — un ADMIN ne voit ni ne modifie jamais un compte
 * d'une autre entreprise, ni un SUPER_ADMIN.
 */
export class UserManagementRepository {
    static async findAllByOrganization(organizationId: string) {
        return prisma.user.findMany({
            where: { organizationId, role: { not: RoleType.SUPER_ADMIN } },
            select: TEAM_MEMBER_SELECT,
            orderBy: [{ isActive: "desc" }, { nom: "asc" }, { prenom: "asc" }],
        });
    }

    static async findByIdInOrganization(id: string, organizationId: string) {
        return prisma.user.findFirst({
            where: { id, organizationId, role: { not: RoleType.SUPER_ADMIN } },
            select: TEAM_MEMBER_SELECT,
        });
    }

    static async countActiveAdmins(organizationId: string): Promise<number> {
        return prisma.user.count({
            where: { organizationId, role: RoleType.ADMIN, isActive: true },
        });
    }

    static async update(id: string, data: { nom?: string; prenom?: string; role?: RoleType; isActive?: boolean }) {
        return prisma.user.update({
            where: { id },
            data,
            select: TEAM_MEMBER_SELECT,
        });
    }

    static async updatePasswordHash(id: string, passwordHash: string) {
        return prisma.user.update({
            where: { id },
            data: { passwordHash },
            select: TEAM_MEMBER_SELECT,
        });
    }
}
