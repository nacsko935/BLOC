import { Reel, mockReels } from "../reelsData";

const sampleVideo = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export type ReelItem = Reel & {
  playableUrl: string;
};

export async function fetchReels(cursor = 0, pageSize = 6): Promise<{ items: ReelItem[]; nextCursor: number | null }> {
  await new Promise((r) => setTimeout(r, 220));
  const source = mockReels.map((r) => ({
    ...r,
    playableUrl: r.type === "video" ? sampleVideo : sampleVideo,
  }));
  const items = source.slice(cursor, cursor + pageSize);
  const nextCursor = cursor + pageSize >= source.length ? null : cursor + pageSize;
  return { items, nextCursor };
}
