from sqlalchemy import Column, ForeignKey, Integer, String, Date, TIMESTAMP, CheckConstraint, TIME
from sqlalchemy.dialects.mssql.information_schema import constraints
from sqlalchemy.ext.declarative import declarative_base
from database import Base

class Customer(Base):
    __tablename__ = 'Customer'

    CustomerID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Age = Column(Integer, nullable=False)
    DateOfBirth = Column(Date)
    CustomerName = Column(String(100), nullable=False)
    Email = Column(String(100), nullable=False, unique=True)
    Phone = Column(String(10), nullable=False, unique=True)
    __table_args__ = (
        CheckConstraint('Age >= 18', name='check_age_more_than_18'),
    )

class Product(Base):
    __tablename__ = 'Product'

    ProductIP = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ProductName = Column(String(100), nullable=False, unique=True)
    ProductDescription = Column(String(1000))

class Order(Base):
    __tablename__ = 'Order'

    OrderID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    CustomerID = Column(Integer, ForeignKey('Customer.CustomerID'))
    TotalQty = Column(Integer, nullable=False)
    __table_args__ = (
        CheckConstraint('TotalQty > 0', name='check_totalqty_over_0'),
    )
    DateOrder = Column(TIMESTAMP)

class Store(Base):
    __tablename__ = 'Store'

    StoreID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    StoreName = Column(String(100), nullable=False)
    StoreAddress = Column(String(100), nullable=False)
    OpeningHour = Column(TIME)
    ClosingHour = Column(TIME)
    PhoneNumber = Column(String(10), nullable=False, unique=True)

class Employee(Base):
    __tablename__ = 'Staff'

    EmployeeID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    StoreID = Column(Integer, ForeignKey('Store.StoreID'))
    Department = Column(String(100), nullable=False)
    Position = Column(String(20), nullable=False)

class OrderItem(Base):
    __tablename__ = 'OrderItem'

    OrderID = Column(Integer, ForeignKey('Order.OrderID'), primary_key=True)
    ProductID = Column(Integer, ForeignKey('Product.ProductID'), primary_key=True)
