import { z } from "zod";

export const movieSchema = z.object({
  id: z.string().uuid().optional(),
  tmdb_id: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(500).optional().nullable(),
  watched_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  position: z.number().int().default(0),
});

export type MovieInput = z.infer<typeof movieSchema>;

export function extractTmdbId(raw: string): number | null {
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  const urlMatch = trimmed.match(/themoviedb\.org\/movie\/(\d+)/i);
  if (urlMatch) return parseInt(urlMatch[1], 10);
  return null;
}
