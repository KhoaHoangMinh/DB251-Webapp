from sqlalchemy import Column, String, Integer, Date, DateTime, Time, Boolean, DECIMAL, Text, CheckConstraint, ForeignKey, Sequence
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import datetime
from database import Base


class Customer(Base):
    __tablename__ = "Customer"

    CustomerID = Column(String(10), primary_key=True)
    Age = Column(Integer, nullable=False)
    DateOfBirth = Column(Date, nullable=False)
    CustomerName = Column(String(100), nullable=False)
    Email = Column(String(100), nullable=False, unique=True)
    Phone = Column(String(20), nullable=False, unique=True)
    RegistrationDate = Column(DateTime, server_default=func.now())
    IsActive = Column(Boolean, default=True)
    LoyaltyPoints = Column(Integer, default=0)

    # Relationships
    orders = relationship("Orders", back_populates="customer")

    __table_args__ = (
        CheckConstraint('Age >= 18', name='check_age'),
        CheckConstraint('LoyaltyPoints >= 0', name='check_loyalty_points'),
        CheckConstraint("Email LIKE '%_@gmail.com%'", name='check_email_format'),
    )


class Store(Base):
    __tablename__ = "Store"

    StoreID = Column(String(10), primary_key=True)
    StoreName = Column(String(100), nullable=False)
    StoreAddress = Column(String(255), nullable=False, unique=True)
    OpeningHour = Column(Time, nullable=False)
    ClosingHour = Column(Time, nullable=False)
    PhoneNumber = Column(String(20), nullable=False, unique=True)
    Email = Column(String(100))
    IsActive = Column(Boolean, default=True)

    # Relationships
    employees = relationship("Employee", back_populates="store")
    orders = relationship("Orders", back_populates="store")

    __table_args__ = (
        CheckConstraint('ClosingHour > OpeningHour', name='check_hours'),
    )


class Employee(Base):
    __tablename__ = "Employee"

    EmployeeID = Column(String(10), primary_key=True)
    EmployeeName = Column(String(100), nullable=False)
    StoreID = Column(String(10), ForeignKey('Store.StoreID'), nullable=False)
    Department = Column(String(50), nullable=False)
    Position = Column(String(50), nullable=False)
    IsActive = Column(Boolean, default=True)
    Salary = Column(DECIMAL(10, 2))

    # Relationships
    store = relationship("Store", back_populates="employees")

    __table_args__ = (
        CheckConstraint('Salary >= 0', name='check_salary'),
    )


class Product(Base):
    __tablename__ = "Product"

    ProductID = Column(String(10), primary_key=True)
    ProductName = Column(String(100), nullable=False, unique=True)
    ProductDescription = Column(Text)
    Price = Column(DECIMAL(10, 2), nullable=False)
    StockQuantity = Column(Integer, default=0)
    IsActive = Column(Boolean, default=True)
    CreatedDate = Column(DateTime, server_default=func.now())

    # Relationships
    order_items = relationship("OrderItem", back_populates="product")

    __table_args__ = (
        CheckConstraint('Price >= 0', name='check_price'),
        CheckConstraint('StockQuantity >= 0', name='check_stock_quantity'),
    )


class Orders(Base):
    __tablename__ = "Orders"

    OrderID = Column(String(10), primary_key=True)
    CustomerID = Column(String(10), ForeignKey('Customer.CustomerID'), nullable=False)
    StoreID = Column(String(10), ForeignKey('Store.StoreID'), nullable=False)
    TotalQty = Column(Integer, nullable=False)
    TotalAmount = Column(DECIMAL(10, 2))
    DateOrder = Column(DateTime, server_default=func.now())
    OrderStatus = Column(String(20), default='Pending')

    # Relationships
    customer = relationship("Customer", back_populates="orders")
    store = relationship("Store", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")

    __table_args__ = (
        CheckConstraint('TotalQty > 0', name='check_total_qty'),
        CheckConstraint('TotalAmount >= 0', name='check_total_amount'),
        CheckConstraint("OrderStatus IN ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')",
                        name='check_order_status'),
    )


class OrderItem(Base):
    __tablename__ = "OrderItem"

    OrderID = Column(String(10), ForeignKey('Orders.OrderID'), primary_key=True)
    ProductID = Column(String(10), ForeignKey('Product.ProductID'), primary_key=True)
    Quantity = Column(Integer, nullable=False)
    UnitPrice = Column(DECIMAL(10, 2), nullable=False)
    LineTotal = Column(DECIMAL(10, 2), computed='Quantity * UnitPrice')

    # Relationships
    order = relationship("Orders", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")

    __table_args__ = (
        CheckConstraint('Quantity > 0', name='check_quantity'),
        CheckConstraint('UnitPrice >= 0', name='check_unit_price'),
    )