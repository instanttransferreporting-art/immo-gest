import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { PaiementsPanel } from "@/features/payments/components/PaiementsPanel";
import { PaiementService } from "@/features/payments/services/paiement.service";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getI18n();

    return { title: `${t.payments.pageTitle} | ${t.common.appName}` };
}

export default async function PaymentsPage() {
    const { t } = await getI18n();

    const paiements = await PaiementService.listAll();

    return (
        <Container>
            <PageTitle
                title={t.payments.pageTitle}
                description={t.payments.description}
            />

            <div className="mt-6">
                <PaiementsPanel paiements={paiements} />
            </div>
        </Container>
    );
}
