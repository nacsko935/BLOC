import { StyleProp, View, ViewStyle } from "react-native";
import { theme } from "./theme";

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: 1, backgroundColor: theme.colors.border }, style]} />;
}

export default Divider;

