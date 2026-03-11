import { NextFunction, Request, RequestHandler,Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

import { ApiError } from "../utils/error";

export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    const issues = err?.issues.map((issue) => ({
      field: issue.path.join(", "),
      message: issue.message,
    }));

    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Validation failed",
      error: issues,
    });
  }

  console.error("Unhandled Exception:", err);
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ error: "Internal Server Error" });
};
