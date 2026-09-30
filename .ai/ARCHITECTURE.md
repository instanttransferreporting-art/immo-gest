# ARCHITECTURE.md

# Architecture Technique

Version : 1.0

Projet : ERP Immobilier SaaS

---

# Philosophie

Le projet suit une architecture **Feature-First**, **Clean Architecture** et **Domain-Oriented**.

Chaque fonctionnalité (Feature) est indépendante.

Chaque couche possède une seule responsabilité.

L'objectif est de :

- faciliter la maintenance
- faciliter les tests
- éviter le couplage
- rendre les modules réutilisables
- permettre à plusieurs développeurs de travailler simultanément

---

# Architecture Globale

```
src/

app/
components/
config/
constants/
emails/
features/
generated/
hooks/
lib/
providers/
styles/
types/
utils/
middleware.ts
```

---

# Description des dossiers

## app/

Contient uniquement :

- les routes Next.js
- les layouts
- les pages
- les loading
- les error
- les not-found

Aucune logique métier.

Aucun accès Prisma.

Aucun calcul complexe.

Le dossier app orchestre simplement les Features.

---

## components/

Contient uniquement les composants globaux.

Exemples :

Layout

Sidebar

Header

Dialog

Button

Card

DataTable

Modal

Breadcrumb

Avatar

Skeleton

Toast

Les composants ici doivent être totalement indépendants du métier.

---

## config/

Configuration globale.

Exemples :

application

navigation

auth

theme

upload

email

---

## constants/

Constantes globales.

Exemples :

routes

permissions

roles

countries

currencies

dateFormats

---

## emails/

Templates React Email.

Aucune logique métier.

Uniquement le rendu.

---

## generated/

Code généré automatiquement.

Ne jamais modifier.

Exemple :

Prisma Client

---

## hooks/

Hooks globaux.

Exemples :

useDisclosure

useDebounce

useLocalStorage

usePagination

useMediaQuery

---

## lib/

Infrastructure.

Contient :

prisma

auth

mail

storage

env

logger

utils

Aucune logique métier.

---

## providers/

Tous les Providers React.

Exemples :

ThemeProvider

QueryProvider

SessionProvider

SidebarProvider

---

## styles/

Styles globaux.

Variables CSS.

Thème.

Animations.

---

## types/

Types globaux.

Exemples :

Pagination

ApiResponse

Result

Option

DTO

---

## utils/

Fonctions utilitaires.

Exemples :

formatMoney

formatDate

slugify

generateReference

phoneFormatter

emailValidator

---

# Feature Architecture

Chaque Feature possède exactement cette structure.

```
feature/

actions/
components/
constants/
hooks/
repositories/
schemas/
services/
types/
```

Aucun dossier supplémentaire sans validation.

---

# Description des couches

## components/

Affichage uniquement.

Interdit :

Prisma

fetch

calcul métier

validation métier

Autorisé :

React Hook Form

Zod Resolver

Tailwind

Shadcn UI

---

## actions/

Toutes les mutations passent ici.

Exemples :

createProperty

updateTenant

deleteLease

approvePayment

Les Actions :

- valident les données
- appellent les Services
- retournent une réponse typée

Jamais de logique métier complexe.

---

## services/

Les Services contiennent toute la logique métier.

Exemples :

calcul du prorata

calcul des pénalités

renouvellement automatique

génération d'échéancier

génération de facture

Les Services ne connaissent jamais React.

---

## repositories/

Seule couche autorisée à utiliser Prisma.

Les Repositories :

- créent
- lisent
- modifient
- suppriment

Ils ne prennent aucune décision métier.

---

## schemas/

Validation Zod.

Toutes les validations passent ici.

Jamais dans les composants.

---

## hooks/

Hooks propres à une Feature.

Exemple :

usePropertyForm

useTenantFilters

---

## constants/

Constantes propres à la Feature.

Exemple :

PROPERTY_STATUS

LEASE_STATUS

PAYMENT_METHODS

---

## types/

Types propres à la Feature.

DTO

FormData

Filters

Responses

---

# Flux de données

Le flux est toujours :

```
Utilisateur

↓

UI

↓

Server Action

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL
```

Jamais l'inverse.

---

# Communication entre Features

Une Feature ne doit jamais accéder directement au Repository d'une autre Feature.

Toujours passer par :

Service public

ou

Server Action

si nécessaire.

---

# Gestion des dépendances

Les dépendances autorisées :

```
UI

↓

Actions

↓

Services

↓

Repositories

↓

Prisma
```

Interdit :

Repository → Component

Repository → Hook

Component → Prisma

Hook → Prisma

---

# Principe de modularité

Chaque Feature doit pouvoir être déplacée dans un autre projet avec un minimum de modifications.

Une Feature ne dépend pas des autres Features.

---

# Organisation des imports

Ordre :

1. React

2. Next.js

3. Bibliothèques externes

4. Alias @/

5. Imports locaux

6. Types

7. Styles

---

# Gestion des erreurs

Toutes les erreurs doivent être centralisées.

Jamais de :

throw new Error("...")

dans les composants.

Toujours retourner :

Result

ou

ActionResponse

typé.

---

# Réponses des Server Actions

Toutes les Actions retournent :

```
type ActionResponse<T> = {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
}
```

Toutes les Features utilisent ce format.

---

# Multi-Tenant

Toutes les entités possèdent :

organizationId

Toutes les requêtes filtrent sur :

organizationId

Aucune exception.

---

# Convention des références

Les références sont générées automatiquement.

Exemples :

ORG-2026-000001

IMM-2026-000001

RES-2026-000001

UNT-2026-000001

TEN-2026-000001

CTR-2026-000001

INV-2026-000001

PAY-2026-000001

DOC-2026-000001

---

# Convention des noms de fichiers

Composants

PropertyForm.tsx

TenantTable.tsx

LeaseCard.tsx

Hooks

useProperty.ts

useTenant.ts

Services

PropertyService.ts

Repositories

PropertyRepository.ts

Schemas

property.schema.ts

Actions

create-property.ts

update-property.ts

delete-property.ts

Types

property.types.ts

---

# Tests

Chaque Feature doit pouvoir être testée indépendamment.

Les Services sont prioritaires pour les tests unitaires.

Les Repositories sont testés via l'intégration.

Les composants sont testés uniquement pour leur comportement.

---

# Évolutivité

Toute nouvelle Feature doit respecter cette architecture.

Aucun raccourci n'est autorisé.

Si une nouvelle règle est nécessaire, ce document doit être mis à jour avant le développement.