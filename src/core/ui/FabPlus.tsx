import { View, Text } from "react-native";

export default function FabPlus() {
  return (
    <View
      style={{
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: "#ff4d5d",
        alignItems: "center",
        justifyContent: "center",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      }}
    >
      <Text style={{ color: "white", fontSize: 30, fontWeight: "900", marginTop: -2 }}>+</Text>
    </View>
  );
}
