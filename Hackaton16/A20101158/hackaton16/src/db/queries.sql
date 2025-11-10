CREATE DATABASE IF NOT EXISTS pagos_db;
USE pagos_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  oauth_id VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  email VARCHAR(100),
  provider VARCHAR(50)
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  amount DECIMAL(10,2),
  status ENUM('pendiente','pagado','devuelto') DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE refunds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT,
  reason TEXT,
  refund_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);
