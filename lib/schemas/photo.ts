import { z } from "zod";

export const photoSchema = z.object({
  id: z.string().uuid().optional(),
  media_id: z.string().uuid(),
  caption: z.string().max(500).optional().nullable(),
  location: z.string().max(120).optional().nullable(),
  taken_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  position: z.number().int().default(0),
  tag_ids: z.array(z.string().uuid()).default([]),
});

export type PhotoInput = z.infer<typeof photoSchema>;
