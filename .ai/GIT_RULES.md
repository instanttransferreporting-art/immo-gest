# GIT_RULES.md

# Workflow Git

Version : 1.0

---

# Branche principale

main

Toujours stable.

Jamais de développement direct sur main.

---

# Convention de branches

feature/property

feature/tenant

feature/payment

fix/invoice

refactor/dashboard

docs/architecture

---

# Convention des commits

Format :

type(scope): description

Exemples :

feat(property): add property form

feat(payment): create payment service

fix(invoice): correct total calculation

refactor(layout): improve sidebar

docs(ai): update architecture

---

# Types de commits

feat

fix

refactor

docs

style

test

build

ci

perf

chore

---

# Un ticket = un commit

Chaque ticket correspond à un commit.

Ne jamais mélanger plusieurs tickets.

---

# Pull Requests

Une PR traite un seul sujet.

Toujours décrire :

Objectif

Modifications

Impact

Tests réalisés

---

# Avant chaque commit

Vérifier :

Le projet compile.

ESLint passe.

Aucune erreur TypeScript.

Tests OK.

---

# Ne jamais committer

node_modules

.next

.env

logs

fichiers temporaires

---

# Documentation

Toute modification importante doit être accompagnée d'une mise à jour de la documentation correspondante.

---

# Philosophie

Préférer des commits petits, fréquents et explicites.

L'historique Git doit raconter l'évolution du projet.