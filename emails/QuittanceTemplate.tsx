import { Text } from "@react-email/components";

import { EmailLayout, styles } from "./components/EmailLayout";

type QuittanceTemplateProps = {
    organizationNom: string;
    organizationLogo?: string | null;
    locataireNom: string;
    uniteLabel: string;
    numeroFacture: string;
    montantPaye: number;
    modePaiement: string;
    datePaiement: string;
    soldeRestant: number;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

export default function QuittanceTemplate({
    organizationNom,
    organizationLogo,
    locataireNom,
    uniteLabel,
    numeroFacture,
    montantPaye,
    modePaiement,
    datePaiement,
    soldeRestant,
}: QuittanceTemplateProps) {
    return (
        <EmailLayout
            previewText={`Quittance ${numeroFacture} — ${currencyFormatter.format(montantPaye)} reçu`}
            organizationNom={organizationNom}
            organizationLogo={organizationLogo}
            title="Quittance de loyer"
        >
            <Text style={styles.text}>Bonjour {locataireNom},</Text>
            <Text style={styles.text}>
                Nous confirmons la réception de votre paiement pour <strong>{uniteLabel}</strong>, facture{" "}
                <strong>{numeroFacture}</strong>, le <strong>{datePaiement}</strong> par {modePaiement}.
            </Text>

            <div style={styles.amountBox}>
                <Text style={styles.label}>Montant reçu</Text>
                <Text style={styles.amount}>{currencyFormatter.format(montantPaye)}</Text>
            </div>

            {soldeRestant > 0 ? (
                <Text style={styles.text}>
                    Solde restant dû sur cette facture : <strong>{currencyFormatter.format(soldeRestant)}</strong>.
                </Text>
            ) : (
                <Text style={styles.text}>Cette facture est désormais intégralement soldée. Merci.</Text>
            )}
        </EmailLayout>
    );
}
