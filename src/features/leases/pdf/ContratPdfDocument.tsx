import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { formatMontantPdf } from "@/lib/pdf-format";

type ContratPdfDocumentProps = {
    organizationNom: string;
    organizationAdresse: string | null;
    numeroContrat: string;
    proprietaireNom: string;
    locataireNom: string;
    locatairePieceIdentite: string;
    immeubleNom: string;
    immeubleAdresse: string;
    immeubleVille: string;
    uniteNumero: string;
    uniteTypeLabel: string;
    dateDebutLabel: string;
    dateFinLabel: string;
    loyerBase: number;
    charges: number;
    frequenceLabel: string;
    depotGarantie: number;
};

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#ffffff",
        color: "#0f172a",
        fontFamily: "Helvetica",
        fontSize: 10,
        lineHeight: 1.5,
        padding: 48,
    },
    header: {
        borderBottomColor: "#e2e8f0",
        borderBottomWidth: 1,
        marginBottom: 20,
        paddingBottom: 12,
    },
    organizationNom: {
        fontSize: 14,
        fontWeight: 700,
    },
    organizationAdresse: {
        color: "#64748b",
        fontSize: 8,
        marginTop: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: 700,
        marginBottom: 4,
        textAlign: "center",
    },
    subtitle: {
        color: "#64748b",
        fontSize: 9,
        marginBottom: 20,
        textAlign: "center",
    },
    sectionTitle: {
        backgroundColor: "#f1f5f9",
        fontSize: 10,
        fontWeight: 700,
        marginBottom: 8,
        marginTop: 16,
        padding: 6,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    label: {
        color: "#64748b",
    },
    value: {
        fontWeight: 700,
    },
    paragraph: {
        marginBottom: 6,
        textAlign: "justify",
    },
    clause: {
        marginBottom: 4,
        paddingLeft: 10,
        textAlign: "justify",
    },
    signatures: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 48,
    },
    signatureBlock: {
        width: "45%",
    },
    signatureLabel: {
        fontWeight: 700,
        marginBottom: 32,
    },
    signatureLine: {
        borderTopColor: "#0f172a",
        borderTopWidth: 1,
        paddingTop: 4,
    },
    footer: {
        color: "#94a3b8",
        bottom: 24,
        fontSize: 8,
        left: 48,
        position: "absolute",
    },
    pageNumber: {
        bottom: 24,
        color: "#94a3b8",
        fontSize: 8,
        position: "absolute",
        right: 48,
    },
});

export function ContratPdfDocument({
    organizationNom,
    organizationAdresse,
    numeroContrat,
    proprietaireNom,
    locataireNom,
    locatairePieceIdentite,
    immeubleNom,
    immeubleAdresse,
    immeubleVille,
    uniteNumero,
    uniteTypeLabel,
    dateDebutLabel,
    dateFinLabel,
    loyerBase,
    charges,
    frequenceLabel,
    depotGarantie,
}: ContratPdfDocumentProps) {
    return (
        <Document title={`Contrat de bail ${numeroContrat}`}>
            <Page size="A4" style={styles.page} wrap>
                <View style={styles.header}>
                    <Text style={styles.organizationNom}>{organizationNom}</Text>
                    {organizationAdresse ? <Text style={styles.organizationAdresse}>{organizationAdresse}</Text> : null}
                </View>

                <Text style={styles.title}>Contrat de Bail à Usage d&apos;Habitation</Text>
                <Text style={styles.subtitle}>Contrat n° {numeroContrat}</Text>

                <Text style={styles.sectionTitle}>Entre les soussignés</Text>
                <Text style={styles.paragraph}>
                    <Text style={styles.value}>Le Bailleur : </Text>
                    {proprietaireNom}, ci-après représenté par son mandataire de gestion {organizationNom},
                    d&apos;une part,
                </Text>
                <Text style={styles.paragraph}>
                    <Text style={styles.value}>Le Preneur : </Text>
                    {locataireNom}, titulaire de la pièce d&apos;identité n° {locatairePieceIdentite}, d&apos;autre
                    part,
                </Text>
                <Text style={styles.paragraph}>Il a été convenu et arrêté ce qui suit :</Text>

                <Text style={styles.sectionTitle}>Article 1 — Objet et désignation du bien loué</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Immeuble</Text>
                    <Text style={styles.value}>{immeubleNom}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Adresse</Text>
                    <Text style={styles.value}>
                        {immeubleAdresse}, {immeubleVille}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Unité louée</Text>
                    <Text style={styles.value}>
                        {uniteNumero} ({uniteTypeLabel})
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Article 2 — Durée du bail</Text>
                <Text style={styles.paragraph}>
                    Le présent bail est consenti et accepté pour une durée débutant le{" "}
                    <Text style={styles.value}>{dateDebutLabel}</Text> et se terminant le{" "}
                    <Text style={styles.value}>{dateFinLabel}</Text>, sauf résiliation anticipée dans les conditions
                    prévues à l&apos;Article 6.
                </Text>

                <Text style={styles.sectionTitle}>Article 3 — Loyer et charges</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Loyer mensuel de base</Text>
                    <Text style={styles.value}>{formatMontantPdf(loyerBase)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Charges</Text>
                    <Text style={styles.value}>{formatMontantPdf(charges)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Fréquence de paiement</Text>
                    <Text style={styles.value}>{frequenceLabel}</Text>
                </View>
                <Text style={styles.paragraph}>
                    Le loyer est payable d&apos;avance, à la charge du Preneur, selon la fréquence convenue ci-dessus.
                </Text>

                <Text style={styles.sectionTitle}>Article 4 — Dépôt de garantie</Text>
                <Text style={styles.paragraph}>
                    Un dépôt de garantie de <Text style={styles.value}>{formatMontantPdf(depotGarantie)}</Text>{" "}
                    est versé par le Preneur à la signature du présent contrat. Il sera restitué en fin de bail,
                    déduction faite le cas échéant des sommes dues au titre de dégradations locatives ou d&apos;impayés.
                </Text>

                <Text style={styles.sectionTitle}>Article 5 — Obligations des parties</Text>
                <Text style={styles.clause}>
                    • Le Preneur s&apos;engage à payer le loyer et les charges aux échéances convenues, à user
                    paisiblement des lieux loués et à les rendre en bon état à la fin du bail.
                </Text>
                <Text style={styles.clause}>
                    • Le Bailleur s&apos;engage à délivrer un logement décent et à assurer au Preneur une jouissance
                    paisible des lieux loués pendant toute la durée du bail.
                </Text>

                <Text style={styles.sectionTitle}>Article 6 — Résiliation</Text>
                <Text style={styles.paragraph}>
                    Le présent bail peut être résilié à tout moment d&apos;un commun accord entre les parties, ou par
                    l&apos;une des parties en cas de manquement grave de l&apos;autre partie à ses obligations, après
                    mise en demeure restée sans effet.
                </Text>

                <View style={styles.signatures}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.signatureLabel}>Le Bailleur (ou son mandataire)</Text>
                        <Text style={styles.signatureLine}>Signature</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.signatureLabel}>Le Preneur</Text>
                        <Text style={styles.signatureLine}>Signature</Text>
                    </View>
                </View>

                <Text style={styles.footer} fixed>
                    Document généré automatiquement par {organizationNom} via Immo Gest — ne constitue pas un conseil
                    juridique.
                </Text>
                <Text
                    style={styles.pageNumber}
                    render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    );
}
