# Règles de Codage

## TypeScript

1. **Strict Mode** : Toujours activé. Aucun compromis.
2. **`any` est strictement interdit**. Utiliser `unknown` si le type est temporairement indéterminé, puis le typer correctement (type narrowing).
3. **Interfaces vs Types** : Préférer `type` pour les définitions métiers, les unions et les intersections. Utiliser `interface` uniquement si l'héritage est indispensable.
4. **Export** : Exporter uniquement ce qui est nécessaire. Privilégier les exports nommés (`export const...`) aux exports par défaut, sauf pour les pages Next.js (`page.tsx`, `layout.tsx`).

## Nommage (Naming Conventions)

- **Fichiers et dossiers** : `kebab-case` (ex: `property-form.tsx`, `create-lease.ts`).
- **Composants React** : `PascalCase` (ex: `TenantTable`, `UserProfile`).
- **Fonctions et variables** : `camelCase` (ex: `calculateProrata`, `totalAmount`).
- **Constantes globales** : `UPPER_SNAKE_CASE` (ex: `MAX_UPLOAD_SIZE`, `DEFAULT_CURRENCY`).
- **Types et Interfaces** : `PascalCase` (ex: `PropertyDTO`, `ActionResponse`).
- **Booléens** : Préfixer par `is`, `has`, `should`, ou `can` (ex: `isActive`, `hasPermission`).

## Fonctions et Logique

1. **Single Responsibility** : Une fonction = une action. Si la fonction dépasse 50 lignes, elle doit probablement être découpée.
2. **Early Returns** : Toujours privilégier les retours anticipés pour éviter l'imbrication de conditions (éviter le code en "pyramide").
3. **Magic Numbers** : Interdits. Extraire les valeurs brutes dans des constantes descriptives.

## Gestion des Erreurs

1. **Pas de `throw new Error()` dans l'UI**.
2. Les Server Actions et Services doivent toujours retourner un objet standardisé (ex: `ActionResponse<T>`) contenant :
    - `success`: boolean
    - `message`: string (message compréhensible pour l'utilisateur)
    - `data?`: T
    - `errors?`: Record<string, string[]> (pour les erreurs de validation Zod)

## Commentaires

- Commenter le *pourquoi* (la logique métier complexe, le contexte), pas le *comment* (le code doit être assez clair pour s'expliquer lui-même).
- Utiliser JSDoc pour les fonctions complexes des Services et des Repositories.