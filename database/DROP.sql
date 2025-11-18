USE database_webapp;


DROP TABLE OrderItem;
DROP TABLE Employee;
DROP TABLE Orders;
DROP TABLE Product;
DROP TABLE Store;
DROP TABLE Customer;

DROP SEQUENCE Seq_CustomerID;
DROP SEQUENCE Seq_EmployeeID;
DROP SEQUENCE Seq_OrderID;
DROP SEQUENCE Seq_ProductID;
DROP SEQUENCE Seq_StoreID;

DROP FUNCTION GetCustomerTotalSpending;
DROP FUNCTION GetAveragePriceByStore;
DROP FUNCTION GetOrderSummary;

DROP PROCEDURE GetTopCustomers;
DROP PROCEDURE UpdateStockAfterOrder;
DROP PROCEDURE GetOrderProductDetails;

DROP TRIGGER AddLoyaltyPoints;
DROP TRIGGER CheckManagerSalary;

use master go
alter database database_webapp set single_user with rollback immediate
drop database database_webapp