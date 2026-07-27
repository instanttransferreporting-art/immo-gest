import { prisma } from "@/lib/prisma";

export class UserRepository {
    static async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                role: true,
                isActive: true,
                passwordHash: true,
            },
        });
    }
}
