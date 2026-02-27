import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { theme } from "../../src/core/ui/theme";

export default function CreateReelModal() {
  const router = useRouter();
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Permission requise",
        "Nous avons besoin de l'accès à vos photos"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType(result.assets[0].type === "video" ? "video" : "image");
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Permission requise",
        "Nous avons besoin de l'accès à votre caméra"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType(result.assets[0].type === "video" ? "video" : "image");
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "video/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setMediaUri(asset.uri);
        // Detect media type from mimeType when available.
        setMediaType(asset.mimeType?.startsWith("video") ? "video" : "image");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de selectionner ce fichier.");
    }
  };

  const handlePublish = async () => {
    if (!mediaUri) {
      Alert.alert("Erreur", "Veuillez sélectionner une photo ou vidéo");
      return;
    }

    if (!caption.trim()) {
      Alert.alert("Erreur", "Veuillez ajouter une légende");
      return;
    }

    setLoading(true);

    try {
      // Simuler l'upload (en production: upload vers serveur)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Parser les tags
      const tagsList = tags
        .split(" ")
        .filter((t) => t.startsWith("#"))
        .map((t) => t.substring(1));

      // En production: Créer le reel dans la DB
      void tagsList;

      Alert.alert("Succès", "Votre reel a été publié !", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de publier le reel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Créer un Reel</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Media Preview */}
        {mediaUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: mediaUri }} style={styles.previewMedia} />
            <Pressable
              onPress={() => {
                setMediaUri(null);
                setMediaType(null);
              }}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </Pressable>
            <View style={styles.mediaTypeBadge}>
              <Text style={styles.mediaTypeBadgeText}>
                {mediaType === "video" ? "📹 Vidéo" : "📷 Photo"}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.uploadSection}>
            <Text style={styles.uploadIcon}>🎬</Text>
            <Text style={styles.uploadTitle}>Ajouter un média</Text>
            <Text style={styles.uploadDescription}>
              Photo ou vidéo au format 9:16
            </Text>

            <View style={styles.uploadButtons}>
              <Pressable
                onPress={pickFromGallery}
                style={({ pressed }) => [
                  styles.uploadButton,
                  pressed && styles.uploadButtonPressed,
                ]}
              >
                <Text style={styles.uploadButtonIcon}>🖼️</Text>
                <Text style={styles.uploadButtonText}>Galerie</Text>
              </Pressable>

              <Pressable
                onPress={takePhoto}
                style={({ pressed }) => [
                  styles.uploadButton,
                  pressed && styles.uploadButtonPressed,
                ]}
              >
                <Text style={styles.uploadButtonIcon}>📷</Text>
                <Text style={styles.uploadButtonText}>Caméra</Text>
              </Pressable>

              <Pressable
                onPress={pickDocument}
                style={({ pressed }) => [
                  styles.uploadButton,
                  pressed && styles.uploadButtonPressed,
                ]}
              >
                <Text style={styles.uploadButtonIcon}>📁</Text>
                <Text style={styles.uploadButtonText}>Fichiers</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Form */}
        {mediaUri && (
          <View style={styles.form}>
            {/* Caption */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Légende</Text>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="Décrivez votre reel..."
                placeholderTextColor={theme.colors.textMuted}
                style={styles.textArea}
                multiline
                maxLength={300}
              />
              <Text style={styles.charCount}>{caption.length}/300</Text>
            </View>

            {/* Tags */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tags (séparés par des espaces)</Text>
              <TextInput
                value={tags}
                onChangeText={setTags}
                placeholder="#maths #cours #tutoriel"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                autoCapitalize="none"
              />
              <View style={styles.tagsPreview}>
                {tags
                  .split(" ")
                  .filter((t) => t.startsWith("#"))
                  .map((tag, index) => (
                    <View key={index} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>{tag}</Text>
                    </View>
                  ))}
              </View>
            </View>

            {/* Tips */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Conseils</Text>
              <Text style={styles.tipsText}>
                • Utilisez un format vertical (9:16)
              </Text>
              <Text style={styles.tipsText}>• Ajoutez des hashtags pertinents</Text>
              <Text style={styles.tipsText}>
                • La légende doit être engageante
              </Text>
            </View>

            {/* Publish Button */}
            <Pressable
              onPress={handlePublish}
              disabled={loading}
              style={({ pressed }) => [
                styles.publishButton,
                pressed && styles.publishButtonPressed,
                loading && styles.publishButtonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.publishButtonIcon}>🚀</Text>
                  <Text style={styles.publishButtonText}>Publier</Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
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
  previewContainer: {
    margin: 20,
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    aspectRatio: 9 / 16,
    position: "relative",
  },
  previewMedia: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  mediaTypeBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  mediaTypeBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  uploadSection: {
    alignItems: "center",
    padding: 40,
    margin: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
  },
  uploadIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  uploadTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  uploadDescription: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 24,
    textAlign: "center",
  },
  uploadButtons: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  uploadButton: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.lg,
    minWidth: 100,
  },
  uploadButtonPressed: {
    opacity: 0.7,
  },
  uploadButtonIcon: {
    fontSize: 32,
  },
  uploadButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  form: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    alignSelf: "flex-end",
  },
  tagsPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  tagChip: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagChipText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  tipsContainer: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    padding: 16,
    borderRadius: theme.radius.lg,
    gap: 8,
  },
  tipsTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },
  tipsText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  publishButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.colors.accent,
    paddingVertical: 16,
    borderRadius: theme.radius.lg,
    ...theme.shadow.md,
  },
  publishButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  publishButtonDisabled: {
    opacity: 0.5,
  },
  publishButtonIcon: {
    fontSize: 20,
  },
  publishButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
  },
});

