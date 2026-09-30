export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted">
            <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-sm font-medium text-muted-foreground">Chargement en cours...</p>
            </div>
        </div>
    );
}