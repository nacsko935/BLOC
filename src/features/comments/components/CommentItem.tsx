import { View } from "react-native";
import { Comment } from "../types";
import { AppText } from "../../../core/ui/AppText";
import Card from "../../../core/ui/Card";
import { AppButton } from "../../../core/ui/AppButton";

export function CommentItem({
  item,
  isReply,
  onReply,
}: {
  item: Comment;
  isReply?: boolean;
  onReply?: (commentId: string, author: string) => void;
}) {
  return (
    <View style={{ marginLeft: isReply ? 22 : 0, marginTop: 8 }}>
      <Card>
        <AppText variant="caption" muted>{item.author}</AppText>
        <AppText style={{ marginTop: 6 }}>{item.text}</AppText>
        {!isReply ? (
          <View style={{ marginTop: 8, alignSelf: "flex-start" }}>
            <AppButton variant="secondary" onPress={() => onReply?.(item.id, item.author)}>
              Repondre
            </AppButton>
          </View>
        ) : null}
      </Card>
    </View>
  );
}
