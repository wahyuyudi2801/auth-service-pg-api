-- REAL 



INSERT INTO oe.product_information (product_name, product_description, category_id, weight_class, warranty_period, supplier_id, product_status, list_price, min_price, catalog_url) VALUES
('Asus ROG Zephyrus', 'Laptop gaming spek tinggi AMD Ryzen 9', 10, 2, INTERVAL '2 years', 501, 'orderable', 25000000.00, 23000000.00, 'http://catalog.com/rog'),
('MacBook Pro M3', 'Apple MacBook Pro 14 inch M3 Chip', 10, 1, INTERVAL '1 year', 502, 'orderable', 30000000.00, 28500000.00, 'http://catalog.com/macbook'),
('iPhone 15 Pro', 'Apple iPhone 15 Pro Titanium 256GB', 20, 1, INTERVAL '1 year', 502, 'orderable', 21000000.00, 19500000.00, 'http://catalog.com/iphone15'),
('Samsung Galaxy S24', 'Samsung Galaxy S24 Ultra 512GB', 20, 1, INTERVAL '1 year', 503, 'orderable', 20000000.00, 18000000.00, 'http://catalog.com/s24'),
('Sony WH-1000XM5', 'Wireless Noise Canceling Headphones', 30, 1, INTERVAL '6 months', 504, 'orderable', 4500000.00, 4100000.00, 'http://catalog.com/sonywh5'),
('Logitech MX Master 3S', 'Wireless Ergonomic Mouse', 30, 1, INTERVAL '1 year', 505, 'under development', 1500000.00, 1300000.00, 'http://catalog.com/mxmaster');



INSERT INTO oe.product_descriptions (product_id, language_id, translated_name, translated_description) VALUES
(1, 'en', 'Asus ROG Zephyrus', 'High-end gaming laptop with AMD Ryzen 9'),
(1, 'id', 'Asus ROG Zephyrus', 'Laptop gaming kelas atas dengan AMD Ryzen 9'),
(2, 'en', 'MacBook Pro M3', 'Apple MacBook Pro 14 inch M3 Chip'),
(2, 'id', 'MacBook Pro M3', 'Apple MacBook Pro 14 inci dengan Chip M3');



INSERT INTO oe.warehouses (warehouse_name, location_id, warehouse_spec) VALUES
('Gudang Utama Jakarta', 6, '<warehouse><capacity>10000</capacity><temperature_controlled>true</temperature_controlled></warehouse>'),
('Gudang Regional Bandung', 6, '<warehouse><capacity>5000</capacity><temperature_controlled>false</temperature_controlled></warehouse>'),
('Gudang Hub Surabaya', 6, '<warehouse><capacity>8000</capacity><temperature_controlled>true</temperature_controlled></warehouse>');

INSERT INTO oe.inventories (product_id, warehouse_id, quantity_on_hand) VALUES
(1, 4, 50),  -- Asus ROG di Gudang Jakarta
(1, 5, 15),  -- Asus ROG di Gudang Bandung
(2, 4, 30),  -- MacBook Pro di Gudang Jakarta
(2, 6, 40),  -- MacBook Pro di Gudang Surabaya
(3, 4, 100), -- iPhone 15 di Gudang Jakarta
(4, 6, 85);  -- Samsung S24 di Gudang Surabaya


INSERT INTO oe.customers (cust_first_name, cust_last_name, cust_street_address, cust_postal_code, cust_city, cust_state_province, country_id, phone_number, cust_email, account_mgr_id, credit_limit, date_of_birth, marital_status, gender, income_level) VALUES
('Rian', 'Hidayat', 'Jl. Sudirman No. 45', '10110', 'Jakarta Pusat', 'DKI Jakarta', 'ID', '08123456789', 'rian.hidayat@mail.com',145 , 50000000.00, '1990-05-14', 'Married', 'M', 'High'),
('Siti', 'Rahmawati', 'Jl. Dago No. 102', '40135', 'Bandung', 'Jawa Barat', 'ID', '08198765432', 'siti.rahma@mail.com', 145, 30000000.00, '1995-08-22', 'Single', 'F', 'Medium'),
('John', 'Doe', '123 Wall Street', '10001', 'New York', 'New York', 'US', '+12025550143', 'john.doe@example.com', 145, 100000000.00, '1985-11-02', 'Married', 'M', 'Very High');



INSERT INTO oe.orders (order_date, order_mode, customer_id, order_status, order_total, sales_rep_id, promotion_id) VALUES
(CURRENT_TIMESTAMP - INTERVAL '2 days', 'online', 4, 4, 46000000.00, 146, NULL), 
(CURRENT_TIMESTAMP - INTERVAL '5 hours', 'direct', 5, 1, 21000000.00, 176, NULL),
(CURRENT_TIMESTAMP, 'online', 6, 1, 30000000.00, 178, 99);                       


INSERT INTO oe.order_items (order_id, line_item_id, product_id, unit_price, quantity) VALUES
(16, 1, 1, 25000000.00, 1),
(16, 2, 3, 21000000.00, 1),
(17, 1, 3, 21000000.00, 1),
(18, 1, 2, 30000000.00, 1);

-- TEST ONLY 

INSERT INTO oe.product_information (product_name, product_description, category_id, weight_class, warranty_period, supplier_id, product_status, list_price, min_price, catalog_url) VALUES
('Asus ROG Zephyrus', 'Laptop gaming spek tinggi AMD Ryzen 9', 10, 2, INTERVAL '2 years', 501, 'orderable', 25000000.00, 23000000.00, 'http://catalog.com/rog'),
('MacBook Pro M3', 'Apple MacBook Pro 14 inch M3 Chip', 10, 1, INTERVAL '1 year', 502, 'orderable', 30000000.00, 28500000.00, 'http://catalog.com/macbook'),
('iPhone 15 Pro', 'Apple iPhone 15 Pro Titanium 256GB', 20, 1, INTERVAL '1 year', 502, 'orderable', 21000000.00, 19500000.00, 'http://catalog.com/iphone15'),
('Samsung Galaxy S24', 'Samsung Galaxy S24 Ultra 512GB', 20, 1, INTERVAL '1 year', 503, 'orderable', 20000000.00, 18000000.00, 'http://catalog.com/s24'),
('Sony WH-1000XM5', 'Wireless Noise Canceling Headphones', 30, 1, INTERVAL '6 months', 504, 'orderable', 4500000.00, 4100000.00, 'http://catalog.com/sonywh5'),
('Logitech MX Master 3S', 'Wireless Ergonomic Mouse', 30, 1, INTERVAL '1 year', 505, 'under development', 1500000.00, 1300000.00, 'http://catalog.com/mxmaster');



INSERT INTO oe.product_descriptions (product_id, language_id, translated_name, translated_description) VALUES
(1, 'en', 'Asus ROG Zephyrus', 'High-end gaming laptop with AMD Ryzen 9'),
(1, 'id', 'Asus ROG Zephyrus', 'Laptop gaming kelas atas dengan AMD Ryzen 9'),
(2, 'en', 'MacBook Pro M3', 'Apple MacBook Pro 14 inch M3 Chip'),
(2, 'id', 'MacBook Pro M3', 'Apple MacBook Pro 14 inci dengan Chip M3');



INSERT INTO oe.warehouses (warehouse_name, location_id, warehouse_spec) VALUES
('Gudang Utama Jakarta', 1, '<warehouse><capacity>10000</capacity><temperature_controlled>true</temperature_controlled></warehouse>'),
('Gudang Regional Bandung', 2, '<warehouse><capacity>5000</capacity><temperature_controlled>false</temperature_controlled></warehouse>'),
('Gudang Hub Surabaya', 3, '<warehouse><capacity>8000</capacity><temperature_controlled>true</temperature_controlled></warehouse>');



INSERT INTO oe.inventories (product_id, warehouse_id, quantity_on_hand) VALUES
(1, 1, 50),  -- Asus ROG di Gudang Jakarta
(1, 2, 15),  -- Asus ROG di Gudang Bandung
(2, 1, 30),  -- MacBook Pro di Gudang Jakarta
(2, 3, 40),  -- MacBook Pro di Gudang Surabaya
(3, 1, 100), -- iPhone 15 di Gudang Jakarta
(4, 3, 85);  -- Samsung S24 di Gudang Surabaya


INSERT INTO oe.customers (cust_first_name, cust_last_name, cust_street_address, cust_postal_code, cust_city, cust_state_province, country_id, phone_number, cust_email, account_mgr_id, credit_limit, date_of_birth, marital_status, gender, income_level) VALUES
('Rian', 'Hidayat', 'Jl. Sudirman No. 45', '10110', 'Jakarta Pusat', 'DKI Jakarta', 'ID', '08123456789', 'rian.hidayat@mail.com', 1, 50000000.00, '1990-05-14', 'Married', 'M', 'High'),
('Siti', 'Rahmawati', 'Jl. Dago No. 102', '40135', 'Bandung', 'Jawa Barat', 'ID', '08198765432', 'siti.rahma@mail.com', 1, 30000000.00, '1995-08-22', 'Single', 'F', 'Medium'),
('John', 'Doe', '123 Wall Street', '10001', 'New York', 'New York', 'US', '+12025550143', 'john.doe@example.com', 2, 100000000.00, '1985-11-02', 'Married', 'M', 'Very High');


INSERT INTO oe.orders (order_date, order_mode, customer_id, order_status, order_total, sales_rep_id, promotion_id) VALUES
(CURRENT_TIMESTAMP - INTERVAL '2 days', 'online', 1, 4, 46000000.00, 1, NULL), -- Order Rian 2 hari lalu (Selesai/status 4)
(CURRENT_TIMESTAMP - INTERVAL '5 hours', 'direct', 2, 1, 21000000.00, 2, NULL), -- Order Siti 5 jam lalu (Pending/status 1)
(CURRENT_TIMESTAMP, 'online', 3, 1, 30000000.00, 2, 99);                        -- Order John Doe baru saja



INSERT INTO oe.order_items (order_id, line_item_id, product_id, unit_price, quantity) VALUES
-- Item untuk Order ID 1 (Total: 25jt + 21jt = 46jt)
(1, 1, 1, 25000000.00, 1,
(1, 2, 3, 21000000.00, 1,

-- Item untuk Order ID 2 (Total: 21jt)
(2, 1, 3, 21000000.00, 1,

-- Item untuk Order ID 3 (Total: 30jt)
(3, 1, 2, 30000000.00, 1);