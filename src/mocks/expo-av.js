// MOCK expo-av — expo-av 16 cause crash keep-awake dans Expo Go SDK 54
// Audio et Video sont disponibles dans les builds EAS

export const Audio = {
  Recording: {
    createAsync: () => Promise.resolve({ recording: null }),
  },
  RecordingOptionsPresets: { HIGH_QUALITY: {} },
  Sound: {
    createAsync: () => Promise.resolve({ sound: null }),
  },
  requestPermissionsAsync: () => Promise.resolve({ granted: false }),
  setAudioModeAsync: () => Promise.resolve(),
};

export const Video = null;
export const ResizeMode = { COVER: 'cover', CONTAIN: 'contain', STRETCH: 'stretch' };
export const AVPlaybackStatus = {};
export default { Audio, Video, ResizeMode };
