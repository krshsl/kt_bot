import { z } from "zod";

export const user = z.object({
  email: z.email(),
  name: z.string().min(1),
  phone: z
    .string()
    .transform((val) => {
      return val.replace(/[\s\-()]/g, "");
    })
    .pipe(z.e164()),
});

export const getUsers = z.object({
  page: z.number(),
  limit: z.number(),
});

export type GetUsers = z.infer<typeof getUsers>;
