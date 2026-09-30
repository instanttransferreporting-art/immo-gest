import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { getCurrentSession } from "@/lib/auth";
import { RoleType } from "@/generated/prisma/enums";
import { ROUTES } from "@/constants/routes";

export default async function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const session = await getCurrentSession();

    if (session?.user.role === RoleType.SUPER_ADMIN && !session.user.impersonatedOrganizationId) {
        redirect(ROUTES.PLATFORM);
    }

    return <AppShell>{children}</AppShell>;
}