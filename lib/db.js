import mysql from "mysql2/promise";

const globalForDb = globalThis;

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "blockchain",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

export const db = globalForDb.mysqlPool || createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.mysqlPool = db;
}

export async function query(sql, params = []) {
  const [rows] = await db.execute(sql, params);

  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);

  return rows[0] || null;
}

export async function execute(sql, params = []) {
  const [result] = await db.execute(sql, params);

  return result;
}
