-- การเพิ่มข้อมูลเริ่มต้นในตาราง students
INSERT INTO students (student_id, full_name, major, email) VALUES
('66010001', 'กานต์ ก้าวไกล', 'เทคโนโลยีสารสนเทศ', '66010001@example.ac.th'),
('66010002', 'ขวัญใจ เรียนดี', 'วิทยาการคอมพิวเตอร์', '66010002@example.ac.th'),
('66010003', 'ชลธี สร้างสรรค์', 'เทคโนโลยีสารสนเทศ', '66010003@example.ac.th'),
('66010004', 'ดาริน ทดลอง', 'วิทยาการคอมพิวเตอร์', '66010004@example.ac.th'),
('66010005', 'ธนภัทร พัฒนา', 'เทคโนโลยีสารสนเทศ', '66010005@example.ac.th');

-- การเพิ่มข้อมูลเริ่มต้นในตาราง equipment
INSERT INTO equipment (code, name, category) VALUES
('NB-001', 'Notebook Lenovo ThinkPad', 'Notebook'),
('NB-002', 'Notebook Dell Latitude', 'Notebook'),
('PJ-001', 'Projector Epson', 'Projector'),
('CM-001', 'Camera Canon', 'Camera'),
('MC-001', 'Wireless Microphone', 'Microphone'),
('TB-001', 'iPad 10th Gen', 'Tablet'),
('TB-002', 'Samsung Galaxy Tab', 'Tablet'),
('SP-001', 'Portable Speaker', 'Audio');