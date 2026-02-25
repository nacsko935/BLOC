import { StyleSheet, Text, View } from "react-native";

type Props = {
  followers: number;
  following: number;
  points: number;
};

export function ProfileStats({ followers, following, points }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{followers} Abonnes</Text>
      <Text style={styles.dot}>|</Text>
      <Text style={styles.text}>{following} Suivis</Text>
      <Text style={styles.dot}>|</Text>
      <Text style={styles.text}>{points} Points</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  text: {
    color: "#D6D6DE",
    fontSize: 13,
    fontWeight: "600",
  },
  dot: {
    color: "#666673",
    fontSize: 12,
  },
});
