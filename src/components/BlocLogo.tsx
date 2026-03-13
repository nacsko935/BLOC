import React from "react";
import { View } from "react-native";
import Svg, { Path, Circle, G, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";

type Props = {
  size?: number;
  /** "dark" = fond sombre (écrans auth), "light" = fond clair */
  variant?: "dark" | "light";
};

/**
 * Logo BLOC — livre minimaliste ouvert
 * Reproduit fidèlement le logo fourni :
 *  - Couverture bleu marine foncé
 *  - Pages blanches/crème avec reflet
 *  - Étoile dorée 4 branches (haut droite)
 *  - Point décoratif (page gauche)
 */
export function BlocLogo({ size = 72, variant = "dark" }: Props) {
  const s = size;
  const half = s / 2;

  // Couleurs selon le thème du logo original
  const navyColor   = "#1B2B5E";   // bleu marine foncé (couverture)
  const pageColor   = "#F8F6F0";   // blanc cassé (pages)
  const pageShade   = "#EDE9DF";   // ombre légère sur la page droite
  const goldColor   = "#C9973B";   // or (étoile)
  const dotColor    = "#C9973B";   // point décoratif

  return (
    <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Defs>
          <SvgLinearGradient id="pageGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={pageColor} stopOpacity="1" />
            <Stop offset="1" stopColor={pageShade} stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="coverGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#253575" stopOpacity="1" />
            <Stop offset="1" stopColor={navyColor} stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {/* ── Couverture gauche (forme L / U inversée gauche) ── */}
        <Path
          d="M18 72 L18 38 Q18 30 24 28 L46 28 L46 78 Q36 76 26 75 Q18 74 18 72 Z"
          fill="url(#coverGrad)"
        />

        {/* ── Couverture droite ── */}
        <Path
          d="M82 72 L82 38 Q82 30 76 28 L54 28 L54 78 Q64 76 74 75 Q82 74 82 72 Z"
          fill="url(#coverGrad)"
        />

        {/* ── Pages gauches (courbe vers le centre) ── */}
        <Path
          d="M46 28 Q46 28 50 20 Q50 20 54 28 L54 78 Q50 72 50 72 Q50 72 46 78 Z"
          fill="url(#pageGrad)"
        />

        {/* ── Reflet page droite ── */}
        <Path
          d="M54 32 Q58 31 62 33 L62 70 Q58 69 54 70 Z"
          fill={pageColor}
          opacity="0.25"
        />

        {/* ── Ligne centrale (reliure) ── */}
        <Path
          d="M50 20 L50 72"
          stroke={navyColor}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* ── Point décoratif (page gauche) ── */}
        <Circle cx="38" cy="46" r="2.5" fill={dotColor} opacity="0.9" />

        {/* ── Étoile 4 branches (haut droite) ── */}
        <G transform="translate(68, 24)">
          {/* 4-pointed star */}
          <Path
            d="M0 -9 L1.8 -1.8 L9 0 L1.8 1.8 L0 9 L-1.8 1.8 L-9 0 L-1.8 -1.8 Z"
            fill={goldColor}
            transform="scale(0.85)"
          />
        </G>

        {/* ── Petite lueur sous l'étoile ── */}
        <Circle cx="68" cy="24" r="5" fill={goldColor} opacity="0.12" />
      </Svg>
    </View>
  );
}

export default BlocLogo;
