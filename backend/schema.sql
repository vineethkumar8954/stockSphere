-- Stock Harmony MySQL Schema
-- Run via MySQL CLI or Workbench

CREATE DATABASE IF NOT EXISTS stock_harmony;
USE stock_harmony;

-- ─── Categories ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Suppliers ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id             CHAR(36)     NOT NULL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone          VARCHAR(50),
  email          VARCHAR(255),
  address        TEXT,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Products ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            CHAR(36)       NOT NULL PRIMARY KEY,
  name          VARCHAR(255)   NOT NULL,
  sku           VARCHAR(100)   NOT NULL UNIQUE,
  category_id   CHAR(36),
  supplier_id   CHAR(36),
  price         DECIMAL(12, 2) NOT NULL DEFAULT 0,
  quantity      INT            NOT NULL DEFAULT 0,
  reorder_level INT            NOT NULL DEFAULT 10,
  created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_product_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id)  ON DELETE SET NULL
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_sku      ON products(sku);

-- ─── Transactions ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id               CHAR(36)   NOT NULL PRIMARY KEY,
  product_id       CHAR(36)   NOT NULL,
  transaction_type VARCHAR(3) NOT NULL,
  quantity         INT        NOT NULL,
  notes            TEXT,
  created_at       DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_txn_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT chk_txn_type   CHECK (transaction_type IN ('IN','OUT')),
  CONSTRAINT chk_txn_qty    CHECK (quantity > 0)
);

CREATE INDEX idx_transactions_product ON transactions(product_id);
CREATE INDEX idx_transactions_type    ON transactions(transaction_type);

-- ─── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         CHAR(36)    NOT NULL PRIMARY KEY,
  message    TEXT        NOT NULL,
  type       VARCHAR(10) NOT NULL DEFAULT 'info',
  `read`     TINYINT(1)  NOT NULL DEFAULT 0,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_notif_type CHECK (type IN ('info','warning','danger'))
);

CREATE INDEX idx_notifications_read ON notifications(`read`);

-- ─── Trigger: auto-update quantity + create notifications ─────────────────────
DROP TRIGGER IF EXISTS trg_handle_transaction;

DELIMITER //
CREATE TRIGGER trg_handle_transaction
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
  DECLARE cur_qty      INT;
  DECLARE new_qty      INT;
  DECLARE prod_name    VARCHAR(255);
  DECLARE reorder_lvl  INT;
  DECLARE new_id       CHAR(36);

  SELECT quantity, name, reorder_level
    INTO cur_qty, prod_name, reorder_lvl
    FROM products
   WHERE id = NEW.product_id;

  IF NEW.transaction_type = 'IN' THEN
    SET new_qty = cur_qty + NEW.quantity;
  ELSE
    IF cur_qty < NEW.quantity THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient stock';
    END IF;
    SET new_qty = cur_qty - NEW.quantity;
  END IF;

  UPDATE products SET quantity = new_qty WHERE id = NEW.product_id;

  SET new_id = UUID();
  IF new_qty = 0 THEN
    INSERT INTO notifications (id, message, type)
      VALUES (new_id, CONCAT(prod_name, ' is now out of stock!'), 'danger');
  ELSEIF new_qty <= reorder_lvl THEN
    INSERT INTO notifications (id, message, type)
      VALUES (new_id, CONCAT(prod_name, ' stock is low (', new_qty, ' remaining)'), 'warning');
  END IF;
END//
DELIMITER ;
