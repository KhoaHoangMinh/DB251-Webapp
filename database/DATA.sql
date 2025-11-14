USE database_webapp;
GO

INSERT INTO Customer (Age, DateOfBirth, CustomerName, Email, Phone, LoyaltyPoints) VALUES
(25, '1999-03-15', 'John Smith', 'john.smith@gmail.com', '555-0101', 150),
(30, '1994-07-22', 'Sarah Johnson', 'sarah.j@gmail.com', '555-0102', 300),
(22, '2002-11-08', 'Mike Davis', 'mike.davis@gmail.com', '555-0103', 75),
(28, '1996-05-30', 'Emily Wilson', 'emily.wilson@gmail.com', '555-0104', 500),
(35, '1989-09-14', 'David Brown', 'david.brown@gmail.com', '555-0105', 200),
(19, '2005-01-25', 'Jessica Lee', 'jessica.lee@gmail.com', '555-0106', 50),
(32, '1992-12-03', 'Robert Taylor', 'robert.t@gmail.com', '555-0107', 400);

INSERT INTO Store (StoreName, StoreAddress, OpeningHour, ClosingHour, PhoneNumber, Email) VALUES
('Nike Downtown', '123 Main Street, City Center', '09:00', '21:00', '555-1001', 'downtown@nike.com'),
('Nike Mall', '456 Mall Road, Shopping District', '10:00', '22:00', '555-1002', 'mall@nike.com'),
('Nike Sports Complex', '789 Arena Boulevard', '08:00', '20:00', '555-1003', 'sports@nike.com'),
('Nike Outlet', '321 Outlet Drive, East Side', '09:30', '21:30', '555-1004', 'outlet@nike.com'),
('Nike Superstore', '654 Super Mall, West End', '09:00', '22:00', '555-1005', 'super@nike.com'),
('Nike Urban', '987 Downtown Plaza', '10:00', '21:00', '555-1006', 'urban@nike.com'),
('Nike Flagship', '147 Premium Avenue', '08:30', '23:00', '555-1007', 'flagship@nike.com');

INSERT INTO Employee (EmployeeName, StoreID, Department, Position, Salary) VALUES
('Alice Cooper', 'STO0001', 'Sales', 'Store Manager', 55000.00),
('Brian Carter', 'STO0001', 'Sales', 'Sales Associate', 35000.00),
('Carol Evans', 'STO0002', 'Inventory', 'Stock Manager', 42000.00),
('Daniel Fox', 'STO0002', 'Sales', 'Cashier', 32000.00),
('Eva Green', 'STO0003', 'Management', 'Assistant Manager', 48000.00),
('Frank Harris', 'STO0003', 'Customer Service', 'Service Representative', 38000.00),
('Grace Irving', 'STO0004', 'Sales', 'Senior Sales Associate', 45000.00);

INSERT INTO Product (ProductName, ProductDescription, Price, StockQuantity) VALUES
('Nike Air Force 1', 'Classic white leather sneakers', 110.00, 50),
('Nike Air Max 270', 'Comfortable lifestyle shoes with Max Air unit', 150.00, 35),
('Nike Dri-FIT T-Shirt', 'Moisture-wicking performance t-shirt', 35.00, 100),
('Nike Pro Shorts', 'Compression shorts for athletic performance', 45.00, 75),
('Nike Sportswear Hoodie', 'Comfortable cotton blend hoodie', 85.00, 40),
('Nike Basketball Jersey', 'Authentic NBA-style basketball jersey', 120.00, 25),
('Nike Running Shorts', 'Lightweight running shorts with liner', 55.00, 60);

INSERT INTO Orders (CustomerID, StoreID, TotalQty, TotalAmount, OrderStatus) VALUES
('CUS0001', 'STO0001', 2, 220.00, 'Delivered'),
('CUS0002', 'STO0002', 3, 270.00, 'Processing'),
('CUS0003', 'STO0001', 1, 150.00, 'Shipped'),
('CUS0004', 'STO0003', 4, 340.00, 'Confirmed'),
('CUS0005', 'STO0002', 2, 90.00, 'Pending'),
('CUS0006', 'STO0004', 1, 85.00, 'Delivered'),
('CUS0001', 'STO0001', 3, 165.00, 'Processing');

INSERT INTO OrderItem (OrderID, ProductID, Quantity, UnitPrice) VALUES
('ORD0001', 'PRO0001', 2, 110.00),
('ORD0002', 'PRO0002', 1, 150.00),
('ORD0002', 'PRO0003', 2, 35.00),
('ORD0003', 'PRO0002', 1, 150.00),
('ORD0004', 'PRO0004', 2, 45.00),
('ORD0004', 'PRO0005', 1, 85.00),
('ORD0004', 'PRO0006', 1, 120.00),
('ORD0005', 'PRO0003', 2, 35.00),
('ORD0005', 'PRO0004', 1, 45.00),
('ORD0006', 'PRO0005', 1, 85.00),
('ORD0007', 'PRO0003', 3, 35.00),
('ORD0007', 'PRO0007', 1, 55.00);

