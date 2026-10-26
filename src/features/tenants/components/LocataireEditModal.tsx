"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { updateLocataire } from "@/features/tenants/actions/locataire.actions";
import {
    locataireMoraleSchema,
    locatairePhysiqueSchema,
} from "@/features/tenants/schemas/tenant.schema";
import { TypeLocataire } from "@/generated/prisma/enums";
import type { LocataireDTO } from "@/features/tenants/types/tenant.types";
import { useI18n } from "@/i18n/client";

type LocataireFormInput = {
    type: TypeLocataire;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    adresse: string;
    pieceIdentite: string;
    dateNaissance?: Date;
    profession?: string;
    revenuMensuelMoyen?: number;
    raisonSociale?: string;
    rccm?: string;
    niu?: string;
    telephoneMoral?: string;
    emailMoral?: string;
};

type LocataireEditModalProps = {
    locataire: LocataireDTO;
    onSuccess?: (locataire: LocataireDTO) => void;
};

function toDefaultValues(locataire: LocataireDTO): LocataireFormInput {
    return {
        type: locataire.type,
        nom: locataire.nom,
        prenom: locataire.prenom,
        telephone: locataire.telephone,
        email: locataire.email,
        adresse: locataire.adresse,
        pieceIdentite: locataire.pieceIdentite,
        dateNaissance: locataire.dateNaissance ?? undefined,
        profession: locataire.profession ?? undefined,
        revenuMensuelMoyen: locataire.revenuMensuelMoyen ?? undefined,
        raisonSociale: locataire.raisonSociale ?? undefined,
        rccm: locataire.rccm ?? undefined,
        niu: locataire.niu ?? undefined,
        telephoneMoral: locataire.telephoneMoral ?? undefined,
        emailMoral: locataire.emailMoral ?? undefined,
    };
}

const toDateInputValue = (date?: Date | null) =>
    date ? new Date(date).toISOString().slice(0, 10) : "";

export function LocataireEditModal({ locataire, onSuccess }: LocataireEditModalProps) {
    const { t, tv } = useI18n();

    const [open, setOpen] = useState(false);
    const [type, setType] = useState<TypeLocataire>(locataire.type);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<LocataireFormInput>({
        resolver: zodResolver(
            type === TypeLocataire.PHYSIQUE ? locatairePhysiqueSchema : locataireMoraleSchema
        ) as Resolver<LocataireFormInput>,
        defaultValues: toDefaultValues(locataire),
    });

    function handleOpenChange(next: boolean) {
        setOpen(next);
        if (next) {
            setType(locataire.type);
            reset(toDefaultValues(locataire));
        }
    }

    function handleTypeChange(next: TypeLocataire) {
        setType(next);
        reset({ ...toDefaultValues(locataire), type: next });
    }

    async function onSubmit(values: LocataireFormInput) {
        const result = await updateLocataire(locataire.id, values);

        if (!result.success || !result.data) {
            toast.add({ title: result.message, type: "error" });
            return;
        }

        toast.add({ title: result.message, type: "success" });
        setOpen(false);
        onSuccess?.(result.data);
    }

    const isPhysique = type === TypeLocataire.PHYSIQUE;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger
                render={
                    <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-border text-muted-foreground hover:text-brand-700"
                    />
                }
            >
                <Pencil className="h-4 w-4" />
                {t.common.edit}
            </DialogTrigger>

            <DialogContent className="max-w-xl rounded-2xl">
                <DialogHeader>
                    <DialogTitle>{t.tenants.edit}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    {/* Type toggle */}
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
                        {Object.values(TypeLocataire).map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleTypeChange(option)}
                                className={cn(
                                    "h-9 rounded-lg text-sm font-medium transition-all duration-200",
                                    type === option
                                        ? "bg-card text-brand-700 shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {t.enums.typeLocataire[option]}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label htmlFor="edit-nom" className="text-sm font-medium text-foreground">
                                {isPhysique ? t.tenants.lastName : t.tenants.repLastName}
                            </label>
                            <Input
                                id="edit-nom"
                                className={cn("h-10 rounded-xl", errors.nom && "border-red-500")}
                                {...register("nom")}
                            />
                            {errors.nom && <p className="animate-pulse text-sm text-red-500">{tv(errors.nom.message)}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="edit-prenom" className="text-sm font-medium text-foreground">
                                {isPhysique ? t.tenants.firstName : t.tenants.repFirstName}
                            </label>
                            <Input
                                id="edit-prenom"
                                className={cn("h-10 rounded-xl", errors.prenom && "border-red-500")}
                                {...register("prenom")}
                            />
                            {errors.prenom && (
                                <p className="animate-pulse text-sm text-red-500">{tv(errors.prenom.message)}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label htmlFor="edit-telephone" className="text-sm font-medium text-foreground">
                                {t.common.phone}
                            </label>
                            <Input
                                id="edit-telephone"
                                placeholder="+237690000000"
                                className={cn("h-10 rounded-xl", errors.telephone && "border-red-500")}
                                {...register("telephone")}
                            />
                            {errors.telephone && (
                                <p className="animate-pulse text-sm text-red-500">{tv(errors.telephone.message)}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="edit-email" className="text-sm font-medium text-foreground">
                                {t.common.email}
                            </label>
                            <Input
                                id="edit-email"
                                type="email"
                                className={cn("h-10 rounded-xl", errors.email && "border-red-500")}
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="animate-pulse text-sm text-red-500">{tv(errors.email.message)}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="edit-adresse" className="text-sm font-medium text-foreground">
                            {t.common.address}
                        </label>
                        <Input
                            id="edit-adresse"
                            className={cn("h-10 rounded-xl", errors.adresse && "border-red-500")}
                            {...register("adresse")}
                        />
                        {errors.adresse && (
                            <p className="animate-pulse text-sm text-red-500">{tv(errors.adresse.message)}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="edit-pieceIdentite" className="text-sm font-medium text-foreground">
                            {t.tenants.idDocumentLong}
                        </label>
                        <Input
                            id="edit-pieceIdentite"
                            className={cn("h-10 rounded-xl", errors.pieceIdentite && "border-red-500")}
                            {...register("pieceIdentite")}
                        />
                        {errors.pieceIdentite && (
                            <p className="animate-pulse text-sm text-red-500">{tv(errors.pieceIdentite.message)}</p>
                        )}
                    </div>

                    {isPhysique ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label htmlFor="edit-profession" className="text-sm font-medium text-foreground">
                                    {t.tenants.profession}
                                </label>
                                <Input
                                    id="edit-profession"
                                    className="h-10 rounded-xl"
                                    {...register("profession")}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="edit-revenuMensuelMoyen" className="text-sm font-medium text-foreground">
                                    {t.tenants.averageMonthlyIncome}
                                </label>
                                <Input
                                    id="edit-revenuMensuelMoyen"
                                    type="number"
                                    min={0}
                                    className={cn("h-10 rounded-xl", errors.revenuMensuelMoyen && "border-red-500")}
                                    {...register("revenuMensuelMoyen", { valueAsNumber: true })}
                                />
                                {errors.revenuMensuelMoyen && (
                                    <p className="animate-pulse text-sm text-red-500">
                                        {tv(errors.revenuMensuelMoyen.message)}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-1.5">
                                <label htmlFor="edit-raisonSociale" className="text-sm font-medium text-foreground">
                                    {t.tenants.companyName}
                                </label>
                                <Input
                                    id="edit-raisonSociale"
                                    className={cn("h-10 rounded-xl", errors.raisonSociale && "border-red-500")}
                                    {...register("raisonSociale")}
                                />
                                {errors.raisonSociale && (
                                    <p className="animate-pulse text-sm text-red-500">{tv(errors.raisonSociale.message)}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label htmlFor="edit-rccm" className="text-sm font-medium text-foreground">
                                        {t.tenants.rccm}
                                    </label>
                                    <Input
                                        id="edit-rccm"
                                        className={cn("h-10 rounded-xl", errors.rccm && "border-red-500")}
                                        {...register("rccm")}
                                    />
                                    {errors.rccm && (
                                        <p className="animate-pulse text-sm text-red-500">{tv(errors.rccm.message)}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="edit-niu" className="text-sm font-medium text-foreground">
                                        {t.tenants.niu}
                                    </label>
                                    <Input
                                        id="edit-niu"
                                        className={cn("h-10 rounded-xl", errors.niu && "border-red-500")}
                                        {...register("niu")}
                                    />
                                    {errors.niu && (
                                        <p className="animate-pulse text-sm text-red-500">{tv(errors.niu.message)}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label htmlFor="edit-telephoneMoral" className="text-sm font-medium text-foreground">
                                        {t.tenants.companyPhone}
                                    </label>
                                    <Input
                                        id="edit-telephoneMoral"
                                        placeholder="+237690000000"
                                        className={cn("h-10 rounded-xl", errors.telephoneMoral && "border-red-500")}
                                        {...register("telephoneMoral")}
                                    />
                                    {errors.telephoneMoral && (
                                        <p className="animate-pulse text-sm text-red-500">
                                            {tv(errors.telephoneMoral.message)}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="edit-emailMoral" className="text-sm font-medium text-foreground">
                                        {t.tenants.companyEmail}
                                    </label>
                                    <Input
                                        id="edit-emailMoral"
                                        type="email"
                                        className={cn("h-10 rounded-xl", errors.emailMoral && "border-red-500")}
                                        {...register("emailMoral")}
                                    />
                                    {errors.emailMoral && (
                                        <p className="animate-pulse text-sm text-red-500">
                                            {tv(errors.emailMoral.message)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-10 w-full rounded-xl bg-brand-600 text-white hover:bg-brand-700"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.tenants.saveChanges}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Silence unused variable warning from toDateInputValue
void toDateInputValue;
