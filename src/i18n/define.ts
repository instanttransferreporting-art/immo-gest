/**
 * Déclare les traductions d'un domaine, français et anglais côte à côte.
 * Le français fait référence : l'anglais doit avoir exactement les mêmes clés et
 * les mêmes signatures de fonctions (paramètres d'interpolation), sinon TypeScript
 * refuse de compiler — aucune traduction ne peut être oubliée.
 */
export function defineMessages<T extends Record<string, unknown>>(messages: { fr: T; en: NoInfer<T> }) {
    return messages;
}
