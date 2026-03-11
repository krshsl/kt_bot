import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { AuthRequest } from "../middleware/auth";
import { catchAsync } from "../middleware/error";
import * as schema from "../schemas/auth";
import * as service from "../service/auth";

export const signUp = catchAsync(async (req: Request, res: Response) => {
  const result = schema.signUp.parse(req.body);
  await service.signUp(result);
  return res.status(StatusCodes.CREATED);
});

export const signIn = catchAsync(async (req: Request, res: Response) => {
  const result = schema.signIn.parse(req.body);
  const data = await service.signIn(result);
  return res.json(data);
});

export const signOut = async (req: AuthRequest, res: Response) => {
  await service.signOut(req.token);
  res.json("Signed out successfully");
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "No token provided" });

  const data = await service.refresh(token);
  return res.json(data);
};

export const me = async (req: AuthRequest, res: Response) => {
  const me = await service.getMe(req.user);
  return res.json(me);
};
