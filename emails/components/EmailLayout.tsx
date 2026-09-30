import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import type { ReactNode } from "react";

type EmailLayoutProps = {
    previewText: string;
    organizationNom: string;
    organizationLogo?: string | null;
    title: string;
    children: ReactNode;
};

export function EmailLayout({ previewText, organizationNom, organizationLogo, title, children }: EmailLayoutProps) {
    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Section style={styles.header}>
                        {organizationLogo ? (
                            <Img src={organizationLogo} alt={organizationNom} width="40" height="40" style={styles.logo} />
                        ) : null}
                        <Text style={styles.organizationNom}>{organizationNom}</Text>
                    </Section>

                    <Heading style={styles.title}>{title}</Heading>

                    {children}

                    <Hr style={styles.hr} />

                    <Text style={styles.footer}>
                        Cet email a été envoyé automatiquement par {organizationNom} via Immo Gest. Merci de ne pas y
                        répondre directement si vous n&apos;avez pas de question.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

export const styles = {
    body: {
        backgroundColor: "#f8fafc",
        fontFamily: "Helvetica, Arial, sans-serif",
        margin: 0,
        padding: "24px 0",
    },
    container: {
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        margin: "0 auto",
        maxWidth: "480px",
        padding: "32px",
    },
    header: {
        alignItems: "center",
        display: "flex",
        gap: "8px",
        marginBottom: "16px",
    },
    logo: {
        borderRadius: "8px",
    },
    organizationNom: {
        color: "#0f172a",
        fontSize: "16px",
        fontWeight: 700,
        margin: 0,
    },
    title: {
        color: "#0f172a",
        fontSize: "20px",
        fontWeight: 700,
        margin: "0 0 16px",
    },
    text: {
        color: "#334155",
        fontSize: "14px",
        lineHeight: "22px",
        margin: "0 0 12px",
    },
    label: {
        color: "#64748b",
        fontSize: "13px",
        margin: "0",
    },
    value: {
        color: "#0f172a",
        fontSize: "14px",
        fontWeight: 600,
        margin: "0 0 12px",
    },
    amountBox: {
        backgroundColor: "#f0fdf4",
        borderRadius: "12px",
        margin: "16px 0",
        padding: "16px",
    },
    amount: {
        color: "#047857",
        fontSize: "24px",
        fontWeight: 700,
        margin: 0,
    },
    hr: {
        borderColor: "#e2e8f0",
        margin: "24px 0 16px",
    },
    footer: {
        color: "#94a3b8",
        fontSize: "12px",
        lineHeight: "18px",
        margin: 0,
    },
} as const;
