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
import { ContratForm } from "@/features/leases/components/ContratForm";
import { ContratsTable } from "@/features/leases/components/ContratsTable";
import type { ContratDTO, LocataireOptionDTO, UniteLibreOptionDTO } from "@/features/leases/types/lease.types";

type LeasesPanelProps = {
    contrats: readonly ContratDTO[];
    uniteOptions: readonly UniteLibreOptionDTO[];
    locataireOptions: readonly LocataireOptionDTO[];
};

export function LeasesPanel({ contrats, uniteOptions, locataireOptions }: LeasesPanelProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    function handleSuccess() {
        setOpen(false);
        router.refresh();
    }

    const canCreate = uniteOptions.length > 0 && locataireOptions.length > 0;

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-6">
                <CardTitle className="text-base font-semibold text-foreground">Contrats</CardTitle>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        render={
                            <Button
                                size="sm"
                                disabled={!canCreate}
                                className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            />
                        }
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter
                    </DialogTrigger>

                    <DialogContent className="max-w-lg rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Nouveau contrat de bail</DialogTitle>
                        </DialogHeader>

                        <ContratForm
                            uniteOptions={uniteOptions}
                            locataireOptions={locataireOptions}
                            onSuccess={handleSuccess}
                        />
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="px-6">
                {!canCreate && (
                    <p className="mb-3 text-sm text-amber-600">
                        {uniteOptions.length === 0
                            ? "Aucune unité libre disponible. Libérez ou ajoutez une unité pour créer un contrat."
                            : "Ajoutez d'abord un locataire pour pouvoir créer un contrat."}
                    </p>
                )}

                <ContratsTable contrats={contrats} />
            </CardContent>
        </Card>
    );
}
