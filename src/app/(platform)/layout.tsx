import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";

import { UserMenu } from "@/components/layout";
import { getCurrentSession } from "@/lib/auth";
import { RoleType } from "@/generated/prisma/enums";
import { ROUTES } from "@/constants/routes";

export default async function PlatformLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {
    const session = await getCurrentSession();

    if (!session) {
        redirect(ROUTES.LOGIN);
    }

    if (session.user.role !== RoleType.SUPER_ADMIN) {
        redirect(ROUTES.DASHBOARD);
    }

    if (session.user.impersonatedOrganizationId) {
        redirect(ROUTES.DASHBOARD);
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900">Immo Gest</p>
                        <p className="text-xs text-slate-500">Espace Plateforme</p>
                    </div>
                </div>

                <UserMenu />
            </header>

            <main>{children}</main>
        </div>
    );
}
