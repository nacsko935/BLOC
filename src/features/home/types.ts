import { Post } from "../../core/data/models";

export type HomeTabKey = "Abonne" | "Campus" | "Prof" | "Amis" | "Tendances";

export type HomeFeedPage = {
  items: Post[];
  nextCursor: number | null;
};
