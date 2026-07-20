const { Pool } = require("pg");
require("dotenv").config();

async function fixAreas() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();
  try {
    // Mesas 1-5 = Interior
    const res1 = await client.query(
      `UPDATE "Mesa" SET area = 'Interior' WHERE numero IN (1, 2, 3, 4, 5)`
    );
    console.log(`Mesas 1-5 → Interior (${res1.rowCount} actualizadas)`);

    // Mesas 6-14 = Exterior
    const res2 = await client.query(
      `UPDATE "Mesa" SET area = 'Exterior' WHERE numero IN (6, 7, 8, 9, 10, 11, 12, 13, 14)`
    );
    console.log(`Mesas 6-14 → Exterior (${res2.rowCount} actualizadas)`);

    console.log("✅ ¡Áreas corregidas!");
  } finally {
    client.release();
    await pool.end();
  }
}

fixAreas().catch((e) => {
  console.error(e);
  process.exit(1);
});
