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
import { CreateOrganizationForm } from "@/features/platform/components/CreateOrganizationForm";
import { OrganizationsTable } from "@/features/platform/components/OrganizationsTable";
import type { OrganizationSummaryDTO } from "@/features/platform/types/platform.types";

type OrganizationsPanelProps = {
    organizations: readonly OrganizationSummaryDTO[];
};

export function OrganizationsPanel({ organizations }: OrganizationsPanelProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    function handleSuccess() {
        setOpen(false);
        router.refresh();
    }

    return (
        <Card className="rounded-2xl border border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-6">
                <CardTitle className="text-base font-semibold text-slate-900">Entreprises</CardTitle>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        render={
                            <Button size="sm" className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700" />
                        }
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter
                    </DialogTrigger>

                    <DialogContent className="max-w-lg rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Nouvelle entreprise</DialogTitle>
                        </DialogHeader>

                        <CreateOrganizationForm onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="px-6">
                <OrganizationsTable organizations={organizations} />
            </CardContent>
        </Card>
    );
}
