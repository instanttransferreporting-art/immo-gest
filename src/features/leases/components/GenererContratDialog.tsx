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
    contratDocumentSchema,
    type ContratDocumentValues,
} from "@/features/leases/schemas/contrat-document.schema";
import type { ContratDocumentDefaults } from "@/features/leases/services/contrat-document.service";
import { useI18n } from "@/i18n/client";

type GenererContratDialogProps = {
    contratId: string;
    defaults: ContratDocumentDefaults;
};

type Format = "docx" | "pdf";

const SELECT_CLASS =
    "h-10 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";


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
    const { t, tv, f } = useI18n();

    const [open, setOpen] = useState(false);
    const [generated, setGenerated] = useState<ContratDocumentValues | null>(null);
    const [downloading, setDownloading] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ContratDocumentDefaults>({ defaultValues: defaults });

    const error = (name: keyof ContratDocumentDefaults) => tv(errors[name]?.message as string | undefined);
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
                toast.add({ title: body?.error ?? t.leases.generate.failed, type: "error" });
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

    const utcDateFormatter = new Intl.DateTimeFormat(f.intl, { dateStyle: "long", timeZone: "UTC" });
    const formatUtc = (date: Date) => utcDateFormatter.format(date);

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
                {t.leases.generate.trigger}
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl">
                <DialogHeader>
                    <DialogTitle>{t.leases.generate.title}</DialogTitle>
                </DialogHeader>

                {generated ? (
                    <div className="space-y-4">
                        <p className="rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-700">
                            {periods.length === 2
                                ? t.leases.generate.twoContracts
                                : t.leases.generate.oneContract}
                        </p>

                        {periods.map((period) => (
                            <div
                                key={period.index}
                                className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {t.leases.generate.contractYear(period.index, period.debut.getUTCFullYear())}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {t.leases.generate.fromTo(formatUtc(period.debut), formatUtc(period.fin))}
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
                            {t.leases.generate.editInfo}
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                        <Section title={t.leases.generate.sections.tenant}>
                            <Field label={t.leases.generate.fields.civilite} error={error("civilite")}>
                                <select className={SELECT_CLASS} {...register("civilite")}>
                                    {CIVILITES.map((civilite) => (
                                        <option key={civilite} value={civilite}>
                                            {t.enums.civilite[civilite]}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label={t.leases.generate.fields.fullName} error={error("locataireNom")}>
                                <Input className={inputClass("locataireNom")} {...register("locataireNom")} />
                            </Field>
                            <Field label={t.leases.generate.fields.nationality} error={error("nationalite")}>
                                <Input className={inputClass("nationalite")} {...register("nationalite")} />
                            </Field>
                            <Field label={t.leases.generate.fields.phone} error={error("telephone")}>
                                <Input className={inputClass("telephone")} {...register("telephone")} />
                            </Field>
                            <Field label={t.leases.generate.fields.cniNumber} error={error("pieceIdentite")}>
                                <Input className={inputClass("pieceIdentite")} {...register("pieceIdentite")} />
                            </Field>
                            <Field label={t.leases.generate.fields.cniIssuedOn} hint={t.leases.generate.fields.cniIssuedOnHint} error={error("pieceDelivreeLe")}>
                                <Input className={inputClass("pieceDelivreeLe")} {...register("pieceDelivreeLe")} />
                            </Field>
                            <Field label={t.leases.generate.fields.cniIssuedAt} hint={t.leases.generate.fields.cniIssuedAtHint} error={error("pieceDelivreeA")}>
                                <Input className={inputClass("pieceDelivreeA")} {...register("pieceDelivreeA")} />
                            </Field>
                        </Section>

                        <Section title={t.leases.generate.sections.premises}>
                            <Field
                                label={t.leases.generate.fields.location}
                                hint={t.leases.generate.fields.locationHint}
                                error={error("localisation")}
                                className="sm:col-span-2"
                            >
                                <Input className={inputClass("localisation")} {...register("localisation")} />
                            </Field>
                            <Field label={t.leases.generate.fields.surface} error={error("surface")}>
                                <Input
                                    type="number"
                                    step="any"
                                    className={inputClass("surface")}
                                    {...register("surface", { valueAsNumber: true })}
                                />
                            </Field>
                            <Field label={t.leases.generate.fields.composition} hint={t.leases.generate.fields.compositionHint} error={error("composition")}>
                                <Input className={inputClass("composition")} {...register("composition")} />
                            </Field>
                        </Section>

                        <Section title={t.leases.generate.sections.duration}>
                            <Field label={t.leases.generate.fields.effectiveDate} error={error("dateDebut")}>
                                <Input type="date" className={inputClass("dateDebut")} {...register("dateDebut")} />
                            </Field>
                            <Field label={t.leases.generate.fields.signatureDate} error={error("dateSignature")}>
                                <Input type="date" className={inputClass("dateSignature")} {...register("dateSignature")} />
                            </Field>
                            <label className="flex items-start gap-3 rounded-xl border border-border px-4 py-3 text-sm">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 h-4 w-4 rounded border-input accent-brand-600"
                                    {...register("reconductionAuto")}
                                />
                                <span>
                                    <span className="font-medium text-foreground">{t.leases.generate.fields.autoRenewal}</span>
                                    <span className="block text-xs text-muted-foreground">
                                        {t.leases.generate.fields.autoRenewalHint}
                                    </span>
                                </span>
                            </label>
                            <label className="flex items-start gap-3 rounded-xl border border-border px-4 py-3 text-sm">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 h-4 w-4 rounded border-input accent-brand-600"
                                    {...register("genererContratSuivant")}
                                />
                                <span>
                                    <span className="font-medium text-foreground">{t.leases.generate.fields.nextYear}</span>
                                    <span className="block text-xs text-muted-foreground">
                                        {t.leases.generate.fields.nextYearHint}
                                    </span>
                                </span>
                            </label>
                        </Section>

                        <Section title={t.leases.generate.sections.rent}>
                            <Field label={t.leases.generate.fields.monthlyRent} error={error("loyer")}>
                                <Input
                                    type="number"
                                    className={inputClass("loyer")}
                                    {...register("loyer", { valueAsNumber: true })}
                                />
                            </Field>
                            <Field label={t.leases.generate.fields.periodicity} error={error("periodicite")}>
                                <select className={SELECT_CLASS} {...register("periodicite")}>
                                    {PERIODICITES_BAIL.map((periodicite) => (
                                        <option key={periodicite} value={periodicite}>
                                            {t.enums.periodiciteBail[periodicite]}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label={t.leases.generate.fields.advanceMonths} error={error("moisAvance")}>
                                <Input
                                    type="number"
                                    min={1}
                                    className={inputClass("moisAvance")}
                                    {...register("moisAvance", { valueAsNumber: true })}
                                />
                            </Field>
                        </Section>

                        <Section title={t.leases.generate.sections.deposit}>
                            <Field label={t.leases.generate.fields.depositMonths} error={error("depotMois")}>
                                <Input
                                    type="number"
                                    min={1}
                                    className={inputClass("depotMois")}
                                    {...register("depotMois", { valueAsNumber: true })}
                                />
                            </Field>
                            <Field label={t.leases.generate.fields.depositAmount} error={error("depotMontant")}>
                                <Input
                                    type="number"
                                    className={inputClass("depotMontant")}
                                    {...register("depotMontant", { valueAsNumber: true })}
                                />
                            </Field>
                        </Section>

                        <Section title={t.leases.generate.sections.charges}>
                            <Field
                                label={t.leases.generate.fields.chargesAmount}
                                hint={t.leases.generate.fields.chargesAmountHint}
                                error={error("chargesMontant")}
                            >
                                <Input
                                    type="number"
                                    className={inputClass("chargesMontant")}
                                    {...register("chargesMontant", { valueAsNumber: true })}
                                />
                            </Field>
                            <Field
                                label={t.leases.generate.fields.chargesNature}
                                hint={t.leases.generate.fields.chargesNatureHint}
                                error={error("natureCharges")}
                            >
                                <Input className={inputClass("natureCharges")} {...register("natureCharges")} />
                            </Field>
                        </Section>

                        <Section title={t.leases.generate.sections.penalties}>
                            <Field label={t.leases.generate.fields.penaltyRate} error={error("tauxPenalite")}>
                                <Input
                                    type="number"
                                    step="any"
                                    className={inputClass("tauxPenalite")}
                                    {...register("tauxPenalite", { valueAsNumber: true })}
                                />
                            </Field>
                            <Field label={t.leases.generate.fields.penaltyDelay} error={error("delaiPenaliteJours")}>
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
                            className="h-10 w-full rounded-xl bg-brand-600 text-white hover:bg-brand-700"
                        >
                            {t.leases.generate.submit}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
