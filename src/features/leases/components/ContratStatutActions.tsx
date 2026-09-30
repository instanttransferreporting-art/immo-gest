"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PauseCircle, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { reactiverContrat, suspendreContrat } from "@/features/leases/actions/contrat.actions";
import { StatutBail } from "@/generated/prisma/enums";

type ContratStatutActionsProps = {
    contratId: string;
    statut: StatutBail;
};

export function ContratStatutActions({ contratId, statut }: ContratStatutActionsProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSuspendre() {
        setIsSubmitting(true);
        const result = await suspendreContrat({ contratId });
        setIsSubmitting(false);

        if (!result.success) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({ title: result.message, type: "success" });
        router.refresh();
    }

    async function handleReactiver() {
        setIsSubmitting(true);
        const result = await reactiverContrat({ contratId });
        setIsSubmitting(false);

        if (!result.success) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({ title: result.message, type: "success" });
        router.refresh();
    }

    if (statut === StatutBail.ACTIF) {
        return (
            <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleSuspendre}
                className="rounded-lg"
            >
                <PauseCircle className="h-4 w-4" />
                Suspendre
            </Button>
        );
    }

    if (statut === StatutBail.SUSPENDU) {
        return (
            <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleReactiver}
                className="rounded-lg"
            >
                <PlayCircle className="h-4 w-4" />
                Réactiver
            </Button>
        );
    }

    return null;
}
