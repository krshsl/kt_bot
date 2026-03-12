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
    .transform((val) => {
      return val.replace(/[\s\-()]/g, "");
    })
    .pipe(z.e164()),
});

export type SignUp = z.infer<typeof signUp>;
