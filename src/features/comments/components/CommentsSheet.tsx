import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { AppText } from "../../../core/ui/AppText";
import { AppButton } from "../../../core/ui/AppButton";
import { CommentItem } from "./CommentItem";
import { listComments, postComment } from "../services/commentsService";
import { Comment } from "../types";
import { theme } from "../../../core/ui/theme";

export function CommentsSheet({
  visible,
  targetId,
  onClose,
  onCountChange,
}: {
  visible: boolean;
  targetId: string;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}) {
  const [items, setItems] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const translateY = useRef(new Animated.Value(420)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    listComments(targetId).then((loaded) => {
      setItems(loaded);
      onCountChange?.(loaded.filter((i) => !i.parentId).length);
    });
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(backdropOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [backdropOpacity, onCountChange, targetId, translateY, visible]);

  const roots = useMemo(() => items.filter((i) => !i.parentId), [items]);
  const repliesByParent = useMemo(() => {
    const m: Record<string, Comment[]> = {};
    items.filter((i) => i.parentId).forEach((i) => {
      const key = i.parentId as string;
      m[key] = [...(m[key] ?? []), i];
    });
    return m;
  }, [items]);

  const submit = async () => {
    const v = text.trim();
    if (!v) return;
    const optimistic: Comment = {
      id: `tmp-${Date.now()}`,
      author: "Moi",
      text: v,
      createdAt: new Date().toISOString(),
      optimistic: true,
      parentId: replyTo?.id ?? null,
    };
    setItems((prev) => [optimistic, ...prev]);
    setText("");
    setReplyTo(null);
    const created = await postComment(targetId, v, optimistic.parentId ?? undefined);
    setItems((prev) => {
      const next = [created, ...prev.filter((p) => p.id !== optimistic.id)];
      onCountChange?.(next.filter((i) => !i.parentId).length);
      return next;
    });
  };

  const closeWithAnimation = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 420, duration: 180, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={closeWithAnimation}>
      <Animated.View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", opacity: backdropOpacity }}>
        <Pressable style={{ flex: 1 }} onPress={closeWithAnimation} />
      </Animated.View>
      <Animated.View style={{ transform: [{ translateY }] }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
        style={{
          maxHeight: "75%",
          backgroundColor: theme.colors.bg,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 14,
          borderTopWidth: 1,
          borderColor: theme.colors.border,
        }}
        >
          <AppText variant="subtitle">Commentaires</AppText>
          <ScrollView style={{ marginTop: 10 }}>
            {roots.map((r) => (
              <View key={r.id}>
                <CommentItem item={r} onReply={(id, author) => setReplyTo({ id, author })} />
                {(repliesByParent[r.id] ?? []).slice(0, 1).map((rep) => (
                  <CommentItem key={rep.id} item={rep} isReply />
                ))}
              </View>
            ))}
          </ScrollView>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={replyTo ? `Repondre a @${replyTo.author}...` : "Ajouter un commentaire..."}
              placeholderTextColor={theme.colors.textMuted}
              style={{
                flex: 1,
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 10,
                backgroundColor: theme.colors.surface,
              }}
            />
            <AppButton onPress={submit}>Envoyer</AppButton>
          </View>
          {replyTo ? (
            <View style={{ marginTop: 8 }}>
              <AppButton variant="secondary" onPress={() => setReplyTo(null)}>
                Annuler la reponse
              </AppButton>
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </Animated.View>
      <View style={{ height: 0 }}>
        <></>
      </View>
    </Modal>
  );
}
