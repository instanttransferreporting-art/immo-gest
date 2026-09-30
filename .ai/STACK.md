# STACK.md

# Stack Technique

Version : 1.0

Projet : ERP Immobilier SaaS

---

# Philosophie

Le projet utilise une stack moderne, open-source et gratuite.

Les choix techniques privilégient :

- Performance
- Maintenabilité
- Typage fort
- Évolutivité
- Simplicité
- Faible coût d'exploitation

---

# Frontend

## Framework

Next.js 16

Utilisation :

- App Router
- Server Components
- Server Actions
- Route Groups
- Metadata API

Ne pas utiliser :

- Pages Router
- API Routes (sauf besoin exceptionnel)

---

## React

Version :

React 19

Utiliser :

- Functional Components
- Hooks
- Suspense
- Server Components

---

## TypeScript

Strict Mode obligatoire.

Aucun fichier JavaScript.

---

# Styling

## Tailwind CSS

Version :

v4

Utiliser exclusivement Tailwind.

Créer des composants réutilisables.

Aucun CSS inline.

---

## Shadcn UI

Tous les composants UI proviennent de Shadcn.

Exemples :

Button

Input

Dialog

Popover

Dropdown

Badge

Tabs

Drawer

Alert

Table

---

## Lucide React

Bibliothèque officielle d'icônes.

Aucune autre bibliothèque.

---

# Validation

Zod

Toutes les validations passent par Zod.

Jamais de validation directement dans les composants.

---

# Formulaires

React Hook Form

+

Zod Resolver

Tous les formulaires utilisent cette combinaison.

---

# Base de données

PostgreSQL

via Supabase.

---

# ORM

Prisma

Toutes les requêtes passent par Prisma.

Jamais de SQL brut sauf nécessité exceptionnelle.

---

# Authentification

Auth.js (NextAuth)

Gestion :

Session

Connexion

Déconnexion

Permissions

---

# État serveur

TanStack Query

Utilisation :

Cache

Synchronisation

Invalidation

Mutations

---

# État local

Zustand

Uniquement pour :

Sidebar

Préférences utilisateur

Filtres temporaires

Jamais pour les données serveur.

---

# Notifications

Sonner

Toutes les notifications utilisent Sonner.

---

# Emails

React Email

+

Resend

Tous les emails utilisent :

Templates React Email.

---

# PDF

React PDF

PDF-Lib

Utilisation :

Contrats

Factures

Reçus

Rapports

---

# Excel

ExcelJS

Utilisation :

Exports

Rapports

Imports

---

# Dates

date-fns

Aucune manipulation manuelle.

---

# Utilitaires

clsx

tailwind-merge

class-variance-authority

Toujours utiliser :

cn()

---

# Upload

Supabase Storage

Tous les documents :

Contrats

Photos

Pièces

Factures

sont stockés dans Supabase Storage.

---

# Architecture

Feature First.

Chaque Feature est autonome.

---

# Outils

ESLint

Prettier

Husky

lint-staged

---

# Variables d'environnement

DATABASE_URL

NEXTAUTH_SECRET

NEXTAUTH_URL

RESEND_API_KEY

SUPABASE_URL

SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

---

# Interdictions

Ne jamais ajouter une nouvelle dépendance sans validation.

Toujours privilégier les bibliothèques déjà présentes.

Avant d'ajouter une dépendance :

- vérifier si une bibliothèque existante répond déjà au besoin.

---

# Bonnes pratiques

Toujours privilégier :

Server Components

Server Actions

TypeScript strict

Zod

Repository Pattern

Services

Code réutilisable

Composants génériques