/**
 * Avatar3D — Custom SVG avatar with 3D lighting effects.
 * Rendered entirely with react-native-svg (no external API).
 */
import { useRef } from "react";
import Svg, {
  Circle, ClipPath, Defs, Ellipse,
  FeDropShadow, Filter, G,
  LinearGradient, Path,
  RadialGradient, Rect, Stop,
} from "react-native-svg";

// ── Types ─────────────────────────────────────────────────────────────────────

export type HairStyle     = "buzz" | "short" | "medium" | "long" | "curly" | "bun" | "wavy";
export type EyeStyle      = "round" | "almond" | "wide" | "sleepy";
export type EyebrowStyle  = "arched" | "thin" | "thick" | "straight";
export type MouthStyle    = "smile" | "neutral" | "open" | "smirk" | "grin";
export type FacialHair    = "none" | "stubble" | "goatee" | "beard" | "mustache";
export type Accessory     = "none" | "glasses" | "sunglasses" | "hat";
export type ClothingStyle = "tshirt" | "hoodie" | "shirt" | "jacket";

export type Avatar3DConfig = {
  _v: "3d";
  skinColor: string;
  hairStyle: HairStyle;
  hairColor: string;
  eyeStyle: EyeStyle;
  eyeColor: string;
  eyebrowStyle: EyebrowStyle;
  mouthStyle: MouthStyle;
  facialHair: FacialHair;
  accessory: Accessory;
  clothingStyle: ClothingStyle;
  clothingColor: string;
  bgColor: string;
};

// ── Presets ───────────────────────────────────────────────────────────────────

export const SKIN_TONES      = ["#FDDBB4","#F5C28A","#E8A96C","#C68B5A","#A0632A","#6B3A2A"];
export const HAIR_COLORS     = ["#1A0A05","#4A2E0F","#7B4F1E","#C8862A","#D4A847","#8B6347","#D0D0D0","#FF6B6B","#A855F7","#3B82F6"];
export const EYE_COLORS      = ["#2C6EAA","#2E7D32","#8B4513","#1A1A1A","#9B59B6","#0EA5E9"];
export const CLOTHING_COLORS = ["#7B6CFF","#FF3B30","#34C759","#FF9500","#1A1A2E","#E5E7EB","#F472B6","#0EA5E9","#10B981","#EF4444"];
export const BG_COLORS       = ["#1A0A3B","#0A1628","#0D2137","#1A1A0A","#0A2018","#1F0A28","#2D1B00","#001A2D"];
export const HAIR_STYLE_LABELS: Record<HairStyle, string>     = { buzz:"Rasé",short:"Court",medium:"Mi-long",long:"Long",curly:"Frisé",bun:"Chignon",wavy:"Ondulé" };
export const EYE_STYLE_LABELS: Record<EyeStyle, string>       = { round:"Rond",almond:"Amande",wide:"Grand",sleepy:"Mi-clos" };
export const EYEBROW_LABELS: Record<EyebrowStyle, string>     = { arched:"Arqué",thin:"Fin",thick:"Épais",straight:"Droit" };
export const MOUTH_LABELS: Record<MouthStyle, string>         = { smile:"Sourire",neutral:"Naturel",open:"Bouche ouverte",smirk:"Coin",grin:"Grand sourire" };
export const FACIAL_HAIR_LABELS: Record<FacialHair, string>   = { none:"Aucune",stubble:"Barbe naissante",goatee:"Bouc",beard:"Barbe",mustache:"Moustache" };
export const ACCESSORY_LABELS: Record<Accessory, string>      = { none:"Aucun",glasses:"Lunettes",sunglasses:"Lunettes de soleil",hat:"Chapeau" };
export const CLOTHING_LABELS: Record<ClothingStyle, string>   = { tshirt:"T-shirt",hoodie:"Hoodie",shirt:"Chemise",jacket:"Veste" };

export function createDefaultAvatar3DConfig(): Avatar3DConfig {
  return {
    _v: "3d",
    skinColor: SKIN_TONES[0],
    hairStyle: "short",
    hairColor: HAIR_COLORS[0],
    eyeStyle: "round",
    eyeColor: EYE_COLORS[0],
    eyebrowStyle: "arched",
    mouthStyle: "smile",
    facialHair: "none",
    accessory: "none",
    clothingStyle: "tshirt",
    clothingColor: CLOTHING_COLORS[0],
    bgColor: BG_COLORS[0],
  };
}

export function isAvatar3DConfig(v: unknown): v is Avatar3DConfig {
  return typeof v === "object" && v !== null && (v as any)._v === "3d";
}

// ── Color utilities ────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return [isNaN(r) ? 128 : r, isNaN(g) ? 128 : g, isNaN(b) ? 128 : b];
}

function mix(hex: string, pct: number): string {
  const [r, g, b] = hexToRgb(hex);
  const t = Math.round(pct * 255);
  return `rgb(${Math.min(255, r + t)},${Math.min(255, g + t)},${Math.min(255, b + t)})`;
}

function shade(hex: string, pct: number): string {
  const [r, g, b] = hexToRgb(hex);
  const t = Math.round(pct * 255);
  return `rgb(${Math.max(0, r - t)},${Math.max(0, g - t)},${Math.max(0, b - t)})`;
}

// ── SVG path data ─────────────────────────────────────────────────────────────
// ViewBox 0 0 200 230 | Head: cx=100 cy=110 rx=55 ry=58

// Hair cap paths (drawn ON TOP of head, covering forehead to crown)
const HAIR_CAP: Record<HairStyle, string> = {
  // Barely-there cap — high hairline
  buzz:   "M 56 93 Q 100 85 144 93 Q 154 72 100 46 Q 46 72 56 93 Z",
  // Normal cap — mid hairline
  short:  "M 54 80 Q 100 70 146 80 Q 155 60 100 46 Q 45 60 54 80 Z",
  // Same cap as short (sides are separate)
  medium: "M 54 80 Q 100 70 146 80 Q 155 60 100 46 Q 45 60 54 80 Z",
  // Same cap (long sides separate)
  long:   "M 54 80 Q 100 70 146 80 Q 155 60 100 46 Q 45 60 54 80 Z",
  // Big fluffy afro
  curly:  "M 38 102 Q 32 80 40 62 Q 50 44 72 38 Q 100 32 128 38 Q 150 44 160 62 Q 168 80 162 102 Q 154 78 144 62 Q 130 48 100 46 Q 70 48 56 62 Q 46 78 38 102 Z",
  // Short cap + bun (bun rendered separately)
  bun:    "M 56 82 Q 100 72 144 82 Q 154 62 100 46 Q 46 62 56 82 Z",
  // Wavy bottom edge
  wavy:   "M 50 88 Q 62 80 74 90 Q 86 100 98 80 Q 100 76 102 80 Q 114 100 126 90 Q 138 80 150 88 Q 155 62 100 46 Q 45 62 50 88 Z",
};

// Side hair pieces (only for medium/long styles)
const HAIR_LEFT: Partial<Record<HairStyle, string>> = {
  medium: "M 50 102 Q 40 118 40 150 Q 40 164 50 166 Q 54 150 54 112 Z",
  long:   "M 48 106 Q 33 122 30 178 Q 28 208 44 214 Q 50 194 50 118 Z",
};
const HAIR_RIGHT: Partial<Record<HairStyle, string>> = {
  medium: "M 150 102 Q 160 118 160 150 Q 160 164 150 166 Q 146 150 146 112 Z",
  long:   "M 152 106 Q 167 122 170 178 Q 172 208 156 214 Q 150 194 150 118 Z",
};

// Clothing path (shoulders + shirt visible at bottom)
const CLOTHING_PATH: Record<ClothingStyle, string> = {
  tshirt:  "M 28 222 Q 28 198 52 190 L 78 182 Q 100 188 122 182 L 148 190 Q 172 198 172 222 Z",
  hoodie:  "M 22 222 Q 22 196 48 186 L 72 178 Q 100 186 128 178 L 152 186 Q 178 196 178 222 Z",
  shirt:   "M 30 222 Q 30 200 54 192 L 80 184 Q 100 188 120 184 L 146 192 Q 170 200 170 222 Z",
  jacket:  "M 20 222 Q 20 194 44 184 L 68 176 L 100 182 L 132 176 L 156 184 Q 180 194 180 222 Z",
};

// Collar detail for jacket
const JACKET_COLLAR = "M 94 182 L 88 175 L 100 179 L 112 175 L 106 182 Q 100 186 94 182 Z";

// ── Eye geometry ──────────────────────────────────────────────────────────────

function eyeSize(style: EyeStyle) {
  switch (style) {
    case "round":  return { rx: 10.5, ry: 10.5 };
    case "almond": return { rx: 12,   ry: 8    };
    case "wide":   return { rx: 11,   ry: 12   };
    case "sleepy": return { rx: 11,   ry: 7    };
  }
}

// ── Eyebrow paths ─────────────────────────────────────────────────────────────

function browPath(style: EyebrowStyle, side: "left" | "right") {
  const L = side === "left";
  switch (style) {
    case "arched":   return L ? "M 64 87 Q 78 81 92 87" : "M 108 87 Q 122 81 136 87";
    case "thin":     return L ? "M 66 88 Q 78 84 90 88" : "M 110 88 Q 122 84 134 88";
    case "thick":    return L ? "M 64 90 Q 78 83 92 90 Q 90 94 78 88 Q 66 94 64 90 Z"
                              : "M 108 90 Q 122 83 136 90 Q 134 94 122 88 Q 110 94 108 90 Z";
    case "straight": return L ? "M 66 88 L 90 88" : "M 110 88 L 134 88";
  }
}

// ── Mouth paths ───────────────────────────────────────────────────────────────

const MOUTH_DATA: Record<MouthStyle, { outer: string; inner?: string }> = {
  smile:   { outer: "M 86 136 Q 100 149 114 136" },
  neutral: { outer: "M 88 138 L 112 138" },
  open:    { outer: "M 85 134 Q 100 150 115 134", inner: "M 87 134 Q 100 144 113 134" },
  smirk:   { outer: "M 88 136 Q 102 142 114 133" },
  grin:    { outer: "M 82 133 Q 100 152 118 133" },
};

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  config: Avatar3DConfig;
  size?: number;
  /** "face" crops to head only (good for small avatars) */
  variant?: "face" | "full";
};

export function Avatar3D({ config, size = 120, variant = "full" }: Props) {
  // Stable ID prefix per instance (avoids SVG id collisions in lists)
  const uid = useRef(`a_${Math.random().toString(36).slice(2, 7)}`).current;
  const id  = (s: string) => `${uid}_${s}`;

  const skinL = mix(config.skinColor, 0.24);
  const skinD = shade(config.skinColor, 0.18);
  const hairL = mix(config.hairColor, 0.28);
  const hairD = shade(config.hairColor, 0.32);
  const clothL = mix(config.clothingColor, 0.22);
  const clothD = shade(config.clothingColor, 0.28);
  const bgL   = mix(config.bgColor, 0.14);
  const bgD   = shade(config.bgColor, 0.24);

  const eye   = eyeSize(config.eyeStyle);
  const browFill = config.eyebrowStyle === "thick" ? shade(config.hairColor, 0.1) : "none";
  const browStroke = config.eyebrowStyle === "thick" ? "none" : shade(config.hairColor, 0.1);

  const viewBox = variant === "face" ? "30 45 140 130" : "0 0 200 230";
  const svgH    = variant === "face" ? size : size * (230 / 200);

  const hairCap   = HAIR_CAP[config.hairStyle];
  const leftSide  = HAIR_LEFT[config.hairStyle];
  const rightSide = HAIR_RIGHT[config.hairStyle];
  const clothing  = CLOTHING_PATH[config.clothingStyle];
  const mouth     = MOUTH_DATA[config.mouthStyle];

  return (
    <Svg viewBox={viewBox} width={size} height={svgH}>
      <Defs>
        {/* Background gradient */}
        <LinearGradient id={id("bg")} x1="0.4" y1="0" x2="0.6" y2="1">
          <Stop offset="0%"   stopColor={bgL} />
          <Stop offset="100%" stopColor={bgD} />
        </LinearGradient>

        {/* Head — 3D sphere effect (light from upper-left) */}
        <RadialGradient id={id("skin")} cx="33%" cy="26%" r="72%">
          <Stop offset="0%"   stopColor={skinL} />
          <Stop offset="52%"  stopColor={config.skinColor} />
          <Stop offset="100%" stopColor={skinD} />
        </RadialGradient>

        {/* Ear (simpler gradient) */}
        <RadialGradient id={id("ear")} cx="40%" cy="30%" r="65%">
          <Stop offset="0%"   stopColor={config.skinColor} />
          <Stop offset="100%" stopColor={skinD} />
        </RadialGradient>

        {/* Hair — top-to-bottom depth */}
        <LinearGradient id={id("hair")} x1="0.35" y1="0" x2="0.65" y2="1">
          <Stop offset="0%"   stopColor={hairL} />
          <Stop offset="100%" stopColor={hairD} />
        </LinearGradient>

        {/* Eye iris */}
        <RadialGradient id={id("iris")} cx="38%" cy="34%" r="65%">
          <Stop offset="0%"   stopColor={mix(config.eyeColor, 0.32)} />
          <Stop offset="68%"  stopColor={config.eyeColor} />
          <Stop offset="100%" stopColor={shade(config.eyeColor, 0.38)} />
        </RadialGradient>

        {/* Clothing */}
        <LinearGradient id={id("cloth")} x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%"   stopColor={clothL} />
          <Stop offset="100%" stopColor={clothD} />
        </LinearGradient>

        {/* Drop shadow for head */}
        <Filter id={id("shadow")} x="-18%" y="-18%" width="136%" height="148%">
          <FeDropShadow dx="2" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.22" />
        </Filter>

        {/* Clip for sleepy eyelids */}
        <ClipPath id={id("leftEyeClip")}>
          <Rect x={78 - eye.rx} y={100} width={eye.rx * 2} height={eye.ry * 2} />
        </ClipPath>
        <ClipPath id={id("rightEyeClip")}>
          <Rect x={122 - eye.rx} y={100} width={eye.rx * 2} height={eye.ry * 2} />
        </ClipPath>
      </Defs>

      {/* ── Background ── */}
      {variant === "full" && (
        <Rect x="0" y="0" width="200" height="230" rx="22" fill={`url(#${id("bg")})`} />
      )}

      {/* ── Long / Medium hair behind head ── */}
      {leftSide  && <Path d={leftSide}  fill={`url(#${id("hair")})`} />}
      {rightSide && <Path d={rightSide} fill={`url(#${id("hair")})`} />}

      {/* ── Neck ── */}
      {variant === "full" && (
        <Rect x="87" y="162" width="26" height="30" rx="5" fill={config.skinColor} />
      )}

      {/* ── Clothing ── */}
      {variant === "full" && (
        <>
          <Path d={clothing} fill={`url(#${id("cloth")})`} />
          {config.clothingStyle === "jacket" && (
            <Path d={JACKET_COLLAR} fill={clothL} />
          )}
          {config.clothingStyle === "hoodie" && (
            <Path d="M 90 184 Q 100 190 110 184 L 108 194 Q 100 197 92 194 Z"
              fill={shade(config.clothingColor, 0.12)} />
          )}
        </>
      )}

      {/* ── Left ear ── */}
      <Ellipse cx="44" cy="113" rx="11" ry="14" fill={`url(#${id("ear")})`} />
      <Ellipse cx="44" cy="113" rx="6"  ry="9"  fill={shade(config.skinColor, 0.09)} />

      {/* ── Right ear ── */}
      <Ellipse cx="156" cy="113" rx="11" ry="14" fill={`url(#${id("ear")})`} />
      <Ellipse cx="156" cy="113" rx="6"  ry="9"  fill={shade(config.skinColor, 0.09)} />

      {/* ── Head (the main 3D sphere) ── */}
      <Ellipse cx="100" cy="110" rx="55" ry="58"
        fill={`url(#${id("skin")})`}
        filter={`url(#${id("shadow")})`}
      />

      {/* ── Chin shadow (subtle) ── */}
      <Ellipse cx="100" cy="158" rx="36" ry="10"
        fill={shade(config.skinColor, 0.12)} opacity={0.55} />

      {/* ── Hair cap (on top of face) ── */}
      <Path d={hairCap} fill={`url(#${id("hair")})`} />

      {/* ── Bun knot ── */}
      {config.hairStyle === "bun" && (
        <G>
          <Ellipse cx="100" cy="40" rx="17" ry="18" fill={`url(#${id("hair")})`} />
          {/* Knot highlight */}
          <Ellipse cx="95" cy="34" rx="7" ry="5" fill={hairL} opacity={0.45}
            transform="rotate(-20, 95, 34)" />
        </G>
      )}

      {/* ── Eyebrows ── */}
      <Path d={browPath(config.eyebrowStyle, "left")}
        fill={browFill} stroke={browStroke}
        strokeWidth={config.eyebrowStyle === "thin" ? 1.8 : 2.6}
        strokeLinecap="round" />
      <Path d={browPath(config.eyebrowStyle, "right")}
        fill={browFill} stroke={browStroke}
        strokeWidth={config.eyebrowStyle === "thin" ? 1.8 : 2.6}
        strokeLinecap="round" />

      {/* ── Left eye ── */}
      <Ellipse cx="78" cy="100" rx={eye.rx} ry={eye.ry} fill="white" />
      <Circle  cx="78" cy="100" r={eye.rx * 0.68} fill={`url(#${id("iris")})`} />
      <Circle  cx="78" cy="100" r={eye.rx * 0.37} fill="#0D0D0D" />
      <Circle  cx={78 + eye.rx * 0.28} cy={100 - eye.ry * 0.32} r={eye.rx * 0.16} fill="white" />

      {/* ── Right eye ── */}
      <Ellipse cx="122" cy="100" rx={eye.rx} ry={eye.ry} fill="white" />
      <Circle  cx="122" cy="100" r={eye.rx * 0.68} fill={`url(#${id("iris")})`} />
      <Circle  cx="122" cy="100" r={eye.rx * 0.37} fill="#0D0D0D" />
      <Circle  cx={122 + eye.rx * 0.28} cy={100 - eye.ry * 0.32} r={eye.rx * 0.16} fill="white" />

      {/* ── Sleepy eyelids ── */}
      {config.eyeStyle === "sleepy" && (
        <G>
          <Path d={`M ${78 - eye.rx} 100 Q 78 ${100 - eye.ry * 0.9} ${78 + eye.rx} 100`}
            fill={config.skinColor} />
          <Path d={`M ${122 - eye.rx} 100 Q 122 ${100 - eye.ry * 0.9} ${122 + eye.rx} 100`}
            fill={config.skinColor} />
        </G>
      )}

      {/* ── Nose ── */}
      <Path d="M 95 114 Q 92 122 96 127 M 105 114 Q 108 122 104 127"
        fill="none" stroke={shade(config.skinColor, 0.2)}
        strokeWidth={1.8} strokeLinecap="round" />

      {/* ── Mouth ── */}
      {config.mouthStyle === "open" ? (
        <G>
          <Path d={mouth.outer} fill="#A52A1A" />
          {mouth.inner && <Path d={mouth.inner} fill="#fff" />}
          <Path d={mouth.outer} fill="none"
            stroke={shade(config.skinColor, 0.28)} strokeWidth={1.5} />
        </G>
      ) : (
        <Path d={mouth.outer} fill="none"
          stroke={shade(config.skinColor, 0.28)} strokeWidth={2.6}
          strokeLinecap="round" />
      )}

      {/* ── Rosy cheeks ── */}
      <Ellipse cx="60"  cy="118" rx="12" ry="8" fill="#FF7A7A" opacity={0.22} />
      <Ellipse cx="140" cy="118" rx="12" ry="8" fill="#FF7A7A" opacity={0.22} />

      {/* ── Facial hair ── */}
      {config.facialHair === "stubble" && (
        <G fill={shade(config.hairColor, 0.05)} opacity={0.45}>
          {([86,92,100,108,114,84,116] as number[]).map((x, i) => (
            <Circle key={i} cx={x} cy={i < 5 ? 132 : 126} r={1.3} />
          ))}
        </G>
      )}
      {config.facialHair === "mustache" && (
        <Path d="M 88 129 Q 94 124 100 127 Q 106 124 112 129 Q 108 133 100 131 Q 92 133 88 129 Z"
          fill={shade(config.hairColor, 0.08)} />
      )}
      {config.facialHair === "goatee" && (
        <G fill={shade(config.hairColor, 0.08)}>
          <Path d="M 88 129 Q 94 124 100 127 Q 106 124 112 129 Q 108 133 100 131 Q 92 133 88 129 Z" />
          <Path d="M 93 134 Q 100 150 107 134 Q 100 138 93 134 Z" />
        </G>
      )}
      {config.facialHair === "beard" && (
        <Path d="M 60 124 Q 55 138 60 152 Q 70 168 100 170 Q 130 168 140 152 Q 145 138 140 124 Q 128 132 100 134 Q 72 132 60 124 Z"
          fill={shade(config.hairColor, 0.08)} opacity={0.92} />
      )}

      {/* ── Glasses ── */}
      {config.accessory === "glasses" && (
        <G fill="none" stroke="#3A3A3A" strokeWidth={2.2}>
          <Ellipse cx="78"  cy="100" rx="17" ry="13" />
          <Ellipse cx="122" cy="100" rx="17" ry="13" />
          <Path d="M 95 100 L 105 100" strokeWidth={2} />
          <Path d="M 61 97 L 54 95" strokeLinecap="round" strokeWidth={1.8} />
          <Path d="M 139 97 L 146 95" strokeLinecap="round" strokeWidth={1.8} />
        </G>
      )}

      {/* ── Sunglasses ── */}
      {config.accessory === "sunglasses" && (
        <G>
          <Ellipse cx="78"  cy="100" rx="17" ry="13" fill="#111" opacity={0.88} />
          <Ellipse cx="122" cy="100" rx="17" ry="13" fill="#111" opacity={0.88} />
          <Path d="M 95 100 L 105 100" fill="none" stroke="#444" strokeWidth={2} />
          <Path d="M 61 97 L 54 95"   fill="none" stroke="#444" strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M 139 97 L 146 95" fill="none" stroke="#444" strokeWidth={1.8} strokeLinecap="round" />
          {/* Lens shine */}
          <Path d="M 67 93 Q 72 90 77 93" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth={1.5} strokeLinecap="round" />
          <Path d="M 111 93 Q 116 90 121 93" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth={1.5} strokeLinecap="round" />
        </G>
      )}

      {/* ── Hat ── */}
      {config.accessory === "hat" && (
        <G>
          {/* Brim */}
          <Ellipse cx="100" cy="65" rx="66" ry="10" fill={shade(config.hairColor, 0.18)} />
          {/* Body */}
          <Rect x="50" y="22" width="100" height="46" rx="10"
            fill={shade(config.hairColor, 0.06)} />
          {/* Band */}
          <Rect x="50" y="57" width="100" height="10" rx="3"
            fill={shade(config.hairColor, 0.28)} />
          {/* Shine on hat */}
          <Path d="M 58 28 Q 80 23 102 26" fill="none"
            stroke="rgba(255,255,255,0.18)" strokeWidth={2} strokeLinecap="round" />
        </G>
      )}

      {/* ── 3D specular highlight (glass-sphere effect) ── */}
      <Ellipse cx="72" cy="82" rx="18" ry="11"
        fill="white" opacity={0.13}
        transform="rotate(-24, 72, 82)" />

      {/* Tiny second specular point */}
      <Circle cx="130" cy="148" r="4" fill="white" opacity={0.05} />
    </Svg>
  );
}
