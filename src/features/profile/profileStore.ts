// Simple store pour la photo de profil (en production: utiliser AsyncStorage ou une DB)
let profilePhotoUri: string | null = null;

export const setProfilePhoto = (uri: string | null) => {
  profilePhotoUri = uri;
};

export const getProfilePhoto = (): string | null => {
  return profilePhotoUri;
};
