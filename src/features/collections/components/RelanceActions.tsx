"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { genererRelance } from "@/features/collections/actions/relance.actions";
import { NIVEAU_RELANCE_ORDER } from "@/features/collections/constants/collection.constants";
import type { NiveauRelance } from "@/generated/prisma/enums";
import { useI18n } from "@/i18n/client";

type RelanceActionsProps = {
    echeanceId: string;
    dernierNiveauRelance: NiveauRelance | null;
};

export function RelanceActions({ echeanceId, dernierNiveauRelance }: RelanceActionsProps) {
    const { t } = useI18n();

    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentIndex = dernierNiveauRelance ? NIVEAU_RELANCE_ORDER.indexOf(dernierNiveauRelance) : -1;
    const prochainNiveau = NIVEAU_RELANCE_ORDER[currentIndex + 1];

    if (!prochainNiveau) {
        return (
            <Badge variant="outline" className="rounded-lg text-red-700">
                {t.operations.collections.litigationInProgress}
            </Badge>
        );
    }

    async function handleClick() {
        setIsSubmitting(true);
        const result = await genererRelance({ echeanceId, niveau: prochainNiveau });
        setIsSubmitting(false);

        if (!result.success) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({ title: result.message, type: "success" });
        router.refresh();
    }

    return (
        <Button
            size="sm"
            variant="outline"
            disabled={isSubmitting}
            onClick={handleClick}
            className="rounded-lg"
        >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {t.enums.prochaineAction[prochainNiveau]}
        </Button>
    );
}
