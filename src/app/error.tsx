"use client";

import { useEffect } from "react";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log l'erreur si besoin
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
            <h2 className="text-xl font-semibold">Une erreur est survenue !</h2>
            <p className="text-gray-500">{error.message || "Erreur interne de l'application"}</p>
            <button
                onClick={() => reset()}
                className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
                Réessayer
            </button>
        </div>
    );
}