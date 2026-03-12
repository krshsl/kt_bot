import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { catchAsync } from "../middleware/error";
import * as schema from "../schemas/user";
import * as service from "../service/user";
import { ApiError } from "../utils/error";

export const createUsers = catchAsync(async (req: Request, res: Response) => {
  if (!req.file || !req.file.buffer) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "CSV file is required");
  }

  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "Org ID missing");

  const count = await service.create(req.file.buffer, id);
  return res
    .status(StatusCodes.CREATED)
    .send(`${count} Users added successfully`);
});

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "User ID missing");

  const data = schema.getUsers.parse(req.body);
  const result = await service.getUsers(id, data.page, data.limit);
  return res.status(StatusCodes.OK).send(result);
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "User ID missing");

  const data = await service.getUser(id);
  return res.status(StatusCodes.OK).send(data);
});

export const removeUser = catchAsync(async (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "User ID missing");

  await service.remove(id);
  return res.status(StatusCodes.OK).send("Users deleted successfully");
});
