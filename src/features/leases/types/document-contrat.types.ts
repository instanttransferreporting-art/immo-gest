import type { TypeDocumentContrat } from "@/generated/prisma/enums";

export type DocumentContratDTO = Readonly<{
    id: string;
    contratId: string;
    type: TypeDocumentContrat;
    nomFichier: string;
    createdAt: Date;
}>;
