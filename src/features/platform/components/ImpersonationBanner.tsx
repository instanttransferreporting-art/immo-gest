"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeftRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useI18n } from "@/i18n/client";

export function ImpersonationBanner() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const { t } = useI18n();

    const organizationNom = session?.user.impersonatedOrganizationNom;

    if (!organizationNom) {
        return null;
    }

    async function handleReturnToPlatform() {
        await update({ impersonatedOrganizationId: null, impersonatedOrganizationNom: null });
        router.push(ROUTES.PLATFORM);
        router.refresh();
    }

    return (
        <div className="flex items-center justify-between gap-3 bg-amber-500 px-6 py-2 text-sm text-white">
            <p className="font-medium">{t.layout.impersonation.visiting(organizationNom)}</p>

            <Button
                type="button"
                size="sm"
                onClick={handleReturnToPlatform}
                className="h-7 rounded-lg bg-white/15 px-3 text-white hover:bg-white/25"
            >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                {t.layout.impersonation.backToPlatform}
            </Button>
        </div>
    );
}
