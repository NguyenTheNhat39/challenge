require('dotenv').config();
const express = require('express');
const app = express();
const productRoutes = require('./routes/product');

// Middleware để đọc JSON body
app.use(express.json());

// Route chính
app.use('/api/product', productRoutes);

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
