# LOT-01 : Authentification et Gestion des Accès (RBAC)

## 1. Objectif
Mettre en place l'authentification sécurisée et la gestion des rôles (Admin, Gestionnaire, Comptable, DG) pour restreindre l'accès aux différentes parties de l'ERP.

## 2. Dépendances
- LOT-00 (Setup initial et Base de données) terminé.

## 3. Sous-tâches
- **01.1 - Types & Schemas** : Définir les types `UserDTO` et le `login.schema.ts` (Zod) pour la validation du formulaire de connexion.
- **01.2 - Configuration Auth.js** : Configurer NextAuth/Auth.js avec le PrismaAdapter. Ajouter le rôle et l'`organizationId` (si applicable) dans la session utilisateur.
- **01.3 - Middleware** : Créer le `middleware.ts` pour protéger les routes `/dashboard/*` et rediriger les utilisateurs non connectés vers `/login`.
- **01.4 - UI Connexion** : Créer le composant `LoginForm.tsx` et la page `app/(auth)/login/page.tsx` avec affichage des erreurs (identifiants incorrects).
- **01.5 - UI Layout & Déconnexion** : Implémenter le `UserMenu.tsx` dans le header avec le bouton de déconnexion et l'affichage du rôle de l'utilisateur.

## 4. Critères d'acceptation
- [ ] Un utilisateur ne peut pas accéder à `/dashboard` sans être connecté.
- [ ] Le formulaire de login valide les formats d'email et mot de passe avec Zod.
- [ ] La session utilisateur (récupérable via `auth()`) contient bien l'ID, l'email et le `RoleType` de l'utilisateur.
- [ ] Le bouton de déconnexion détruit la session et redirige vers `/login`.