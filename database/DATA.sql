USE database_webapp;
GO

INSERT INTO Customer (Age, DateOfBirth, CustomerName, Email, Phone, LoyaltyPoints)
VALUES
(25, '2000-04-15', 'Alice Nguyen', 'alice.nguyen@gmail.com', '0901000001', 120),
(30, '1995-09-12', 'Bob Tran', 'bob.tran@gmail.com', '0901000002', 250),
(22, '2003-07-20', 'Charlie Le', 'charlie.le@gmail.com', '0901000003', 80),
(28, '1997-02-03', 'Diana Vo', 'diana.vo@gmail.com', '0901000004', 0),
(35, '1990-11-25', 'Evan Pham', 'evan.pham@gmail.com', '0901000005', 330),
(40, '1985-03-14', 'Fiona Dang', 'fiona.dang@gmail.com', '0901000006', 410),
(26, '1999-12-30', 'George Ho', 'george.ho@gmail.com', '0901000007', 150);

INSERT INTO Store (StoreName, StoreAddress, OpeningHour, ClosingHour, PhoneNumber, Email)
VALUES
('TechZone District 1', '123 Le Loi, D1, HCMC', '08:00', '21:00', '0281000001', 'store1@gmail.com'),
('TechZone District 3', '45 Vo Van Tan, D3, HCMC', '08:00', '21:00', '0281000002', 'store2@gmail.com'),
('TechZone District 5', '99 Tran Hung Dao, D5, HCMC', '09:00', '20:30', '0281000003', 'store3@gmail.com'),
('TechZone Thu Duc', '12 Vo Van Ngan, Thu Duc, HCMC', '08:00', '22:00', '0281000004', 'store4@gmail.com'),
('TechZone Binh Thanh', '233 Phan Dang Luu, BT, HCMC', '08:00', '21:30', '0281000005', 'store5@gmail.com'),
('TechZone Tan Binh', '88 Hoang Hoa Tham, Tan Binh, HCMC', '09:00', '22:00', '0281000006', 'store6@gmail.com'),
('TechZone Go Vap', '56 Quang Trung, Go Vap, HCMC', '08:30', '21:00', '0281000007', 'store7@gmail.com');

INSERT INTO Employee (EmployeeName, StoreID, Department, Position, Salary)
VALUES
('Minh Tran', 'STO0001', 'Sales', 'Sales Associate', 8000.00),
('Khang Le', 'STO0001', 'IT', 'System Admin', 12000.00),
('Linh Pham', 'STO0002', 'Customer Service', 'Support Staff', 9000.00),
('Phuong Vu', 'STO0003', 'Warehouse', 'Stock Keeper', 7500.00),
('Bao Nguyen', 'STO0004', 'Sales', 'Sales Associate', 8500.00),
('Tam Do', 'STO0005', 'Manager', 'Store Manager', 15000.00),
('Huy Tran', 'STO0006', 'Delivery', 'Driver', 7000.00);

INSERT INTO Product (ProductName, ProductDescription, Price, StockQuantity)
VALUES
('Laptop Dell XPS 13', '13-inch ultrabook with Intel i7', 32000.00, 15),
('iPhone 15 Pro', 'Apple smartphone 256GB', 35000.00, 10),
('Samsung Galaxy S24', 'Android flagship phone', 28000.00, 12),
('Asus ROG Strix', 'Gaming laptop 16GB RAM', 42000.00, 8),
('Logitech MX Master 3S', 'Wireless mouse', 2500.00, 50),
('Razer BlackWidow V4', 'Mechanical gaming keyboard', 4800.00, 30),
('Apple AirPods Pro 2', 'Wireless earbuds', 5200.00, 20);

INSERT INTO Orders (CustomerID, StoreID, TotalQty, TotalAmount, OrderStatus)
VALUES
('CUS0001', 'STO0001', 2, 67000.00, 'Confirmed'),
('CUS0002', 'STO0002', 1, 35000.00, 'Pending'),
('CUS0003', 'STO0003', 3, 43000.00, 'Delivered'),
('CUS0004', 'STO0001', 2, 8000.00, 'Processing'),
('CUS0005', 'STO0005', 4, 52000.00, 'Shipped'),
('CUS0006', 'STO0006', 1, 42000.00, 'Cancelled'),
('CUS0007', 'STO0002', 5, 58000.00, 'Confirmed');

INSERT INTO OrderItem (OrderID, ProductID, Quantity, UnitPrice)
VALUES
('ORD0001', 'PRO0001', 1, 32000.00),
('ORD0001', 'PRO0005', 1, 2500.00),
('ORD0002', 'PRO0002', 1, 35000.00),
('ORD0003', 'PRO0007', 2, 5200.00),
('ORD0004', 'PRO0006', 2, 4800.00),
('ORD0005', 'PRO0003', 2, 28000.00),
('ORD0007', 'PRO0004', 1, 42000.00);

