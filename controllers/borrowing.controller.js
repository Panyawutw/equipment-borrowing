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
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// POST /borrowings
exports.create = async (req, res, next) => {
  const { student_id, equipment_id, due_at } = req.body;
  try {
    // Validation: ตรวจสอบข้อมูลครบถ้วน และ due_at ต้องมากกว่าเวลาปัจจุบัน
    if (
      !student_id ||
      !equipment_id ||
      !due_at ||
      new Date(due_at) <= new Date()
    ) {
      throw new Error("กรอกข้อมูลให้ครบและกำหนดคืนต้องอยู่ในอนาคต");
    }

    await Borrowing.borrow({ student_id, equipment_id, due_at });
    res.redirect("/borrowings");
  } catch (err) {
    try {
      const data = await Borrowing.formData();
      res.status(400).render("borrowings/new", {
        title: "ยืมอุปกรณ์",
        ...data,
        error: err.message,
      });
    } catch (e) {
      next(e);
    }
  }
};

// POST /borrowings/:id/return
exports.returnItem = async (req, res, next) => {
  try {
    await Borrowing.returnItem(req.params.id);
    res.redirect("/borrowings");
  } catch (err) {
    res.status(400).render("errors/error", {
      title: "คืนไม่ได้",
      message: err.message,
    });
  }
};
