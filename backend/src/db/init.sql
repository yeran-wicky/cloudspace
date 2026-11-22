DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;

CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    qty INT NOT NULL DEFAULT 0 CHECK (qty >= 0),
    reorder_level INT NOT NULL DEFAULT 10 CHECK (reorder_level >= 0),
    part_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Approved', 'Completed', 'Canceled', 'Returned')),
    item_id INT NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
    req_qty INT NOT NULL CHECK (req_qty > 0),
    part_number VARCHAR(50) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_item_id ON orders(item_id);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_low_stock ON inventory(qty, reorder_level);

INSERT INTO inventory (item_name, category, unit_price, qty, reorder_level, part_number) VALUES
('Arduino Uno R3',                   'Microcontrollers',  2850.00,  180,   20, 'MCU-ARD-UNO'),
('ESP32-WROOM-32',                   'Microcontrollers',  1750.00,   95,   30, 'MCU-ESP32-W'),
('Raspberry Pi Pico',                'Microcontrollers',  1950.00,  320,   50, 'MCU-RPI-PICO'),
('10K Ohm Resistor Pack (x100)',     'Resistors',          180.00, 1200,  200, 'RES-10K-100'),
('220 Ohm Resistor Pack (x100)',     'Resistors',          180.00,  800,  200, 'RES-220-100'),
('100uF Electrolytic Capacitor',     'Capacitors',          35.00, 2500,  500, 'CAP-100UF-EL'),
('10nF Ceramic Capacitor (x50)',     'Capacitors',         220.00, 1800,  300, 'CAP-10NF-CER'),
('HC-SR04 Ultrasonic Sensor',        'Sensors',            550.00,  450,   50, 'SEN-ULTRA-04'),
('DHT22 Temp & Humidity Sensor',     'Sensors',           1450.00,   15,   25, 'SEN-DHT22'),
('LM7805 Voltage Regulator',         'ICs',                 85.00, 3000,  500, 'IC-LM7805'),
('NE555 Timer IC',                   'ICs',                 65.00, 5000,  500, 'IC-NE555'),
('ATmega328P Microchip',             'ICs',                980.00,    8,   20, 'IC-ATMEGA328'),
('USB Type-C Connector',             'Connectors',         120.00,  600,  100, 'CON-USB-C'),
('40-Pin Male Header Strip',         'Connectors',          60.00, 3500,  500, 'CON-HDR-40M'),
('16x2 LCD Display Module',          'Displays',           850.00,   75,   30, 'DIS-LCD-1602'),
('0.96in OLED Display (I2C)',        'Displays',          1150.00,   12,   20, 'DIS-OLED-096'),
('5V 4-Channel Relay Board',         'Power Modules',      750.00,  220,   40, 'PWR-REL-5V4'),
('LM2596 Step-Down Converter',       'Power Modules',      420.00,    5,   15, 'PWR-LM2596'),
('nRF24L01+ Wireless Module',        'Communication',      480.00,  350,   50, 'COM-NRF24'),
('HC-05 Bluetooth Module',           'Communication',     1350.00,  180,   30, 'COM-BT-HC05');

INSERT INTO orders (order_id, customer_name, status, item_id, req_qty, part_number, due_date, created_at) VALUES
('ORD-95774', 'TechZone Solutions',    'Approved',   2,   50, 'MCU-ESP32-W',   '2026-06-30 17:00', '2026-06-15 09:30'),
('ORD-83221', 'RoboTech Lanka',        'Pending',    8,  100, 'SEN-ULTRA-04',  '2026-11-15 17:00', '2026-11-01 10:15'),
('ORD-71459', 'ElectroHub Pvt Ltd',    'Completed',  4,  200, 'RES-10K-100',   '2026-08-01 17:00', '2026-07-20 14:00'),
('ORD-66103', 'CircuitLab Engineers',  'Approved',   1,   25, 'MCU-ARD-UNO',   '2026-09-25 17:00', '2026-09-10 08:45'),
('ORD-52887', 'MegaParts Electronics', 'Canceled',  11,  500, 'IC-NE555',      '2026-08-20 17:00', '2026-08-05 11:30'),
('ORD-49332', 'SmartHome Systems',     'Completed', 17,   30, 'PWR-REL-5V4',   '2026-07-25 17:00', '2026-07-12 16:00'),
('ORD-41205', 'IoT Solutions Inc',     'Pending',    3,   75, 'MCU-RPI-PICO',  '2026-11-20 17:00', '2026-11-02 09:00'),
('ORD-38876', 'DigiParts Corp',        'Returned',  15,   20, 'DIS-LCD-1602',  '2026-09-10 17:00', '2026-08-25 13:15'),
('ORD-35501', 'Embedded Tech Co',      'Approved',  19,  100, 'COM-NRF24',     '2026-10-15 17:00', '2026-10-01 10:30'),
('ORD-29945', 'PCB Masters Ltd',       'Completed',  6, 1000, 'CAP-100UF-EL',  '2026-07-10 17:00', '2026-06-28 15:45'),
('ORD-24618', 'SensorHub Trading',     'Pending',    9,   40, 'SEN-DHT22',     '2026-11-18 17:00', '2026-11-03 11:00'),
('ORD-19882', 'AutoBot Robotics',      'Approved',  14,  200, 'CON-HDR-40M',   '2026-10-30 17:00', '2026-10-15 08:30'),
('ORD-15543', 'Wireless World Co',     'Completed', 20,   50, 'COM-BT-HC05',   '2026-09-20 17:00', '2026-09-05 14:20'),
('ORD-11207', 'PowerGrid Systems',     'Canceled',  18,  100, 'PWR-LM2596',    '2026-09-01 17:00', '2026-08-18 10:00'),
('ORD-10001', 'ChipVault Store',       'Pending',   12,   30, 'IC-ATMEGA328',  '2026-11-25 17:00', '2026-11-04 07:00');
