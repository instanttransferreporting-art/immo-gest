import type { TypeDocumentContrat } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const DOCUMENT_SELECT = {
    id: true,
    contratId: true,
    type: true,
    nomFichier: true,
    createdAt: true,
} as const;

export class DocumentContratRepository {
    static async create(data: {
        organizationId: string;
        contratId: string;
        type: TypeDocumentContrat;
        nomFichier: string;
        cheminFichier: string;
    }) {
        return prisma.documentContrat.create({ data, select: DOCUMENT_SELECT });
    }

    static async findByContrat(contratId: string, organizationId: string) {
        return prisma.documentContrat.findMany({
            where: { contratId, organizationId },
            select: DOCUMENT_SELECT,
            orderBy: { createdAt: "desc" },
        });
    }

    static async findPathById(id: string, organizationId: string) {
        return prisma.documentContrat.findFirst({
            where: { id, organizationId },
            select: { cheminFichier: true, nomFichier: true },
        });
    }
}
