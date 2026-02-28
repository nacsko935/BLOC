const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

/**
 * Redirection des modules problématiques vers des mocks silencieux.
 * 
 * POURQUOI :
 * - expo-notifications: cause "Unable to activate keep awake" + crash Android dans Expo Go SDK 53+
 *   car le module natif push n'existe plus dans Expo Go depuis SDK 53.
 * - expo-av: cause le même crash via expo-keep-awake dans SDK 54.
 * 
 * Ces mocks sont des no-ops parfaits qui permettent à l'app de tourner dans Expo Go.
 * Dans un build EAS (eas build), ces redirections ne s'appliquent PAS car 
 * node_modules est résolu normalement — les vraies fonctionnalités seront disponibles.
 * 
 * Pour activer les vraies notifs/audio : faire un `eas build --profile development`
 */
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    ...config.resolver?.extraNodeModules,
    "expo-notifications": path.resolve(__dirname, "src/mocks/expo-notifications.js"),
    "expo-av": path.resolve(__dirname, "src/mocks/expo-av.js"),
  },
};

module.exports = config;
