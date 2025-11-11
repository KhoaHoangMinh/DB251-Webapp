from typing import Annotated
from fastapi import Depends

from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker, declarative_base, Session
import os
import pyodbc

"""
   URL_DATABASE="mssql+pyodbc://SA:YourPassword@localhost/database_name?driver=ODBC+Driver+17+for+SQL+Server&TrustServerCertificate=yes"
"""

URL_DATABASE=\
    "mssql+pyodbc://sa:Truong%40675@localhost,1433/database_webapp?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes"

engine = create_engine(URL_DATABASE, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]