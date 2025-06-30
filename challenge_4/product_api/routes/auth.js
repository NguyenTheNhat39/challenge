const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

require('dotenv').config();

const router = express.Router();

// Lấy thông tin user theo id
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Không tìm thấy user' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Lỗi hệ thống' });
  }
});

// Lấy danh sách tất cả user
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, created_at FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Lỗi hệ thống' });
  }
});

// Cập nhật user theo id
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { email, password } = req.body;
  try {
    let updateFields = [];
    let values = [];
    let idx = 1;
    if (email) {
      updateFields.push(`email = $${idx++}`);
      values.push(email);
    }
    if (password) {
      const bcrypt = require('bcrypt');
      const hashed = await bcrypt.hash(password, 10);
      updateFields.push(`password_hash = $${idx++}`);
      values.push(hashed);
    }
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
    }
    values.push(id);
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${idx} RETURNING id, email, created_at`;
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Không tìm thấy user để cập nhật' });
    }
    res.json({ message: 'Cập nhật user thành công', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Lỗi hệ thống' });
  }
});

// Xóa user theo id
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, email', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Không tìm thấy user để xóa' });
    }
    res.json({ message: 'Xóa user thành công', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Lỗi hệ thống' });
  }
});

// Đăng ký
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashed]
    );
    res.status(201).json({ message: 'Đăng ký thành công', user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Email đã tồn tại hoặc lỗi hệ thống' });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Email không tồn tại' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(403).json({ error: 'Sai mật khẩu' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ message: 'Đăng nhập thành công', token });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Lỗi hệ thống khi đăng nhập' });
  }
});

module.exports = router;
