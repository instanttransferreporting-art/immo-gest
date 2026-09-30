"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ReceiptText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { genererFacturesDuMois } from "@/features/invoices/actions/facture.actions";
import { MOIS_LABELS } from "@/features/invoices/constants/invoice.constants";

export function GenererFacturesButton() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    async function handleClick() {
        setIsPending(true);

        const now = new Date();
        const result = await genererFacturesDuMois({
            mois: now.getMonth() + 1,
            annee: now.getFullYear(),
        });

        toast.add({ title: result.message, type: result.success ? "success" : "error" });
        setIsPending(false);

        if (result.success) {
            router.refresh();
        }
    }

    const now = new Date();

    return (
        <Button
            type="button"
            onClick={handleClick}
            disabled={isPending}
            className="h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <ReceiptText className="h-4 w-4" />
            )}
            Générer les factures de {MOIS_LABELS[now.getMonth()]}
        </Button>
    );
}
