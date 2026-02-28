import { useTheme } from "../../src/core/theme/ThemeProvider";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../src/core/ui/theme";

interface Comment {
  id: string;
  authorName: string;
  authorHandle: string;
  authorType: 'student' | 'professor' | 'school';
  text: string;
  timestamp: string;
  likes: number;
  liked: boolean;
}

const mockComments: Comment[] = [
  {
    id: "1",
    authorName: "Sophie Martin",
    authorHandle: "@sophie.m",
    authorType: "student",
    text: "Super explication ! Merci beaucoup 🙏",
    timestamp: "Il y a 2h",
    likes: 124,
    liked: false,
  },
  {
    id: "2",
    authorName: "Dr. Thomas",
    authorHandle: "@dr.thomas",
    authorType: "professor",
    text: "Excellente synthèse du cours d'hier ! 👏",
    timestamp: "Il y a 5h",
    likes: 89,
    liked: true,
  },
  {
    id: "3",
    authorName: "Marie Dubois",
    authorHandle: "@marie.d",
    authorType: "student",
    text: "Est-ce que tu peux faire une vidéo sur les dérivées ?",
    timestamp: "Il y a 1j",
    likes: 45,
    liked: false,
  },
];

export default function ReelCommentsModal() {
  const { c } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");
  const slideAnim = useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  const handlePostComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      authorName: "Vous",
      authorHandle: "@vous",
      authorType: "student",
      text: newComment.trim(),
      timestamp: "À l'instant",
      likes: 0,
      liked: false,
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  const handleLikeComment = (commentId: string) => {
    setComments(
      comments.map((c) =>
        c.id === commentId
          ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
  };

  const getBadgeConfig = (type: 'student' | 'professor' | 'school') => {
    switch (type) {
      case 'professor':
        return { text: 'Pro', color: '#ff9500', bg: 'rgba(255, 149, 0, 0.15)' };
      case 'school':
        return { text: '🏫', color: '#af52de', bg: 'rgba(175, 82, 222, 0.15)' };
      default:
        return { text: 'Ét', color: '#007aff', bg: 'rgba(0, 122, 255, 0.15)' };
    }
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const badge = getBadgeConfig(item.authorType);

    return (
      <View style={styles.commentItem}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>{item.authorName.charAt(0)}</Text>
        </View>
        
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <View style={styles.commentAuthorRow}>
              <Text style={styles.commentAuthor}>{item.authorHandle}</Text>
              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.badgeText, { color: badge.color }]}>
                  {badge.text}
                </Text>
              </View>
              <Text style={styles.commentTimestamp}>{item.timestamp}</Text>
            </View>
          </View>
          
          <Text style={styles.commentText}>{item.text}</Text>
          
          <View style={styles.commentActions}>
            <Pressable
              onPress={() => handleLikeComment(item.id)}
              style={styles.commentAction}
            >
              <Text style={styles.commentActionIcon}>{item.liked ? "❤️" : "🤍"}</Text>
              <Text style={[styles.commentActionText, item.liked && { color: "#fe2c55" }]}>
                {item.likes > 0 ? item.likes : ""}
              </Text>
            </Pressable>
            
            <Pressable
              style={styles.commentAction}
              onPress={() => setNewComment(`@${item.authorHandle.replace("@", "")} `)}
            >
              <Text style={styles.commentActionText}>Repondre</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View 
        style={[
          styles.modal,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.dragIndicator} />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {comments.length} commentaire{comments.length > 1 ? 's' : ''}
            </Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
        </View>

        {/* Comments List */}
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.commentsList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Ajouter un commentaire..."
                placeholderTextColor={"rgba(255,255,255,0.45)"}
                style={styles.input}
                multiline
                maxLength={300}
              />
              
              <Pressable
                onPress={handlePostComment}
                disabled={!newComment.trim()}
                style={[
                  styles.sendButton,
                  !newComment.trim() && styles.sendButtonDisabled,
                ]}
              >
                <Text style={styles.sendButtonText}>➤</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    flex: 1,
    backgroundColor: "#000000",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  commentsList: {
    paddingVertical: 12,
  },
  commentItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  commentContent: {
    flex: 1,
    gap: 6,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  commentAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentAuthor: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  commentTimestamp: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 12,
    fontWeight: "500",
  },
  commentText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400",
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 4,
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentActionIcon: {
    fontSize: 16,
  },
  commentActionText: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 13,
    fontWeight: "600",
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#000000",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    backgroundColor: "#111111",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fe2c55",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
});

