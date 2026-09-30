import { MAIL_FROM_ADDRESS, resend } from "@/lib/mail";
import { NIVEAU_RELANCE_LABELS } from "@/features/collections/constants/collection.constants";
import type { NiveauRelance } from "@/generated/prisma/enums";
import AvisEcheanceTemplate from "../../emails/AvisEcheanceTemplate";
import QuittanceTemplate from "../../emails/QuittanceTemplate";
import RelanceTemplate from "../../emails/RelanceTemplate";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

const NIVEAU_RELANCE_MESSAGES: Readonly<Record<NiveauRelance, string>> = {
    NIVEAU_1: "Nous n'avons pas encore reçu votre règlement pour la facture ci-dessous. Merci de régulariser votre situation dans les meilleurs délais.",
    NIVEAU_1_BIS: "Malgré notre premier rappel, votre facture demeure impayée. Nous vous invitons à procéder au règlement rapidement afin d'éviter toute pénalité supplémentaire.",
    NIVEAU_2: "Sans réponse de votre part suite à nos précédents rappels, nous vous mettons en demeure de régler le solde restant dû dans les plus brefs délais.",
    NIVEAU_3: "En l'absence de règlement malgré la mise en demeure, ce dossier est transmis en procédure contentieuse.",
};

export type MailAttachment = {
    filename: string;
    content: Buffer;
};

type AvisEcheanceParams = {
    to: string;
    organizationNom: string;
    organizationLogo: string | null;
    locataireNom: string;
    uniteLabel: string;
    numeroFacture: string;
    montantTotal: number;
    dateEcheance: Date;
    attachment?: MailAttachment;
};

type QuittanceParams = {
    to: string;
    organizationNom: string;
    organizationLogo: string | null;
    locataireNom: string;
    uniteLabel: string;
    numeroFacture: string;
    montantPaye: number;
    modePaiement: string;
    datePaiement: Date;
    soldeRestant: number;
    attachment?: MailAttachment;
};

type RelanceParams = {
    to: string;
    organizationNom: string;
    organizationLogo: string | null;
    locataireNom: string;
    uniteLabel: string;
    numeroFacture: string;
    soldeRestant: number;
    joursRetard: number;
    niveau: NiveauRelance;
    attachment?: MailAttachment;
};

export class MailService {
    static async sendAvisEcheance(params: AvisEcheanceParams): Promise<boolean> {
        if (!resend || !MAIL_FROM_ADDRESS || !params.to) {
            console.warn(`[mail] Envoi ignoré (Resend non configuré) — avis d'échéance ${params.numeroFacture}`);
            return false;
        }

        try {
            await resend.emails.send({
                from: `${params.organizationNom} <${MAIL_FROM_ADDRESS}>`,
                to: params.to,
                subject: `Avis d'échéance — ${params.numeroFacture}`,
                attachments: params.attachment ? [params.attachment] : undefined,
                react: (
                    <AvisEcheanceTemplate
                        organizationNom={params.organizationNom}
                        organizationLogo={params.organizationLogo}
                        locataireNom={params.locataireNom}
                        uniteLabel={params.uniteLabel}
                        numeroFacture={params.numeroFacture}
                        montantTotal={params.montantTotal}
                        dateEcheance={dateFormatter.format(params.dateEcheance)}
                    />
                ),
            });

            return true;
        } catch (error) {
            console.error("[mail] Échec de l'envoi de l'avis d'échéance", error);
            return false;
        }
    }

    static async sendQuittance(params: QuittanceParams): Promise<boolean> {
        if (!resend || !MAIL_FROM_ADDRESS || !params.to) {
            console.warn(`[mail] Envoi ignoré (Resend non configuré) — quittance ${params.numeroFacture}`);
            return false;
        }

        try {
            await resend.emails.send({
                from: `${params.organizationNom} <${MAIL_FROM_ADDRESS}>`,
                to: params.to,
                subject: `Quittance de loyer — ${params.numeroFacture}`,
                attachments: params.attachment ? [params.attachment] : undefined,
                react: (
                    <QuittanceTemplate
                        organizationNom={params.organizationNom}
                        organizationLogo={params.organizationLogo}
                        locataireNom={params.locataireNom}
                        uniteLabel={params.uniteLabel}
                        numeroFacture={params.numeroFacture}
                        montantPaye={params.montantPaye}
                        modePaiement={params.modePaiement}
                        datePaiement={dateFormatter.format(params.datePaiement)}
                        soldeRestant={params.soldeRestant}
                    />
                ),
            });

            return true;
        } catch (error) {
            console.error("[mail] Échec de l'envoi de la quittance", error);
            return false;
        }
    }

    static async sendRelance(params: RelanceParams): Promise<boolean> {
        if (!resend || !MAIL_FROM_ADDRESS || !params.to) {
            console.warn(`[mail] Envoi ignoré (Resend non configuré) — relance ${params.numeroFacture}`);
            return false;
        }

        const niveauLabel = NIVEAU_RELANCE_LABELS[params.niveau];

        try {
            await resend.emails.send({
                from: `${params.organizationNom} <${MAIL_FROM_ADDRESS}>`,
                to: params.to,
                subject: `${niveauLabel} — Facture ${params.numeroFacture}`,
                attachments: params.attachment ? [params.attachment] : undefined,
                react: (
                    <RelanceTemplate
                        organizationNom={params.organizationNom}
                        organizationLogo={params.organizationLogo}
                        locataireNom={params.locataireNom}
                        uniteLabel={params.uniteLabel}
                        numeroFacture={params.numeroFacture}
                        soldeRestant={params.soldeRestant}
                        joursRetard={params.joursRetard}
                        niveauLabel={niveauLabel}
                        message={NIVEAU_RELANCE_MESSAGES[params.niveau]}
                    />
                ),
            });

            return true;
        } catch (error) {
            console.error("[mail] Échec de l'envoi de la relance", error);
            return false;
        }
    }
}
