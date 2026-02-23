import { Comment } from "../types";

const db: Record<string, Comment[]> = {};

export async function listComments(targetId: string): Promise<Comment[]> {
  await new Promise((r) => setTimeout(r, 120));
  return db[targetId] ?? [];
}

export async function postComment(targetId: string, text: string, parentId?: string): Promise<Comment> {
  await new Promise((r) => setTimeout(r, 220));
  const item: Comment = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    parentId: parentId ?? null,
    author: "Moi",
    text,
    createdAt: new Date().toISOString(),
  };
  db[targetId] = [item, ...(db[targetId] ?? [])];
  return item;
}
