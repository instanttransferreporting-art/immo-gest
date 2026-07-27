"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/login.schema";

const INVALID_CREDENTIALS_MESSAGE = "Identifiants incorrects. Veuillez réessayer.";

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    async function onSubmit(values: LoginFormValues) {
        setServerError(null);

        const result = await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
        });

        if (!result || result.error) {
            setServerError(INVALID_CREDENTIALS_MESSAGE);
            return;
        }

        const callbackUrl = searchParams.get("callbackUrl") ?? ROUTES.DASHBOARD;
        router.push(callbackUrl);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-slate-900">
                    Email
                </label>

                <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="vous@societe.com"
                    aria-invalid={!!errors.email}
                    className={cn(
                        "h-10 rounded-xl",
                        errors.email && "border-red-500"
                    )}
                    {...register("email")}
                />

                {errors.email && (
                    <p className="animate-pulse text-sm text-red-500">{errors.email.message}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-900">
                    Mot de passe
                </label>

                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        aria-invalid={!!errors.password}
                        className={cn(
                            "h-10 rounded-xl pr-10",
                            errors.password && "border-red-500"
                        )}
                        {...register("password")}
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>

                {errors.password && (
                    <p className="animate-pulse text-sm text-red-500">{errors.password.message}</p>
                )}
            </div>

            {serverError && (
                <p className="animate-pulse rounded-xl border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-500">
                    {serverError}
                </p>
            )}

            <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
                {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    "Se connecter"
                )}
            </Button>
        </form>
    );
}
