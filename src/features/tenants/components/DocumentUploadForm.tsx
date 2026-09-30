"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { uploadLocataireDocument } from "@/features/tenants/actions/document.actions";
import { TYPE_DOCUMENT, TYPE_DOCUMENT_LABELS } from "@/features/tenants/constants/tenant.constants";

type DocumentUploadFormProps = {
    locataireId: string;
};

const UPLOADABLE_TYPES = [TYPE_DOCUMENT.CNI, TYPE_DOCUMENT.PHOTO] as const;

export function DocumentUploadForm({ locataireId }: DocumentUploadFormProps) {
    const [pendingType, setPendingType] = useState<string | null>(null);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    async function handleFileChange(typeDocument: string, file: File | undefined) {
        if (!file) {
            return;
        }

        setPendingType(typeDocument);

        const formData = new FormData();
        formData.set("locataireId", locataireId);
        formData.set("typeDocument", typeDocument);
        formData.set("file", file);

        const result = await uploadLocataireDocument(formData);

        toast.add({ title: result.message, type: result.success ? "success" : "error" });
        setPendingType(null);

        const input = fileInputRefs.current[typeDocument];
        if (input) {
            input.value = "";
        }
    }

    return (
        <div className="space-y-3 rounded-xl border border-dashed border-border p-4">
            <p className="text-sm font-medium text-foreground">Pièces jointes (optionnel)</p>

            {UPLOADABLE_TYPES.map((typeDocument) => (
                <div key={typeDocument} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">{TYPE_DOCUMENT_LABELS[typeDocument]}</span>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pendingType === typeDocument}
                        className="rounded-lg"
                        onClick={() => fileInputRefs.current[typeDocument]?.click()}
                    >
                        <UploadCloud className="h-4 w-4" />
                        {pendingType === typeDocument ? "Envoi..." : "Téléverser"}
                    </Button>

                    <input
                        ref={(el) => {
                            fileInputRefs.current[typeDocument] = el;
                        }}
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(event) => handleFileChange(typeDocument, event.target.files?.[0])}
                    />
                </div>
            ))}
        </div>
    );
}
