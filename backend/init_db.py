import sqlite3
import os

def init_db():
    db_path = os.path.join(os.path.dirname(__file__), 'hostel_management.db')
    # If the file exists, delete it so we start fresh with the exact MySQL dump data
    if os.path.exists(db_path):
        os.remove(db_path)

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE beds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      bed_no TEXT NOT NULL,
      status TEXT DEFAULT 'Vacant'
    );

    CREATE TABLE blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hostel_id INTEGER DEFAULT NULL,
      block_name TEXT NOT NULL,
      manager_id INTEGER DEFAULT NULL,
      block_incharge_id INTEGER DEFAULT NULL
    );

    CREATE TABLE floors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      block_id INTEGER NOT NULL,
      floor_name TEXT NOT NULL,
      incharge_id INTEGER DEFAULT NULL
    );

    CREATE TABLE hostels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hostel_name TEXT DEFAULT NULL,
      hostel_code TEXT DEFAULT NULL,
      location_id INTEGER DEFAULT NULL,
      status TEXT DEFAULT NULL
    );

    CREATE TABLE locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT DEFAULT NULL
    );

    CREATE TABLE roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_name TEXT DEFAULT NULL,
      status TEXT DEFAULT NULL
    );

    CREATE TABLE rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      floor_id INTEGER NOT NULL,
      room_no TEXT NOT NULL
    );

    CREATE TABLE tenants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_name TEXT NOT NULL,
      phone TEXT DEFAULT NULL,
      emergency_phone TEXT DEFAULT NULL,
      designation TEXT DEFAULT NULL,
      address TEXT,
      bed_id INTEGER DEFAULT NULL,
      fee REAL DEFAULT NULL,
      joining_date DATE DEFAULT NULL
    );

    CREATE TABLE users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      contact_no TEXT DEFAULT NULL,
      role_id INTEGER DEFAULT NULL,
      email_id TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      status TEXT DEFAULT NULL
    );
    """)

    # --- INSERT DATA EXACTLY AS PROVIDED FROM MYSQL DUMP ---
    
    cursor.executescript("""
    insert into roles (id,role_name,status) values 
    (1,'superAdmin','T'),
    (2,'admin','T'),
    (3,'manager','T'),
    (4,'blockIncharge','T'),
    (5,'floorIncharge','T');

    insert into users (user_id,user_name,contact_no,role_id,email_id,password,status) values 
    (2,'rushika','8686867888',1,'rushikasriya.pendurthi@gmail.com','123456','T');
    """)

    conn.commit()
    conn.close()
    print("Database initialized successfully!")

if __name__ == '__main__':
    init_db()
