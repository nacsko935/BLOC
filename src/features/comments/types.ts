export type Comment = {
  id: string;
  parentId?: string | null;
  author: string;
  text: string;
  createdAt: string;
  optimistic?: boolean;
};
