"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { updateUser } from "@/features/users/actions/user.actions";
import { RoleSelect } from "@/features/users/components/RoleSelect";
import { updateUserSchema, type UpdateUserFormValues } from "@/features/users/schemas/user.schema";
import type { AssignableRole } from "@/features/users/constants/user.constants";
import type { TeamMemberDTO } from "@/features/users/types/user.types";

type EditUserFormProps = {
    user: TeamMemberDTO;
    isSelf: boolean;
    onSuccess?: () => void;
};

export function EditUserForm({ user, isSelf, onSuccess }: EditUserFormProps) {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<UpdateUserFormValues>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: { prenom: user.prenom, nom: user.nom, role: user.role as AssignableRole },
    });

    async function onSubmit(values: UpdateUserFormValues) {
        const result = await updateUser(user.id, values);

        if (!result.success) {
            toast.add({ title: result.message, type: "error" });

            if (result.errors) {
                for (const [field, messages] of Object.entries(result.errors)) {
                    setError(field as keyof UpdateUserFormValues, { message: messages[0] });
                }
            }

            return;
        }

        toast.add({ title: result.message, type: "success" });
        onSuccess?.();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <p className="text-sm text-muted-foreground">{user.email}</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="edit-prenom" className="text-sm font-medium text-foreground">
                        Prénom
                    </label>
                    <Input
                        id="edit-prenom"
                        className={cn("h-10 rounded-xl", errors.prenom && "border-red-500")}
                        {...register("prenom")}
                    />
                    {errors.prenom && <p className="animate-pulse text-sm text-red-500">{errors.prenom.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="edit-nom" className="text-sm font-medium text-foreground">
                        Nom
                    </label>
                    <Input
                        id="edit-nom"
                        className={cn("h-10 rounded-xl", errors.nom && "border-red-500")}
                        {...register("nom")}
                    />
                    {errors.nom && <p className="animate-pulse text-sm text-red-500">{errors.nom.message}</p>}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="edit-role" className="text-sm font-medium text-foreground">
                        Rôle
                    </label>
                    {/* readOnly-like : un <select disabled> ne serait pas soumis par react-hook-form */}
                    <RoleSelect
                        id="edit-role"
                        invalid={!!errors.role}
                        className={cn(isSelf && "pointer-events-none opacity-50")}
                        aria-disabled={isSelf}
                        tabIndex={isSelf ? -1 : undefined}
                        {...register("role")}
                    />
                    {isSelf && (
                        <p className="text-xs text-muted-foreground">Vous ne pouvez pas modifier votre propre rôle.</p>
                    )}
                    {errors.role && <p className="animate-pulse text-sm text-red-500">{errors.role.message}</p>}
                </div>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
            </Button>
        </form>
    );
}
