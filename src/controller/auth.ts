import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { catchAsync } from "../middleware/error";
import * as schema from "../schemas/auth";
import * as service from "../service/auth";

export const signUp = catchAsync(async (req: Request, res: Response) => {
  const result = schema.signUp.parse(req.body);
  await service.signUp(result);
  return res.status(StatusCodes.CREATED).send("User created successfully");
});

export const signIn = catchAsync(async (req: Request, res: Response) => {
  const result = schema.signIn.parse(req.body);
  const data = await service.signIn(result);
  return res.json(data);
});

export const signOut = catchAsync(async (req: Request, res: Response) => {
  await service.signOut(req.token!);
  return res.json("Signed out successfully");
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "No token provided" });

  const data = await service.refresh(refreshToken);
  return res.json(data);
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const me = await service.getMe(req.user!);
  return res.json(me);
});
