"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ProprietaireForm } from "@/features/properties/components/ProprietaireForm";
import type { ProprietaireDTO } from "@/features/properties/types/property.types";

type ProprietairesPanelProps = {
    proprietaires: readonly ProprietaireDTO[];
};

export function ProprietairesPanel({ proprietaires }: ProprietairesPanelProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    function handleSuccess() {
        setOpen(false);
        router.refresh();
    }

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-6">
                <CardTitle className="text-base font-semibold text-foreground">
                    Propriétaires
                </CardTitle>

                <Dialog open={open} onOpenChange={setOpen}>
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

                    <DialogContent className="max-w-lg rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Nouveau propriétaire</DialogTitle>
                        </DialogHeader>

                        <ProprietaireForm onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="px-6">
                {proprietaires.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Aucun propriétaire enregistré</p>
                        <p className="text-sm text-muted-foreground">Ajoutez un propriétaire pour pouvoir créer un immeuble.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-border">
                        {proprietaires.map((proprietaire) => (
                            <li key={proprietaire.id} className="flex items-center justify-between py-3">
                                <div>
                                    <Link
                                        href={`/proprietaires/${proprietaire.id}/bilan`}
                                        className="text-sm font-medium text-foreground hover:text-emerald-700 hover:underline"
                                    >
                                        {`${proprietaire.nom} ${proprietaire.prenom ?? ""}`.trim()}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">{proprietaire.ville}</p>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    {proprietaire.telephones.length} tél. · {proprietaire.emails.length} email(s)
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
