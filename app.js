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
app.use("/equipment", equipmentRoutes);
app.use("/borrowings", borrowingRoutes);

// --- Error Handlers ---
// ดักจับ 404 Not Found
app.use((req, res) => {
  res.status(404).render("errors/error", {
    title: "ไม่พบหน้าที่ต้องการ",
    message: "ไม่พบข้อมูลหรือหน้าที่ร้องขอ",
  });
});

// ดักจับ 500 Global Server Error
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("errors/error", {
    title: "ระบบขัดข้อง",
    message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
  });
});

// การเปิดทำงานเซิร์ฟเวอร์
const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Server:
http://localhost:${port}`),
);
