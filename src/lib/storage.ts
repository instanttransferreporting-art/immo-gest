import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DOCUMENTS_BUCKET = "documents";

let cachedClient: SupabaseClient | null = null;

function getStorageClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error("Le stockage Supabase n'est pas configuré (variables d'environnement manquantes).");
    }

    if (!cachedClient) {
        cachedClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    }

    return cachedClient;
}

export async function uploadFile(path: string, file: File): Promise<string> {
    const { error } = await getStorageClient()
        .storage.from(DOCUMENTS_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });

    if (error) {
        throw new Error(`Échec de l'upload du fichier : ${error.message}`);
    }

    return path;
}

const SIGNED_URL_TTL_SECONDS = 60 * 5;

/** Lien de téléchargement temporaire (le bucket est privé). */
export async function createSignedDownloadUrl(path: string, filename: string): Promise<string> {
    const { data, error } = await getStorageClient()
        .storage.from(DOCUMENTS_BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS, { download: filename });

    if (error || !data) {
        throw new Error(`Impossible de générer le lien de téléchargement : ${error?.message ?? "inconnu"}`);
    }

    return data.signedUrl;
}
