"use server";

import { revalidatePath } from "next/cache";

import { getCurrentSession } from "@/lib/auth";
import { DocumentService } from "@/features/tenants/services/document.service";
import { TYPE_DOCUMENT, type TypeDocument } from "@/features/tenants/constants/tenant.constants";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { DocumentLocataireDTO } from "@/features/tenants/types/tenant.types";

const VALID_DOCUMENT_TYPES = Object.values(TYPE_DOCUMENT);

export async function uploadLocataireDocument(formData: FormData): Promise<ActionResponse<DocumentLocataireDTO>> {
    const session = await getCurrentSession();

    if (!session) {
        return { success: false, message: "Vous devez être connecté pour effectuer cette action." };
    }

    const locataireId = formData.get("locataireId");
    const typeDocument = formData.get("typeDocument");
    const file = formData.get("file");

    if (typeof locataireId !== "string" || !locataireId) {
        return { success: false, message: "Le locataire est requis." };
    }

    if (typeof typeDocument !== "string" || !VALID_DOCUMENT_TYPES.includes(typeDocument as TypeDocument)) {
        return { success: false, message: "Le type de document est invalide." };
    }

    if (!(file instanceof File) || file.size === 0) {
        return { success: false, message: "Veuillez sélectionner un fichier." };
    }

    try {
        const document = await DocumentService.uploadForLocataire(locataireId, typeDocument as TypeDocument, file);

        revalidatePath(ROUTES.TENANTS);

        return {
            success: true,
            message: "Document téléversé avec succès.",
            data: document,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Une erreur est survenue lors de l'upload.",
        };
    }
}
