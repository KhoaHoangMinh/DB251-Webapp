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
        SUM(o.TotalAmount) AS TotalSpent
    FROM Customer c
    JOIN Orders o ON c.CustomerID = o.CustomerID
    WHERE o.OrderStatus IN ('Confirmed', 'Delivered', 'Shipped')
    GROUP BY c.CustomerID, c.CustomerName
    HAVING SUM(o.TotalAmount) > 0
    ORDER BY TotalSpent DESC;
END;
GO

EXEC GetTopCustomers @TopN = 5;
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

EXEC UpdateStockAfterOrder 'ORD0001';
