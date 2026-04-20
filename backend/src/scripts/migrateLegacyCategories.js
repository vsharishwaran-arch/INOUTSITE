import { pool } from '../config/db.js';

const MAPPING = {
  casual:     'tshirt',
  formal:     'shirt',
  streetwear: 'hoodies',
};

async function migrate() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const [oldCat, newCat] of Object.entries(MAPPING)) {
      const [result] = await connection.execute(
        'UPDATE products SET category = ? WHERE category = ?',
        [newCat, oldCat]
      );
      console.log(`  ${oldCat} → ${newCat}: ${result.affectedRows} row(s) updated`);
    }

    await connection.commit();
    console.log('Migration complete.');
  } catch (err) {
    await connection.rollback();
    console.error('Migration failed, rolled back:', err.message);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrate();
