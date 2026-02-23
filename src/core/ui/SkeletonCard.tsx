import { View } from "react-native";
import Card from "./Card";
import { Skeleton } from "./Skeleton";

export function SkeletonCard() {
  return (
    <Card>
      <View style={{ gap: 8 }}>
        <Skeleton height={18} width="35%" />
        <Skeleton height={16} width="70%" />
        <Skeleton height={12} width="45%" />
      </View>
    </Card>
  );
}
