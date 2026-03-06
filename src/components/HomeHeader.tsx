import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../core/theme/ThemeProvider";

type Props = {
  notificationCount: number;
  avatarLabel?: string;
  avatarUri?: string | null;
  onPressBoost: () => void;
  onPressFavorites: () => void;
  onPressNotifications: () => void;
  onPressTitle: () => void;
  onPressMessages?: () => void;
};

export function HomeHeader({
  notificationCount, avatarLabel="B", avatarUri,
  onPressFavorites, onPressNotifications, onPressTitle, onPressMessages,
}: Props) {
  const insets = useSafeAreaInsets();
  const { c, isDark } = useTheme();

  const btnStyle = {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: isDark ? "#181836" : "#EEEEFF",
    alignItems: "center" as const, justifyContent: "center" as const,
    borderWidth: 1,
    borderColor: isDark ? "rgba(130,110,255,0.18)" : "rgba(91,76,255,0.10)",
  };

  return (
    <View style={{
      backgroundColor: isDark ? "rgba(7,7,26,0.97)" : "rgba(246,245,255,0.97)",
      paddingTop: insets.top + 10,
      paddingBottom: 13,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(130,110,255,0.10)" : "rgba(91,76,255,0.07)",
    }}>
      {/* Left: avatar + BLOC wordmark */}
      <View style={{ flexDirection:"row", alignItems:"center", gap:10 }}>
        <Pressable style={{
          width:36, height:36, borderRadius:12, overflow:"hidden",
          borderWidth:1.5,
          borderColor: isDark ? "rgba(130,110,255,0.35)" : "rgba(91,76,255,0.25)",
        }}>
          {avatarUri
            ? <Image source={{uri:avatarUri}} style={{width:36,height:36}} resizeMode="cover"/>
            : <LinearGradient colors={["#8B7DFF","#4D3ECC"]} style={{flex:1,alignItems:"center",justifyContent:"center"}}>
                <Text style={{color:"#fff",fontWeight:"900",fontSize:14}}>{avatarLabel.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
          }
        </Pressable>
        <Pressable onPress={onPressTitle} style={{flexDirection:"row",alignItems:"center",gap:4}}>
          <Text style={{
            color: c.textPrimary,
            fontSize: 21, fontWeight:"900",
            letterSpacing: -0.9,
          }}>BLOC</Text>
          <Ionicons name="chevron-down" size={13} color={c.textSecondary} style={{marginTop:3}}/>
        </Pressable>
      </View>

      {/* Right: icon buttons */}
      <View style={{flexDirection:"row",alignItems:"center",gap:7}}>
        <Pressable onPress={onPressFavorites} style={btnStyle}>
          <Ionicons name="search-outline" size={17} color={c.textPrimary}/>
        </Pressable>
        <Pressable onPress={onPressMessages} style={btnStyle}>
          <Ionicons name="chatbubble-ellipses-outline" size={17} color={c.textPrimary}/>
        </Pressable>
        <Pressable onPress={onPressNotifications} style={[btnStyle, {position:"relative"}]}>
          <Ionicons name="notifications-outline" size={17} color={c.textPrimary}/>
          {notificationCount > 0 && (
            <View style={{
              position:"absolute", top:7, right:7,
              width:7, height:7, borderRadius:4,
              backgroundColor:"#FF4757",
              borderWidth:1.5, borderColor: isDark ? "#07071A" : "#F6F5FF",
            }}/>
          )}
        </Pressable>
      </View>
    </View>
  );
}
