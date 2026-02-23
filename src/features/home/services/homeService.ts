import { feedPosts } from "../../feed/mock";
import { Post } from "../../../core/data/models";
import { HomeFeedPage, HomeTabKey } from "../types";

const PAGE_SIZE = 6;

function filterByTab(posts: Post[], tab: HomeTabKey) {
  switch (tab) {
    case "Campus":
      return posts.filter((p) => p.source === "campus");
    case "Prof":
      return posts.filter((p) => p.source === "prof");
    case "Amis":
      return posts.filter((p) => p.source === "amis");
    case "Tendances":
      return posts.filter((p) => p.source === "tendance");
    default:
      return posts;
  }
}

export async function fetchHomeFeed(tab: HomeTabKey, cursor = 0): Promise<HomeFeedPage> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const source = filterByTab(feedPosts, tab);
  const start = cursor;
  const end = cursor + PAGE_SIZE;
  const items = source.slice(start, end);
  const nextCursor = end >= source.length ? null : end;
  return { items, nextCursor };
}
