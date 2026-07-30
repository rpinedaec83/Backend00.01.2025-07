CREATE DATABASE IF NOT EXISTS hackathon_pagos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hackathon_pagos;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  oauth_provider VARCHAR(50) NOT NULL,
  oauth_id VARCHAR(191) NOT NULL,
  nombre VARCHAR(191),
  email VARCHAR(191),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_oauth (oauth_provider, oauth_id)
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(191) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  estado ENUM('pendiente', 'pagado', 'cancelado', 'refund_parcial', 'refund_total') DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_users FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_orders FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_order_items_products FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  gateway VARCHAR(50) NOT NULL,
  gateway_payment_id VARCHAR(191) NOT NULL,
  moneda VARCHAR(10) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  estado ENUM('pending', 'succeeded', 'failed', 'refunded') DEFAULT 'pending',
  raw_response LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_orders FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS refunds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL,
  gateway_refund_id VARCHAR(191),
  monto DECIMAL(10,2),
  motivo VARCHAR(255),
  estado VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refunds_payments FOREIGN KEY (payment_id) REFERENCES payments(id)
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gateway VARCHAR(50),
  tipo_evento VARCHAR(191),
  payload LONGTEXT,
  procesado TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE VIEW vista_pagos_usuario AS
SELECT
  u.id AS user_id,
  u.nombre,
  u.email,
  o.id AS order_id,
  o.total,
  o.estado AS estado_orden,
  p.id AS payment_id,
  p.gateway,
  p.monto,
  p.estado AS estado_pago,
  p.created_at AS fecha_pago
FROM users u
JOIN orders o ON o.user_id = u.id
LEFT JOIN payments p ON p.order_id = o.id;

DELIMITER $$

CREATE FUNCTION fn_total_pagado_por_usuario(p_user_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
  DECLARE total_pagado DECIMAL(10,2);
  SELECT IFNULL(SUM(monto), 0) INTO total_pagado
  FROM payments p
  JOIN orders o ON p.order_id = o.id
  WHERE o.user_id = p_user_id AND p.estado = 'succeeded';
  RETURN total_pagado;
END$$

CREATE TRIGGER tr_actualizar_stock_despues_pago
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
  IF NEW.estado = 'succeeded' AND OLD.estado <> 'succeeded' THEN
    UPDATE products pr
    JOIN order_items oi ON oi.product_id = pr.id
    JOIN orders o ON o.id = oi.order_id
    SET pr.stock = pr.stock - oi.cantidad
    WHERE o.id = NEW.order_id;
  END IF;
END$$

DELIMITER ;

INSERT INTO products (nombre, descripcion, precio, stock, estado)
VALUES
('Curso de NodeJS', 'Acceso al curso completo de NodeJS', 150.00, 100, 'activo'),
('Suscripción mensual', 'Suscripción a la plataforma por 1 mes', 50.00, 1000, 'activo'),
('Pack Hackathon', 'Participación en hackathon + material exclusivo', 80.00, 200, 'activo');
