import { Image, View } from "react-native";

type Props = {
  size?: number;
  /** "dark" = fond sombre → logo blanc | "light" = fond clair → logo foncé */
  variant?: "dark" | "light";
};

export function BlocLogo({ size = 72, variant = "dark" }: Props) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Image
        source={require("../../assets/logo.png")}
        style={{
          width: size * 0.82,
          height: size * 0.82,
          resizeMode: "contain",
          // PNG transparent : tintColor fonctionne maintenant
          tintColor: variant === "dark" ? "#FFFFFF" : "#1A1040",
        }}
      />
    </View>
  );
}

export default BlocLogo;
