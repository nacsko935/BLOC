import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../src/core/ui/theme";

interface ActionButton {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  action: () => void;
}

export default function CreateModal() {
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  // Import fichier
  const handleImportFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      Alert.alert(
        'Fichier importé',
        `Nom: ${file.name}\nTaille: ${(file.size! / 1024).toFixed(2)} KB`,
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'importer le fichier');
    }
  };

  // Enregistrement audio
  const handleRecordAudio = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert('Permission refusée', 'L\'accès au microphone est nécessaire');
        return;
      }

      if (recording) {
        // Stop recording
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        
        Alert.alert(
          'Enregistrement terminé',
          `Audio sauvegardé`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        // Start recording
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        
        setRecording(newRecording);
        Alert.alert('Enregistrement...', 'Cliquez à nouveau pour arrêter');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer l\'audio');
    }
  };

  // Scanner / Photo
  const handleScanDocument = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert('Permission refusée', 'L\'accès à la caméra est nécessaire');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        Alert.alert(
          'Document scanné',
          'Le document a été capturé avec succès',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de scanner le document');
    }
  };

  // Créer résumé
  const handleCreateSummary = () => {
    Alert.alert(
      'Créer un résumé',
      'Sélectionnez un document à résumer',
      [
        {
          text: 'Choisir un fichier',
          onPress: async () => {
            const result = await DocumentPicker.getDocumentAsync({
              type: ['application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            });
            
            if (!result.canceled) {
              // Simuler la génération de résumé
              setTimeout(() => {
                Alert.alert(
                  'Résumé généré',
                  'Résumé créé avec succès ! Le résumé automatique sera disponible dans vos notes.',
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              }, 1500);
            }
          },
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  // Outils d'études
  const handleStudyTools = () => {
    Alert.alert(
      'Outils d\'études',
      'Choisissez un outil',
      [
        {
          text: '⏱️ Timer Pomodoro',
          onPress: () => {
            Alert.alert('Timer', 'Fonctionnalité en cours de développement');
          },
        },
        {
          text: '🎴 Flashcards',
          onPress: () => {
            Alert.alert('Flashcards', 'Fonctionnalité en cours de développement');
          },
        },
        {
          text: '📝 Quiz',
          onPress: () => {
            Alert.alert('Quiz', 'Fonctionnalité en cours de développement');
          },
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const actions: ActionButton[] = [
    {
      id: 'import',
      title: 'Importer un fichier',
      subtitle: 'PDF, Word, Excel, Images...',
      icon: '📁',
      color: '#3d8fff',
      action: handleImportFile,
    },
    {
      id: 'audio',
      title: recording ? 'Arrêter l\'enregistrement' : 'Enregistrer audio',
      subtitle: recording ? 'Enregistrement en cours...' : 'Notes vocales, cours...',
      icon: recording ? '⏹️' : '🎙️',
      color: '#ff3b30',
      action: handleRecordAudio,
    },
    {
      id: 'scan',
      title: 'Scanner un document',
      subtitle: 'Photo, document, tableau...',
      icon: '📷',
      color: '#34c759',
      action: handleScanDocument,
    },
    {
      id: 'summary',
      title: 'Créer un résumé',
      subtitle: 'Résumé automatique AI',
      icon: '🤖',
      color: '#b164ff',
      action: handleCreateSummary,
    },
    {
      id: 'tools',
      title: 'Outils d\'études',
      subtitle: 'Timer, Flashcards, Quiz...',
      icon: '🎯',
      color: '#f5a623',
      action: handleStudyTools,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Quoi de neuf ?</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        {/* Actions */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.actionsList}
        >
          {actions.map((action, index) => (
            <Pressable
              key={action.id}
              onPress={action.action}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed,
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${action.color}20` }]}>
                <Text style={styles.icon}>{action.icon}</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
              <View style={[styles.actionArrow, { backgroundColor: action.color }]}>
                <Text style={styles.actionArrowText}>→</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: theme.colors.surfaceElevated,
  },
  closeButtonText: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  actionsList: {
    paddingBottom: 40,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actionButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: theme.colors.surfaceElevated,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  actionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionArrowText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
});
