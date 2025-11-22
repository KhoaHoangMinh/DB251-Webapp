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

    customerID = Column(
        String(10),
        primary_key=True,
        server_default=text(
            "('CUS' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_CustomerID AS VARCHAR(4)), 4))"
        ),
        nullable=False,
    )
    age = Column(Integer, nullable=False)
    dateOfBirth = Column(Date, nullable=False)
    customerName = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20), unique=True, nullable=False)
    registrationDate = Column(DateTime, server_default=func.current_timestamp())
    isActive = Column(Boolean, server_default="1")
    loyaltyPoints = Column(Integer, nullable=False, server_default="0")

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

    storeID = Column(
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
    phoneNumber = Column(String(20), unique=True, nullable=False)
    email = Column(String(100))
    isActive = Column(Boolean, server_default="1")

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
    storeID = Column(String(10), ForeignKey("Store.storeID", ondelete="CASCADE"), nullable=False)
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

    productID = Column(
        String(10),
        primary_key=True,
        server_default=text(
            "('PRO' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_ProductID AS VARCHAR(4)), 4))"
        ),
        nullable=False,
    )
    productName = Column(String(100), unique=True, nullable=False)
    productDescription = Column(Text)
    price = Column(DECIMAL(10, 2), nullable=False)
    stockQuantity = Column(Integer, server_default="0")
    isActive = Column(Boolean, server_default="1")
    createdDate = Column(DateTime, server_default=func.current_timestamp())

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

    orderID = Column(
        String(10),
        primary_key=True,
        server_default=text(
            "('ORD' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_OrderID AS VARCHAR(4)), 4))"
        ),
        nullable=False,
    )
    customerID = Column(String(10), ForeignKey("Customer.customerID", ondelete="CASCADE"), nullable=False)
    storeID = Column(String(10), ForeignKey("Store.storeID", ondelete="CASCADE"), nullable=False)
    dateOrder = Column(DateTime, server_default=func.current_timestamp())
    orderStatus = Column(
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

    orderID = Column(String(10), ForeignKey("Orders.orderID", ondelete="CASCADE"), primary_key=True)
    productID = Column(String(10), ForeignKey("Product.productID", ondelete="CASCADE"), primary_key=True)
    quantity = Column(Integer, nullable=False)
    unitPrice = Column(DECIMAL(10, 2), nullable=False)
    lineTotal = Column(DECIMAL(10, 2))

    __table_args__ = (
        CheckConstraint("Quantity > 0", name="checkQuantity"),
        CheckConstraint("UnitPrice >= 0", name="checkUnitPrice"),
    )

    order = relationship("Orders", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class CartItem(Base):
    __tablename__ = 'CartItem'

    cartID = Column(String(10), ForeignKey("Cart.cartID", ondelete="CASCADE"), primary_key=True)
    productID = Column(String(10), ForeignKey("Product.productID", ondelete="CASCADE"), primary_key=True)
    quantity = Column(Integer, nullable=False)
    unitPrice = Column(DECIMAL(10, 2), nullable=False)
    lineTotal = Column(DECIMAL(10, 2))

    __table_args__ = (
        CheckConstraint("quantity > 0", name="checkQuantity"),
        CheckConstraint("unitPrice >= 0", name="checkUnitPrice"),
    )

class Cart(Base):
    __tablename__ = 'Cart'

    cartID = Column(
        String(10),
        primary_key=True,
        server_default=text(
            "('CRT' + RIGHT('0000' + CAST(NEXT VALUE FOR Seq_OrderID AS VARCHAR(4)), 4))"
        ),
        nullable=False,
    )
    customerID = Column(String(10), ForeignKey("Customer.customerID", ondelete="CASCADE"), nullable=False)