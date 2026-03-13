export type AvatarExpression = "neutral" | "happy" | "focused" | "tired" | "motivated";

export type AvatarConfig = {
  seed: string;
  skinColor: string;
  top: string;
  hairColor: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  facialHair: string;
  clothes: string;
  clothesColor: string;
  accessories: string;
  expression: AvatarExpression;
};

// New 3D avatar config — stored with _v: "3d" marker
export type { Avatar3DConfig } from "../src/components/Avatar3D";
