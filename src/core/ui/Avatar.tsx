import { useTheme } from "../theme/ThemeProvider";
import { View } from "react-native";
import { Image } from "expo-image";
import { AppText } from "./AppText";
import { theme } from "./theme";

type Props = {
  name: string;
  size?: number;
  uri?: string | null;
};

export function Avatar({ name, size = 44, uri }: Props) {
  const radius = size / 2;
  if (uri) {
    return <Image source={{ uri }} contentFit="cover" style={{ width: size, height: size, borderRadius: radius }} />;
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: "#1c1c23",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AppText style={{ fontWeight: "800" }}>{name.charAt(0).toUpperCase()}</AppText>
    </View>
  );
}
