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

    SELECT @TotalSpending = ISNULL(SUM(gs.TotalAmount), 0)
    FROM Orders o
    CROSS APPLY dbo.GetOrderSummary(o.OrderID) gs
    WHERE o.CustomerID = @CustomerID
      AND o.OrderStatus IN ('Confirmed', 'Delivered', 'Shipped');

    RETURN @TotalSpending;
END;
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

--Function 3: Get Order Summary Stats by OrderID --

CREATE FUNCTION GetOrderSummary(@OrderID VARCHAR(10))
RETURNS TABLE
AS
RETURN
(
    SELECT
        oi.OrderID,
        SUM(oi.Quantity) AS TotalQuantity,
        SUM(oi.Quantity * oi.UnitPrice) AS TotalAmount
    FROM OrderItem oi
    WHERE oi.OrderID = @OrderID
    GROUP BY oi.OrderID
)
GO