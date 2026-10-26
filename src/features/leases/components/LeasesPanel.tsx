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
import { useI18n } from "@/i18n/client";

type LeasesPanelProps = {
    contrats: readonly ContratDTO[];
    uniteOptions: readonly UniteLibreOptionDTO[];
    locataireOptions: readonly LocataireOptionDTO[];
};

export function LeasesPanel({ contrats, uniteOptions, locataireOptions }: LeasesPanelProps) {
    const { t } = useI18n();

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
                <CardTitle className="text-base font-semibold text-foreground">{t.leases.listTitle}</CardTitle>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        render={
                            <Button
                                size="sm"
                                disabled={!canCreate}
                                className="rounded-lg bg-brand-600 text-white hover:bg-brand-700"
                            />
                        }
                    >
                        <Plus className="h-4 w-4" />
                        {t.common.add}
                    </DialogTrigger>

                    <DialogContent className="max-w-lg rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>{t.leases.new}</DialogTitle>
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
                            ? t.leases.noFreeUnit
                            : t.leases.needTenantFirst}
                    </p>
                )}

                <ContratsTable contrats={contrats} />
            </CardContent>
        </Card>
    );
}
