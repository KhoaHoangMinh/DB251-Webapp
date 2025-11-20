USE database_webapp;
GO

-- Trigger 1: Auto-update Loyalty Points After Order Insert --
CREATE TRIGGER AddLoyaltyPoints
ON Orders
AFTER INSERT
AS
BEGIN
    UPDATE c
    SET c.LoyaltyPoints = c.LoyaltyPoints + (gs.TotalAmount / 1000)
    FROM Customer c
    JOIN inserted i ON c.CustomerID = i.CustomerID
    CROSS APPLY dbo.GetOrderSummary(i.OrderID) gs
    WHERE i.OrderStatus IN ('Confirmed', 'Delivered');
END;
GO

-- Trigger 2: Enforce Business Rule — Salary Hierarchy
CREATE TRIGGER CheckManagerSalary
ON Employee
INSTEAD OF UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Check for manager salary violations
    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE i.Position = 'Store Manager'
        AND EXISTS (
            SELECT 1
            FROM Employee e
            WHERE e.StoreID = i.StoreID
            AND e.Position <> 'Store Manager'
            AND e.Salary >= i.Salary
            AND e.EmployeeID <> ISNULL(i.EmployeeID, 0)
        )
    )
    BEGIN
        RAISERROR('Error: Manager salary must be higher than all other employees in the same store.', 16, 1);
        RETURN;
    END

    -- If no violations, perform the actual insert/update
    IF EXISTS (SELECT 1 FROM deleted)
    BEGIN
        -- This is an UPDATE
        UPDATE e
        SET EmployeeName = i.EmployeeName,
            StoreID = i.StoreID,
            Department = i.Department,
            Position = i.Position,
            Salary = i.Salary,
            IsActive = i.IsActive
        FROM Employee e
        INNER JOIN inserted i ON e.EmployeeID = i.EmployeeID;
    END
    ELSE
    BEGIN
        -- This is an INSERT
        INSERT INTO Employee (EmployeeName, StoreID, Department, Position, Salary, IsActive)
        SELECT EmployeeName, StoreID, Department, Position, Salary, IsActive
        FROM inserted;
    END
END;
GO

-- Trigger 3: Prevent from Deletion of Invalid Product
CREATE TRIGGER PreventProductDeletion
ON Product
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if any products to be deleted are referenced in order items
    IF EXISTS (
        SELECT 1
        FROM deleted d
        WHERE EXISTS (SELECT 1 FROM OrderItem oi WHERE oi.ProductID = d.ProductID)
    )
    BEGIN
        DECLARE @ProductID VARCHAR(10);
        DECLARE @ProductName VARCHAR(100);
        DECLARE @OrderCount INT;

        -- Get details of first product that has orders
        SELECT TOP 1
            @ProductID = d.ProductID,
            @ProductName = d.ProductName,
            @OrderCount = (SELECT COUNT(*) FROM OrderItem WHERE ProductID = d.ProductID)
        FROM deleted d
        WHERE EXISTS (SELECT 1 FROM OrderItem oi WHERE oi.ProductID = d.ProductID);

        RAISERROR('Cannot delete product "%s" (ID: %s) - referenced in %d order(s). Set IsActive to 0 instead.', 16, 1, @ProductName, @ProductID, @OrderCount);
        RETURN;
    END

    -- Check if trying to delete active products
    IF EXISTS (SELECT 1 FROM deleted WHERE IsActive = 1)
    BEGIN
        RAISERROR('Cannot delete active products. Set IsActive to 0 first.', 16, 1);
        RETURN;
    END

    -- Only allow deletion of inactive products with no orders
    DELETE p
    FROM Product p
    INNER JOIN deleted d ON p.ProductID = d.ProductID
    WHERE p.IsActive = 0
      AND NOT EXISTS (SELECT 1 FROM OrderItem oi WHERE oi.ProductID = p.ProductID);

    PRINT CAST(@@ROWCOUNT AS VARCHAR) + ' product(s) deleted successfully.';
END;
GO

-- Trigger 4: Prevent from Deletion of Invalid Employee
CREATE TRIGGER PreventEmployeeDeletion
ON Employee
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if trying to delete active employees
    IF EXISTS (SELECT 1 FROM deleted WHERE IsActive = 1)
    BEGIN
        DECLARE @ActiveCount INT;
        SELECT @ActiveCount = COUNT(*) FROM deleted WHERE IsActive = 1;

        RAISERROR('Cannot delete %d active employee(s). Set IsActive to 0 first.', 16, 1, @ActiveCount);
        RETURN;
    END

    -- Only allow deletion of inactive employees with explicit WHERE
    DELETE e
    FROM Employee e
    INNER JOIN deleted d ON e.EmployeeID = d.EmployeeID
    WHERE e.IsActive = 0;

    PRINT CAST(@@ROWCOUNT AS VARCHAR) + ' inactive employee(s) deleted successfully.';
END;
GO

--Trigger 5: Prevent from Deletion of Invalid Customer
CREATE TRIGGER PreventCustomerDeletion
ON Customer
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if any customers to be deleted have orders
    IF EXISTS (
        SELECT 1
        FROM deleted d
        WHERE EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerID = d.CustomerID)
    )
    BEGIN
        DECLARE @CustomerID VARCHAR(10);
        DECLARE @CustomerName VARCHAR(100);
        DECLARE @OrderCount INT;

        -- Get details of first customer that has orders
        SELECT TOP 1
            @CustomerID = d.CustomerID,
            @CustomerName = d.CustomerName,
            @OrderCount = (SELECT COUNT(*) FROM Orders WHERE CustomerID = d.CustomerID)
        FROM deleted d
        WHERE EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerID = d.CustomerID);

        RAISERROR('Cannot delete customer "%s" (ID: %s) - has %d order(s). Set IsActive to 0 instead.', 16, 1, @CustomerName, @CustomerID, @OrderCount);
        RETURN;
    END

    -- Check if trying to delete active customers
    IF EXISTS (SELECT 1 FROM deleted WHERE IsActive = 1)
    BEGIN
        RAISERROR('Cannot delete active customers. Set IsActive to 0 first.', 16, 1);
        RETURN;
    END

    -- Only allow deletion of inactive customers with no orders
    DELETE c
    FROM Customer c
    INNER JOIN deleted d ON c.CustomerID = d.CustomerID
    WHERE c.IsActive = 0
      AND NOT EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerID = c.CustomerID);

    PRINT CAST(@@ROWCOUNT AS VARCHAR) + ' customer(s) deleted successfully.';
END;
GO