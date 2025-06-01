from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv
# Load environment variables from .env file
load_dotenv()

# Define the database URL, you can also use environment variables for security
DATABASE_URL = os.getenv("DATABASE_URL","postgresql://postgres:tony6666@localhost:5432/friday") 


engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()