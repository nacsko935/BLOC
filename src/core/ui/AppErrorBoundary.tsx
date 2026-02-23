import React from "react";
import { View } from "react-native";
import { AppText } from "./AppText";
import { AppButton } from "./AppButton";
import { theme } from "./theme";

type State = {
  hasError: boolean;
};

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Lightweight logger hook for production errors.
    console.error("[AppErrorBoundary]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.bg,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
            gap: 12,
          }}
        >
          <AppText variant="subtitle">Une erreur est survenue</AppText>
          <AppText muted variant="caption" style={{ textAlign: "center" }}>
            Relance l'ecran pour continuer.
          </AppText>
          <AppButton onPress={() => this.setState({ hasError: false })}>Reessayer</AppButton>
        </View>
      );
    }
    return this.props.children;
  }
}
