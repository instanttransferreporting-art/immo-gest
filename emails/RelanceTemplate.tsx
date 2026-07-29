import { Text } from "@react-email/components";

import { EmailLayout, styles } from "./components/EmailLayout";

type RelanceTemplateProps = {
    organizationNom: string;
    organizationLogo?: string | null;
    locataireNom: string;
    uniteLabel: string;
    numeroFacture: string;
    soldeRestant: number;
    joursRetard: number;
    niveauLabel: string;
    message: string;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

export default function RelanceTemplate({
    organizationNom,
    organizationLogo,
    locataireNom,
    uniteLabel,
    numeroFacture,
    soldeRestant,
    joursRetard,
    niveauLabel,
    message,
}: RelanceTemplateProps) {
    return (
        <EmailLayout
            previewText={`${niveauLabel} — Facture ${numeroFacture} en retard de ${joursRetard} jour(s)`}
            organizationNom={organizationNom}
            organizationLogo={organizationLogo}
            title={niveauLabel}
        >
            <Text style={styles.text}>Bonjour {locataireNom},</Text>
            <Text style={styles.text}>{message}</Text>

            <Text style={styles.label}>Logement</Text>
            <Text style={styles.value}>{uniteLabel}</Text>

            <Text style={styles.label}>Facture</Text>
            <Text style={styles.value}>
                {numeroFacture} — {joursRetard} jour(s) de retard
            </Text>

            <div style={styles.amountBox}>
                <Text style={styles.label}>Solde restant dû</Text>
                <Text style={styles.amount}>{currencyFormatter.format(soldeRestant)}</Text>
            </div>
        </EmailLayout>
    );
}
