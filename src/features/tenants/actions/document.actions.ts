"use server";

import { revalidatePath } from "next/cache";

import { checkPermission } from "@/lib/permissions";
import { DocumentService } from "@/features/tenants/services/document.service";
import { TYPE_DOCUMENT, type TypeDocument } from "@/features/tenants/constants/tenant.constants";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { DocumentLocataireDTO } from "@/features/tenants/types/tenant.types";
import { getI18n } from "@/i18n/server";
import { authErrorMessage } from "@/i18n/action-errors";

const VALID_DOCUMENT_TYPES = Object.values(TYPE_DOCUMENT);

export async function uploadLocataireDocument(formData: FormData): Promise<ActionResponse<DocumentLocataireDTO>> {
    const { t } = await getI18n();

    try {
        await checkPermission("DOCUMENT_UPLOAD");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const locataireId = formData.get("locataireId");
    const typeDocument = formData.get("typeDocument");
    const file = formData.get("file");

    if (typeof locataireId !== "string" || !locataireId) {
        return { success: false, message: t.tenants.documents.tenantRequired };
    }

    if (typeof typeDocument !== "string" || !VALID_DOCUMENT_TYPES.includes(typeDocument as TypeDocument)) {
        return { success: false, message: t.tenants.documents.invalidType };
    }

    if (!(file instanceof File) || file.size === 0) {
        return { success: false, message: t.tenants.documents.fileRequired };
    }

    try {
        const document = await DocumentService.uploadForLocataire(locataireId, typeDocument as TypeDocument, file);

        revalidatePath(ROUTES.TENANTS);

        return {
            success: true,
            message: t.tenants.documents.uploaded,
            data: document,
        };
    } catch (error) {
        console.error("[documents] Échec de l'envoi", error);

        return {
            success: false,
            message: t.tenants.documents.uploadFailed,
        };
    }
}
