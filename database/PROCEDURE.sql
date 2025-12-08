USE database_webapp;
GO

-- Procedure 1: Get Top Customers by Spending --
CREATE PROCEDURE GetTopCustomers
    @TopN INT
AS
BEGIN
    IF @TopN <= 0
    BEGIN
        PRINT 'Invalid input: TopN must be positive';
        RETURN;
    END

    SELECT TOP(@TopN)
        c.CustomerID,
        c.CustomerName,
        dbo.GetCustomerTotalSpending(c.CustomerID) AS TotalSpent
    FROM Customer c
    WHERE dbo.GetCustomerTotalSpending(c.CustomerID) > 0
    ORDER BY TotalSpent DESC;
END;
GO


-- Procedure 2: Update Product Stock After Order --
CREATE PROCEDURE UpdateStockAfterOrder
    @OrderID VARCHAR(10)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Orders WHERE OrderID = @OrderID)
    BEGIN
        PRINT 'Error: Invalid Order ID';
        RETURN;
    END

    IF NOT EXISTS (
        SELECT 1
        FROM Orders
        WHERE OrderID = @OrderID
--           AND OrderStatus = 'Delivered'
    )
    BEGIN
        PRINT 'Order not delivered yet. Stock not updated.';
        RETURN;
    END

    DECLARE @ProductID VARCHAR(10), @Qty INT;

    DECLARE order_cursor CURSOR FOR
        SELECT ProductID, Quantity
        FROM OrderItem
        WHERE OrderID = @OrderID;

    OPEN order_cursor;
    FETCH NEXT FROM order_cursor INTO @ProductID, @Qty;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        UPDATE Product
        SET StockQuantity = StockQuantity - @Qty
        WHERE ProductID = @ProductID
          AND StockQuantity >= @Qty;

        FETCH NEXT FROM order_cursor INTO @ProductID, @Qty;
    END

    CLOSE order_cursor;
    DEALLOCATE order_cursor;

    PRINT 'Stock updated successfully for Order ' + @OrderID;
END;
GO


-- Procedure 3: Get products detail of Order by OrderID --
CREATE PROCEDURE GetOrderProductDetails
    @OrderID VARCHAR(10) = NULL  -- Optional parameter to filter by specific order
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        o.OrderID,
        o.DateOrder,
        c.CustomerName,
        s.StoreName,
        p.ProductName,
        oi.Quantity,
        oi.UnitPrice,
        oi.LineTotal,
        o.OrderStatus as OrderTotal
    FROM Orders o
    INNER JOIN OrderItem oi ON o.OrderID = oi.OrderID
    INNER JOIN Product p ON oi.ProductID = p.ProductID
    INNER JOIN Customer c ON o.CustomerID = c.CustomerID
    INNER JOIN Store s ON o.StoreID = s.StoreID
    WHERE (@OrderID IS NULL OR o.OrderID = @OrderID)
    ORDER BY o.DateOrder DESC, o.OrderID, p.ProductName;
END;
GO

-- Procedure 4: Get Top N Best Selling Product
CREATE PROCEDURE GetTopSellingProductsByQuantity
    @TopN INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate TopN parameter
    IF @TopN <= 0
    BEGIN
        RAISERROR('TopN must be a positive number.', 16, 1);
    END

    SELECT TOP (@TopN)
        p.ProductID,
        p.ProductName,
        SUM(oi.Quantity) as TotalQuantitySold
    FROM Product p
    INNER JOIN OrderItem oi ON p.ProductID = oi.ProductID
    INNER JOIN Orders o ON oi.OrderID = o.OrderID
    WHERE o.OrderStatus NOT IN ('Cancelled', 'Pending', 'Confirmed', 'Processing')  -- Exclude cancelled orders
      AND p.IsActive = 1
    GROUP BY p.ProductID, p.ProductName
    ORDER BY TotalQuantitySold DESC;
END;
GO

CREATE PROCEDURE CreateNewEmployee
    @EmployeeName VARCHAR(100),
    @StoreID VARCHAR(10),
    @Department VARCHAR(50),
    @Position VARCHAR(50),
    @Salary DECIMAL(10,2)
AS
BEGIN
    -- Check if the StoreID is valid
    IF NOT EXISTS (SELECT 1 FROM Store WHERE StoreID = @StoreID)
    BEGIN
        -- Raise an error if the StoreID does not exist
        RAISERROR('Error: The provided StoreID does not exist in the Store table.', 16, 1)
    END

    -- Check if Salary is valid (though the table constraint handles this,
    -- it's good practice to check in the procedure too)
    IF @Salary < 0
    BEGIN
        RAISERROR('Error: Salary cannot be negative.', 16, 1)

    END

    -- Insert the new employee record
    INSERT INTO Employee (
        EmployeeID, -- The default value handles the sequence and formatting
        EmployeeName,
        StoreID,
        Department,
        Position,
        IsActive, -- Uses the table's default of 1 (or you can explicitly pass 1)
        Salary
    )
    VALUES (
        'EMP' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_EmployeeID AS VARCHAR(4)), 4),
        @EmployeeName,
        @StoreID,
        @Department,
        @Position,
        1, -- Explicitly setting IsActive to 1 (True)
        @Salary
    );
END
GO

CREATE PROCEDURE UpdateEmployeeDetails
    @EmployeeID VARCHAR(10),
    @EmployeeName VARCHAR(100) = NULL, -- Optional: Only update if provided
    @StoreID VARCHAR(10) = NULL,       -- Optional
    @Department VARCHAR(50) = NULL,    -- Optional
    @Position VARCHAR(50) = NULL,      -- Optional
    @Salary DECIMAL(10,2) = NULL,      -- Optional
    @IsActive BIT = NULL               -- Optional: For activating/deactivating
AS
BEGIN
    -- 1. Check if the EmployeeID exists
    IF NOT EXISTS (SELECT 1 FROM Employee WHERE EmployeeID = @EmployeeID)
    BEGIN
        RAISERROR('Error: Employee ID not found.', 16, 1)

    END

    -- 2. Validate StoreID if provided
    IF @StoreID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Store WHERE StoreID = @StoreID)
    BEGIN
        RAISERROR('Error: The provided StoreID does not exist in the Store table.', 16, 1)

    END

    -- 3. Perform the Update
    UPDATE Employee
    SET
        EmployeeName = ISNULL(@EmployeeName, EmployeeName), -- Use new value, or keep old value if NULL
        StoreID = ISNULL(@StoreID, StoreID),
        Department = ISNULL(@Department, Department),
        Position = ISNULL(@Position, Position),
        Salary = ISNULL(@Salary, Salary),
        IsActive = ISNULL(@IsActive, IsActive)
    WHERE
        EmployeeID = @EmployeeID;

END
GO

CREATE PROCEDURE DeleteEmployeePermanently
    @EmployeeID VARCHAR(10)
AS
BEGIN
    -- Set the number of rows affected to be returned
    SET NOCOUNT ON;

    -- 1. Check if the EmployeeID exists
    IF NOT EXISTS (SELECT 1 FROM Employee WHERE EmployeeID = @EmployeeID)
    BEGIN
        -- Raise an error if the EmployeeID is not found
        RAISERROR('Error: Employee ID not found. No deletion performed.', 16, 1)

    END

    -- 2. Perform the Hard Delete
    DELETE FROM Employee
    WHERE EmployeeID = @EmployeeID;

END
GO

CREATE PROCEDURE CreateNewCustomer
    @CustomerName VARCHAR(100),
    @DateOfBirth DATE,
    @Email VARCHAR(100),
    @Phone VARCHAR(20)
AS
BEGIN
    -- 1. Email Format Check (Redundant due to table constraint, but good for immediate feedback)
    IF @Email NOT LIKE '%_@%_%.%'
    BEGIN
        RAISERROR('Error: Email format is invalid. Please use a standard email address format (e.g., user@domain.com).', 16, 1)

    END

    -- 2. Insert the new customer record
    INSERT INTO Customer (
        CustomerID,
        CustomerName,
        DateOfBirth,
        Email,
        Phone,
        RegistrationDate, -- Uses table default (CURRENT_TIMESTAMP)
        IsActive,         -- Uses table default (1)
        LoyaltyPoints     -- Uses table default (0)
    )
    VALUES (
        'CUS' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_CustomerID AS VARCHAR(4)), 4),
        @CustomerName,
        @DateOfBirth,
        @Email,
        @Phone,
        DEFAULT,
        1,
        0
    );

END
GO

CREATE PROCEDURE UpdateCustomerDetails
    @CustomerID VARCHAR(10),
    @CustomerName VARCHAR(100) = NULL,
    @DateOfBirth DATE = NULL,
    @Email VARCHAR(100) = NULL,
    @Phone VARCHAR(20) = NULL,
    @IsActive BIT = NULL,
    @LoyaltyPoints INT = NULL
AS
BEGIN
    -- 1. Check if the CustomerID exists
    IF NOT EXISTS (SELECT 1 FROM Customer WHERE CustomerID = @CustomerID)
    BEGIN
        RAISERROR('Error: Customer ID not found.', 16, 1)

    END

    -- 2. Check for Email Uniqueness/Format (if changing)
    IF @Email IS NOT NULL AND (
        NOT EXISTS (SELECT 1 FROM Customer WHERE Email = @Email AND CustomerID = @CustomerID) -- Check if new email is different
        AND EXISTS (SELECT 1 FROM Customer WHERE Email = @Email) -- Check if new email is already used by someone else
    )
    BEGIN
        RAISERROR('Error: The new Email is already registered to another customer.', 16, 1)

    END
    ELSE IF @Email IS NOT NULL AND @Email NOT LIKE '%_@%_%.%'
    BEGIN
        RAISERROR('Error: New Email format is invalid.', 16, 1)

    END

    -- 3. Check for Phone Uniqueness (if changing)
    IF @Phone IS NOT NULL AND (
        NOT EXISTS (SELECT 1 FROM Customer WHERE Phone = @Phone AND CustomerID = @CustomerID) -- Check if new phone is different
        AND EXISTS (SELECT 1 FROM Customer WHERE Phone = @Phone) -- Check if new phone is already used by someone else
    )
    BEGIN
        RAISERROR('Error: The new Phone number is already registered to another customer.', 16, 1)

    END

    -- 4. Perform the Update
    UPDATE Customer
    SET
        CustomerName = ISNULL(@CustomerName, CustomerName),
        DateOfBirth = ISNULL(@DateOfBirth, DateOfBirth),
        Email = ISNULL(@Email, Email),
        Phone = ISNULL(@Phone, Phone),
        IsActive = ISNULL(@IsActive, IsActive),
        LoyaltyPoints = ISNULL(@LoyaltyPoints, LoyaltyPoints)
    WHERE
        CustomerID = @CustomerID;

END
GO

CREATE PROCEDURE DeleteCustomerPermanently
    @CustomerID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Check if the CustomerID exists
    IF NOT EXISTS (SELECT 1 FROM Customer WHERE CustomerID = @CustomerID)
    BEGIN
        RAISERROR('Error: Customer ID not found. No deletion performed.', 16, 1)

    END

    -- 2. Perform the Hard Delete
    -- Your existing trigger will execute here to check constraints before deletion.
    DELETE FROM Customer
    WHERE CustomerID = @CustomerID;

END
GO

CREATE PROCEDURE CreateNewProduct
    @ProductName VARCHAR(100),
    @ProductDescription VARCHAR(MAX) = NULL,
    @Price DECIMAL(10,2),
    @StockQuantity INT
AS
BEGIN
    -- 1. Check for valid Price
    IF @Price < 0
    BEGIN
        RAISERROR('Error: Price cannot be negative.', 16, 1)

    END

    -- 2. Check for valid Stock Quantity
    IF @StockQuantity < 0
    BEGIN
        RAISERROR('Error: Stock Quantity cannot be negative.', 16, 1)

    END

    -- 3. Check for unique ProductName (required by the table definition)
    IF EXISTS (SELECT 1 FROM Product WHERE ProductName = @ProductName)
    BEGIN
        RAISERROR('Error: A product with this name already exists.', 16, 1)

    END

    -- 4. Insert the new product record
    INSERT INTO Product (
        ProductID,
        ProductName,
        ProductDescription,
        Price,
        StockQuantity,
        IsActive,         -- Uses table default (1)
        CreatedDate       -- Uses table default (CURRENT_TIMESTAMP)
    )
    VALUES (
        'PRO' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_ProductID AS VARCHAR(4)), 4),
        @ProductName,
        @ProductDescription,
        @Price,
        @StockQuantity,
        1, -- Explicitly setting IsActive to 1
        DEFAULT
    );

END
GO

CREATE PROCEDURE UpdateProductDetails
    @ProductID VARCHAR(10),
    @ProductName VARCHAR(100) = NULL,
    @ProductDescription VARCHAR(MAX) = NULL,
    @Price DECIMAL(10,2) = NULL,
    @StockQuantity INT = NULL,
    @IsActive BIT = NULL
AS
BEGIN
    -- 1. Check if the ProductID exists
    IF NOT EXISTS (SELECT 1 FROM Product WHERE ProductID = @ProductID)
    BEGIN
        RAISERROR('Error: Product ID not found.', 16, 1)

    END

    -- 2. Validate Price if provided
    IF @Price IS NOT NULL AND @Price < 0
    BEGIN
        RAISERROR('Error: Price cannot be negative.', 16, 1)

    END

    -- 3. Validate Stock Quantity if provided
    IF @StockQuantity IS NOT NULL AND @StockQuantity < 0
    BEGIN
        RAISERROR('Error: Stock Quantity cannot be negative.', 16, 1)

    END

    -- 4. Check for unique ProductName (if changing)
    IF @ProductName IS NOT NULL AND (
        NOT EXISTS (SELECT 1 FROM Product WHERE ProductName = @ProductName AND ProductID = @ProductID) -- Name is different
        AND EXISTS (SELECT 1 FROM Product WHERE ProductName = @ProductName) -- Name is already used by another product
    )
    BEGIN
        RAISERROR('Error: The new Product Name is already in use by another product.', 16, 1)

    END

    -- 5. Perform the Update
    UPDATE Product
    SET
        ProductName = ISNULL(@ProductName, ProductName),
        ProductDescription = ISNULL(@ProductDescription, ProductDescription),
        Price = ISNULL(@Price, Price),
        StockQuantity = ISNULL(@StockQuantity, StockQuantity),
        IsActive = ISNULL(@IsActive, IsActive)
    WHERE
        ProductID = @ProductID;

END
GO

CREATE PROCEDURE DeleteProductPermanently
    @ProductID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Check if the ProductID exists
    IF NOT EXISTS (SELECT 1 FROM Product WHERE ProductID = @ProductID)
    BEGIN
        RAISERROR('Error: Product ID not found. No deletion performed.', 16, 1)

    END

    -- 2. Perform the Hard Delete
    -- Your existing trigger will execute here.
    DELETE FROM Product
    WHERE ProductID = @ProductID;
END
GO

CREATE PROCEDURE CreateNewOrder
    @CustomerID VARCHAR(10),
    @StoreID VARCHAR(10)
AS
BEGIN
    -- 1. Check if the CustomerID is valid
    IF NOT EXISTS (SELECT 1 FROM Customer WHERE CustomerID = @CustomerID)
    BEGIN
        RAISERROR('Error: The provided CustomerID does not exist.', 16, 1)

    END

    -- 2. Check if the StoreID is valid
    IF NOT EXISTS (SELECT 1 FROM Store WHERE StoreID = @StoreID)
    BEGIN
        RAISERROR('Error: The provided StoreID does not exist.', 16, 1)

    END

    -- 3. Insert the new order record
    INSERT INTO Orders (
        OrderID,
        CustomerID,
        StoreID,
        DateOrder,       -- Uses table default (CURRENT_TIMESTAMP)
        OrderStatus      -- Uses table default ('Pending')
    )
    VALUES (
        'ORD' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_OrderID AS VARCHAR(4)), 4),
        @CustomerID,
        @StoreID,
        DEFAULT,
        DEFAULT
    );
END
GO

CREATE PROCEDURE UpdateOrderDetails
    @OrderID VARCHAR(10),
    @StoreID VARCHAR(10) = NULL,
    @OrderStatus VARCHAR(20) = NULL
AS
BEGIN
    -- Allowed Status values for validation
    DECLARE @AllowedStatus TABLE (StatusValue VARCHAR(20));
    INSERT INTO @AllowedStatus (StatusValue) VALUES
        ('Pending'), ('Confirmed'), ('Processing'), ('Shipped'), ('Delivered'), ('Cancelled');

    -- 1. Check if the OrderID exists
    IF NOT EXISTS (SELECT 1 FROM Orders WHERE OrderID = @OrderID)
    BEGIN
        RAISERROR('Error: Order ID not found.', 16, 1)

    END

    -- 2. Validate new StoreID if provided
    IF @StoreID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Store WHERE StoreID = @StoreID)
    BEGIN
        RAISERROR('Error: The provided new StoreID does not exist.', 16, 1)

    END

    -- 3. Validate new OrderStatus if provided
    IF @OrderStatus IS NOT NULL AND NOT EXISTS (SELECT 1 FROM @AllowedStatus WHERE StatusValue = @OrderStatus)
    BEGIN
        RAISERROR('Error: Invalid OrderStatus provided. Must be one of: Pending, Confirmed, Processing, Shipped, Delivered, or Cancelled.', 16, 1)

    END

    -- 4. Perform the Update
    UPDATE Orders
    SET
        StoreID = ISNULL(@StoreID, StoreID),
        OrderStatus = ISNULL(@OrderStatus, OrderStatus)
    WHERE
        OrderID = @OrderID;

END
GO

CREATE PROCEDURE DeleteOrderPermanently
    @OrderID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Check if the OrderID exists
    IF NOT EXISTS (SELECT 1 FROM Orders WHERE OrderID = @OrderID)
    BEGIN
        RAISERROR('Error: Order ID not found. No deletion performed.', 16, 1)

    END

    -- 2. Perform the Hard Delete
    -- Your existing trigger will execute here.
    DELETE FROM Orders
    WHERE OrderID = @OrderID;

END
GO

CREATE PROCEDURE AddOrderItem
    @OrderID VARCHAR(10),
    @ProductID VARCHAR(10),
    @Quantity INT,
    @UnitPrice DECIMAL(10,2)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Check if the OrderID exists (Foreign Key check)
    IF NOT EXISTS (SELECT 1 FROM Orders WHERE OrderID = @OrderID)
    BEGIN
        RAISERROR('Error: Order ID not found in the Orders table.', 16, 1)

    END

    -- 2. Check if the ProductID exists (Foreign Key check)
    IF NOT EXISTS (SELECT 1 FROM Product WHERE ProductID = @ProductID)
    BEGIN
        RAISERROR('Error: Product ID not found in the Product table.', 16, 1)

    END

    -- 3. Check for existing item (Composite Primary Key check)
    IF EXISTS (SELECT 1 FROM OrderItem WHERE OrderID = @OrderID AND ProductID = @ProductID)
    BEGIN
        RAISERROR('Error: This Product already exists in this Order. Use the update procedure to change the quantity/price.', 16, 1)

    END

    -- 4. Check for constraints
    IF @Quantity <= 0
    BEGIN
        RAISERROR('Error: Quantity must be greater than zero.', 16, 1)

    END

    IF @UnitPrice < 0
    BEGIN
        RAISERROR('Error: Unit Price cannot be negative.', 16, 1)

    END

    -- 5. Insert the new order item
    INSERT INTO OrderItem (
        OrderID,
        ProductID,
        Quantity,
        UnitPrice
        -- LineTotal is a computed column, so it is not inserted
    )
    VALUES (
        @OrderID,
        @ProductID,
        @Quantity,
        @UnitPrice
    );

END
GO

CREATE PROCEDURE UpdateOrderItem
    @OrderID VARCHAR(10),
    @ProductID VARCHAR(10),
    @Quantity INT = NULL,
    @UnitPrice DECIMAL(10,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Check if the Order Item exists (Composite Key check)
    IF NOT EXISTS (SELECT 1 FROM OrderItem WHERE OrderID = @OrderID AND ProductID = @ProductID)
    BEGIN
        RAISERROR('Error: The specified Order Item was not found.', 16, 1)

    END

    -- 2. Validate Quantity if provided
    IF @Quantity IS NOT NULL AND @Quantity <= 0
    BEGIN
        RAISERROR('Error: New Quantity must be greater than zero.', 16, 1)

    END

    -- 3. Validate UnitPrice if provided
    IF @UnitPrice IS NOT NULL AND @UnitPrice < 0
    BEGIN
        RAISERROR('Error: New Unit Price cannot be negative.', 16, 1)

    END

    -- 4. Perform the Update
    UPDATE OrderItem
    SET
        Quantity = ISNULL(@Quantity, Quantity),
        UnitPrice = ISNULL(@UnitPrice, UnitPrice)
        -- LineTotal updates automatically as it's a PERSISTED computed column
    WHERE
        OrderID = @OrderID
        AND ProductID = @ProductID;

END
GO

CREATE PROCEDURE DeleteOrderItem
    @OrderID VARCHAR(10),
    @ProductID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Check if the Order Item exists (Composite Key check)
    IF NOT EXISTS (SELECT 1 FROM OrderItem WHERE OrderID = @OrderID AND ProductID = @ProductID)
    BEGIN
        RAISERROR('Error: The specified Order Item was not found. No deletion performed.', 16, 1)

    END

    -- 2. Perform the Hard Delete
    DELETE FROM OrderItem
    WHERE
        OrderID = @OrderID
        AND ProductID = @ProductID;

END
GO

CREATE PROCEDURE CreateNewCart
    @CustomerID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Check if the CustomerID is valid
    IF NOT EXISTS (SELECT 1 FROM Customer WHERE CustomerID = @CustomerID)
    BEGIN
        RAISERROR('Error: The provided CustomerID does not exist.', 16, 1)

    END

    -- 2. Insert the new cart record
    INSERT INTO Cart (
        CartID,
        CustomerID
    )
    VALUES (
        'CRT' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_CartID AS VARCHAR(4)), 4),
        @CustomerID
    );
END
GO

CREATE PROCEDURE DeleteCartPermanently
    @CartID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Check if the CartID exists
    IF NOT EXISTS (SELECT 1 FROM Cart WHERE CartID = @CartID)
    BEGIN
        RAISERROR('Error: Cart ID not found. No deletion performed.', 16, 1)

    END

    -- 2. Perform the Hard Delete
    DELETE FROM Cart
    WHERE CartID = @CartID;
END
GO

CREATE PROCEDURE AddCartItem
    @CartID VARCHAR(10),
    @ProductID VARCHAR(10),
    @Quantity INT,
    @UnitPrice DECIMAL(10,2)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Check if the CartID exists (Foreign Key check)
    IF NOT EXISTS (SELECT 1 FROM Cart WHERE CartID = @CartID)
    BEGIN
        RAISERROR('Error: Cart ID not found in the Cart table.', 16, 1)

    END

    -- 2. Check if the ProductID exists (Foreign Key check)
    IF NOT EXISTS (SELECT 1 FROM Product WHERE ProductID = @ProductID)
    BEGIN
        RAISERROR('Error: Product ID not found in the Product table.', 16, 1)

    END

    -- 3. Check for existing item (Composite Primary Key check)
    IF EXISTS (SELECT 1 FROM CartItem WHERE CartID = @CartID AND ProductID = @ProductID)
    BEGIN
        -- If item exists, update the quantity instead of inserting a duplicate
        UPDATE CartItem
        SET Quantity = Quantity + @Quantity
        WHERE CartID = @CartID AND ProductID = @ProductID;

        SELECT 'Success' AS Result, 'Quantity updated for existing Cart Item.' AS Message;
        RETURN
    END

    -- 4. Check for constraints
    IF @Quantity <= 0
    BEGIN
        RAISERROR('Error: Quantity must be greater than zero.', 16, 1)

    END

    IF @UnitPrice < 0
    BEGIN
        RAISERROR('Error: Unit Price cannot be negative.', 16, 1)

    END

    -- 5. Insert the new cart item
    INSERT INTO CartItem (
        CartID,
        ProductID,
        Quantity,
        UnitPrice
    )
    VALUES (
        @CartID,
        @ProductID,
        @Quantity,
        @UnitPrice
    );
END
GO

CREATE PROCEDURE UpdateCartItem
    @CartID VARCHAR(10),
    @ProductID VARCHAR(10),
    @Quantity INT = NULL,
    @UnitPrice DECIMAL(10,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Check if the Cart Item exists (Composite Key check)
    IF NOT EXISTS (SELECT 1 FROM CartItem WHERE CartID = @CartID AND ProductID = @ProductID)
    BEGIN
        RAISERROR('Error: The specified Cart Item was not found.', 16, 1)

    END

    -- 2. Validate Quantity if provided
    IF @Quantity IS NOT NULL AND @Quantity <= 0
    BEGIN
        -- Option: If Quantity is 0, delete the item instead of failing
        EXEC DeleteCartItem @CartID = @CartID, @ProductID = @ProductID;
        SELECT 'Success' AS Result, 'Quantity set to 0, item deleted from cart.' AS Message;
        RETURN
    END

    -- 3. Validate UnitPrice if provided
    IF @UnitPrice IS NOT NULL AND @UnitPrice < 0
    BEGIN
        RAISERROR('Error: New Unit Price cannot be negative.', 16, 1)

    END

    -- 4. Perform the Update
    UPDATE CartItem
    SET
        Quantity = ISNULL(@Quantity, Quantity),
        UnitPrice = ISNULL(@UnitPrice, UnitPrice)
    WHERE
        CartID = @CartID
        AND ProductID = @ProductID;

END
GO

CREATE PROCEDURE DeleteCartItem
    @CartID VARCHAR(10),
    @ProductID VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Check if the Cart Item exists (Composite Key check)
    IF NOT EXISTS (SELECT 1 FROM CartItem WHERE CartID = @CartID AND ProductID = @ProductID)
    BEGIN
        RAISERROR('Error: The specified Cart Item was not found. No deletion performed.', 16, 1)

    END

    -- 2. Perform the Hard Delete
    DELETE FROM CartItem
    WHERE
        CartID = @CartID
        AND ProductID = @ProductID;

END
GO