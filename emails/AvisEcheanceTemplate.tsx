import { Text } from "@react-email/components";

import { EmailLayout, styles } from "./components/EmailLayout";

type AvisEcheanceTemplateProps = {
    organizationNom: string;
    organizationLogo?: string | null;
    locataireNom: string;
    uniteLabel: string;
    numeroFacture: string;
    montantTotal: number;
    dateEcheance: string;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

export default function AvisEcheanceTemplate({
    organizationNom,
    organizationLogo,
    locataireNom,
    uniteLabel,
    numeroFacture,
    montantTotal,
    dateEcheance,
}: AvisEcheanceTemplateProps) {
    return (
        <EmailLayout
            previewText={`Avis d'échéance ${numeroFacture} — ${currencyFormatter.format(montantTotal)}`}
            organizationNom={organizationNom}
            organizationLogo={organizationLogo}
            title="Avis d'échéance de loyer"
        >
            <Text style={styles.text}>Bonjour {locataireNom},</Text>
            <Text style={styles.text}>
                Voici l&apos;avis d&apos;échéance pour votre logement <strong>{uniteLabel}</strong>, facture{" "}
                <strong>{numeroFacture}</strong>, à régler avant le <strong>{dateEcheance}</strong>.
            </Text>

            <div style={styles.amountBox}>
                <Text style={styles.label}>Montant à régler</Text>
                <Text style={styles.amount}>{currencyFormatter.format(montantTotal)}</Text>
            </div>

            <Text style={styles.text}>
                Merci de procéder au règlement dans les meilleurs délais auprès de votre agence.
            </Text>
        </EmailLayout>
    );
}
