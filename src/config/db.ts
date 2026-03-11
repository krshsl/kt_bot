import { DataSource } from "typeorm";

const db = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
  entities: [],
  synchronize: true,
});

export default db;
