import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
            <LanguageSwitcher className="absolute top-4 right-4" />
            {children}
        </div>
    );
}
