export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public err?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}
