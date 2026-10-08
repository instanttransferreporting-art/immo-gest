import { readFile } from "node:fs/promises";
import path from "node:path";

import JSZip from "jszip";

import type { PeriodiciteBail } from "@/features/leases/schemas/contrat-document.schema";
import { formatMontantEnLettres, numberToWordsFr } from "@/features/leases/utils/number-to-words-fr";

const TEMPLATE_PATH = path.join(process.cwd(), "src", "features", "leases", "templates", "contrat-bail.docx");
const DOCUMENT_XML = "word/document.xml";

/** Données déjà résolues (période calculée) injectées dans le modèle Word. */
export type ContratBailDocData = {
    civilite: string;
    locataireNom: string;
    nationalite: string;
    pieceIdentite: string;
    pieceDelivreeLe: string;
    pieceDelivreeA: string;
    telephone: string;
    localisation: string;
    surface: number;
    composition: string;
    dateDebut: Date;
    dateFin: Date;
    reconductionAuto: boolean;
    loyer: number;
    periodicite: PeriodiciteBail;
    moisAvance: number;
    depotMois: number;
    depotMontant: number;
    chargesMontant: number;
    natureCharges?: string;
    tauxPenalite: number;
    delaiPenaliteJours: number;
    dateSignature: Date;
};

export type ContratParagraph = {
    text: string;
    runs: Array<{ text: string; bold: boolean; italic: boolean; underline: boolean }>;
    align: "left" | "center" | "right" | "justify";
    numId: string | null;
    indented: boolean;
};

type Edit = { start: number; end: number; value: string };

// Une zone à remplir = série de points ou de « … ». Deux zones séparées par un simple espace
// (« ……. ………. ») forment un seul champ.
const FIELD_REGEX = /[….]{2,}(?:\s[….]{2,})*/g;

// ---------- Utilitaires XML ----------

const decodeXml = (value: string) =>
    value
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&");

const encodeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const PARAGRAPH_RE = /<w:p[ >][\s\S]*?<\/w:p>/g;
const TEXT_NODE_RE = /<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g;

function paragraphText(paragraphXml: string): string {
    return [...paragraphXml.matchAll(TEXT_NODE_RE)].map((m) => decodeXml(m[1])).join("");
}

/** Applique des remplacements (positions dans le texte concaténé) sur les nœuds <w:t> d'un paragraphe. */
function applyEdits(paragraphXml: string, edits: Edit[]): string {
    if (edits.length === 0) {
        return paragraphXml;
    }

    let offset = 0;

    return paragraphXml.replace(TEXT_NODE_RE, (node, rawText: string) => {
        const text = decodeXml(rawText);
        const nodeStart = offset;
        offset += text.length;

        let output = "";
        let changed = false;

        for (let i = 0; i < text.length; i += 1) {
            const position = nodeStart + i;
            const startingEdit = edits.find((edit) => edit.start === position);

            if (startingEdit) {
                output += startingEdit.value;
                changed = true;
            }

            if (edits.some((edit) => position >= edit.start && position < edit.end)) {
                changed = true;
                continue;
            }

            output += text[i];
        }

        return changed ? `<w:t xml:space="preserve">${encodeXml(output)}</w:t>` : node;
    });
}

// ---------- Mise en forme des valeurs ----------

const MONTHS = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

// Les dates du bail sont manipulées en UTC (minuit) pour ne pas dépendre du fuseau du serveur.
export function formatDateBail(date: Date): string {
    const day = date.getUTCDate() === 1 ? "1er" : String(date.getUTCDate());
    return `${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Nombre de mois calendaires couverts, du mois de début au mois de fin inclus. */
export function countMonths(dateDebut: Date, dateFin: Date): number {
    return (dateFin.getUTCFullYear() - dateDebut.getUTCFullYear()) * 12 + (dateFin.getUTCMonth() - dateDebut.getUTCMonth()) + 1;
}

/** `null` = formulation d'origine du modèle (trimestrielle). */
const PERIODICITE_TEXT: Record<PeriodiciteBail, { adverbe: string; jour: string } | null> = {
    MENSUEL: { adverbe: "mensuellement", jour: "du mois" },
    TRIMESTRIEL: null,
    SEMESTRIEL: { adverbe: "semestriellement", jour: "du 1er mois du semestre" },
    ANNUEL: { adverbe: "annuellement", jour: "du 1er mois de l’année" },
};

const NO_RECONDUCTION_TEXT =
    "Le bail prend fin de plein droit à son terme, sans qu’il soit besoin de donner congé. " +
    "Toute reconduction devra faire l’objet d’un nouvel accord écrit des parties.";

function formatMois(count: number): string {
    return `${String(count).padStart(2, "0")} (${numberToWordsFr(count)})`;
}

function formatTaux(rate: number): string {
    return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(rate)}%`;
}

// ---------- Règles de remplissage ----------

type ParagraphRule = {
    /** Début du texte du paragraphe visé. */
    startsWith: string;
    /** Valeur de chaque zone de points, dans l'ordre. */
    fields?: string[];
    /** Remplacements de texte littéral. */
    replacements?: Array<{ find: string; value: string }>;
    /** Remplace le texte depuis `find` jusqu'à la fin du paragraphe. */
    replaceTail?: { find: string; value: string };
};

function buildRules(data: ContratBailDocData): ParagraphRule[] {
    const periodicite = PERIODICITE_TEXT[data.periodicite];
    const tauxCharges = data.loyer > 0 ? (data.chargesMontant / data.loyer) * 100 : 0;
    const natureCharges = data.natureCharges?.trim();

    return [
        {
            startsWith: "Monsieur/Madame",
            replacements: [{ find: "Monsieur/Madame", value: data.civilite }],
            fields: [
                ` ${data.locataireNom}`,
                data.nationalite,
                // Dans le modèle, ces zones touchent le texte voisin (« numéro ……délivrée le ……à…… »).
                `${data.pieceIdentite} `,
                `${data.pieceDelivreeLe} `,
                ` ${data.pieceDelivreeA}`,
                data.telephone,
            ],
        },
        {
            startsWith: "Le bailleur donne à titre de bail",
            fields: [data.localisation, String(data.surface).replace(".", ","), `${data.composition}.`],
        },
        // Les points de « comprenant … » débordent sur le début du paragraphe suivant.
        { startsWith: "…", fields: [""] },
        {
            startsWith: "Le bail est consenti pour un terme",
            fields: [
                String(countMonths(data.dateDebut, data.dateFin)),
                formatDateBail(data.dateDebut),
                formatDateBail(data.dateFin),
            ],
            // Le modèle contient un « . » isolé avant la clause de reconduction.
            replacements: data.reconductionAuto ? [{ find: " . A défaut", value: ". A défaut" }] : undefined,
            replaceTail: data.reconductionAuto ? undefined : { find: " . A défaut", value: `. ${NO_RECONDUCTION_TEXT}` },
        },
        {
            startsWith: "La présente location est consentie",
            fields: [formatMontantEnLettres(data.loyer)],
        },
        {
            startsWith: "Le locataire paiera",
            fields: [`${formatMois(data.moisAvance)} de loyer`],
            replacements: periodicite
                ? [
                      { find: "trimestriellement", value: periodicite.adverbe },
                      { find: "du 1er mois du trimestre", value: periodicite.jour },
                  ]
                : undefined,
        },
        {
            startsWith: "Le dépôt de garantie correspond",
            fields: [formatMontantEnLettres(data.depotMontant)],
            replacements: [{ find: "02 (deux)", value: formatMois(data.depotMois) }],
        },
        {
            startsWith: "Ces charges représentent",
            fields: [formatMontantEnLettres(data.chargesMontant)],
            replacements: [
                { find: "5%", value: formatTaux(tauxCharges) },
                ...(natureCharges
                    ? [
                          {
                              find: "hors taxes par mois.",
                              value: `hors taxes par mois. Nature des charges : ${natureCharges}.`,
                          },
                      ]
                    : []),
            ],
        },
        {
            startsWith: "Tout montant dû par les preneurs",
            replacements: [
                { find: "non payé 10 jours", value: `non payé ${data.delaiPenaliteJours} jours` },
                { find: "5% par mois", value: `${formatTaux(data.tauxPenalite)} par mois` },
            ],
        },
        {
            startsWith: "Fait à Yaoundé le",
            fields: [formatDateBail(data.dateSignature)],
        },
    ];
}

function buildEdits(text: string, rule: ParagraphRule): Edit[] {
    const edits: Edit[] = [];

    if (rule.fields) {
        const matches = [...text.matchAll(FIELD_REGEX)];

        if (matches.length !== rule.fields.length) {
            throw new Error(
                `Modèle de bail inattendu : ${matches.length} zone(s) à remplir trouvée(s) pour « ${rule.startsWith} », ${rule.fields.length} attendue(s).`
            );
        }

        matches.forEach((match, index) => {
            edits.push({ start: match.index, end: match.index + match[0].length, value: rule.fields![index] });
        });
    }

    for (const { find, value } of rule.replacements ?? []) {
        const index = text.indexOf(find);

        if (index === -1) {
            throw new Error(`Modèle de bail inattendu : « ${find} » introuvable.`);
        }

        edits.push({ start: index, end: index + find.length, value });
    }

    if (rule.replaceTail) {
        const index = text.indexOf(rule.replaceTail.find);

        if (index === -1) {
            throw new Error(`Modèle de bail inattendu : « ${rule.replaceTail.find} » introuvable.`);
        }

        edits.push({ start: index, end: text.trimEnd().length, value: rule.replaceTail.value });
    }

    return edits;
}

/** Remplit le modèle Word avec les données du bail et retourne le .docx. */
export async function fillContratDocx(data: ContratBailDocData): Promise<Buffer> {
    const template = await readFile(TEMPLATE_PATH);
    const zip = await JSZip.loadAsync(template);
    const documentFile = zip.file(DOCUMENT_XML);

    if (!documentFile) {
        throw new Error("Modèle de bail invalide : word/document.xml introuvable.");
    }

    const xml = await documentFile.async("string");
    const rules = buildRules(data);
    const applied = new Set<ParagraphRule>();

    const filled = xml.replace(PARAGRAPH_RE, (paragraph) => {
        const text = paragraphText(paragraph);
        const rule = rules.find((candidate) => !applied.has(candidate) && text.startsWith(candidate.startsWith));

        if (!rule) {
            return paragraph;
        }

        applied.add(rule);

        return applyEdits(paragraph, buildEdits(text, rule));
    });

    const missing = rules.find((rule) => !applied.has(rule));

    if (missing) {
        throw new Error(`Modèle de bail inattendu : paragraphe « ${missing.startsWith} » introuvable.`);
    }

    zip.file(DOCUMENT_XML, filled);

    return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

// ---------- Lecture du .docx rempli (pour le rendu PDF) ----------

const attr = (xml: string, tag: string) => new RegExp(`<${tag}(?: [^>]*?)?w:val="([^"]*)"`).exec(xml)?.[1];

/** Extrait les paragraphes (texte + style simple) d'un .docx rempli. */
export async function readContratParagraphs(docx: Buffer): Promise<ContratParagraph[]> {
    const zip = await JSZip.loadAsync(docx);
    const xml = (await zip.file(DOCUMENT_XML)?.async("string")) ?? "";
    const paragraphs: ContratParagraph[] = [];

    for (const [paragraph] of xml.matchAll(PARAGRAPH_RE)) {
        const pPr = /<w:pPr>[\s\S]*?<\/w:pPr>/.exec(paragraph)?.[0] ?? "";
        const markProps = /<w:rPr>[\s\S]*?<\/w:rPr>/.exec(pPr)?.[0] ?? "";
        const layoutProps = pPr.replace(markProps, "");
        const jc = attr(layoutProps, "w:jc");
        const runs: ContratParagraph["runs"] = [];

        for (const [run] of paragraph.matchAll(/<w:r[ >][\s\S]*?<\/w:r>/g)) {
            const rPr = /<w:rPr>[\s\S]*?<\/w:rPr>/.exec(run)?.[0] ?? "";
            const flag = (tag: string) =>
                new RegExp(`<${tag}(?: [^>]*)?/>`).test(rPr) && !new RegExp(`<${tag} w:val="(?:0|false)"`).test(rPr);
            let text = "";

            for (const token of run.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>|<w:(tab)\/>/g)) {
                text += token[2] ? "\t" : decodeXml(token[1]);
            }

            if (text) {
                runs.push({
                    text,
                    bold: flag("w:b"),
                    italic: flag("w:i"),
                    underline: /<w:u w:val="(?!none)/.test(rPr),
                });
            }
        }

        paragraphs.push({
            text: runs.map((run) => run.text).join(""),
            runs,
            align: jc === "center" ? "center" : jc === "right" ? "right" : jc === "both" ? "justify" : "left",
            numId: attr(layoutProps, "w:numId") ?? null,
            indented: /<w:ind [^>]*w:left="[1-9]/.test(layoutProps),
        });
    }

    return paragraphs;
}
