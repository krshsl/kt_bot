import { Express } from "express";

import auth from "./auth";
import health from "./health";

export const registerRoutes = (app: Express) => {
  app.use("/health", health);
  app.use("/auth", auth);
};
