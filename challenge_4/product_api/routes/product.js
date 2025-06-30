const express = require('express');
const router = express.Router();
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

// Middleware: Check Content-Type for POST & PUT
router.use((req, res, next) => {
  if (['POST', 'PUT'].includes(req.method) && !req.is('application/json')) {
    return res.status(415).json({ message: 'Content-Type must be application/json' });
  }
  next();
});

// Debug middleware
router.use((req, res, next) => {
  if (req.method !== 'GET') {
    console.log(`[${req.method}] ${req.originalUrl} - body:`, req.body);
  }
  next();
});

// [GET] All products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error('GET /:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// [POST] Create new product
router.post('/', async (req, res) => {
  try {
    const { name, slug, quantity } = req.body;

    if (!name || typeof name !== 'string' || !slug || typeof slug !== 'string' || typeof quantity !== 'number') {
      return res.status(400).json({ message: 'Invalid input: name/slug must be string, quantity must be number' });
    }

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO products (id, name, slug, quantity, create_at, update_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [id, name, slug, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// [GET] Product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// [GET] Product by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE slug = $1', [slug]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// [PUT] Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, quantity } = req.body;

    if (!name || typeof name !== 'string' || !slug || typeof slug !== 'string' || typeof quantity !== 'number') {
      return res.status(400).json({ message: 'Invalid input: name/slug must be string, quantity must be number' });
    }

    const result = await pool.query(
      `UPDATE products
       SET name = $1, slug = $2, quantity = $3, update_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [name, slug, quantity, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// [DELETE] Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
