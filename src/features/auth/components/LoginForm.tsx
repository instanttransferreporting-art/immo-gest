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
import { useI18n } from "@/i18n/client";

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, tv } = useI18n();
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
            setServerError(t.layout.auth.invalidCredentials);
            return;
        }

        const callbackUrl = searchParams.get("callbackUrl") ?? ROUTES.DASHBOARD;
        router.push(callbackUrl);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                    {t.common.email}
                </label>

                <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t.layout.auth.emailPlaceholder}
                    aria-invalid={!!errors.email}
                    className={cn(
                        "h-10 rounded-xl",
                        errors.email && "border-red-500"
                    )}
                    {...register("email")}
                />

                {errors.email && (
                    <p className="animate-pulse text-sm text-red-500">{tv(errors.email.message)}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                    {t.common.password}
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
                        aria-label={showPassword ? t.layout.auth.hidePassword : t.layout.auth.showPassword}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-muted-foreground"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>

                {errors.password && (
                    <p className="animate-pulse text-sm text-red-500">{tv(errors.password.message)}</p>
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
                className="h-10 w-full rounded-xl bg-brand-600 text-white hover:bg-brand-700"
            >
                {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    t.layout.auth.signIn
                )}
            </Button>
        </form>
    );
}
