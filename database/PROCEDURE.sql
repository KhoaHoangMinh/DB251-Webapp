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
        RETURN;
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


