import { Express } from "express";

import health from "./health";

export const registerRoutes = (app: Express) => {
  app.use("/health", health);
};
