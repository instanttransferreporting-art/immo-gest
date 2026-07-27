import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import {QueryProvider, SessionProvider, ThemeProvider} from "@/providers";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Immo Gest",
    description: "Plateforme de gestion immobilière",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr" suppressHydrationWarning className={inter.variable}>
        <body>
        <ThemeProvider>
            <SessionProvider>
                <QueryProvider>
                    <Toaster>{children}</Toaster>
                </QueryProvider>
            </SessionProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}