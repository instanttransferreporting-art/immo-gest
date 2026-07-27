# PRISMA_RULES.md

# Prisma & Database Guidelines

Version : 1.0

Projet : ERP Immobilier SaaS

---

# Objectif

Définir les règles de conception de la base de données. Regardes ce qui est la 

Toutes les entités du projet doivent respecter ces conventions.

Aucune exception sans validation.

---

# Base de données

SGBD :

PostgreSQL

ORM :

Prisma ORM

Le schéma Prisma est la source de vérité.

Toute modification de la structure de la base passe par Prisma.

---

# Générateur

Toujours utiliser le générateur officiel Prisma.

Ne jamais modifier le client généré.

---

# Structure des modèles

Tous les modèles suivent cette structure.

```prisma
model Entity {

  id String @id @default(cuid())

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

}
```

---

# Identifiants

Toujours utiliser :

cuid()

Ne jamais utiliser :

Int

Auto Increment

UUID sauf besoin spécifique.

---

# Champs obligatoires

Toutes les tables possèdent :

id

createdAt

updatedAt

---

# Soft Delete

Les entités métier importantes utilisent :

```prisma
deletedAt DateTime?
```

Les suppressions physiques doivent être exceptionnelles.

---

# Multi-Tenant

Toutes les entités métier possèdent :

```prisma
organizationId String
```

Relation :

```prisma
organization Organization
```

Aucune donnée ne doit exister sans organisation.

---

# Convention des relations

Toujours nommer clairement les relations.

Exemple :

```prisma
organization Organization @relation(fields:[organizationId], references:[id])
```

Jamais de relation implicite.

---

# Types

Préférer :

String

Boolean

DateTime

Decimal

Json

Ne jamais utiliser Float pour des montants financiers.

---

# Argent

Tous les montants utilisent :

```prisma
Decimal
```

Jamais :

Float

Double

---

# Dates

Toujours :

DateTime

Jamais :

String

---

# Enum

Les valeurs métier fixes utilisent des Enums.

Exemple :

```prisma
enum PaymentMethod {

 CASH

 BANK_TRANSFER

 MOBILE_MONEY

}
```

---

# Valeurs par défaut

Toujours utiliser :

@default()

quand pertinent.

---

# Index

Créer un index sur :

organizationId

email

reference

status

createdAt

Tous les champs utilisés pour la recherche.

---

# Contraintes

Les références métier sont uniques.

Exemple :

```prisma
reference String @unique
```

---

# Relations

Préférer :

One-to-Many

au lieu de :

Json

pour représenter les données.

---

# Normalisation

Les données doivent être normalisées.

Éviter la duplication.

---

# Cascade

Toujours réfléchir avant d'utiliser :

Cascade Delete

Préférer :

Restrict

ou

Soft Delete.

---

# Audit

Les tables critiques doivent conserver l'historique.

Exemple :

Paiement

Contrat

Facture

Utilisateur

---

# Repository Pattern

Toutes les requêtes Prisma passent uniquement par :

repositories/

Jamais ailleurs.

---

# Transactions

Utiliser :

```ts
prisma.$transaction()
```

pour :

Paiement

Facturation

Résiliation

Renouvellement

Remboursement

---

# Pagination

Toujours utiliser :

take

skip

cursor

Ne jamais récupérer des milliers de lignes.

---

# Recherche

Toujours utiliser :

contains

mode: "insensitive"

quand applicable.

---

# Includes

Ne jamais faire :

include: true

Toujours sélectionner uniquement les champs utiles.

---

# Sécurité

Toutes les requêtes filtrent sur :

organizationId

Aucune exception.

---

# Migrations

Chaque évolution du schéma :

1 migration.

Ne jamais modifier une ancienne migration.

---

# Seed

Le projet possède un seed officiel.

Le seed contient :

Organisation de démonstration

Administrateur

Rôles

Permissions

Paramètres

Jeux de données de démonstration

---

# Environnement

Toutes les connexions passent par :

DATABASE_URL

Jamais de chaînes de connexion codées en dur.

---

# Performances

Éviter :

N+1 Queries

Préférer :

include

select

transactions

pagination

index

---

# Conventions de nommage

Modèles

PascalCase

Exemple :

Property

Tenant

Lease

Invoice

Paiement

---

Champs

camelCase

Exemple :

createdAt

organizationId

monthlyRent

securityDeposit

---

Tables

Nom généré automatiquement par Prisma.

Ne jamais personnaliser sans nécessité.

---

# Références métier

Chaque entité possède une référence lisible.

Exemple :

ORG-2026-000001

IMM-2026-000001

RES-2026-000001

UNT-2026-000001

TEN-2026-000001

CTR-2026-000001

INV-2026-000001

PAY-2026-000001

DOC-2026-000001

Ces références sont générées automatiquement par un service dédié.

---

# Évolutivité

Toute nouvelle table doit respecter ce document.

Toute exception doit être documentée avant implémentation.