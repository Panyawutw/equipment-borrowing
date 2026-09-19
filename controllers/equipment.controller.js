// --- Imports & Helpers ---
const Equipment = require('../models/equipment.model');
const clean = (value) => String(value || '').trim();

// --- Equipment Controller Handlers ---

// แสดงรายการอุปกรณ์ทั้งหมด
exports.list = async (req, res, next) => {
  try {
    res.render('equipment/list', { 
      title: 'อุปกรณ์', 
      items: await Equipment.findAll() 
    });
  } catch (err) { 
    next(err); 
  }
};

// แสดงรายละเอียดอุปกรณ์ตาม ID
exports.detail = async (req, res, next) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) {
      return res.status(404).render('errors/error', { 
        title: 'ไม่พบอุปกรณ์', 
        message: 'ไม่พบรหัสอุปกรณ์นี้' 
      });
    }
    res.render('equipment/detail', { title: 'รายละเอียดอุปกรณ์', item });
  } catch (err) { 
    next(err); 
  }
};

// แสดงฟอร์มเพิ่มอุปกรณ์
exports.newForm = (req, res) => {
  res.render('equipment/form', { 
    title: 'เพิ่มอุปกรณ์', 
    item: {}, 
    error: null, 
    action: '/equipment' 
  });
};

// ประมวลผลการเพิ่มอุปกรณ์ใหม่
exports.create = async (req, res, next) => {
  const item = { 
    code: clean(req.body.code), 
    name: clean(req.body.name), 
    category: clean(req.body.category) 
  };
  
  if (!item.code || !item.name || !item.category) {
    return res.status(400).render('equipment/form', { 
      title: 'เพิ่มอุปกรณ์', 
      item, 
      error: 'กรอกข้อมูลให้ครบ', 
      action: '/equipment' 
    });
  }

  try { 
    await Equipment.create(item); 
    res.redirect('/equipment'); 
  } catch (err) {
    if (err.code === '23505') { // Postgres UNIQUE Constraint Error
      return res.status(400).render('equipment/form', { 
        title: 'เพิ่มอุปกรณ์', 
        item, 
        error: 'รหัสอุปกรณ์ซ้ำ', 
        action: '/equipment' 
      });
    }
    next(err);
  }
};

// แสดงฟอร์มแก้ไขอุปกรณ์
exports.editForm = async (req, res, next) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) {
      return res.status(404).render('errors/error', { 
        title: 'ไม่พบอุปกรณ์', 
        message: 'ไม่พบรหัสอุปกรณ์นี้' 
      });
    }
    res.render('equipment/form', { 
      title: 'แก้ไขอุปกรณ์', 
      item, 
      error: null, 
      action: `/equipment/${item.equipment_id}/edit` 
    });
  } catch (err) { 
    next(err); 
  }
};

// ประมวลผลการอัปเดตข้อมูลอุปกรณ์
exports.update = async (req, res, next) => {
  const item = { 
    equipment_id: req.params.id, 
    code: clean(req.body.code), 
    name: clean(req.body.name), 
    category: clean(req.body.category) 
  };

  if (!item.code || !item.name || !item.category) {
    return res.status(400).render('equipment/form', { 
      title: 'แก้ไขอุปกรณ์', 
      item, 
      error: 'กรอกข้อมูลให้ครบ', 
      action: `/equipment/${req.params.id}/edit` 
    });
  }

  try {
    const updated = await Equipment.update(req.params.id, item);
    if (!updated) {
      return res.status(404).render('errors/error', { 
        title: 'ไม่พบอุปกรณ์', 
        message: 'ไม่พบรหัสอุปกรณ์นี้' 
      });
    }
    res.redirect(`/equipment/${req.params.id}`);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).render('equipment/form', { 
        title: 'แก้ไขอุปกรณ์', 
        item, 
        error: 'รหัสอุปกรณ์ซ้ำ', 
        action: `/equipment/${req.params.id}/edit` 
      });
    }
    next(err);
  }
};

// ประมวลผลการลบอุปกรณ์
exports.remove = async (req, res, next) => {
  try {
    const deleted = await Equipment.remove(req.params.id);
    if (!deleted) {
      return res.status(400).render('errors/error', { 
        title: 'ลบไม่ได้', 
        message: 'ไม่พบอุปกรณ์หรืออุปกรณ์กำลังถูกยืม' 
      });
    }
    res.redirect('/equipment');
  } catch (err) {
    if (err.code === '23503') { // Foreign Key Constraint Error
      return res.status(400).render('errors/error', { 
        title: 'ลบไม่ได้', 
        message: 'อุปกรณ์นี้มีประวัติการยืม' 
      });
    }
    next(err);
  }
};