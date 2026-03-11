import { Request, Response } from "express";

import db from "../config/db";
import supabase from "../config/supabase";
import { catchAsync } from "../middleware/error";

export const health = catchAsync(async (_req: Request, res: Response) => {
  await db.query("SELECT 1");
  await supabase.auth.getSession();
  return res.json({
    status: "ok",
    server: "up",
    db: "connected",
    auth: "success",
  });
});
