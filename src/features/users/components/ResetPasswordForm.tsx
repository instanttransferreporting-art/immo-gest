"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { resetUserPassword } from "@/features/users/actions/user.actions";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/features/users/schemas/user.schema";
import type { TeamMemberDTO } from "@/features/users/types/user.types";

type ResetPasswordFormProps = {
    user: TeamMemberDTO;
    onSuccess?: () => void;
};

export function ResetPasswordForm({ user, onSuccess }: ResetPasswordFormProps) {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
    });

    async function onSubmit(values: ResetPasswordFormValues) {
        const result = await resetUserPassword(user.id, values);

        if (!result.success) {
            toast.add({ title: result.message, type: "error" });

            if (result.errors?.password) {
                setError("password", { message: result.errors.password[0] });
            }

            return;
        }

        toast.add({ title: result.message, type: "success" });
        onSuccess?.();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <p className="text-sm text-muted-foreground">
                Nouveau mot de passe pour {user.prenom} {user.nom} ({user.email}).
            </p>

            <div className="space-y-1.5">
                <label htmlFor="reset-password" className="text-sm font-medium text-foreground">
                    Nouveau mot de passe
                </label>
                <Input
                    id="reset-password"
                    type="password"
                    autoComplete="new-password"
                    className={cn("h-10 rounded-xl", errors.password && "border-red-500")}
                    {...register("password")}
                />
                {errors.password && <p className="animate-pulse text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Réinitialiser"}
            </Button>
        </form>
    );
}
