import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { AuthBackdrop } from "@/features/auth/components/AuthArt";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
            <AuthBackdrop />
            <LanguageSwitcher className="absolute top-4 right-4 z-10" />
            <div className="relative z-10 w-full max-w-4xl">{children}</div>
        </div>
    );
}
