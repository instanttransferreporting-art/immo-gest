# PROJECT_CONTEXT.md

# ERP Immobilier SaaS

## Présentation

Ce projet est une plateforme SaaS de gestion immobilière destinée aux sociétés de gestion immobilière.

L'application permet de gérer l'ensemble du cycle de vie locatif :

- Patrimoine immobilier
- Propriétaires
- Locataires
- Contrats
- Facturation
- Paiements
- Cautions
- Maintenance
- Documents
- Rapports
- Tableaux de bord
- Notifications
- Comptabilité locative

Le système est conçu pour fonctionner aussi bien sur ordinateur que sur tablette et smartphone.

---

# Vision du projet

L'objectif est de remplacer les fichiers Excel, les documents papier et les traitements manuels par une plateforme moderne, sécurisée et collaborative.

L'application doit être :

- rapide
- modulaire
- évolutive
- multi-tenant
- hautement maintenable

---

# Type d'application

Le projet est un SaaS Multi-Tenant.

Une même application héberge plusieurs sociétés immobilières.

Chaque société possède uniquement ses propres données.

Aucune donnée ne doit être visible entre deux organisations.

---

# Hiérarchie métier

Le système suit la hiérarchie suivante :

Organisation

↓

Immeuble

↓

Résidence (optionnelle selon le type de patrimoine)

↓

Unité locative

↓

Contrat

↓

Paiements

Toutes les données sont toujours rattachées à une Organisation.

---

# Organisation

Une organisation représente une société immobilière.

Exemples :

- Agence immobilière
- Société de gestion
- Promoteur immobilier

Une organisation possède :

- ses utilisateurs
- ses immeubles
- ses paramètres
- ses comptes bancaires
- ses documents
- ses contrats
- ses rapports

---

# Immeuble

Un immeuble représente un patrimoine immobilier.

Exemples :

- Résidence
- Immeuble commercial
- Centre d'affaires
- Villa
- Entrepôt

Chaque immeuble possède :

- un propriétaire
- une adresse
- une ville
- un nombre de niveaux
- une référence unique
- plusieurs unités

---

# Résidence

Certaines organisations souhaitent regrouper plusieurs bâtiments.

Exemple :

Résidence Les Palmiers

↓

Bloc A

Bloc B

Bloc C

Chaque résidence appartient à un immeuble.

Une résidence peut contenir plusieurs unités.

---

# Unité

Une unité est un bien pouvant être loué.

Types :

- Appartement
- Bureau
- Commerce
- Villa
- Entrepôt
- Chambre
- Studio

Une unité possède :

- surface
- étage
- loyer
- charges
- dépôt de garantie
- état

Une unité appartient toujours à une organisation.

---

# Propriétaire

Le propriétaire est la personne physique ou morale propriétaire du patrimoine.

Une organisation peut gérer plusieurs propriétaires.

Chaque propriétaire peut posséder plusieurs immeubles.

---

# Locataire

Deux types :

## Personne Physique

Nom

Prénom

Téléphone

Email

Profession

Revenu mensuel

Adresse

Pièce d'identité

Photo

Contrat

## Personne Morale

Raison sociale

NIU

RCCM

Adresse

Téléphone

Email

Responsable légal

---

# Contrat

Un contrat relie :

Locataire

↓

Unité

↓

Organisation

Le contrat possède :

- date de début
- date de fin
- fréquence
- loyer
- charges
- dépôt
- statut

Statuts possibles :

- Brouillon
- Actif
- Suspendu
- Résilié
- Expiré
- Renouvelé

---

# Paiement

Le système gère :

- Loyers
- Charges
- Dépôts
- Pénalités

Modes :

- Virement
- Mobile Money
- Espèces (exceptionnel)
- Carte bancaire (option future)

Les chèques sont interdits.

---

# Facturation

Le système génère automatiquement :

- Factures
- Avis d'échéance
- Reçus
- Pénalités

Toutes les factures sont historisées.

---

# Caution

Chaque contrat peut posséder :

- un dépôt de garantie

Le système suit :

- montant
- utilisation
- restitution

---

# Maintenance

Une intervention possède :

- type
- urgence
- prestataire
- coût
- statut

Statuts :

- Ouverte
- En cours
- Terminée
- Annulée

---

# Documents

Le système archive :

- Contrats
- États des lieux
- Pièces d'identité
- Photos
- Factures
- Reçus
- Rapports

Tous les documents appartiennent à une organisation.

---

# Dashboard

Le tableau de bord affiche notamment :

- revenus
- logements vacants
- taux d'occupation
- contrats actifs
- impayés
- maintenance
- loyers encaissés
- loyers en attente

---

# Rapports

Exports :

PDF

Excel

Les rapports sont filtrables.

---

# Notifications

Le système envoie :

- rappels
- échéances
- relances
- confirmations
- emails

---

# Audit

Toutes les actions importantes doivent être historisées.

Exemples :

Connexion

Création

Modification

Suppression

Paiement

Annulation

Validation

---

# Multi-Tenant

Toutes les données doivent être filtrées par :

organizationId

Aucune requête ne doit retourner les données d'une autre organisation.

Cette règle est obligatoire sur l'ensemble du projet.

---

# Authentification

Tous les utilisateurs doivent être authentifiés.

Les permissions sont contrôlées par le système RBAC.

---

# Rôles

Le projet possède quatre rôles principaux :

Administrateur

Gestionnaire Immobilier

Comptable

Directeur Général

Les permissions seront définies dans le module RBAC.

---

# Références automatiques

Le système génère automatiquement les références.

Exemples :

Organisation

ORG-2026-000001

Immeuble

IMM-2026-000001

Résidence

RES-2026-000001

Unité

UNT-2026-000001

Locataire

TEN-2026-000001

Contrat

CTR-2026-000001

Facture

FAC-2026-000001

Paiement

PAY-2026-000001

Maintenance

MAI-2026-000001

Document

DOC-2026-000001

---

# Philosophie de développement

Le projet privilégie :

- simplicité
- modularité
- sécurité
- évolutivité
- réutilisabilité
- performance

Chaque nouveau développement doit respecter cette philosophie.