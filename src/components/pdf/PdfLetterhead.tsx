import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { PdfImageSource } from "@/lib/pdf-logo";

export type PdfLetterheadProps = {
    logo: PdfImageSource | null;
    organizationNom: string;
    organizationAdresse?: string | null;
    organizationContact?: string | null;
    /** Police du document hôte (Helvetica par défaut, Times pour le bail). */
    fontFamily?: string;
    fontFamilyBold?: string;
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderBottomColor: "#e2e8f0",
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        paddingBottom: 12,
    },
    logo: {
        maxHeight: 64,
        maxWidth: 230,
        objectFit: "contain",
    },
    identity: {
        maxWidth: 260,
    },
    identityRight: {
        alignItems: "flex-end",
    },
    nom: {
        fontSize: 14,
    },
    detail: {
        color: "#64748b",
        fontSize: 8,
        marginTop: 2,
    },
});

/**
 * En-tête commun des documents imprimés : logo « documents » de l'entreprise à
 * gauche et coordonnées à droite ; sans logo, les coordonnées seules à gauche.
 */
export function PdfLetterhead({
    logo,
    organizationNom,
    organizationAdresse,
    organizationContact,
    fontFamily = "Helvetica",
    fontFamilyBold = "Helvetica-Bold",
}: PdfLetterheadProps) {
    const identity = (
        <View style={logo ? [styles.identity, styles.identityRight] : styles.identity}>
            <Text style={[styles.nom, { fontFamily: fontFamilyBold }]}>{organizationNom}</Text>
            {organizationAdresse ? (
                <Text style={[styles.detail, { fontFamily }, logo ? { textAlign: "right" } : {}]}>
                    {organizationAdresse}
                </Text>
            ) : null}
            {organizationContact ? (
                <Text style={[styles.detail, { fontFamily }, logo ? { textAlign: "right" } : {}]}>
                    {organizationContact}
                </Text>
            ) : null}
        </View>
    );

    return (
        <View style={styles.container} fixed={false}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- composant PDF, pas d'attribut alt */}
            {logo ? <Image src={logo} style={styles.logo} /> : identity}
            {logo ? identity : null}
        </View>
    );
}
