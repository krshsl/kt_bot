import path from "path";
import { DataSource } from "typeorm";

const db = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
  entities: [path.join(__dirname, "../entities/**/*.{ts,js}")],
  synchronize: true,
});

export default db;
