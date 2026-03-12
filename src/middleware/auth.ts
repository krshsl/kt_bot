import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import supabase from "../config/supabase";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "No token provided" });

  const { data, error } = await supabase.auth.getUser(token); // expensive but i don't wanna focus on that??
  if (error || !data.user)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "Invalid token" });

  req.user = data.user;
  req.token = token;
  next();
};
