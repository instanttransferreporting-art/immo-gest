"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
    CIVILITES,
    PERIODICITES_BAIL,
    PERIODICITE_BAIL_LABELS,
    contratDocumentSchema,
    type ContratDocumentValues,
} from "@/features/leases/schemas/contrat-document.schema";
import type { ContratDocumentDefaults } from "@/features/leases/services/contrat-document.service";

type GenererContratDialogProps = {
    contratId: string;
    defaults: ContratDocumentDefaults;
};

type Format = "docx" | "pdf";

const SELECT_CLASS =
    "h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "UTC" });

function Field({
    label,
    hint,
    error,
    className,
    children,
}: {
    label: string;
    hint?: string;
    error?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <label className="text-sm font-medium text-foreground">{label}</label>
            {children}
            {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <fieldset className="space-y-3">
            <legend className="rounded-lg bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {title}
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
        </fieldset>
    );
}

export function GenererContratDialog({ contratId, defaults }: GenererContratDialogProps) {
    const [open, setOpen] = useState(false);
    const [generated, setGenerated] = useState<ContratDocumentValues | null>(null);
    const [downloading, setDownloading] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ContratDocumentDefaults>({ defaultValues: defaults });

    const error = (name: keyof ContratDocumentDefaults) => errors[name]?.message as string | undefined;
    const inputClass = (name: keyof ContratDocumentDefaults) => cn("h-10 rounded-xl", errors[name] && "border-red-500");

    function onSubmit(values: ContratDocumentDefaults) {
        const parsed = contratDocumentSchema.safeParse(values);

        if (!parsed.success) {
            for (const issue of parsed.error.issues) {
                setError(issue.path[0] as keyof ContratDocumentDefaults, { message: issue.message });
            }
            return;
        }

        setGenerated(parsed.data);
    }

    async function download(index: 1 | 2, format: Format) {
        if (!generated) {
            return;
        }

        const key = `${index}-${format}`;
        setDownloading(key);

        try {
            const response = await fetch(`/api/contrats/${contratId}/document`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ values: generated, index, format }),
            });

            if (!response.ok) {
                const body = (await response.json().catch(() => null)) as { error?: string } | null;
                toast.add({ title: body?.error ?? "Impossible de générer le contrat.", type: "error" });
                return;
            }

            const filename =
                /filename="([^"]+)"/.exec(response.headers.get("Content-Disposition") ?? "")?.[1] ??
                `contrat-bail.${format}`;
            const url = URL.createObjectURL(await response.blob());
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        } finally {
            setDownloading(null);
        }
    }

    function handleOpenChange(next: boolean) {
        setOpen(next);

        if (!next) {
            setGenerated(null);
        }
    }

    const periods = generated
        ? [
              {
                  index: 1 as const,
                  debut: generated.dateDebut,
                  fin: new Date(Date.UTC(generated.dateDebut.getUTCFullYear(), 11, 31)),
              },
              ...(generated.genererContratSuivant
                  ? [
                        {
                            index: 2 as const,
                            debut: new Date(Date.UTC(generated.dateDebut.getUTCFullYear() + 1, 0, 1)),
                            fin: new Date(Date.UTC(generated.dateDebut.getUTCFullYear() + 1, 11, 31)),
                        },
                    ]
                  : []),
          ]
        : [];

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger render={<Button variant="outline" className="rounded-lg" />}>
                <FileText className="h-4 w-4" />
                Générer le bail (Word / PDF)
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Générer le contrat de bail</DialogTitle>
                </DialogHeader>

                {generated ? (
                    <div className="space-y-4">
                        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            {periods.length === 2
                                ? "Deux contrats sont générés : le bail de l'année en cours puis celui de l'année suivante."
                                : "Un seul contrat est généré."}
                        </p>

                        {periods.map((period) => (
                            <div
                                key={period.index}
                                className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        Contrat {period.index} — {period.debut.getUTCFullYear()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Du {dateFormatter.format(period.debut)} au {dateFormatter.format(period.fin)}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    {(["docx", "pdf"] as const).map((format) => (
                                        <Button
                                            key={format}
                                            type="button"
                                            variant="outline"
                                            className="rounded-lg"
                                            disabled={downloading !== null}
                                            onClick={() => download(period.index, format)}
                                        >
                                            {downloading === `${period.index}-${format}` ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : null}
                                            {format === "docx" ? "Word" : "PDF"}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-lg"
                            onClick={() => setGenerated(null)}
                        >
                            Modifier les informations
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                        <Section title="Preneur">
                            <Field label="Civilité" error={error("civilite")}>
                                <select className={SELECT_CLASS} {...register("civilite")}>
                                    {CIVILITES.map((civilite) => (
                                        <option key={civilite} value={civilite}>
                                            {civilite === "Monsieur" ? "Monsieur" : "Madame"}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Nom complet" error={error("locataireNom")}>
                                <Input className={inputClass("locataireNom")} {...register("locataireNom")} />
                            </Field>
                            <Field label="Nationalité" error={error("nationalite")}>
                                <Input className={inputClass("nationalite")} {...register("nationalite")} />
                            </Field>
                            <Field label="Téléphone" error={error("telephone")}>
                                <Input className={inputClass("telephone")} {...register("telephone")} />
                            </Field>
                            <Field label="N° de CNI" error={error("pieceIdentite")}>
                                <Input className={inputClass("pieceIdentite")} {...register("pieceIdentite")} />
                            </Field>
                            <Field label="CNI délivrée le" hint="Ex : 12/03/2019" error={error("pieceDelivreeLe")}>
                                <Input className={inputClass("pieceDelivreeLe")} {...register("pieceDelivreeLe")} />
                            </Field>
                            <Field label="CNI délivrée à" hint="Ex : Yaoundé" error={error("pieceDelivreeA")}>
                                <Input className={inputClass("pieceDelivreeA")} {...register("pieceDelivreeA")} />
                            </Field>
                        </Section>

                        <Section title="Local loué">
                            <Field
                                label="Localisation"
                                hint="Complète « les locaux situés au … » (ex : 2ème étage, porte B12)"
                                error={error("localisation")}
                                className="sm:col-span-2"
                            >
                                <Input className={inputClass("localisation")} {...register("localisation")} />
                            </Field>
                            <Field label="Surface (m²)" error={error("surface")}>
                                <Input
                                    type="number"
                                    step="any"
                                    className={inputClass("surface")}
                                    {...register("surface", { valueAsNumber: true })}
                                />
                            </Field>
                            <Field label="Composition" hint="Ex : un salon, deux chambres, une cuisine" error={error("composition")}>
                                <Input className={inputClass("composition")} {...register("composition")} />
                            </Field>
                        </Section>

                        <Section title="Durée">
                            <Field label="Date de prise d'effet" error={error("dateDebut")}>
                                <Input type="date" className={inputClass("dateDebut")} {...register("dateDebut")} />
                            </Field>
                            <Field label="Date de signature" error={error("dateSignature")}>
                                <Input type="date" className={inputClass("dateSignature")} {...register("dateSignature")} />
                            </Field>
                            <label className="flex items-start gap-3 rounded-xl border border-border px-4 py-3 text-sm">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 h-4 w-4 rounded border-input accent-emerald-600"
                                    {...register("reconductionAuto")}
                                />
                                <span>
                                    <span className="font-medium text-foreground">Reconduction automatique</span>
                                    <span className="block text-xs text-muted-foreground">
                                        Sinon, le bail prend fin à son terme.
                                    </span>
                                </span>
                            </label>
                            <label className="flex items-start gap-3 rounded-xl border border-border px-4 py-3 text-sm">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 h-4 w-4 rounded border-input accent-emerald-600"
                                    {...register("genererContratSuivant")}
                                />
                                <span>
                                    <span className="font-medium text-foreground">Générer aussi le bail de l&apos;année suivante</span>
                                    <span className="block text-xs text-muted-foreground">
                                        Du 1er janvier au 31 décembre (entrée en cours d&apos;année).
                                    </span>
                                </span>
                            </label>
                        </Section>

                        <Section title="Loyer et paiement">
                            <Field label="Loyer mensuel (FCFA, hors taxes)" error={error("loyer")}>
                                <Input
                                    type="number"
                                    className={inputClass("loyer")}
                                    {...register("loyer", { valueAsNumber: true })}
                                />
                            </Field>
                            <Field label="Périodicité de paiement" error={error("periodicite")}>
                                <select className={SELECT_CLASS} {...register("periodicite")}>
                                    {PERIODICITES_BAIL.map((periodicite) => (
                                        <option key={periodicite} value={periodicite}>
                                            {PERIODICITE_BAIL_LABELS[periodicite]}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Loyers payés d'avance (mois)" error={error("moisAvance")}>
                                <Input
                                    type="number"
                                    min={1}
                                    className={inputClass("moisAvance")}
                                    {...register("moisAvance", { valueAsNumber: true })}
                                />
                            </Field>
                        </Section>

                        <Section title="Dépôt de garantie">
                            <Field label="Nombre de mois de loyer" error={error("depotMois")}>
                                <Input
                                    type="number"
                                    min={1}
                                    className={inputClass("depotMois")}
                                    {...register("depotMois", { valueAsNumber: true })}
                                />
                            </Field>
                            <Field label="Montant (FCFA)" error={error("depotMontant")}>
                                <Input
                                    type="number"
                                    className={inputClass("depotMontant")}
                                    {...register("depotMontant", { valueAsNumber: true })}
                                />
                            </Field>
                        </Section>

                        <Section title="Charges communes">
                            <Field
                                label="Montant mensuel (FCFA, hors taxes)"
                                hint="Le pourcentage du loyer est calculé automatiquement."
                                error={error("chargesMontant")}
                            >
                                <Input
                                    type="number"
                                    className={inputClass("chargesMontant")}
                                    {...register("chargesMontant", { valueAsNumber: true })}
                                />
                            </Field>
                            <Field
                                label="Nature des charges (facultatif)"
                                hint="Ex : eau, électricité des parties communes, gardiennage"
                                error={error("natureCharges")}
                            >
                                <Input className={inputClass("natureCharges")} {...register("natureCharges")} />
                            </Field>
                        </Section>

                        <Section title="Pénalités de retard">
                            <Field label="Taux par mois (%)" error={error("tauxPenalite")}>
                                <Input
                                    type="number"
                                    step="any"
                                    className={inputClass("tauxPenalite")}
                                    {...register("tauxPenalite", { valueAsNumber: true })}
                                />
                            </Field>
                            <Field label="Applicable après (jours)" error={error("delaiPenaliteJours")}>
                                <Input
                                    type="number"
                                    min={1}
                                    className={inputClass("delaiPenaliteJours")}
                                    {...register("delaiPenaliteJours", { valueAsNumber: true })}
                                />
                            </Field>
                        </Section>

                        <Button
                            type="submit"
                            className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            Générer le contrat
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
