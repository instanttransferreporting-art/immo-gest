import { getCurrentOrganizationId } from "@/lib/auth";
import { createSignedDownloadUrl, uploadFile } from "@/lib/storage";
import type { TypeDocumentContrat } from "@/generated/prisma/enums";
import { ContratRepository } from "@/features/leases/repositories/contrat.repository";
import { DocumentContratRepository } from "@/features/leases/repositories/document-contrat.repository";
import { ContratNotFoundError } from "@/features/leases/services/contrat.service";
import {
    DOCUMENT_CONTRAT_ALLOWED_EXTENSIONS,
    DOCUMENT_CONTRAT_MAX_SIZE_BYTES,
} from "@/features/leases/constants/document-contrat.constants";
import type { DocumentContratDTO } from "@/features/leases/types/document-contrat.types";

export class DocumentContratInvalideError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DocumentContratInvalideError";
    }
}

export class DocumentContratNotFoundError extends Error {
    constructor() {
        super("Le document est introuvable.");
        this.name = "DocumentContratNotFoundError";
    }
}

export class DocumentContratService {
    static async upload(contratId: string, type: TypeDocumentContrat, file: File): Promise<DocumentContratDTO> {
        const organizationId = await getCurrentOrganizationId();
        const contrat = await ContratRepository.findById(contratId, organizationId);

        if (!contrat) {
            throw new ContratNotFoundError();
        }

        const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

        if (!(DOCUMENT_CONTRAT_ALLOWED_EXTENSIONS as readonly string[]).includes(extension)) {
            throw new DocumentContratInvalideError(
                `Format non accepté. Formats autorisés : ${DOCUMENT_CONTRAT_ALLOWED_EXTENSIONS.join(", ")}.`
            );
        }

        if (file.size > DOCUMENT_CONTRAT_MAX_SIZE_BYTES) {
            throw new DocumentContratInvalideError("Le fichier dépasse la taille maximale de 10 Mo.");
        }

        const path = `contrats/${organizationId}/${contratId}/${type}-${Date.now()}.${extension}`;
        const cheminFichier = await uploadFile(path, file);

        return DocumentContratRepository.create({
            organizationId,
            contratId,
            type,
            nomFichier: file.name,
            cheminFichier,
        });
    }

    static async listByContrat(contratId: string): Promise<DocumentContratDTO[]> {
        const organizationId = await getCurrentOrganizationId();
        return DocumentContratRepository.findByContrat(contratId, organizationId);
    }

    static async getDownloadUrl(documentId: string): Promise<string> {
        const organizationId = await getCurrentOrganizationId();
        const document = await DocumentContratRepository.findPathById(documentId, organizationId);

        if (!document) {
            throw new DocumentContratNotFoundError();
        }

        return createSignedDownloadUrl(document.cheminFichier, document.nomFichier);
    }
}
