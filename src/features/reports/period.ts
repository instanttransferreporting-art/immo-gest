import type { Messages } from "@/i18n/messages";

/**
 * Période d'analyse des rapports, transmise dans l'URL (`?du=AAAA-MM-JJ&au=AAAA-MM-JJ`)
 * pour que l'écran et les exports Excel portent exactement sur les mêmes données.
 * Les deux bornes sont facultatives et incluses ; sans borne, rien n'est filtré.
 */
export type ReportPeriod = Readonly<{
    /** Borne basse incluse (minuit du jour « du »). */
    start: Date | null;
    /** Borne haute exclue (minuit du lendemain du jour « au »). */
    endExclusive: Date | null;
    /** Valeurs d'origine AAAA-MM-JJ, pour les champs de formulaire et les liens d'export. */
    du: string | null;
    au: string | null;
}>;

export const NO_PERIOD: ReportPeriod = { start: null, endExclusive: null, du: null, au: null };

const DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDateInput(value: string | null | undefined): Date | null {
    const match = value ? DATE_INPUT_PATTERN.exec(value) : null;

    if (!match) {
        return null;
    }

    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));

    // Rejette les dates impossibles (ex. 2026-02-31, que Date « corrige » silencieusement).
    return date.getMonth() === Number(match[2]) - 1 ? date : null;
}

export function toDateInput(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Lit la période depuis les paramètres d'URL ; une valeur invalide est ignorée, des bornes inversées sont remises dans l'ordre. */
export function parseReportPeriod(du: string | null | undefined, au: string | null | undefined): ReportPeriod {
    let start = parseDateInput(du);
    let end = parseDateInput(au);

    if (start && end && start > end) {
        [start, end] = [end, start];
    }

    const endExclusive = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1) : null;

    return {
        start,
        endExclusive,
        du: start ? toDateInput(start) : null,
        au: end ? toDateInput(end) : null,
    };
}

export function hasPeriod(period: ReportPeriod): boolean {
    return period.start !== null || period.endExclusive !== null;
}

/** Filtre Prisma `{ gte, lt }` sur un champ date, ou `undefined` si la période est ouverte. */
export function prismaDateRange(period: ReportPeriod): { gte?: Date; lt?: Date } | undefined {
    if (!hasPeriod(period)) {
        return undefined;
    }

    return {
        ...(period.start ? { gte: period.start } : {}),
        ...(period.endExclusive ? { lt: period.endExclusive } : {}),
    };
}

/** Filtre Prisma « le bail a couru au moins un jour sur la période » (dateDebut / dateFin). */
export function prismaOverlapWhere(period: ReportPeriod) {
    return {
        ...(period.endExclusive ? { dateDebut: { lt: period.endExclusive } } : {}),
        ...(period.start ? { dateFin: { gte: period.start } } : {}),
    };
}

export function isInPeriod(date: Date, period: ReportPeriod): boolean {
    return (!period.start || date >= period.start) && (!period.endExclusive || date < period.endExclusive);
}

export function overlapsPeriod(start: Date, end: Date, period: ReportPeriod): boolean {
    return (!period.endExclusive || start < period.endExclusive) && (!period.start || end >= period.start);
}

type PeriodLabels = Messages["reports"]["period"];

/** « du 1 septembre 2026 au 30 septembre 2026 », dans la langue de `labels` / `formatDate`. */
export function formatPeriodLabel(
    period: ReportPeriod,
    labels: PeriodLabels,
    formatDate: (date: Date) => string
): string {
    const start = parseDateInput(period.du);
    const end = parseDateInput(period.au);

    if (start && end) {
        return labels.range(formatDate(start), formatDate(end));
    }

    if (start) {
        return labels.since(formatDate(start));
    }

    if (end) {
        return labels.until(formatDate(end));
    }

    return labels.all;
}

/** Paramètres d'URL de la période (sans « ? »), à ajouter aux liens d'export. */
export function periodSearchParams(period: ReportPeriod): URLSearchParams {
    const params = new URLSearchParams();

    if (period.du) {
        params.set("du", period.du);
    }

    if (period.au) {
        params.set("au", period.au);
    }

    return params;
}

/** Nombre de jours couverts (pour annualiser un rendement), ou null si la période est ouverte. */
export function periodLengthInDays(period: ReportPeriod): number | null {
    if (!period.start || !period.endExclusive) {
        return null;
    }

    return Math.round((period.endExclusive.getTime() - period.start.getTime()) / 86_400_000);
}
