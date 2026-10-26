"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2, KeyRound, MoreVertical, Pencil, UserCog } from "lucide-react";

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
import { setUserActive } from "@/features/users/actions/user.actions";
import { EditUserForm } from "@/features/users/components/EditUserForm";
import { ResetPasswordForm } from "@/features/users/components/ResetPasswordForm";
import type { TeamMemberDTO } from "@/features/users/types/user.types";
import { useI18n } from "@/i18n/client";

type UsersTableProps = {
    users: readonly TeamMemberDTO[];
    currentUserId: string;
};

export function UsersTable({ users, currentUserId }: UsersTableProps) {
    const { t, f } = useI18n();

    const router = useRouter();
    const [editingUser, setEditingUser] = useState<TeamMemberDTO | null>(null);
    const [resettingUser, setResettingUser] = useState<TeamMemberDTO | null>(null);
    const [pendingId, setPendingId] = useState<string | null>(null);

    async function handleToggleActive(user: TeamMemberDTO) {
        setPendingId(user.id);
        const result = await setUserActive(user.id, !user.isActive);
        setPendingId(null);

        if (!result.success) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({ title: result.message, type: "success" });
        router.refresh();
    }

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                <UserCog className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">{t.admin.users.empty}</p>
                <p className="text-sm text-muted-foreground">{t.admin.users.emptyHint}</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted hover:bg-muted">
                            <TableHead>{t.common.name}</TableHead>
                            <TableHead>{t.common.email}</TableHead>
                            <TableHead>{t.common.role}</TableHead>
                            <TableHead>{t.common.status}</TableHead>
                            <TableHead>{t.admin.users.createdAt}</TableHead>
                            <TableHead className="text-right">{t.common.actions}</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {users.map((user) => {
                            const isSelf = user.id === currentUserId;

                            return (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium text-foreground">
                                        {user.prenom} {user.nom}
                                        {isSelf && <span className="ml-2 text-xs text-muted-foreground">{t.common.you}</span>}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                    <TableCell className="text-muted-foreground">{t.enums.role[user.role]}</TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                user.isActive
                                                    ? "rounded-lg bg-brand-50 text-brand-700"
                                                    : "rounded-lg bg-red-50 text-red-700"
                                            }
                                        >
                                            {user.isActive ? t.common.active : t.admin.users.disabled}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {f.date(user.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger
                                                render={
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        disabled={pendingId === user.id}
                                                        className="h-8 w-8 rounded-lg"
                                                    />
                                                }
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end" className="w-56 rounded-xl">
                                                <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                                    <Pencil className="h-4 w-4" />
                                                    {t.common.edit}
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={() => setResettingUser(user)}>
                                                    <KeyRound className="h-4 w-4" />
                                                    {t.admin.users.resetPassword}
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    disabled={isSelf}
                                                    variant={user.isActive ? "destructive" : undefined}
                                                    onClick={() => handleToggleActive(user)}
                                                >
                                                    {user.isActive ? (
                                                        <>
                                                            <Ban className="h-4 w-4" />
                                                            {t.admin.users.deactivate}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            {t.admin.users.reactivate}
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <Dialog
                open={!!editingUser}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingUser(null);
                    }
                }}
            >
                <DialogContent className="max-w-lg rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>{t.admin.users.edit}</DialogTitle>
                    </DialogHeader>

                    {editingUser && (
                        <EditUserForm
                            user={editingUser}
                            isSelf={editingUser.id === currentUserId}
                            onSuccess={() => {
                                setEditingUser(null);
                                router.refresh();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!resettingUser}
                onOpenChange={(open) => {
                    if (!open) {
                        setResettingUser(null);
                    }
                }}
            >
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>{t.admin.users.resetPassword}</DialogTitle>
                    </DialogHeader>

                    {resettingUser && (
                        <ResetPasswordForm user={resettingUser} onSuccess={() => setResettingUser(null)} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
