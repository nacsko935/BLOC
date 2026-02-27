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
import { track } from "../lib/services/analyticsService";

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

const likePending = new Set<string>();
const savePending = new Set<string>();
const commentPending = new Set<string>();

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
    track("post_create", { post_id: post.id, type: post.type }).catch(() => null);
  },

  toggleLike: async (postId) => {
    if (likePending.has(postId)) return;
    likePending.add(postId);
    try {
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
      track("post_like", { post_id: postId, liked }).catch(() => null);
    } finally {
      likePending.delete(postId);
    }
  },

  toggleSave: async (postId) => {
    if (savePending.has(postId)) return;
    savePending.add(postId);
    try {
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
      track("post_save", { post_id: postId, saved }).catch(() => null);
    } finally {
      savePending.delete(postId);
    }
  },

  openComments: async (postId) => {
    set({ commentsLoading: true });
    const comments = await fetchComments(postId);
    set((state) => ({ commentsByPost: { ...state.commentsByPost, [postId]: comments }, commentsLoading: false }));
  },

  addComment: async (postId, content) => {
    if (!content.trim()) return;
    if (commentPending.has(postId)) return;
    commentPending.add(postId);
    try {
      const comments = await addCommentService(postId, content);
      set((state) => ({
        commentsByPost: { ...state.commentsByPost, [postId]: comments },
        posts: state.posts.map((post) =>
          post.id === postId ? { ...post, commentsCount: comments.length } : post
        ),
      }));
      track("comment_add", { post_id: postId }).catch(() => null);
    } finally {
      commentPending.delete(postId);
    }
  },
}));