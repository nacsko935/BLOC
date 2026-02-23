import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../../src/core/ui/theme";
import { setProfilePhoto } from "../../src/features/profile/profileStore";

export default function ProfilePhotoModal() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission requise",
        "Nous avons besoin de l'accès à vos photos pour changer votre photo de profil."
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission requise",
        "Nous avons besoin de l'accès à votre caméra."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!selectedImage) {
      Alert.alert("Erreur", "Veuillez sélectionner une photo");
      return;
    }

    setLoading(true);

    try {
      // Simuler l'upload
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Sauvegarder l'URI dans le store
      setProfilePhoto(selectedImage);
      
      Alert.alert("Succès", "Photo de profil mise à jour !", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour la photo");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    Alert.alert(
      "Supprimer la photo",
      "Êtes-vous sûr de vouloir supprimer votre photo de profil ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            setSelectedImage(null);
            setProfilePhoto(null);
            Alert.alert("Succès", "Photo supprimée", [
              { text: "OK", onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Photo de profil</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Preview */}
        <View style={styles.previewSection}>
          <View style={styles.previewContainer}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Text style={styles.placeholderText}>👤</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.previewLabel}>Aperçu</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={pickImage}
            style={({ pressed }) => [
              styles.actionButton,
              styles.primaryButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <Text style={styles.actionIcon}>🖼️</Text>
            <Text style={styles.actionButtonText}>Choisir une photo</Text>
          </Pressable>

          <Pressable
            onPress={takePhoto}
            style={({ pressed }) => [
              styles.actionButton,
              styles.primaryButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionButtonText}>Prendre une photo</Text>
          </Pressable>

          {selectedImage && (
            <>
              <Pressable
                onPress={handleSave}
                disabled={loading}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.saveButton,
                  pressed && styles.actionButtonPressed,
                  loading && styles.actionButtonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.actionIcon}>✓</Text>
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={handleRemove}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.dangerButton,
                  pressed && styles.actionButtonPressed,
                ]}
              >
                <Text style={styles.actionIcon}>🗑️</Text>
                <Text style={styles.dangerButtonText}>Supprimer</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.infoText}>
            📌 Utilisez une photo carrée pour un meilleur rendu
          </Text>
          <Text style={styles.infoText}>
            📌 Taille recommandée : 400x400 pixels minimum
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "600",
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  previewSection: {
    alignItems: "center",
    paddingVertical: 40,
  },
  previewContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: "hidden",
    marginBottom: 16,
    ...theme.shadow.lg,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  placeholderAvatar: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
  },
  placeholderText: {
    fontSize: 80,
  },
  previewLabel: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 16,
    borderRadius: theme.radius.lg,
    ...theme.shadow.sm,
  },
  actionButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  primaryButton: {
    backgroundColor: theme.colors.surface,
  },
  saveButton: {
    backgroundColor: "#34c759",
  },
  dangerButton: {
    backgroundColor: theme.colors.surface,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionButtonText: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
  dangerButtonText: {
    color: "#ff3b30",
    fontSize: 17,
    fontWeight: "700",
  },
  info: {
    marginTop: 32,
    gap: 8,
    paddingHorizontal: 16,
  },
  infoText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
});
