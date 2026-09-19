-- เก็บข้อมูลนักศึกษา
CREATE TABLE
    students (
        student_id VARCHAR(20) PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        major VARCHAR(120) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE
    );

-- เก็บข้อมูลอุปกรณ์
CREATE TABLE
    equipment (
        equipment_id SERIAL PRIMARY KEY,
        code VARCHAR(30) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
        image_path VARCHAR(255) NULL,
        CONSTRAINT equipment_status_check CHECK (status IN ('AVAILABLE', 'BORROWED'))
    );

-- เก็บประวัติการยืม-คืน
CREATE TABLE
    borrowings (
        borrowing_id SERIAL PRIMARY KEY,
        student_id VARCHAR(20) NOT NULL REFERENCES students (student_id),
        equipment_id INTEGER NOT NULL REFERENCES equipment (equipment_id),
        borrowed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        due_at TIMESTAMP NOT NULL,
        returned_at TIMESTAMP NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'BORROWED',
        CONSTRAINT borrowing_status_check CHECK (status IN ('BORROWED', 'RETURNED')),
        CONSTRAINT borrowing_due_check CHECK (due_at > borrowed_at)
    );

-- การสร้าง Index เพื่อเพิ่มความเร็ว
CREATE INDEX idx_borrowings_student ON borrowings (student_id);

CREATE INDEX idx_borrowings_equipment ON borrowings (equipment_id);