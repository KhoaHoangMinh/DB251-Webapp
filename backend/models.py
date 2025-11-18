from sqlalchemy import Column, String, Integer, Date, DateTime, Time, Boolean, DECIMAL, Text, CheckConstraint, \
    ForeignKey, Sequence, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


# ------------------------------------------------------------
# CUSTOMER
# ------------------------------------------------------------
class Customer(Base):
    __tablename__ = "Customer"

    CustomerID = Column(
        String(10),
        primary_key=True,
        server_default=text(
            "('CUS' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_CustomerID AS VARCHAR(4)), 4))"
        ),
        nullable=False,
    )
    Age = Column(Integer, nullable=False)
    DateOfBirth = Column(Date, nullable=False)
    CustomerName = Column(String(100), nullable=False)
    Email = Column(String(100), unique=True, nullable=False)
    Phone = Column(String(20), unique=True, nullable=False)
    RegistrationDate = Column(DateTime, server_default=func.current_timestamp())
    IsActive = Column(Boolean, server_default="1")
    LoyaltyPoints = Column(Integer, nullable=False, server_default="0")

    __table_args__ = (
        CheckConstraint("Age >= 18", name="checkAge"),
        CheckConstraint("LoyaltyPoints >= 0", name="checkLoyaltyPoints"),
    )

    orders = relationship("Orders", back_populates="customer", cascade="all, delete")


# ------------------------------------------------------------
# STORE
# ------------------------------------------------------------
class Store(Base):
    __tablename__ = "Store"

    StoreID = Column(
        String(10),
        primary_key=True,
        server_default=text(
            "('STO' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_StoreID AS VARCHAR(4)), 4))"
        ),
        nullable=False,
    )
    StoreName = Column(String(100), nullable=False)
    StoreAddress = Column(String(255), unique=True, nullable=False)
    OpeningHour = Column(Time, nullable=False)
    ClosingHour = Column(Time, nullable=False)
    PhoneNumber = Column(String(20), unique=True, nullable=False)
    Email = Column(String(100))
    IsActive = Column(Boolean, server_default="1")

    __table_args__ = (
        CheckConstraint("ClosingHour > OpeningHour", name="checkHours"),
    )

    employees = relationship("Employee", back_populates="store", cascade="all, delete")
    orders = relationship("Orders", back_populates="store", cascade="all, delete")


# ------------------------------------------------------------
# EMPLOYEE
# ------------------------------------------------------------
class Employee(Base):
    __tablename__ = "Employee"

    employeeID = Column(
        String(10),
        primary_key=True,
        server_default=text(
            "('EMP' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_EmployeeID AS VARCHAR(4)), 4))"
        ),
        nullable=False,
    )
    employeeName = Column(String(100), nullable=False)
    storeID = Column(String(10), ForeignKey("Store.StoreID", ondelete="CASCADE"), nullable=False)
    department = Column(String(50), nullable=False)
    position = Column(String(50), nullable=False)
    isActive = Column(Boolean, server_default="1")
    salary = Column(DECIMAL(10, 2))

    __table_args__ = (
        CheckConstraint("Salary >= 0", name="checkSalary"),
    )

    store = relationship("Store", back_populates="employees")


# ------------------------------------------------------------
# PRODUCT
# ------------------------------------------------------------
class Product(Base):
    __tablename__ = "Product"

    ProductID = Column(
        String(10),
        primary_key=True,
        server_default=text(
            "('PRO' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_ProductID AS VARCHAR(4)), 4))"
        ),
        nullable=False,
    )
    ProductName = Column(String(100), unique=True, nullable=False)
    ProductDescription = Column(Text)
    Price = Column(DECIMAL(10, 2), nullable=False)
    StockQuantity = Column(Integer, server_default="0")
    IsActive = Column(Boolean, server_default="1")
    CreatedDate = Column(DateTime, server_default=func.current_timestamp())

    __table_args__ = (
        CheckConstraint("Price >= 0", name="checkPrice"),
        CheckConstraint("StockQuantity >= 0", name="checkStockQuantity"),
    )

    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete")


# ------------------------------------------------------------
# ORDERS
# ------------------------------------------------------------
class Orders(Base):
    __tablename__ = "Orders"

    OrderID = Column(
        String(10),
        primary_key=True,
        server_default=text(
            "('ORD' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_OrderID AS VARCHAR(4)), 4))"
        ),
        nullable=False,
    )
    CustomerID = Column(String(10), ForeignKey("Customer.CustomerID", ondelete="CASCADE"), nullable=False)
    StoreID = Column(String(10), ForeignKey("Store.StoreID", ondelete="CASCADE"), nullable=False)
    DateOrder = Column(DateTime, server_default=func.current_timestamp())
    OrderStatus = Column(
        String(20),
        server_default="Pending"
    )

    __table_args__ = (
        CheckConstraint("OrderStatus IN "
                        "('Pending','Confirmed','Processing','Shipped','Delivered','Cancelled')",
                        name="checkStatus"),
    )

    customer = relationship("Customer", back_populates="orders")
    store = relationship("Store", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete")


# ------------------------------------------------------------
# ORDER ITEM
# ------------------------------------------------------------
class OrderItem(Base):
    __tablename__ = "OrderItem"

    OrderID = Column(String(10), ForeignKey("Orders.OrderID", ondelete="CASCADE"), primary_key=True)
    ProductID = Column(String(10), ForeignKey("Product.ProductID", ondelete="CASCADE"), primary_key=True)
    Quantity = Column(Integer, nullable=False)
    UnitPrice = Column(DECIMAL(10, 2), nullable=False)
    LineTotal = Column(DECIMAL(10, 2))

    __table_args__ = (
        CheckConstraint("Quantity > 0", name="checkQuantity"),
        CheckConstraint("UnitPrice >= 0", name="checkUnitPrice"),
    )

    order = relationship("Orders", back_populates="items")
    product = relationship("Product", back_populates="order_items")