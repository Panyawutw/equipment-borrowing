const Borrowing = require("../models/borrowing.model");

// GET /borrowings
exports.list = async (req, res, next) => {
  try {
    res.render("borrowings/list", {
      title: "รายการยืมคืน",
      items: await Borrowing.findAll(),
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// GET /borrowings/new
exports.newForm = async (req, res, next) => {
  try {
    const data = await Borrowing.formData();
    res.render("borrowings/new", {
      title: "ยืมอุปกรณ์",
      ...data, // ส่ง students และ equipment เข้าไปใน View
      values: {}, // ค่าเริ่มต้นว่างเปล่า
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// POST /borrowings
exports.create = async (req, res, next) => {
  const { student_id, equipment_id, due_at } = req.body;
  const equipIdNum = Number(equipment_id);

  try {
    // 1. Validation: ตรวจสอบ id ว่าเป็นจำนวนเต็มหรือไม่[cite: 9]
    if (!equipment_id || !Number.isInteger(equipIdNum) || equipIdNum <= 0) {
      throw new Error("รหัสอุปกรณ์ไม่ถูกต้อง");
    }

    // 2. Validation: ตรวจสอบข้อมูลครบถ้วน และ due_at ต้องมากกว่าเวลาปัจจุบัน[cite: 9]
    if (!student_id || !due_at || new Date(due_at) <= new Date()) {
      throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน และกำหนดวันคืนต้องอยู่ในอนาคต");
    }

    // เรียกใช้ Transaction Borrow ใน Model (รวมการเช็กสถานะ BORROWED ไว้ข้างใน)
    await Borrowing.borrow({ student_id, equipment_id: equipIdNum, due_at });
    res.redirect("/borrowings");
  } catch (err) {
    try {
      const data = await Borrowing.formData();
      // ส่ง 400 พร้อม Form Persistence (values) และข้อความ Error แจ้งเตือน[cite: 9]
      res.status(400).render("borrowings/new", {
        title: "ยืมอุปกรณ์",
        ...data,
        values: req.body, // คงค่าที่ผู้ใช้กรอกไว้[cite: 1]
        error: err.message, // เช่น "อุปกรณ์นี้กำลังถูกยืมอยู่" หรือ "กรุณากรอกข้อมูลให้ครบ"[cite: 9]
      });
    } catch (e) {
      next(e); // เกิดปัญหาฝั่ง DB/Server ให้ส่งไป 500 Handler[cite: 9]
    }
  }
};

// POST /borrowings/:id/return
exports.returnItem = async (req, res, next) => {
  try {
    const borrowingId = Number(req.params.id);

    // ตรวจสอบ ID ฝั่งคืนอุปกรณ์[cite: 9]
    if (!Number.isInteger(borrowingId) || borrowingId <= 0) {
      return res.status(400).render("errors/error", {
        title: "ข้อมูลไม่ถูกต้อง",
        message: "รหัสรายการยืมคืนไม่ถูกต้อง",
      });
    }

    await Borrowing.returnItem(borrowingId);
    res.redirect("/borrowings");
  } catch (err) {
    next(err); // ส่งเข้า Global Error Handler (500) เพื่อบันทึก Log[cite: 9]
  }
};