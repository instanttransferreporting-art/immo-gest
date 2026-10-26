"use server";

import { revalidatePath } from "next/cache";

import { effectiveOrganizationId } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { AuditService } from "@/lib/audit";
import { TypeDocumentContrat } from "@/generated/prisma/enums";
import {
    DocumentContratInvalideError,
    DocumentContratNotFoundError,
    DocumentContratService,
} from "@/features/leases/services/document-contrat.service";
import { DOCUMENT_CONTRAT_ALLOWED_EXTENSIONS } from "@/features/leases/constants/document-contrat.constants";
import { TYPE_DOCUMENT_CONTRAT_LABELS } from "@/features/leases/constants/document-contrat.constants";
import { ROUTES } from "@/constants/routes";
import type { ActionResponse } from "@/types/action-response.types";
import type { DocumentContratDTO } from "@/features/leases/types/document-contrat.types";
import { getI18n } from "@/i18n/server";
import { authErrorMessage } from "@/i18n/action-errors";

const VALID_TYPES: readonly string[] = Object.values(TypeDocumentContrat);

export async function uploadDocumentContrat(formData: FormData): Promise<ActionResponse<DocumentContratDTO>> {
    const { t } = await getI18n();

    let user;

    try {
        user = await checkPermission("DOCUMENT_UPLOAD");
    } catch (error) {
        const authMessage = await authErrorMessage(error);

        if (authMessage) {
            return { success: false, message: authMessage };
        }

        throw error;
    }

    const contratId = formData.get("contratId");
    const type = formData.get("type");
    const file = formData.get("file");

    if (typeof contratId !== "string" || !contratId) {
        return { success: false, message: t.leases.documents.leaseRequired };
    }

    if (typeof type !== "string" || !VALID_TYPES.includes(type)) {
        return { success: false, message: t.leases.documents.invalidType };
    }

    if (!(file instanceof File) || file.size === 0) {
        return { success: false, message: t.leases.documents.fileRequired };
    }

    try {
        const document = await DocumentContratService.upload(contratId, type as TypeDocumentContrat, file);

        AuditService.log({
            organizationId: effectiveOrganizationId(user),
            userId: user.id,
            action: "CONTRAT_DOCUMENT_UPLOAD",
            details: `${TYPE_DOCUMENT_CONTRAT_LABELS[document.type]} téléversé (${document.nomFichier}).`,
        });

        revalidatePath(`${ROUTES.LEASES}/${contratId}`);

        return { success: true, message: t.leases.documents.uploaded, data: document };
    } catch (error) {
        if (error instanceof DocumentContratInvalideError) {
            return {
                success: false,
                message:
                    error.code === "format"
                        ? t.leases.documents.invalidFormat(DOCUMENT_CONTRAT_ALLOWED_EXTENSIONS.join(", "))
                        : t.leases.documents.fileTooLarge,
            };
        }

        // Erreurs de stockage (ex : Supabase non configuré) : détail technique en log, message générique à l'écran.
        console.error("[documents-contrat] Échec de l'envoi", error);

        return { success: false, message: t.leases.documents.uploadFailed };
    }
}

export async function getDocumentContratUrl(documentId: string): Promise<ActionResponse<string>> {
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

    try {
        const url = await DocumentContratService.getDownloadUrl(documentId);
        return { success: true, message: "OK", data: url };
    } catch (error) {
        if (error instanceof DocumentContratNotFoundError) {
            return { success: false, message: t.leases.documents.notFound };
        }

        console.error("[documents-contrat] Lien de téléchargement", error);

        return { success: false, message: t.leases.documents.linkFailed };
    }
}
