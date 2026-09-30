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
import { ImmeubleForm } from "@/features/properties/components/ImmeubleForm";
import { ImmeublesTable } from "@/features/properties/components/ImmeublesTable";
import type { ImmeubleDTO, ProprietaireOptionDTO } from "@/features/properties/types/property.types";

type ImmeublesPanelProps = {
    immeubles: readonly ImmeubleDTO[];
    proprietaireOptions: readonly ProprietaireOptionDTO[];
};

export function ImmeublesPanel({ immeubles, proprietaireOptions }: ImmeublesPanelProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    function handleSuccess() {
        setOpen(false);
        router.refresh();
    }

    const hasProprietaires = proprietaireOptions.length > 0;

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-6">
                <CardTitle className="text-base font-semibold text-foreground">
                    Immeubles
                </CardTitle>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        render={
                            <Button
                                size="sm"
                                disabled={!hasProprietaires}
                                className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            />
                        }
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter
                    </DialogTrigger>

                    <DialogContent className="max-w-lg rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Nouvel immeuble</DialogTitle>
                        </DialogHeader>

                        <ImmeubleForm proprietaireOptions={proprietaireOptions} onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="px-6">
                {!hasProprietaires && (
                    <p className="mb-3 text-sm text-amber-600">
                        Ajoutez d&apos;abord un propriétaire pour pouvoir créer un immeuble.
                    </p>
                )}

                <ImmeublesTable immeubles={immeubles} proprietaireOptions={proprietaireOptions} />
            </CardContent>
        </Card>
    );
}
