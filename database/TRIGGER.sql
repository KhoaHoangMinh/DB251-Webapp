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
