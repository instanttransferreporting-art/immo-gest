import { prisma } from "@/lib/prisma";

const AUDIT_LOG_SELECT = {
    id: true,
    action: true,
    details: true,
    createdAt: true,
    user: { select: { nom: true, prenom: true } },
} as const;

const MAX_ENTRIES = 500;

export class AuditRepository {
    static async findAll(organizationId: string) {
        return prisma.auditLog.findMany({
            where: { organizationId },
            select: AUDIT_LOG_SELECT,
            orderBy: { createdAt: "desc" },
            take: MAX_ENTRIES,
        });
    }
}
