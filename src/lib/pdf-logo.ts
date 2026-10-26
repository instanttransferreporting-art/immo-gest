import sharp from "sharp";

/** Source d'image directement utilisable par `<Image src={...} />` de @react-pdf/renderer. */
export type PdfImageSource = { data: Buffer; format: "png" };

const FETCH_TIMEOUT_MS = 5_000;
const MAX_WIDTH_PX = 1200;

// Les URL de logo sont horodatées à chaque téléversement : une URL donnée ne change jamais de contenu.
const cache = new Map<string, Promise<PdfImageSource | null>>();

/** Logo à imprimer : le logo « documents » s'il existe, sinon le logo carré de l'application. */
export function documentLogoUrl(organization: { logo: string | null; logoDocument: string | null }): string | null {
    return organization.logoDocument ?? organization.logo;
}

async function fetchAsPng(url: string): Promise<PdfImageSource | null> {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        // react-pdf ne lit que PNG/JPEG : on normalise tout (WebP compris) en PNG.
        const data = await sharp(Buffer.from(await response.arrayBuffer()))
            .resize({ width: MAX_WIDTH_PX, withoutEnlargement: true })
            .png()
            .toBuffer();

        return { data, format: "png" };
    } catch (error) {
        console.error(`[pdf] Logo indisponible, document généré sans logo (${url})`, error);
        return null;
    }
}

/**
 * Charge le logo pour un PDF. Ne lève jamais : un logo inaccessible ne doit pas
 * empêcher l'édition d'une facture ou d'un contrat.
 */
export async function loadPdfLogo(url: string | null): Promise<PdfImageSource | null> {
    if (!url) {
        return null;
    }

    let pending = cache.get(url);

    if (!pending) {
        pending = fetchAsPng(url);
        cache.set(url, pending);
        // Échec : on retentera au prochain document plutôt que de garder l'échec en cache.
        void pending.then((result) => {
            if (!result) {
                cache.delete(url);
            }
        });
    }

    return pending;
}
