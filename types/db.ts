export type Profile = {
  id: string;
  username: string | null;
  display_name?: string | null;
  full_name: string | null;
  bio: string | null;
  filiere: string | null;
  niveau: string | null;
  avatar_url: string | null;
  role?: string | null;
  account_type?: string | null;
  school_name?: string | null;
  ecole?: string | null;
  notification_enabled?: boolean | null;
  push_enabled?: boolean | null;
  analytics_enabled?: boolean | null;
};

export type PostType = "text" | "pdf" | "qcm";

export type Post = {
  id: string;
  author_id: string;
  user_id?: string | null;
  filiere: string | null;
  title: string | null;
  content: string;
  type: PostType;
  attachment_url: string | null;
  created_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export type Like = {
  post_id: string;
  user_id: string;
};

export type Save = {
  post_id: string;
  user_id: string;
};

export type FeedPost = Post & {
  author: Profile | null;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
};

export type FeedComment = Comment & {
  author: Profile | null;
};
