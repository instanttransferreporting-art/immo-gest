import { validation } from "@/i18n/messages/validation";

export type ValidationKey = keyof typeof validation.fr;

/** Préfixe distinguant une clé de traduction d'un message déjà rédigé (ex. erreur serveur). */
const PREFIX = "v:";

/**
 * Clés de validation à utiliser dans les schémas zod : `z.string().min(1, { error: V.emailRequired })`.
 * Chaque valeur vaut "v:<clé>" — traduite à l'affichage par `translateValidation`.
 */
export const V = Object.fromEntries(
    (Object.keys(validation.fr) as ValidationKey[]).map((key) => [key, `${PREFIX}${key}`])
) as { readonly [K in ValidationKey]: `v:${K}` };

/**
 * Traduit un message d'erreur de formulaire. Une clé "v:…" est traduite dans la langue
 * demandée ; tout autre texte (message déjà traduit renvoyé par le serveur) est rendu tel quel.
 */
export function translateValidation(
    message: string | undefined,
    messages: Readonly<Record<ValidationKey, string>>
): string | undefined {
    if (!message?.startsWith(PREFIX)) {
        return message;
    }

    return messages[message.slice(PREFIX.length) as ValidationKey] ?? message;
}
