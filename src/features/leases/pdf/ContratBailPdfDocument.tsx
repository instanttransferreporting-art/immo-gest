import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { ContratParagraph } from "@/features/leases/services/contrat-docx.service";

type ContratBailPdfDocumentProps = {
    paragraphs: ContratParagraph[];
};

const FONT = {
    regular: "Times-Roman",
    bold: "Times-Bold",
    italic: "Times-Italic",
    boldItalic: "Times-BoldItalic",
} as const;

const styles = StyleSheet.create({
    page: {
        color: "#000000",
        fontFamily: FONT.regular,
        fontSize: 10.5,
        lineHeight: 1.45,
        paddingBottom: 56,
        paddingHorizontal: 48,
        paddingTop: 48,
    },
    spacer: { height: 7 },
    title: { fontSize: 14, textAlign: "center" },
    indented: { marginLeft: 22 },
    columns: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
    column: { width: "46%" },
    footer: {
        bottom: 26,
        color: "#444444",
        fontSize: 9,
        position: "absolute",
        right: 48,
        textAlign: "right",
    },
});

function fontFor(run: { bold: boolean; italic: boolean }) {
    if (run.bold && run.italic) {
        return FONT.boldItalic;
    }

    return run.bold ? FONT.bold : run.italic ? FONT.italic : FONT.regular;
}

function cleanText(text: string): string {
    return text.replace(/\t+/g, " ");
}

/** Signatures : « LE BAILLEUR    LE PRENEUR » est écrit à coups de tabulations dans le modèle Word. */
function splitColumns(paragraph: ContratParagraph): string[] | null {
    if (!paragraph.text.includes("\t") && !/\S\s{6,}\S/.test(paragraph.text)) {
        return null;
    }

    const parts = paragraph.text
        .split(/\t[\t ]*|\s{6,}/)
        .map((part) => part.trim())
        .filter(Boolean);

    return parts.length === 2 ? parts : null;
}

export function ContratBailPdfDocument({ paragraphs }: ContratBailPdfDocumentProps) {
    const counters = new Map<string, number>();

    return (
        <Document title="Contrat de bail" author="Immo Gest">
            <Page size="A4" style={styles.page}>
                {paragraphs.map((paragraph, index) => {
                    if (!paragraph.text.trim()) {
                        return <View key={index} style={styles.spacer} />;
                    }

                    const columns = splitColumns(paragraph);

                    if (columns) {
                        const font = fontFor(paragraph.runs[0] ?? { bold: true, italic: false });

                        return (
                            <View key={index} style={styles.columns} wrap={false}>
                                {columns.map((column) => (
                                    <Text key={column} style={[styles.column, { fontFamily: font }]}>
                                        {column}
                                    </Text>
                                ))}
                            </View>
                        );
                    }

                    let prefix = "";

                    if (paragraph.numId === "11") {
                        prefix = "•  ";
                    } else if (paragraph.numId) {
                        const next = (counters.get(paragraph.numId) ?? 0) + 1;
                        counters.set(paragraph.numId, next);
                        prefix = `${next}.  `;
                    } else if (/^Soit /.test(paragraph.text)) {
                        prefix = "•  ";
                    }

                    const isHeading = index === 0 || (paragraph.numId === "1" && paragraph.runs.every((run) => run.bold));

                    return (
                        <Text
                            key={index}
                            minPresenceAhead={isHeading ? 60 : 0}
                            style={[
                                { textAlign: paragraph.align === "justify" ? "justify" : paragraph.align },
                                paragraph.indented ? styles.indented : {},
                                index === 0 ? styles.title : {},
                            ]}
                        >
                            {prefix ? <Text style={{ fontFamily: isHeading ? FONT.bold : FONT.regular }}>{prefix}</Text> : null}
                            {paragraph.runs.map((run, runIndex) => (
                                <Text
                                    key={runIndex}
                                    style={{
                                        fontFamily: fontFor(run),
                                        textDecoration: run.underline ? "underline" : "none",
                                    }}
                                >
                                    {cleanText(run.text)}
                                </Text>
                            ))}
                        </Text>
                    );
                })}

                <Text
                    style={styles.footer}
                    fixed
                    render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`}
                />
            </Page>
        </Document>
    );
}
