import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import {QueryProvider, SessionProvider, ThemeProvider} from "@/providers";
import { Toaster } from "@/components/ui/toast";
import { I18nProvider } from "@/i18n/client";
import { getI18n, getLocale } from "@/i18n/server";

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

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getI18n();

    return { title: t.common.appName, description: t.common.tagline };
}

export default async function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const locale = await getLocale();

    return (
        <html lang={locale} suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
        <body>
        <I18nProvider locale={locale}>
            <ThemeProvider>
                <SessionProvider>
                    <QueryProvider>
                        <Toaster>{children}</Toaster>
                    </QueryProvider>
                </SessionProvider>
            </ThemeProvider>
        </I18nProvider>
        </body>
        </html>
    );
}