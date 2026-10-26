"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeftRight, Ban, Building2, CheckCircle2, MoreVertical, Pencil } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { EditOrganizationForm } from "@/features/platform/components/EditOrganizationForm";
import { setOrganizationActive, startImpersonation } from "@/features/platform/actions/platform.actions";
import { ROUTES } from "@/constants/routes";
import type { OrganizationSummaryDTO } from "@/features/platform/types/platform.types";
import { useI18n } from "@/i18n/client";

type OrganizationsTableProps = {
    organizations: readonly OrganizationSummaryDTO[];
};

export function OrganizationsTable({ organizations }: OrganizationsTableProps) {
    const { t, f } = useI18n();

    const router = useRouter();
    const { update } = useSession();
    const [editingOrganization, setEditingOrganization] = useState<OrganizationSummaryDTO | null>(null);
    const [pendingId, setPendingId] = useState<string | null>(null);

    async function handleImpersonate(organization: OrganizationSummaryDTO) {
        setPendingId(organization.id);
        const result = await startImpersonation(organization.id);
        setPendingId(null);

        if (!result.success || !result.data) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        await update({
            impersonatedOrganizationId: result.data.organizationId,
            impersonatedOrganizationNom: result.data.organizationNom,
        });
        router.push(ROUTES.DASHBOARD);
        router.refresh();
    }

    async function handleToggleActive(organization: OrganizationSummaryDTO) {
        setPendingId(organization.id);
        const result = await setOrganizationActive(organization.id, !organization.isActive);
        setPendingId(null);

        if (!result.success) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({ title: result.message, type: "success" });
        router.refresh();
    }

    if (organizations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">{t.admin.platform.empty}</p>
                <p className="text-sm text-muted-foreground">{t.admin.platform.emptyHint}</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted hover:bg-muted">
                            <TableHead>{t.common.name}</TableHead>
                            <TableHead>{t.common.city}</TableHead>
                            <TableHead>{t.common.status}</TableHead>
                            <TableHead>{t.admin.platform.buildings}</TableHead>
                            <TableHead>{t.admin.platform.users}</TableHead>
                            <TableHead>{t.common.createdAtFeminine}</TableHead>
                            <TableHead className="text-right">{t.common.actions}</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {organizations.map((organization) => (
                            <TableRow key={organization.id}>
                                <TableCell className="font-medium text-foreground">{organization.nom}</TableCell>
                                <TableCell className="text-muted-foreground">{organization.ville ?? "—"}</TableCell>
                                <TableCell>
                                    <Badge
                                        className={
                                            organization.isActive
                                                ? "rounded-lg bg-brand-50 text-brand-700"
                                                : "rounded-lg bg-red-50 text-red-700"
                                        }
                                    >
                                        {organization.isActive ? t.common.activeFeminine : t.common.suspended}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{organization.totalImmeubles}</TableCell>
                                <TableCell className="text-muted-foreground">{organization.totalUsers}</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {f.date(organization.createdAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger
                                            render={
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    disabled={pendingId === organization.id}
                                                    className="h-8 w-8 rounded-lg"
                                                />
                                            }
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end" className="w-56 rounded-xl">
                                            <DropdownMenuItem
                                                disabled={!organization.isActive}
                                                onClick={() => handleImpersonate(organization)}
                                            >
                                                <ArrowLeftRight className="h-4 w-4" />
                                                {t.admin.platform.switchTo}
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={() => setEditingOrganization(organization)}>
                                                <Pencil className="h-4 w-4" />
                                                {t.admin.platform.editOrganization}
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                variant={organization.isActive ? "destructive" : undefined}
                                                onClick={() => handleToggleActive(organization)}
                                            >
                                                {organization.isActive ? (
                                                    <>
                                                        <Ban className="h-4 w-4" />
                                                        {t.admin.platform.suspend}
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        {t.admin.platform.reactivate}
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog
                open={!!editingOrganization}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingOrganization(null);
                    }
                }}
            >
                <DialogContent className="max-w-lg rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>{t.admin.platform.editCompany}</DialogTitle>
                    </DialogHeader>

                    {editingOrganization && (
                        <EditOrganizationForm
                            organization={editingOrganization}
                            onSuccess={() => {
                                setEditingOrganization(null);
                                router.refresh();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
