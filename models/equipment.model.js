// --- Database Connection ---
const pool = require('../db/pool');

// --- Equipment Model Methods ---
// ดึงรายการอุปกรณ์ทั้งหมด (เรียงจากล่าสุด)
exports.findAll = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM equipment ORDER BY equipment_id DESC'
  );
  return rows;
};

// ค้นหาอุปกรณ์ตาม ID
exports.findById = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM equipment WHERE equipment_id = $1', [id]
  );
  return rows[0];
};

// เพิ่มอุปกรณ์ใหม่
exports.create = async ({ code, name, category }) => {
  const sql = `INSERT INTO equipment (code, name, category)
  VALUES ($1, $2, $3) RETURNING *`;
  const { rows } = await pool.query(sql, [code, name, category]);
  return rows[0];
};

// แก้ไขข้อมูลอุปกรณ์
exports.update = async (id, { code, name, category }) => {
  const sql = `UPDATE equipment SET code=$1, name=$2, category=$3
  WHERE equipment_id=$4 RETURNING *`;
  const { rows } = await pool.query(sql, [code, name, category, id]);
  return rows[0];
};

// ลบอุปกรณ์ (ลบได้เฉพาะสถานะ AVAILABLE)
exports.remove = async (id) => {
  const sql = `DELETE FROM equipment
  WHERE equipment_id=$1 AND status='AVAILABLE'
  RETURNING *`;
  const { rows } = await pool.query(sql, [id]);
  return rows[0];
};
