"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { TypeDocumentContrat } from "@/generated/prisma/enums";
import {
    getDocumentContratUrl,
    uploadDocumentContrat,
} from "@/features/leases/actions/document-contrat.actions";
import {
    DOCUMENT_CONTRAT_ALLOWED_EXTENSIONS,
    TYPE_DOCUMENT_CONTRAT_HINTS,
    TYPE_DOCUMENT_CONTRAT_LABELS,
} from "@/features/leases/constants/document-contrat.constants";
import type { DocumentContratDTO } from "@/features/leases/types/document-contrat.types";

type DocumentsContratPanelProps = {
    contratId: string;
    documents: readonly DocumentContratDTO[];
    /** Bail de l'année suivante attendu (entrée en cours d'année). */
    avecContratSuivant: boolean;
};

const TYPES = [
    TypeDocumentContrat.CONTRAT_SIGNE,
    TypeDocumentContrat.CONTRAT_SIGNE_SUIVANT,
    TypeDocumentContrat.ETAT_LIEUX_ENTREE,
    TypeDocumentContrat.ETAT_LIEUX_SORTIE,
] as const;

const ACCEPT = DOCUMENT_CONTRAT_ALLOWED_EXTENSIONS.map((extension) => `.${extension}`).join(",");

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export function DocumentsContratPanel({ contratId, documents, avecContratSuivant }: DocumentsContratPanelProps) {
    const router = useRouter();
    const [pending, setPending] = useState<string | null>(null);
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    async function handleUpload(type: TypeDocumentContrat, file: File | undefined) {
        if (!file) {
            return;
        }

        setPending(type);

        const formData = new FormData();
        formData.set("contratId", contratId);
        formData.set("type", type);
        formData.set("file", file);

        try {
            const result = await uploadDocumentContrat(formData);

            toast.add({ title: result.message, type: result.success ? "success" : "error" });

            if (result.success) {
                router.refresh();
            }
        } catch {
            toast.add({ title: "Le téléversement a échoué. Vérifiez la taille du fichier (10 Mo max).", type: "error" });
        } finally {
            setPending(null);

            const input = inputRefs.current[type];
            if (input) {
                input.value = "";
            }
        }
    }

    async function handleDownload(documentId: string) {
        setPending(documentId);

        try {
            const result = await getDocumentContratUrl(documentId);

            if (!result.success || !result.data) {
                toast.add({ title: result.message, type: "error" });
                return;
            }

            window.location.href = result.data;
        } finally {
            setPending(null);
        }
    }

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="px-6">
                <CardTitle className="text-base font-semibold text-foreground">Documents du bail</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5 px-6 pb-6">
                {TYPES.filter(
                    (type) =>
                        type !== TypeDocumentContrat.CONTRAT_SIGNE_SUIVANT ||
                        avecContratSuivant ||
                        documents.some((document) => document.type === type)
                ).map((type) => {
                    const files = documents.filter((document) => document.type === type);

                    return (
                        <section key={type} className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {TYPE_DOCUMENT_CONTRAT_LABELS[type]}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{TYPE_DOCUMENT_CONTRAT_HINTS[type]}</p>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg"
                                    disabled={pending !== null}
                                    onClick={() => inputRefs.current[type]?.click()}
                                >
                                    {pending === type ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <UploadCloud className="h-4 w-4" />
                                    )}
                                    Téléverser
                                </Button>

                                <input
                                    ref={(element) => {
                                        inputRefs.current[type] = element;
                                    }}
                                    type="file"
                                    accept={ACCEPT}
                                    className="hidden"
                                    onChange={(event) => handleUpload(type, event.target.files?.[0])}
                                />
                            </div>

                            {files.length === 0 ? (
                                <p className="text-xs italic text-muted-foreground">Aucun document.</p>
                            ) : (
                                <ul className="space-y-1">
                                    {files.map((document) => (
                                        <li
                                            key={document.id}
                                            className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-sm"
                                        >
                                            <span className="min-w-0 truncate">
                                                {document.nomFichier}
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    {dateFormatter.format(document.createdAt)}
                                                </span>
                                            </span>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="shrink-0"
                                                aria-label={`Télécharger ${document.nomFichier}`}
                                                disabled={pending !== null}
                                                onClick={() => handleDownload(document.id)}
                                            >
                                                {pending === document.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Download className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    );
                })}
            </CardContent>
        </Card>
    );
}
