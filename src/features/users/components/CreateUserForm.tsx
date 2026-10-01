"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { createUser } from "@/features/users/actions/user.actions";
import { RoleSelect } from "@/features/users/components/RoleSelect";
import { createUserSchema, type CreateUserFormValues } from "@/features/users/schemas/user.schema";
import { RoleType } from "@/generated/prisma/enums";

type CreateUserFormProps = {
    onSuccess?: () => void;
};

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: { role: RoleType.GESTIONNAIRE },
    });

    async function onSubmit(values: CreateUserFormValues) {
        const result = await createUser(values);

        if (!result.success) {
            toast.add({ title: result.message, type: "error" });

            if (result.errors) {
                for (const [field, messages] of Object.entries(result.errors)) {
                    setError(field as keyof CreateUserFormValues, { message: messages[0] });
                }
            }

            return;
        }

        toast.add({ title: result.message, type: "success" });
        onSuccess?.();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="prenom" className="text-sm font-medium text-foreground">
                        Prénom
                    </label>
                    <Input
                        id="prenom"
                        className={cn("h-10 rounded-xl", errors.prenom && "border-red-500")}
                        {...register("prenom")}
                    />
                    {errors.prenom && <p className="animate-pulse text-sm text-red-500">{errors.prenom.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="nom" className="text-sm font-medium text-foreground">
                        Nom
                    </label>
                    <Input
                        id="nom"
                        className={cn("h-10 rounded-xl", errors.nom && "border-red-500")}
                        {...register("nom")}
                    />
                    {errors.nom && <p className="animate-pulse text-sm text-red-500">{errors.nom.message}</p>}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        className={cn("h-10 rounded-xl", errors.email && "border-red-500")}
                        {...register("email")}
                    />
                    {errors.email && <p className="animate-pulse text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="role" className="text-sm font-medium text-foreground">
                        Rôle
                    </label>
                    <RoleSelect id="role" invalid={!!errors.role} {...register("role")} />
                    {errors.role && <p className="animate-pulse text-sm text-red-500">{errors.role.message}</p>}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                        Mot de passe initial
                    </label>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        className={cn("h-10 rounded-xl", errors.password && "border-red-500")}
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="animate-pulse text-sm text-red-500">{errors.password.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Communiquez-le à l&apos;utilisateur ; vous pourrez le réinitialiser plus tard.
                    </p>
                </div>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer l'utilisateur"}
            </Button>
        </form>
    );
}
