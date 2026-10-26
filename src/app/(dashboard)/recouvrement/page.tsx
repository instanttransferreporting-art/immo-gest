import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { ImpayesTable } from "@/features/collections/components/ImpayesTable";
import { RecouvrementService } from "@/features/collections/services/recouvrement.service";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getI18n();

    return { title: `${t.operations.collections.pageTitle} | ${t.common.appName}` };
}

export default async function RecouvrementPage() {
    const { t } = await getI18n();

    const impayes = await RecouvrementService.listImpayes();

    return (
        <Container>
            <PageTitle
                title={t.operations.collections.pageTitle}
                description={t.operations.collections.description}
            />

            <div className="mt-6">
                <Card className="rounded-2xl border border-border shadow-sm">
                    <CardContent className="px-6">
                        <ImpayesTable impayes={impayes} />
                    </CardContent>
                </Card>
            </div>
        </Container>
    );
}
