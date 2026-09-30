"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { LocataireForm } from "@/features/tenants/components/LocataireForm";
import { LocatairesTable } from "@/features/tenants/components/LocatairesTable";
import { DocumentUploadForm } from "@/features/tenants/components/DocumentUploadForm";
import type { LocataireDTO } from "@/features/tenants/types/tenant.types";

type LocatairesPanelProps = {
    locataires: readonly LocataireDTO[];
};

export function LocatairesPanel({ locataires }: LocatairesPanelProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [createdLocataire, setCreatedLocataire] = useState<LocataireDTO | null>(null);

    function handleOpenChange(next: boolean) {
        setOpen(next);
        if (!next) {
            setCreatedLocataire(null);
            router.refresh();
        }
    }

    function handleFinish() {
        setOpen(false);
        setCreatedLocataire(null);
        router.refresh();
    }

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-6">
                <CardTitle className="text-base font-semibold text-foreground">Locataires</CardTitle>

                <Dialog open={open} onOpenChange={handleOpenChange}>
                    <DialogTrigger
                        render={
                            <Button
                                size="sm"
                                className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            />
                        }
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter
                    </DialogTrigger>

                    <DialogContent className="max-w-xl rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {createdLocataire ? "Documents du locataire" : "Nouveau locataire"}
                            </DialogTitle>
                        </DialogHeader>

                        {createdLocataire ? (
                            <div className="space-y-4">
                                <DocumentUploadForm locataireId={createdLocataire.id} />
                                <Button
                                    type="button"
                                    onClick={handleFinish}
                                    className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                    Terminer
                                </Button>
                            </div>
                        ) : (
                            <LocataireForm onSuccess={setCreatedLocataire} />
                        )}
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="px-6">
                <LocatairesTable locataires={locataires} />
            </CardContent>
        </Card>
    );
}
