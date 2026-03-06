// expo-av mock pour Expo Go — enregistrement simulé localement
// Dans un build EAS, le vrai expo-av fonctionne

let _recInterval = null;
let _recStartTime = null;
let _recUri = null;

const MockRecording = {
  _isRecording: false,
  prepareToRecordAsync: async () => {},
  startAsync: async () => {
    MockRecording._isRecording = true;
    _recStartTime = Date.now();
    _recUri = `mock-audio-${Date.now()}.m4a`;
  },
  stopAndUnloadAsync: async () => {
    MockRecording._isRecording = false;
  },
  getURI: () => _recUri,
  getStatusAsync: async () => ({ isRecording: MockRecording._isRecording }),
};

export const Audio = {
  Recording: {
    createAsync: async (options) => {
      const rec = Object.create(MockRecording);
      rec._isRecording = true;
      _recStartTime = Date.now();
      _recUri = `voice-${Date.now()}.m4a`;
      return { recording: rec, status: {} };
    },
  },
  RecordingOptionsPresets: {
    HIGH_QUALITY: {
      android: { extension: '.m4a', outputFormat: 2, audioEncoder: 3, sampleRate: 44100, numberOfChannels: 2, bitRate: 128000 },
      ios: { extension: '.m4a', audioQuality: 127, sampleRate: 44100, numberOfChannels: 2, bitRate: 128000, linearPCMBitDepth: 16 },
      web: {},
    },
  },
  Sound: {
    createAsync: async (source) => {
      const sound = {
        playAsync: async () => {},
        pauseAsync: async () => {},
        stopAsync: async () => {},
        unloadAsync: async () => {},
        setRateAsync: async () => {},
        setOnPlaybackStatusUpdate: () => {},
        getStatusAsync: async () => ({ isLoaded: true, isPlaying: false, positionMillis: 0, durationMillis: 5000 }),
      };
      return { sound, status: { isLoaded: true } };
    },
  },
  requestPermissionsAsync: async () => ({ granted: true, status: 'granted' }),
  getPermissionsAsync: async () => ({ granted: true, status: 'granted' }),
  setAudioModeAsync: async () => {},
};

export const Video = null;
