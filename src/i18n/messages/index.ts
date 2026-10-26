import type { Locale } from "@/i18n/config";
import { common } from "@/i18n/messages/common";
import { admin } from "@/i18n/messages/admin";
import { reports } from "@/i18n/messages/reports";
import { operations } from "@/i18n/messages/operations";
import { payments } from "@/i18n/messages/payments";
import { invoices } from "@/i18n/messages/invoices";
import { leases } from "@/i18n/messages/leases";
import { tenants } from "@/i18n/messages/tenants";
import { units } from "@/i18n/messages/units";
import { properties } from "@/i18n/messages/properties";
import { dashboard } from "@/i18n/messages/dashboard";
import { enums } from "@/i18n/messages/enums";
import { layout } from "@/i18n/messages/layout";
import { validation } from "@/i18n/messages/validation";

/** Tous les domaines de traduction. Ajouter un domaine ici le rend disponible via `t.<domaine>`. */
const NAMESPACES = {
    admin,
    reports,
    operations,
    payments,
    invoices,
    leases,
    tenants,
    units,
    properties,
    dashboard,
    common,
    enums,
    layout,
    validation,
};

type Namespaces = typeof NAMESPACES;

export type Messages = { readonly [K in keyof Namespaces]: Namespaces[K]["fr"] };

function messagesFor(locale: Locale): Messages {
    return Object.fromEntries(
        Object.entries(NAMESPACES).map(([namespace, messages]) => [namespace, messages[locale]])
    ) as unknown as Messages;
}

export const MESSAGES: Readonly<Record<Locale, Messages>> = {
    fr: messagesFor("fr"),
    en: messagesFor("en"),
};
