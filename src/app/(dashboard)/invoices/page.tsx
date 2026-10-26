import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { FacturesPanel } from "@/features/invoices/components/FacturesPanel";
import { FactureService } from "@/features/invoices/services/facture.service";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getI18n();

    return { title: `${t.invoices.pageTitle} | ${t.common.appName}` };
}

export default async function InvoicesPage() {
    const { t } = await getI18n();

    const factures = await FactureService.listAll();

    return (
        <Container>
            <PageTitle
                title={t.invoices.title}
                description={t.invoices.description}
            />

            <div className="mt-6">
                <FacturesPanel factures={factures} />
            </div>
        </Container>
    );
}
