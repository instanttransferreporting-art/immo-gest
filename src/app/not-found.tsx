import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold">404 - Page non trouvée</h2>
            <p className="text-gray-500">Désolé, la page que vous recherchez n'existe pas.</p>
            <Link
                href="/dashboard"
                className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
                Retourner à l'accueil
            </Link>
        </div>
    );
}