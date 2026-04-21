import { z } from "zod";

export const projectSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case required"),
  client: z.string().max(80).optional().nullable(),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  cover_media_id: z.string().uuid().optional().nullable(),
  position: z.number().int().default(0),
  published: z.boolean().default(true),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
