import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { userCache } from "../config/cache";
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
      .json({ message: "Token missing" });

  const payloadBase64 = token.split(".")[1];
  if (!payloadBase64)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid token" });

  let user = userCache.get(token);

  if (!user) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid token" });

    user = data.user;

    const decodedPayload = JSON.parse(
      Buffer.from(payloadBase64, "base64").toString(),
    );
    const expiryTimeMs = decodedPayload.exp * 1000;
    const now = Date.now();
    const remainingTime = expiryTimeMs - now;
    const ttl = Math.max(0, Math.min(remainingTime, 5 * 60 * 1000));
    userCache.set(token, user, { ttl });
  }

  req.user = user;
  req.token = token;
  next();
};
