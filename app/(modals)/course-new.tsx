import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../src/core/ui/theme";
import { createCourse } from "../../src/features/courses/coursesRepo";

const SEMESTERS = ['S1', 'S2'];
const ICONS = ['📚', '💻', '🌐', '🗄️', '🧮', '🌍', '🤖', '🎨', '📊', '🔬', '⚡', '🎯'];
const COLORS = [
  '#3d8fff', '#f5a623', '#b164ff', '#34c759', 
  '#ff3b30', '#ff2d55', '#5856d6', '#00c7be',
  '#ffcc00', '#ff9500', '#af52de', '#32ade6'
];

export default function CourseNewModal() {
  const router = useRouter();
  const [courseName, setCourseName] = useState('');
  const [professorName, setProfessorName] = useState('');
  const [professorHandle, setProfessorHandle] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<'S1' | 'S2'>('S1');
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleSave = async () => {
    try {
      await createCourse({
        name: courseName,
        semester: selectedSemester,
        professorName,
        professorHandle,
        color: selectedColor,
        icon: selectedIcon,
      });
      router.back();
    } catch (error) {
      console.error('Error creating course:', error);
      Alert.alert('Erreur', 'Impossible de créer le cours');
    }
  };

  const canSave = courseName.trim() && professorName.trim() && professorHandle.trim();

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Annuler</Text>
          </Pressable>
          <Text style={styles.title}>Nouveau Cours</Text>
          <Pressable 
            onPress={handleSave} 
            disabled={!canSave}
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          >
            <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
              Créer
            </Text>
          </Pressable>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Course Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Nom du cours</Text>
            <TextInput
              style={styles.input}
              value={courseName}
              onChangeText={setCourseName}
              placeholder="Ex: Réseaux & Protocoles"
              placeholderTextColor={theme.colors.textSubtle}
              autoFocus
            />
          </View>

          {/* Semester Selection */}
          <View style={styles.field}>
            <Text style={styles.label}>Semestre</Text>
            <View style={styles.semesterRow}>
              {SEMESTERS.map((sem) => (
                <Pressable
                  key={sem}
                  onPress={() => setSelectedSemester(sem as 'S1' | 'S2')}
                  style={[
                    styles.semesterChip,
                    selectedSemester === sem && [
                      styles.semesterChipActive,
                      { backgroundColor: selectedColor }
                    ]
                  ]}
                >
                  <Text style={[
                    styles.semesterText,
                    selectedSemester === sem && styles.semesterTextActive
                  ]}>
                    {sem}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Icon Selection */}
          <View style={styles.field}>
            <Text style={styles.label}>Icône</Text>
            <View style={styles.iconsGrid}>
              {ICONS.map((icon) => (
                <Pressable
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={[
                    styles.iconChip,
                    selectedIcon === icon && [
                      styles.iconChipActive,
                      { backgroundColor: `${selectedColor}20`, borderColor: selectedColor }
                    ]
                  ]}
                >
                  <Text style={styles.iconEmoji}>{icon}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.field}>
            <Text style={styles.label}>Couleur</Text>
            <View style={styles.colorsGrid}>
              {COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorChip,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorChipActive
                  ]}
                >
                  {selectedColor === color && (
                    <Text style={styles.colorCheckmark}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Professor Info */}
          <View style={styles.field}>
            <Text style={styles.label}>Professeur</Text>
            <TextInput
              style={styles.input}
              value={professorName}
              onChangeText={setProfessorName}
              placeholder="Nom du professeur"
              placeholderTextColor={theme.colors.textSubtle}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Handle (optionnel)</Text>
            <TextInput
              style={styles.input}
              value={professorHandle}
              onChangeText={(text) => {
                // Ensure @ prefix
                const handle = text.startsWith('@') ? text : `@${text}`;
                setProfessorHandle(handle);
              }}
              placeholder="@username"
              placeholderTextColor={theme.colors.textSubtle}
              autoCapitalize="none"
            />
          </View>

          {/* Preview Card */}
          <View style={styles.previewSection}>
            <Text style={styles.label}>Aperçu</Text>
            <View style={[styles.previewCard, { borderLeftColor: selectedColor }]}>
              <View style={styles.previewHeader}>
                <View style={[styles.previewIcon, { backgroundColor: `${selectedColor}15` }]}>
                  <Text style={styles.previewEmoji}>{selectedIcon}</Text>
                </View>
                <View style={[styles.previewBadge, { backgroundColor: `${selectedColor}20` }]}>
                  <Text style={[styles.previewBadgeText, { color: selectedColor }]}>
                    {selectedSemester}
                  </Text>
                </View>
              </View>
              <Text style={styles.previewTitle}>
                {courseName || 'Nom du cours'}
              </Text>
              <Text style={styles.previewProf}>
                {professorName || 'Professeur'}
              </Text>
              <Text style={styles.previewHandle}>
                {professorHandle || '@username'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.surface,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  saveTextDisabled: {
    color: theme.colors.textMuted,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 24,
  },
  field: {
    gap: 12,
  },
  label: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 16,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  semesterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  semesterChip: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  semesterChipActive: {
    borderColor: 'transparent',
  },
  semesterText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '800',
  },
  semesterTextActive: {
    color: '#ffffff',
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconChip: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  iconChipActive: {
    borderWidth: 3,
  },
  iconEmoji: {
    fontSize: 28,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorChip: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorChipActive: {
    borderColor: '#ffffff',
  },
  colorCheckmark: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  previewSection: {
    gap: 12,
    marginTop: 8,
  },
  previewCard: {
    backgroundColor: '#121214',
    borderRadius: theme.radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderLeftWidth: 4,
    gap: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmoji: {
    fontSize: 28,
  },
  previewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  previewBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  previewTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  previewProf: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  previewHandle: {
    color: theme.colors.textSubtle,
    fontSize: 13,
    fontWeight: '600',
  },
});
