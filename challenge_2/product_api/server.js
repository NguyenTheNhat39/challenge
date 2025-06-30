const express = require('express');
require('dotenv').config();
const productRoutes = require('./routes/product');
const app = express();
const PORT = process.env.PORT || 3000;

// BẮT BUỘC: Parse JSON body
app.use(express.json());

// Route
app.use('/api/product', productRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

