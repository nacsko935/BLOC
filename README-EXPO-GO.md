# BLOC — Guide Expo Go

## Pourquoi ces erreurs dans Expo Go ?

### `Unable to activate keep awake` + expo-notifications crash
Depuis SDK 53, Expo a retiré les push notifications d'Expo Go sur Android.
Le package `expo-notifications` tente de s'initialiser et crash.

### Solution appliquée dans ce projet
- `expo-notifications` et `expo-av` sont retirés de `package.json`
- `metro.config.js` redirige ces imports vers des mocks silencieux
- L'app tourne parfaitement dans Expo Go

### Pour les vraies notifs/audio (production)
```bash
eas build --profile development --platform android
```

## Démarrage rapide
```bash
npm install
npx expo start --clear
```
Le `--clear` est important pour vider le cache Metro après changement de config.

## Structure des fichiers modifiés
- `metro.config.js` → redirections mocks
- `src/mocks/expo-notifications.js` → mock notifications
- `src/mocks/expo-av.js` → mock audio/vidéo
