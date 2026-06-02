import os
from application_properties import localhost

def init_db():
    conn = localhost()
    cursor = conn.cursor()

    # Drop existing tables if they exist to start fresh
    cursor.execute("""
    DROP TABLE IF EXISTS beds, blocks, floors, hostels, locations, roles, rooms, tenants, users CASCADE;
    """)

    cursor.execute("""
    CREATE TABLE beds (
      id SERIAL PRIMARY KEY,
      room_id INTEGER NOT NULL,
      bed_no TEXT NOT NULL,
      status TEXT DEFAULT 'Vacant',
      photo_url TEXT DEFAULT NULL
    );

    CREATE TABLE blocks (
      id SERIAL PRIMARY KEY,
      hostel_id INTEGER DEFAULT NULL,
      block_name TEXT NOT NULL,
      block_incharge_id INTEGER DEFAULT NULL,
      photo_url TEXT DEFAULT NULL
    );

    CREATE TABLE floors (
      id SERIAL PRIMARY KEY,
      block_id INTEGER NOT NULL,
      floor_name TEXT NOT NULL,
      incharge_id INTEGER DEFAULT NULL,
      photo_url TEXT DEFAULT NULL
    );

    CREATE TABLE hostels (
      id SERIAL PRIMARY KEY,
      hostel_name TEXT DEFAULT NULL,
      hostel_code TEXT DEFAULT NULL,
      location_id INTEGER DEFAULT NULL,
      manager_id INTEGER DEFAULT NULL,
      status TEXT DEFAULT NULL,
      photo_url TEXT DEFAULT NULL
    );

    CREATE TABLE locations (
      id SERIAL PRIMARY KEY,
      location TEXT DEFAULT NULL
    );

    CREATE TABLE roles (
      id SERIAL PRIMARY KEY,
      role_name TEXT DEFAULT NULL,
      status TEXT DEFAULT NULL
    );

    CREATE TABLE rooms (
      id SERIAL PRIMARY KEY,
      floor_id INTEGER NOT NULL,
      room_no TEXT NOT NULL,
      photo_url TEXT DEFAULT NULL
    );

    CREATE TABLE tenants (
      id SERIAL PRIMARY KEY,
      tenant_name TEXT NOT NULL,
      phone TEXT DEFAULT NULL,
      emergency_phone TEXT DEFAULT NULL,
      designation TEXT DEFAULT NULL,
      address TEXT,
      bed_id INTEGER DEFAULT NULL,
      fee REAL DEFAULT NULL,
      joining_date DATE DEFAULT NULL,
      photo_url TEXT DEFAULT NULL
    );

    CREATE TABLE users (
      user_id SERIAL PRIMARY KEY,
      user_name TEXT NOT NULL,
      contact_no TEXT DEFAULT NULL,
      address TEXT,
      role_id INTEGER DEFAULT NULL,
      email_id TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      status TEXT DEFAULT NULL,
      photo_url TEXT DEFAULT NULL
    );
    """)

    # --- INSERT DATA EXACTLY AS PROVIDED FROM MYSQL DUMP ---
    
    cursor.execute("""
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
