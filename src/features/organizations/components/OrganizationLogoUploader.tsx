"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { OrganizationLogoImage } from "@/features/organizations/components/OrganizationLogoImage";
import {
    LOGO_ACCEPTED_TYPES,
    LOGO_MAX_SIZE_BYTES,
    type LogoKind,
} from "@/features/organizations/schemas/organization.schema";
import type { OrganizationDTO } from "@/features/organizations/types/organization.types";
import type { ActionResponse } from "@/types/action-response.types";

type OrganizationLogoUploaderProps = {
    kind: LogoKind;
    logo: string | null;
    organizationNom: string;
    canEdit: boolean;
    onUpload: (formData: FormData) => Promise<ActionResponse<OrganizationDTO>>;
    onRemove: (kind: LogoKind) => Promise<ActionResponse<OrganizationDTO>>;
};

const KIND_CONTENT: Record<LogoKind, { field: "logo" | "logoDocument"; preview: string; hint: string }> = {
    sidebar: {
        field: "logo",
        preview: "h-24 w-24",
        hint: "Format carré conseillé (icône seule). Affiché dans la barre latérale et les emails envoyés aux locataires.",
    },
    document: {
        field: "logoDocument",
        preview: "h-24 w-full sm:w-72",
        hint: "Format long conseillé (logo + nom, ex. 1200 × 400 px). Affiché en en-tête des factures, quittances, contrats et documents imprimés.",
    },
};

export function OrganizationLogoUploader({
    kind,
    logo: initialLogo,
    organizationNom,
    canEdit,
    onUpload,
    onRemove,
}: OrganizationLogoUploaderProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [logo, setLogo] = useState(initialLogo);
    const [pending, setPending] = useState<"upload" | "remove" | null>(null);
    const content = KIND_CONTENT[kind];

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) {
            return;
        }

        // Contrôle immédiat côté client ; le serveur revalide de toute façon.
        if (!(LOGO_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
            toast.add({ title: "Format non supporté : utilisez PNG, JPEG ou WebP.", type: "error" });
            return;
        }

        if (file.size > LOGO_MAX_SIZE_BYTES) {
            toast.add({ title: "Le logo ne doit pas dépasser 2 Mo.", type: "error" });
            return;
        }

        const formData = new FormData();
        formData.append("logo", file);
        formData.append("kind", kind);

        setPending("upload");
        const result = await onUpload(formData);
        setPending(null);

        if (!result.success || !result.data) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        setLogo(result.data[content.field]);
        toast.add({ title: result.message, type: "success" });
        router.refresh();
    }

    async function handleRemove() {
        setPending("remove");
        const result = await onRemove(kind);
        setPending(null);

        if (!result.success) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        setLogo(null);
        toast.add({ title: result.message, type: "success" });
        router.refresh();
    }

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <OrganizationLogoImage
                logo={logo}
                organizationNom={organizationNom}
                className={content.preview}
                iconClassName="h-8 w-8"
            />

            <div className="space-y-2">
                {canEdit && (
                    <div className="flex flex-wrap gap-2">
                        <input
                            ref={inputRef}
                            type="file"
                            accept={LOGO_ACCEPTED_TYPES.join(",")}
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        <Button
                            type="button"
                            size="sm"
                            disabled={pending !== null}
                            onClick={() => inputRef.current?.click()}
                            className="rounded-lg bg-brand-600 text-white hover:bg-brand-700"
                        >
                            {pending === "upload" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <ImagePlus className="h-4 w-4" />
                            )}
                            {logo ? "Changer le logo" : "Ajouter un logo"}
                        </Button>

                        {logo && (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={pending !== null}
                                onClick={handleRemove}
                                className="rounded-lg"
                            >
                                {pending === "remove" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                                Retirer
                            </Button>
                        )}
                    </div>
                )}

                <p className="text-xs text-muted-foreground">{content.hint}</p>
                <p className="text-xs text-muted-foreground">PNG, JPEG ou WebP, 2 Mo maximum.</p>
            </div>
        </div>
    );
}
