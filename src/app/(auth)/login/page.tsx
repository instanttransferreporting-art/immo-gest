import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getCurrentSession } from "@/lib/auth";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
    title: "Connexion | Immo Gest",
};

export default async function LoginPage() {
    const session = await getCurrentSession();

    if (session) {
        redirect(ROUTES.DASHBOARD);
    }

    return (
        <Card className="w-full max-w-md rounded-2xl border border-slate-200 shadow-md">
            <CardHeader className="flex flex-col items-center gap-3 pt-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                    <Building2 className="h-6 w-6" />
                </div>

                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        Immo Gest
                    </h1>
                    <p className="text-sm text-slate-500">
                        Connectez-vous à votre espace de gestion.
                    </p>
                </div>
            </CardHeader>

            <CardContent className="pb-8">
                <LoginForm />
            </CardContent>
        </Card>
    );
}
