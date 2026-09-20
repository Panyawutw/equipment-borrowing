// --- View Engine Setup ---
require("dotenv").config();
const express = require("express");
const path = require("path");
const equipmentRoutes = require("./routes/equipment.routes");
const borrowingRoutes = require("./routes/borrowing.routes");

const app = express();

// --- Global Middlewares ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// --- Routes ---
app.get("/", (req, res) => res.redirect("/equipment"));
// เพิ่ม Route ชั่วคราวใน app.js หรือรันสคริปต์ทดสอบ
app.use("/equipment", equipmentRoutes);
app.use("/borrowings", borrowingRoutes);

// --- Error Handlers ---
// ดักจับ 404 Not Found
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).render("errors/error", {
      title: "ไฟล์ใหญ่เกินไป",
      message: "ภาพต้องมีขนาดไม่เกิน 2 MB",
    });
  }
  next(err);
});

// ดักจับ 404 Not Found (กรณีผู้ใช้พิมพ์ URL ที่ไม่มีในระบบ)
app.use((req, res, next) => {
  res.status(404).render("errors/error", {
    title: "404 Not Found",
    message: "ไม่พบหน้าที่คุณต้องการ กรุณาตรวจสอบ URL อีกครั้ง",
  });
});

// ดักจับ 500 Global Server Error (ซ่อน stack trace แสดงข้อความสุภาพ)
app.use((err, req, res, next) => {
  // บันทึก Log ฝั่ง Server สำหรับนักพัฒนาตรวจสอบ
  console.error("[SERVER ERROR LOG]:", err.stack || err);

  // ส่งข้อความสุภาพทั่วไปให้ผู้ใช้ (ปิดบัง err.message เพื่อความปลอดภัย)
  res.status(500).render("errors/error", {
    title: "เกิดข้อผิดพลาดในระบบ",
    message: "เกิดข้อผิดพลาดบางอย่างภายในระบบ กรุณาลองใหม่อีกครั้งในภายหลัง",
  });
});

// การเปิดทำงานเซิร์ฟเวอร์
const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Server:
http://localhost:${port}`),
);
