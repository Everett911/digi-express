import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean().default(false),
  image: z.string().nullish(),
  role: z.string().default("customer"),
  rating: z.object({
    stars: z.number().min(0).max(5),
    count: z.number().int().nonnegative(),
  }),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type User = z.infer<typeof UserSchema>;
