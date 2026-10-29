import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthIllustration } from "@/features/auth/components/AuthArt";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getCurrentSession } from "@/lib/auth";
import { RoleType } from "@/generated/prisma/enums";
import { ROUTES } from "@/constants/routes";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getI18n();

    return { title: `${t.layout.auth.pageTitle} | ${t.common.appName}` };
}

export default async function LoginPage() {
    const session = await getCurrentSession();

    if (session) {
        redirect(session.user.role === RoleType.SUPER_ADMIN ? ROUTES.PLATFORM : ROUTES.DASHBOARD);
    }

    const { t } = await getI18n();

    return (
        <Card className="w-full gap-0 overflow-hidden rounded-3xl border border-border py-0 shadow-xl md:grid md:grid-cols-2">
            <div className="relative hidden flex-col items-center justify-between gap-6 bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white md:flex">
                <div className="flex items-center gap-3 self-start">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">{t.common.appName}</span>
                </div>

                <AuthIllustration />

                <p className="text-center text-sm text-white/80">{t.layout.auth.subtitle}</p>
            </div>

            <div className="flex flex-col justify-center">
                <CardHeader className="flex flex-col items-center gap-3 pt-8 text-center md:hidden">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                        {t.common.appName}
                    </h1>
                </CardHeader>

                <CardContent className="px-8 py-8 md:px-10 md:py-12">
                    <div className="mb-6 text-center md:text-left">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            {t.layout.auth.signIn}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground md:hidden">
                            {t.layout.auth.subtitle}
                        </p>
                    </div>
                    <LoginForm />
                </CardContent>
            </div>
        </Card>
    );
}
