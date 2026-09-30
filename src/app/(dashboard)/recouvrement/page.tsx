import type { Metadata } from "next";

import { Container, PageTitle } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { ImpayesTable } from "@/features/collections/components/ImpayesTable";
import { RecouvrementService } from "@/features/collections/services/recouvrement.service";

export const metadata: Metadata = {
    title: "Recouvrement | Immo Gest",
};

export default async function RecouvrementPage() {
    const impayes = await RecouvrementService.listImpayes();

    return (
        <Container>
            <PageTitle
                title="Recouvrement"
                description="Suivez les impayés et déclenchez les relances graduées."
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
