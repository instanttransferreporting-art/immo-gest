import type { Prisma } from "@/generated/prisma/client";
import type { RoleType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const USER_SELECT = {
    id: true,
    organizationId: true,
    email: true,
    nom: true,
    prenom: true,
    role: true,
    isActive: true,
} as const;

export class UserRepository {
    static async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
            select: {
                ...USER_SELECT,
                passwordHash: true,
                organization: { select: { isActive: true } },
            },
        });
    }

    static async findSessionStateById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                organizationId: true,
                role: true,
                isActive: true,
                organization: { select: { isActive: true } },
            },
        });
    }

    static async create(
        data: {
            organizationId: string;
            nom: string;
            prenom: string;
            email: string;
            passwordHash: string;
            role: RoleType;
        },
        client: Prisma.TransactionClient = prisma
    ) {
        return client.user.create({
            data,
            select: USER_SELECT,
        });
    }
}
