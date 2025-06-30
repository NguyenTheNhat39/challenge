-- Bật extension để tạo UUID ngẫu nhiên
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Xoá bảng users nếu đã tồn tại (nếu bạn muốn reset dữ liệu)
DROP TABLE IF EXISTS users;

-- Tạo bảng users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
