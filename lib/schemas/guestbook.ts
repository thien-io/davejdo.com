import { z } from "zod";

export const guestbookSchema = z.object({
  name: z.string().trim().min(1).max(40),
  message: z.string().trim().min(1).max(280),
  // Honeypot — must be empty.
  website: z.string().max(0).optional(),
});

export type GuestbookInput = z.infer<typeof guestbookSchema>;
