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
import { CreateUserForm } from "@/features/users/components/CreateUserForm";
import { UsersTable } from "@/features/users/components/UsersTable";
import type { TeamMemberDTO } from "@/features/users/types/user.types";

type UsersPanelProps = {
    users: readonly TeamMemberDTO[];
    currentUserId: string;
};

export function UsersPanel({ users, currentUserId }: UsersPanelProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    function handleSuccess() {
        setOpen(false);
        router.refresh();
    }

    return (
        <Card className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-6">
                <CardTitle className="text-base font-semibold text-foreground">Équipe</CardTitle>

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
                            <DialogTitle>Nouvel utilisateur</DialogTitle>
                        </DialogHeader>

                        <CreateUserForm onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="px-6">
                <UsersTable users={users} currentUserId={currentUserId} />
            </CardContent>
        </Card>
    );
}
