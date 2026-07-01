CREATE TABLE oe.customers (
    customer_id SERIAL PRIMARY KEY,
    cust_first_name CHARACTER VARYING(20) NOT NULL,
    cust_last_name CHARACTER VARYING(25) NOT NULL,
    cust_street_address CHARACTER VARYING(40),
    cust_postal_code CHARACTER VARYING(12),
    cust_city CHARACTER VARYING(30),
    cust_state_province CHARACTER VARYING(25),
    country_id CHARACTER(2),
    phone_number CHARACTER VARYING(25),
    cust_email CHARACTER VARYING(100) UNIQUE,
    account_mgr_id INTEGER, -- Relasi ke employees(employee_id) di schema hr
    credit_limit NUMERIC(9,2),
    date_of_birth DATE,
    marital_status CHARACTER VARYING(20),
    gender CHARACTER(1),
    income_level CHARACTER VARYING(20),
    FOREIGN KEY (account_mgr_id) REFERENCES hr.employees (employee_id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- 2. Tabel Warehouses 
CREATE TABLE oe.warehouses (
    warehouse_id SERIAL PRIMARY KEY,
    warehouse_name CHARACTER VARYING(35),
    location_id INTEGER, -- Relasi ke locations(location_id) di schema hr
    warehouse_spec XML,  -- PostgreSQL untuk xml data
    FOREIGN KEY (location_id) REFERENCES hr.locations (location_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- 3. Tabel Product Information 
CREATE TABLE oe.product_information (
    product_id SERIAL PRIMARY KEY,
    product_name CHARACTER VARYING(50) NOT NULL,
    product_description CHARACTER VARYING(2000),
    category_id INTEGER NOT NULL,
    weight_class INTEGER,
    warranty_period INTERVAL, 
    supplier_id INTEGER,
    product_status CHARACTER VARYING(20) DEFAULT 'orderable',
    list_price NUMERIC(8,2),
    min_price NUMERIC(8,2),
    catalog_url CHARACTER VARYING(50)
);

-- 4. Tabel Product Descriptions 
CREATE TABLE oe.product_descriptions (
    product_id INTEGER NOT NULL,
    language_id CHARACTER VARYING(6) NOT NULL,
    translated_name CHARACTER VARYING(50) NOT NULL,
    translated_description CHARACTER VARYING(2000) NOT NULL,
    PRIMARY KEY (product_id, language_id),
    FOREIGN KEY (product_id) REFERENCES oe.product_information (product_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- 5. Tabel Inventories (Stok Barang di Gudang)
CREATE TABLE oe.inventories (
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id, warehouse_id),
    FOREIGN KEY (product_id) REFERENCES oe.product_information (product_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES oe.warehouses (warehouse_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- 6. Tabel Orders (Pesanan)
CREATE TABLE oe.orders (
    order_id SERIAL PRIMARY KEY,
    order_date TIMESTAMP WITH TIME ZONE NOT NULL, -- Support global zone
    order_mode CHARACTER VARYING(8) CHECK (order_mode IN ('direct', 'online')),
    customer_id INTEGER NOT NULL,
    order_status INTEGER CHECK (order_status BETWEEN 0 AND 10),
    order_total NUMERIC(8,2),
    sales_rep_id INTEGER, -- Relasi ke employees(employee_id) di schema hr
    promotion_id INTEGER,
    FOREIGN KEY (customer_id) REFERENCES oe.customers (customer_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (sales_rep_id) REFERENCES hr.employees (employee_id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- 7. Tabel Order Items (Detail Item Pesanan)
CREATE TABLE oe.order_items (
    order_id INTEGER NOT NULL,
    line_item_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    unit_price NUMERIC(8,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (order_id, line_item_id),
    FOREIGN KEY (order_id) REFERENCES oe.orders (order_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES oe.product_information (product_id) ON UPDATE CASCADE ON DELETE CASCADE
);