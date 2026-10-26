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
import { useI18n } from "@/i18n/client";

type OrganizationsPanelProps = {
    organizations: readonly OrganizationSummaryDTO[];
};

export function OrganizationsPanel({ organizations }: OrganizationsPanelProps) {
    const { t } = useI18n();

    const router = useRouter();
    const [open, setOpen] = useState(false);

    function handleSuccess() {
        setOpen(false);
        router.refresh();
    }

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-6">
                <CardTitle className="text-base font-semibold text-foreground">{t.admin.platform.companies}</CardTitle>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        render={
                            <Button size="sm" className="rounded-lg bg-brand-600 text-white hover:bg-brand-700" />
                        }
                    >
                        <Plus className="h-4 w-4" />
                        {t.common.add}
                    </DialogTrigger>

                    <DialogContent className="max-w-lg rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>{t.admin.platform.newCompany}</DialogTitle>
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
