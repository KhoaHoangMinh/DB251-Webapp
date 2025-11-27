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
      AND o.OrderStatus IN ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered');

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
    WHERE o.StoreID = @StoreID
    AND o.OrderStatus IN ('Confirmed', 'Delivered', 'Shipped');

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

-- Function 4: Get SummaryStats for Employee
CREATE FUNCTION dbo.GetSummaryStatsForEmployee()
RETURNS @SummaryStats TABLE (
    total_employees INT,
    total_positions INT,
    total_departments INT,
    avg_salary DECIMAL(10,2)
)
AS
BEGIN
    DECLARE @total_employees INT;
    DECLARE @total_positions INT;
    DECLARE @total_departments INT;
    DECLARE @avg_salary DECIMAL(10,2);

    -- Get total employees
    SELECT @total_employees = COUNT(*) FROM employee;

    -- If no employees, return zeros
    IF @total_employees = 0
    BEGIN
        INSERT INTO @SummaryStats VALUES (0, 0, 0, 0);
        RETURN;
    END

    -- Get distinct positions count
    SELECT @total_positions = COUNT(DISTINCT position) FROM employee;

    -- Get distinct departments count
    SELECT @total_departments = COUNT(DISTINCT department) FROM employee;

    -- Calculate average salary
    SELECT @avg_salary = ROUND(AVG(CAST(salary AS DECIMAL(10,2))), 2) FROM employee;

    INSERT INTO @SummaryStats VALUES (@total_employees, @total_positions, @total_departments, @avg_salary);
    RETURN;
END;
GO

-- Function 5: Get SummaryStats for Customer
CREATE FUNCTION dbo.GetSummaryStatsForCustomers()
RETURNS @SummaryStats TABLE (
    total_customer INT,
    avg_age DECIMAL(10,2)
)
AS BEGIN
    DECLARE @total_customers INT;
    DECLARE @avg_age DECIMAL(10, 2)

    SELECT @total_customers = COUNT(*) FROM Customer;

    IF @total_customers = 0
    BEGIN
        INSERT INTO @SummaryStats VALUES (0, 0);
        RETURN;
    END

    SELECT @avg_age = ROUND(AVG(CAST(Age AS DECIMAL(10,2))), 2) FROM Customer;

    INSERT INTO @SummaryStats VALUES (@total_customers, @avg_age);
    RETURN;
END;
GO

-- Function 6: Calculate Estimate Delivery Date by OrderID
CREATE FUNCTION CalculateEstimatedDelivery
(
    @OrderID VARCHAR(20)
)
RETURNS DATE
AS
BEGIN
    DECLARE @EstimatedDelivery DATE;
    DECLARE @ProcessingDays INT;
    DECLARE @StoreID VARCHAR(50);
    DECLARE @OrderStatus VARCHAR(20);
    DECLARE @OrderDate DATETIME;

    SELECT
        @StoreID = StoreID,
        @OrderStatus = OrderStatus,
        @OrderDate = DateOrder
    FROM Orders
    WHERE OrderID = @OrderID

    IF @StoreID IS NULL
        RETURN NULL;

    IF @StoreID LIKE '%OUTLET%'
        SET @ProcessingDays = 5;
    ELSE IF @StoreID LIKE '%FLAGSHIP%'
        SET @ProcessingDays = 2;
    ELSE
        SET @ProcessingDays = 3;

    -- Adjust based on order status
    IF @OrderStatus IN ('Cancelled', 'Pending')
        SET @EstimatedDelivery = NULL;
    ELSE IF @OrderStatus = 'Delivered'
        SET @EstimatedDelivery = CAST(@OrderDate AS DATE);
    ELSE
        SET @EstimatedDelivery = DATEADD(DAY, @ProcessingDays, @OrderDate);

    -- Exclude weekends from delivery estimate
    WHILE @EstimatedDelivery IS NOT NULL AND DATENAME(WEEKDAY, @EstimatedDelivery) IN ('Saturday', 'Sunday')
    BEGIN
        SET @EstimatedDelivery = DATEADD(DAY, 1, @EstimatedDelivery);
    END

    RETURN @EstimatedDelivery;
END
GO