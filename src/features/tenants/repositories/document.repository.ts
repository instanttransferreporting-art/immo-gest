import { prisma } from "@/lib/prisma";

const DOCUMENT_SELECT = {
    id: true,
    locataireId: true,
    typeDocument: true,
    cheminFichier: true,
    createdAt: true,
} as const;

export class DocumentRepository {
    static async create(data: { locataireId: string; typeDocument: string; cheminFichier: string }) {
        return prisma.documentLocataire.create({
            data,
            select: DOCUMENT_SELECT,
        });
    }

    static async findByLocataire(locataireId: string) {
        return prisma.documentLocataire.findMany({
            where: { locataireId },
            select: DOCUMENT_SELECT,
            orderBy: { createdAt: "desc" },
        });
    }
}
