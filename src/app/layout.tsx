import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import {QueryProvider, SessionProvider, ThemeProvider} from "@/providers";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const geistSans = Geist({
    subsets: ['latin'],
    variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-geist-mono',
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
        <html lang="fr" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
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