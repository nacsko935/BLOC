import { useTheme } from "../theme/ThemeProvider";
import { StyleProp, View, ViewStyle } from "react-native";
import { theme } from "./theme";

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: 1, backgroundColor: "rgba(255,255,255,0.08)" }, style]} />;
}

export default Divider;

