import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  ...(process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST || "127.0.0.1",
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || undefined,
        database: process.env.PGDATABASE || "rentcampy",
      }),
  ...(process.env.DATABASE_SSL === "true" ? { ssl: true } : {}),
});

export default pool;
