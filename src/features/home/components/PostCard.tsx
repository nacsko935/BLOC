import FeedPostCard from "../../feed/PostCard";
import { Post } from "../../../core/data/models";

export function PostCard({ post }: { post: Post }) {
  return <FeedPostCard post={post} />;
}
