-- This code will drop the database if it was already created

DROP DATABASE IF EXISTS bamazon_db;

-- This code will create a database with a name bamazon_db

CREATE DATABASE bamazon_db;


USE bamazon_db;


CREATE TABLE products (
  item_id INT,
  product_name VARCHAR(400) NULL,
  department_name VARCHAR(100) NULL,
  price DECIMAL(10,2) NULL,
  stock_quantity INT (100) NULL,
   PRIMARY KEY (item_id)
);