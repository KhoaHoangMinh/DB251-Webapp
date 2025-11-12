USE database_webapp;
GO
-- Function 1: Get Customer Total Spending by CustomerID --

CREATE FUNCTION GetCustomerTotalSpending(@CustomerID VARCHAR(10))
RETURNS DECIMAL(10,2)
AS
BEGIN
    DECLARE @TotalSpending DECIMAL(10,2);

    IF NOT EXISTS (SELECT 1 FROM Customer WHERE CustomerID = @CustomerID)
    BEGIN
        RETURN -1; -- invalid customer
    END

    SELECT @TotalSpending = ISNULL(SUM(TotalAmount), 0)
    FROM Orders
    WHERE CustomerID = @CustomerID
      AND OrderStatus IN ('Confirmed', 'Delivered', 'Shipped');

    RETURN @TotalSpending;
END;
GO

SELECT dbo.GetCustomerTotalSpending('CUS0001') AS TotalSpent;
GO

-- Function 2: Get Average Product Price by StoreID --

CREATE FUNCTION GetAveragePriceByStore(@StoreID VARCHAR(10))
RETURNS DECIMAL(10,2)
AS
BEGIN
    DECLARE @AvgPrice DECIMAL(10,2);

    IF NOT EXISTS (SELECT 1 FROM Store WHERE StoreID = @StoreID)
    BEGIN
        RETURN -1; -- invalid store
    END

    SELECT @AvgPrice = AVG(oi.UnitPrice)
    FROM Orders o
         JOIN OrderItem oi ON o.OrderID = oi.OrderID
    WHERE o.StoreID = @StoreID;

    RETURN ISNULL(@AvgPrice, 0);
END;
GO

SELECT dbo.GetAveragePriceByStore('STO0003') AS AvgPrice;
GO