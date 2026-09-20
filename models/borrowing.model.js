const pool = require("../db/pool");

// 1. ดึงรายการการยืมทั้งหมด
exports.findAll = async () => {
  const sql = `
    SELECT 
      b.*, 
      s.full_name AS student_name, 
      e.code AS equipment_code, 
      e.name AS equipment_name
    FROM borrowings b 
    JOIN students s ON s.student_id = b.student_id
    JOIN equipment e ON e.equipment_id = b.equipment_id
    ORDER BY b.borrowing_id DESC
  `;
  const { rows } = await pool.query(sql);
  return rows;
};

// 2. ดึงข้อมูลสำหรับใส่ Dropdown เฉพาะอุปกรณ์ AVAILABLE
exports.formData = async () => {
  const studentsQuery = pool.query(
    "SELECT student_id, full_name FROM students ORDER BY full_name",
  );
  const equipmentQuery = pool.query(
    "SELECT equipment_id, code, name FROM equipment WHERE status = 'AVAILABLE' ORDER BY name",
  );

  const [{ rows: students }, { rows: equipment }] = await Promise.all([
    studentsQuery,
    equipmentQuery,
  ]);

  return { students, equipment };
};

// 3. กระบวนการยืมอุปกรณ์: Transaction + SELECT FOR UPDATE
exports.borrow = async ({ student_id, equipment_id, due_at }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ตรวจสอบว่าอุปกรณ์พร้อมยืมหรือไม่ และล็อกแถวข้อมูล (SELECT ... FOR UPDATE)
    const found = await client.query(
      "SELECT status FROM equipment WHERE equipment_id = $1 FOR UPDATE",
      [equipment_id],
    );

    if (!found.rows[0] || found.rows[0].status !== "AVAILABLE") {
      throw new Error("อุปกรณ์ไม่พร้อมให้ยืม");
    }

    // บันทึกการยืมลงตาราง borrowings
    const insertSql = `
      INSERT INTO borrowings (student_id, equipment_id, due_at)
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const inserted = await client.query(insertSql, [
      student_id,
      equipment_id,
      due_at,
    ]);

    // อัปเดตสถานะอุปกรณ์เป็น BORROWED
    await client.query(
      "UPDATE equipment SET status = 'BORROWED' WHERE equipment_id = $1",
      [equipment_id],
    );

    await client.query("COMMIT");
    return inserted.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release(); // คืน Client ใน finally เสมอ
  }
};

// 4. กระบวนการคืนอุปกรณ์: Transaction
exports.returnItem = async (borrowingId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ตรวจสอบรายการยืมและล็อกแถวข้อมูล
    const result = await client.query(
      "SELECT * FROM borrowings WHERE borrowing_id = $1 FOR UPDATE",
      [borrowingId],
    );
    const borrowing = result.rows[0];

    if (!borrowing || borrowing.status !== "BORROWED") {
      throw new Error("รายการนี้คืนแล้วหรือไม่พบรายการ");
    }

    // อัปเดตรายการยืมเป็น RETURNED และบันทึกเวลาคืนปัจจุบัน
    const updateBorrowSql = `
      UPDATE borrowings 
      SET status = 'RETURNED', returned_at = NOW() 
      WHERE borrowing_id = $1 
      RETURNING *
    `;
    const updatedBorrowing = await client.query(updateBorrowSql, [borrowingId]);

    // อัปเดตสถานะอุปกรณ์กลับเป็น AVAILABLE
    await client.query(
      "UPDATE equipment SET status = 'AVAILABLE' WHERE equipment_id = $1",
      [borrowing.equipment_id],
    );

    await client.query("COMMIT");
    return updatedBorrowing.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
