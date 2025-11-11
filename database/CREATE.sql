USE database_webapp;

CREATE TABLE Customer (
    CustomerID INT IDENTITY(1,1) PRIMARY KEY,
    Age INT NOT NULL CHECK (Age >= 18),
    DateOfBirth DATE,
    CustomerName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Phone VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID INT,
    TotalQty INT CHECK (TotalQty > 0),
    DateOrder DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);

CREATE TABLE Store (
    StoreID INT IDENTITY(1,1) PRIMARY KEY,
    StoreName VARCHAR(100) NOT NULL,
    StoreAddress VARCHAR(100) NOT NULL,
    OpeningHour TIME,
    ClosingHour TIME,
    PhoneNumber VARCHAR(20) UNIQUE NOT NULL,
    CONSTRAINT chk_hours CHECK (ClosingHour > OpeningHour)
);

CREATE TABLE Employee (
    EmployeeID INT IDENTITY(1,1) PRIMARY KEY,
    StoreID INT,
    Department VARCHAR(20) NOT NULL,
    Position VARCHAR(20) NOT NULL,
    FOREIGN KEY (StoreID) REFERENCES Store(StoreID)
);

CREATE TABLE Product (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    ProductName VARCHAR(100) UNIQUE NOT NULL,
    ProductDescription VARCHAR(MAX)
);

CREATE TABLE OrderItem (
	OrderID INT,
	ProductID INT,
	PRIMARY KEY (OrderID, ProductID),
	FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
	FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);