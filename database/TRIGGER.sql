USE database_webapp;
GO

-- Trigger 1: Auto-update Loyalty Points After Order Insert --
CREATE TRIGGER AddLoyaltyPoints
ON Orders
AFTER INSERT
AS
BEGIN
    UPDATE c
    SET c.LoyaltyPoints = c.LoyaltyPoints + (i.TotalAmount / 1000)
    FROM Customer c
    JOIN inserted i ON c.CustomerID = i.CustomerID
    WHERE i.OrderStatus IN ('Confirmed', 'Delivered');
END;
GO


-- Trigger 2: Enforce Business Rule — Salary Hierarchy

CREATE TRIGGER CheckManagerSalary
ON Employee
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM Employee e
        JOIN Store s ON e.StoreID = s.StoreID
        WHERE e.Position = 'Store Manager'
        AND e.Salary <= (
            SELECT MAX(Salary)
            FROM Employee e2
            WHERE e2.StoreID = e.StoreID
              AND e2.Position <> 'Store Manager'
        )
    )
    BEGIN
        PRINT 'Error: Manager salary must be higher than other employees in the same store.';
    END
END;
GO
