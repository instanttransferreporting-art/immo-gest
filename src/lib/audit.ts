import { prisma } from "@/lib/prisma";

type AuditLogInput = {
    organizationId: string;
    userId: string;
    action: string;
    details?: string;
};

export class AuditService {
    /**
     * Écrit une entrée d'audit de façon non bloquante — ne doit jamais faire
     * échouer l'action appelante. Toujours appelé en fire-and-forget (sans await)
     * depuis les Server Actions, jamais depuis un contexte dépendant de la session.
     */
    static log(input: AuditLogInput): void {
        void prisma.auditLog
            .create({
                data: {
                    organizationId: input.organizationId,
                    userId: input.userId,
                    action: input.action,
                    details: input.details,
                },
            })
            .catch((error) => {
                console.error(`[audit] Échec de l'écriture du journal (action=${input.action})`, error);
            });
    }
}
