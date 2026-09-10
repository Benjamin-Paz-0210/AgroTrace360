import { initSchema, pool } from "../server/db.js";

try {
  await initSchema();
  console.log("Migración lista: tablas + datos demo (si la base estaba vacía).");
} catch (err) {
  console.error("Falló la migración:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
