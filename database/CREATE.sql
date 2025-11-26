CREATE DATABASE database_webapp;
GO

USE database_webapp;
GO

-- Sequences
CREATE SEQUENCE Seq_CustomerID START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE Seq_EmployeeID START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE Seq_ProductID START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE Seq_OrderID START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE Seq_StoreID START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE Seq_CartID START WITH 1 INCREMENT BY 1;
GO

-- Customer Table
CREATE TABLE Customer (
    CustomerID VARCHAR(10) PRIMARY KEY DEFAULT ('CUS' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_CustomerID AS VARCHAR(4)), 4)),
    Age INT NOT NULL CHECK (Age >= 18),
    DateOfBirth DATE NOT NULL,
    CustomerName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Phone VARCHAR(20) UNIQUE NOT NULL,
    RegistrationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsActive BIT DEFAULT 1,
    LoyaltyPoints INT DEFAULT 0 CHECK (LoyaltyPoints >= 0),
    CONSTRAINT checkEmailFormat CHECK (Email LIKE '%_@gmail.com')
    --Should allow more types of email (eg: @hcmut.edu.vn) ?
);

-- Store Table
CREATE TABLE Store (
    StoreID VARCHAR(10) PRIMARY KEY DEFAULT ('STO' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_StoreID AS VARCHAR(4)), 4)),
    StoreName VARCHAR(100) NOT NULL,
    StoreAddress VARCHAR(255) UNIQUE NOT NULL,
    OpeningHour TIME NOT NULL,
    ClosingHour TIME NOT NULL,
    PhoneNumber VARCHAR(20) UNIQUE NOT NULL,
    Email VARCHAR(100),
    IsActive BIT DEFAULT 1,
    CONSTRAINT checkHours CHECK (ClosingHour > OpeningHour)
);

-- Employee Table
CREATE TABLE Employee (
    EmployeeID VARCHAR(10) PRIMARY KEY DEFAULT ('EMP' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_EmployeeID AS VARCHAR(4)), 4)),
    EmployeeName VARCHAR(100) NOT NULL,
    StoreID VARCHAR(10) NOT NULL,
    Department VARCHAR(50) NOT NULL,
    Position VARCHAR(50) NOT NULL,
    IsActive BIT DEFAULT 1,
    Salary DECIMAL(10,2) CHECK (Salary >= 0),
    FOREIGN KEY (StoreID) REFERENCES Store(StoreID)
);

-- Product Table
CREATE TABLE Product (
    ProductID VARCHAR(10) PRIMARY KEY DEFAULT ('PRO' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_ProductID AS VARCHAR(4)), 4)),
    ProductName VARCHAR(100) UNIQUE NOT NULL,
    --UNIQUE for ProductName might be too strict
    ProductDescription VARCHAR(MAX),
    Price DECIMAL(10,2) NOT NULL CHECK (Price >= 0),
    StockQuantity INT DEFAULT 0 CHECK (StockQuantity >= 0),
    IsActive BIT DEFAULT 1,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE Orders (
    OrderID VARCHAR(10) PRIMARY KEY DEFAULT ('ORD' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_OrderID AS VARCHAR(4)), 4)),
    CustomerID VARCHAR(10) NOT NULL,
    StoreID VARCHAR(10) NOT NULL,
    DateOrder DATETIME DEFAULT CURRENT_TIMESTAMP,
    OrderStatus VARCHAR(20) DEFAULT 'Pending'
        CHECK (OrderStatus IN ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID),
    FOREIGN KEY (StoreID) REFERENCES Store(StoreID)
);

-- OrderItem Table
CREATE TABLE OrderItem (
    OrderID VARCHAR(10),
    ProductID VARCHAR(10),
    Quantity INT NOT NULL CHECK (Quantity > 0),
    UnitPrice DECIMAL(10,2) NOT NULL CHECK (UnitPrice >= 0),
    LineTotal AS (Quantity * UnitPrice) PERSISTED,
    PRIMARY KEY (OrderID, ProductID),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
    --Consider adding FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE
    --So when an order is deleted, its items are deleted automatically.
);

CREATE TABLE Cart (
    CartID VARCHAR(10) PRIMARY KEY DEFAULT ('CRT' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_CartID AS VARCHAR(4)), 4)),
    CustomerID VARCHAR(10) NOT NULL,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);

CREATE TABLE CartItem (
    CartID VARCHAR(10),
    ProductID VARCHAR(10),
    Quantity INT NOT NULL CHECK (Quantity > 0),
    UnitPrice DECIMAL(10,2) NOT NULL CHECK (UnitPrice >= 0),
    LineTotal AS (Quantity * UnitPrice) PERSISTED,
    PRIMARY KEY (CartID, ProductID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID),
    FOREIGN KEY (CartID) REFERENCES Cart(CartID)
);
