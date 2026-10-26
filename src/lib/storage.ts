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

/**
 * Bucket public des logos d'entreprise : les logos sont affichés dans l'app et
 * intégrés aux emails (qui exigent une URL publique stable), contrairement aux
 * pièces de bail du bucket privé `documents`.
 */
const LOGOS_BUCKET = "logos";
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;

let logosBucketReady = false;

async function ensureLogosBucket(): Promise<void> {
    if (logosBucketReady) {
        return;
    }

    const storage = getStorageClient().storage;
    const { data } = await storage.getBucket(LOGOS_BUCKET);

    if (!data) {
        const { error } = await storage.createBucket(LOGOS_BUCKET, {
            public: true,
            fileSizeLimit: MAX_LOGO_SIZE_BYTES,
            allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
        });

        // Une création concurrente peut déjà l'avoir créé entre-temps.
        if (error && !/already exists/i.test(error.message)) {
            throw new Error(`Impossible de créer le bucket des logos : ${error.message}`);
        }
    }

    logosBucketReady = true;
}

/** Téléverse un logo et retourne son URL publique. */
export async function uploadPublicLogo(path: string, file: File): Promise<string> {
    await ensureLogosBucket();

    const storage = getStorageClient().storage.from(LOGOS_BUCKET);
    const { error } = await storage.upload(path, file, { upsert: true, contentType: file.type });

    if (error) {
        throw new Error(`Échec de l'upload du logo : ${error.message}`);
    }

    return storage.getPublicUrl(path).data.publicUrl;
}

/** Supprime un logo à partir de son URL publique (sans effet si l'URL est externe). */
export async function deletePublicLogo(publicUrl: string): Promise<void> {
    const marker = `/storage/v1/object/public/${LOGOS_BUCKET}/`;
    const index = publicUrl.indexOf(marker);

    if (index === -1) {
        return;
    }

    const path = decodeURIComponent(publicUrl.slice(index + marker.length));
    await getStorageClient().storage.from(LOGOS_BUCKET).remove([path]);
}
