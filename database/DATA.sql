INSERT INTO Customer (Age, DateOfBirth, Name, Email, Phone) 
VALUES  (25, '1999-01-10', 'Nguyen Van A', 'a@example.com', '0901000001'),
        (30, '1994-05-22', 'Tran Thi B', 'b@example.com', '0901000002'),
        (22, '2002-07-11', 'Le Van C', 'c@example.com', '0901000003'),
        (28, '1996-03-30', 'Pham Thi D', 'd@example.com', '0901000004'),
        (35, '1989-10-15', 'Hoang Van E', 'e@example.com', '0901000005'),
        (26, '1998-12-01', 'Vu Thi F', 'f@example.com', '0901000006'),
        (32, '1992-08-19', 'Bui Van G', 'g@example.com', '0901000007');

INSERT INTO Store (StoreName, StoreAddress, OpeningHour, PhoneNumber) 
VALUES  ('Store HCM Q1', '123 Le Loi, Q1', '08:00:00', '0283000001'),
        ('Store HCM Q3', '45 Vo Van Tan, Q3', '08:30:00', '0283000002'),
        ('Store HCM Q7', '99 Nguyen Huu Tho, Q7', '09:00:00', '0283000003'),
        ('Store HN Hoan Kiem', '12 Hang Bac, Hoan Kiem', '08:00:00', '0244000001'),
        ('Store HN Dong Da', '56 Tay Son, Dong Da', '08:30:00', '0244000002'),
        ('Store Danang Center', '88 Tran Phu, Da Nang', '09:00:00', '0236000001'),
        ('Store Can Tho', '33 Xo Viet Nghe Tinh, Can Tho', '08:30:00', '0292000001');

INSERT INTO Staff (StoreID, Department, Position) 
VALUES  (1, 'Sales', 'Manager'),
        (2, 'Sales', 'Staff'),
        (3, 'Logistics', 'Staff'),
        (4, 'Cashier', 'Staff'),
        (5, 'CustomerService', 'Supervisor'),
        (6, 'Inventory', 'Staff'),
        (7, 'Marketing', 'Staff');

INSERT INTO Product (ProductName, ProductDescription) 
VALUES  ('iPhone 15', 'Apple flagship phone'),
        ('Samsung S23', 'High-end Samsung smartphone'),
        ('MacBook Air M2', 'Lightweight Apple laptop'),
        ('Dell XPS 13', 'Premium ultrabook'),
        ('iPad Air', 'Apple tablet'),
        ('AirPods Pro', 'Wireless noise-cancelling earphones'),
        ('Apple Watch S8', 'Smartwatch for fitness and health');

INSERT INTO Orders (CustomerID, TotalQty) 
VALUES  (1, 2),
        (2, 1),
        (3, 3),
        (4, 1),
        (5, 4),
        (6, 2),
        (7, 5);

