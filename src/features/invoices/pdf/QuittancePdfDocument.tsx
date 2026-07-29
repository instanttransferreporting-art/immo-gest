import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

type QuittancePdfDocumentProps = {
    organizationNom: string;
    organizationAdresse: string | null;
    numeroFacture: string;
    periodeLabel: string;
    dateEmissionLabel: string;
    locataireNom: string;
    uniteLabel: string;
    montantLoyer: number;
    montantCharges: number;
    totalDu: number;
    totalEncaisse: number;
    soldeRestant: number;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#ffffff",
        color: "#0f172a",
        fontFamily: "Helvetica",
        fontSize: 11,
        padding: 48,
    },
    header: {
        borderBottomColor: "#e2e8f0",
        borderBottomWidth: 1,
        marginBottom: 24,
        paddingBottom: 16,
    },
    organizationNom: {
        fontSize: 16,
        fontWeight: 700,
    },
    organizationAdresse: {
        color: "#64748b",
        fontSize: 9,
        marginTop: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: 700,
        marginBottom: 4,
        marginTop: 16,
    },
    subtitle: {
        color: "#64748b",
        fontSize: 10,
        marginBottom: 24,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    label: {
        color: "#64748b",
    },
    value: {
        fontWeight: 700,
    },
    section: {
        borderTopColor: "#e2e8f0",
        borderTopWidth: 1,
        marginTop: 16,
        paddingTop: 16,
    },
    totalRow: {
        borderTopColor: "#0f172a",
        borderTopWidth: 1,
        flexDirection: "row",
        fontWeight: 700,
        justifyContent: "space-between",
        marginTop: 8,
        paddingTop: 8,
    },
    footer: {
        color: "#94a3b8",
        bottom: 32,
        fontSize: 8,
        left: 48,
        position: "absolute",
    },
});

export function QuittancePdfDocument({
    organizationNom,
    organizationAdresse,
    numeroFacture,
    periodeLabel,
    dateEmissionLabel,
    locataireNom,
    uniteLabel,
    montantLoyer,
    montantCharges,
    totalDu,
    totalEncaisse,
    soldeRestant,
}: QuittancePdfDocumentProps) {
    return (
        <Document title={`Quittance ${numeroFacture}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.organizationNom}>{organizationNom}</Text>
                    {organizationAdresse ? <Text style={styles.organizationAdresse}>{organizationAdresse}</Text> : null}
                </View>

                <Text style={styles.title}>Quittance de Loyer</Text>
                <Text style={styles.subtitle}>Facture {numeroFacture}</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Locataire</Text>
                    <Text style={styles.value}>{locataireNom}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Unité</Text>
                    <Text style={styles.value}>{uniteLabel}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Période</Text>
                    <Text style={styles.value}>{periodeLabel}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Date d&apos;émission</Text>
                    <Text style={styles.value}>{dateEmissionLabel}</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Loyer</Text>
                        <Text>{currencyFormatter.format(montantLoyer)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Charges</Text>
                        <Text>{currencyFormatter.format(montantCharges)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Total dû</Text>
                        <Text style={styles.value}>{currencyFormatter.format(totalDu)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Total encaissé</Text>
                        <Text style={styles.value}>{currencyFormatter.format(totalEncaisse)}</Text>
                    </View>

                    <View style={styles.totalRow}>
                        <Text>Reste à payer</Text>
                        <Text>{currencyFormatter.format(soldeRestant)}</Text>
                    </View>
                </View>

                <Text style={styles.footer} fixed>
                    Document généré automatiquement par {organizationNom} via Immo Gest.
                </Text>
            </Page>
        </Document>
    );
}
