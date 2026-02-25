# BLOC

Application mobile iOS/Android (Expo + React Native) pour l’étude et le social‑learning.

## Description produit (résumé)
BLOC est une app d’étude/social‑learning inspirée de l’UX “feed” : fil d’actualité scolaire, recherche rapide, création d’outils d’apprentissage (QCM, fiches, résumés), progression gamifiée et bibliothèque de ressources.  
Objectif : rendre l’apprentissage fluide, motivant et social, avec un système d’école (code établissement) pour personnaliser les contenus et suivre des professeurs.

## Prérequis
- **Node.js** (inclut `npm`)
- **Git** (optionnel, pour cloner/pusher)
- **Expo Go** sur téléphone (optionnel, pour tester rapidement)

## Installation
```bash
npm install
```

## Lancer le projet
```bash
npx expo start
```

Option utile :
```bash
npx expo start -c
```

## Lancer sur iOS / Android
```bash
npx expo start --ios
npx expo start --android
```

## Structure rapide
- `app/` : écrans (Expo Router)
- `src/core/` : UI + data (DB)
- `src/features/` : fonctionnalités (feed, auth, qcm, etc.)
- `assets/` : icônes, splash, logo

## Notes
- L’app utilise SQLite via `expo-sqlite`.
- Les interactions (likes, commentaires, etc.) sont persistées en local.
- Le feed est filtré par école si un code école est défini.

## TODO – Équipe technique
### Core
- [ ] Définir schéma DB final + migrations versionnées (éviter les collisions)
- [ ] Ajouter gestion d’erreurs SQLite + logs (dev only)
- [ ] Centraliser le theme (typo, spacing, couleurs) + tokens

### Auth & Profil
- [ ] Intégrer OAuth réel (Google/Apple) via Expo Auth Session
- [ ] Upload avatar + stockage (local + future sync)
- [ ] Permissions & privacy (profil public/privé)

### École & Cours
- [ ] Valider le code école via API
- [ ] Cours/ressources par établissement
- [ ] Système “professeurs suivis” avec posts dédiés

### Feed & Recherche
- [ ] Pagination + cache (feed, commentaires)
- [ ] Partage réel + notifications
- [ ] Recherche full‑text + filtres avancés (date, matière, campus)

### QCM & Progression
- [ ] Générateur QCM complet (questions multi‑types)
- [ ] Historique scores + analytics
- [ ] Missions dynamiques + streaks persistés

### Qualité & Build
- [ ] Tests unitaires + tests E2E
- [ ] CI (lint, typecheck, tests)
- [ ] Build release (iOS/Android) + checklist store

## Dépannage
- **Bundling iOS qui échoue / OOM** : réduire les workers Metro dans `metro.config.js` et relancer :
  ```bash
  npx expo start -c
  ```
- **npm non reconnu** : installe Node.js depuis https://nodejs.org

_Mise a jour technique: 2026-02-24 02:26:27_

### Cache navigation / Tabs
Si l'ordre ou les labels des onglets ne refl�tent pas le code, vide le cache Expo/Metro:

```bash
npx expo start -c
```

Si n�cessaire (Windows PowerShell):

```powershell
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force node_modules/.cache
npx expo start -c
```
