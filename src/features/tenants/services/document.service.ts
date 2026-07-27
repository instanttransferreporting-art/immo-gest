import { uploadFile } from "@/lib/storage";
import { DocumentRepository } from "@/features/tenants/repositories/document.repository";
import type { TypeDocument } from "@/features/tenants/constants/tenant.constants";
import type { DocumentLocataireDTO } from "@/features/tenants/types/tenant.types";

export class DocumentService {
    static async uploadForLocataire(
        locataireId: string,
        typeDocument: TypeDocument,
        file: File
    ): Promise<DocumentLocataireDTO> {
        const extension = file.name.split(".").pop() ?? "bin";
        const path = `locataires/${locataireId}/${typeDocument}-${Date.now()}.${extension}`;
        const cheminFichier = await uploadFile(path, file);

        return DocumentRepository.create({ locataireId, typeDocument, cheminFichier });
    }

    static async listForLocataire(locataireId: string): Promise<DocumentLocataireDTO[]> {
        return DocumentRepository.findByLocataire(locataireId);
    }
}
