require('dotenv').config();
const express = require('express');
const app = express();
const productRoutes = require('./routes/product');
const authRoutes = require('./routes/auth');

// Middleware để đọc JSON body
app.use(express.json());

// Route chính
app.use('/api/product', productRoutes);
app.use('/api/auth', authRoutes);

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
