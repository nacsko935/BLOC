// MOCK expo-notifications — remplace le vrai package pour Expo Go
// expo-notifications cause "Unable to activate keep awake" dans Expo Go SDK 53+
// Ce mock est utilisé via metro.config.js extraNodeModules

export const IosAuthorizationStatus = { PROVISIONAL: 3, AUTHORIZED: 2, NOT_DETERMINED: 0, DENIED: 1 };
export function setNotificationHandler() {}
export function getPermissionsAsync() { return Promise.resolve({ granted: false, ios: { status: 0 } }); }
export function requestPermissionsAsync() { return Promise.resolve({ granted: false }); }
export function getExpoPushTokenAsync() { return Promise.resolve({ data: null }); }
export function addNotificationResponseReceivedListener() { return { remove: () => {} }; }
export function removeNotificationSubscription() {}
export function getLastNotificationResponseAsync() { return Promise.resolve(null); }
export function addPushTokenListener() { return { remove: () => {} }; }
export function getBadgeCountAsync() { return Promise.resolve(0); }
export function setBadgeCountAsync() { return Promise.resolve(true); }
export function dismissAllNotificationsAsync() { return Promise.resolve(); }
export function scheduleNotificationAsync() { return Promise.resolve('mock-id'); }
export function cancelAllScheduledNotificationsAsync() { return Promise.resolve(); }
export const DevicePushTokenAutoRegistration = {};
export default {
  IosAuthorizationStatus,
  setNotificationHandler,
  getPermissionsAsync,
  requestPermissionsAsync,
  getExpoPushTokenAsync,
  addNotificationResponseReceivedListener,
  getLastNotificationResponseAsync,
};
