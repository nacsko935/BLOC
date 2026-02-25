import { create } from "zustand";
import { FeedComment, FeedPost, PostType } from "../types/db";
import {
  addComment as addCommentService,
  createPost as createPostService,
  fetchComments,
  fetchFeed,
  toggleLike,
  toggleSave,
} from "../lib/services/postService";

type FeedState = {
  posts: FeedPost[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  cursor: string | null;
  hasMore: boolean;
  commentsByPost: Record<string, FeedComment[]>;
  commentsLoading: boolean;
  refresh: (filiere?: string) => Promise<void>;
  loadMore: (filiere?: string) => Promise<void>;
  createPost: (input: { title?: string; content: string; filiere: string; type?: PostType }) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  toggleSave: (postId: string) => Promise<void>;
  openComments: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
};

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  loading: false,
  refreshing: false,
  loadingMore: false,
  cursor: null,
  hasMore: true,
  commentsByPost: {},
  commentsLoading: false,

  refresh: async (filiere) => {
    set({ refreshing: true, loading: true });
    const result = await fetchFeed({ filiere, limit: 10 });
    set({
      posts: result.posts,
      cursor: result.nextCursor,
      hasMore: Boolean(result.nextCursor),
      loading: false,
      refreshing: false,
    });
  },

  loadMore: async (filiere) => {
    const { loadingMore, hasMore, cursor } = get();
    if (loadingMore || !hasMore || !cursor) return;

    set({ loadingMore: true });
    const result = await fetchFeed({ filiere, limit: 10, cursor });
    set((state) => ({
      posts: [...state.posts, ...result.posts],
      cursor: result.nextCursor,
      hasMore: Boolean(result.nextCursor),
      loadingMore: false,
    }));
  },

  createPost: async (input) => {
    const post = await createPostService(input);
    set((state) => ({ posts: [post, ...state.posts] }));
  },

  toggleLike: async (postId) => {
    const liked = await toggleLike(postId);
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likedByMe: liked,
              likesCount: liked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1),
            }
          : post
      ),
    }));
  },

  toggleSave: async (postId) => {
    const saved = await toggleSave(postId);
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              savedByMe: saved,
              savesCount: saved ? post.savesCount + 1 : Math.max(0, post.savesCount - 1),
            }
          : post
      ),
    }));
  },

  openComments: async (postId) => {
    set({ commentsLoading: true });
    const comments = await fetchComments(postId);
    set((state) => ({ commentsByPost: { ...state.commentsByPost, [postId]: comments }, commentsLoading: false }));
  },

  addComment: async (postId, content) => {
    if (!content.trim()) return;
    const comments = await addCommentService(postId, content);
    set((state) => ({
      commentsByPost: { ...state.commentsByPost, [postId]: comments },
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, commentsCount: comments.length } : post
      ),
    }));
  },
}));