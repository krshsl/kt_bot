import dotenv from "dotenv";
dotenv.config(); // load before db is init?

import "reflect-metadata";

import cors from "cors";
import express from "express";

import db from "./config/db";
import { errorHandler } from "./middleware/error";
import { registerRoutes } from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

registerRoutes(app);

app.use(errorHandler);

db.initialize()
  .then(() => {
    console.log("DB successfully initialized");
    app.listen(PORT, async () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((e) => {
    console.error("DB init failed", e);
    process.exit(-1);
  });
