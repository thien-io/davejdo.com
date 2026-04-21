import { z } from "zod";

export const tagSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(30),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export type TagInput = z.infer<typeof tagSchema>;
