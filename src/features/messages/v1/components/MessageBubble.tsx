import { StyleSheet, Text, View } from "react-native";

type Props = {
  text: string;
  timestamp: string;
  isMe: boolean;
  senderName?: string;
  showSender?: boolean;
};

export function MessageBubble({ text, timestamp, isMe, senderName, showSender = false }: Props) {
  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowOther]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        {showSender && !isMe && senderName ? <Text style={styles.senderName}>{senderName}</Text> : null}
        <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextOther]}>{text}</Text>
        <Text style={[styles.timeText, isMe ? styles.timeTextMe : styles.timeTextOther]}>{timestamp}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    flexDirection: "row",
  },
  rowMe: {
    justifyContent: "flex-end",
  },
  rowOther: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  bubbleMe: {
    backgroundColor: "#2C7BFF",
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    backgroundColor: "#14141A",
    borderWidth: 1,
    borderColor: "#22222B",
    borderBottomLeftRadius: 6,
  },
  senderName: {
    color: "#9EA0FF",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextMe: {
    color: "#FFFFFF",
  },
  messageTextOther: {
    color: "#EBEBEE",
  },
  timeText: {
    fontSize: 11,
  },
  timeTextMe: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "right",
  },
  timeTextOther: {
    color: "#8F8F99",
  },
});
