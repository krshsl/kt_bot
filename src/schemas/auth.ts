import { z } from "zod";

export const signIn = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
});

export type SignIn = z.infer<typeof signIn>;

export const signUp = signIn.extend({
  name: z.string().min(1).max(255),
  organization: z.string().min(1).max(255),
  phone: z
    .string()
    .regex(
      /^\+[1-9]\d{9,14}$/,
      "Phone must be E.164 format without spaces (e.g., +12345678901)",
    ),
});

export type SignUp = z.infer<typeof signUp>;
