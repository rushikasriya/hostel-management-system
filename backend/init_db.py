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
    insert into beds (id,room_id,bed_no,status) values 
    (1,1,'101A-1','Occupied'),
    (2,1,'101A-2','Occupied'),
    (3,2,'102A-1','Occupied'),
    (4,2,'102A-2','Occupied'),
    (5,3,'103A-1','Occupied'),
    (6,4,'201A-1','Occupied'),
    (7,5,'202A-1','Occupied'),
    (8,6,'203A-1','Vacant'),
    (9,7,'101B-1','Occupied'),
    (10,8,'102B-1','Occupied'),
    (11,5,'202A-2','Occupied');

    insert into blocks (id,hostel_id,block_name,manager_id,block_incharge_id) values 
    (1,1,'Block-A',3,5),
    (2,1,'Block-B',3,7);

    insert into floors (id,block_id,floor_name,incharge_id) values 
    (1,1,'floor_A1',6),
    (2,1,'floor_A2',8),
    (3,2,'floor_B1',9),
    (4,2,'floor_B2',10);

    insert into hostels (id,hostel_name,location_id,status) values 
    (1,'Royal Haven',1,'T'),
    (2,'Royal Queens',1,'T');

    insert into locations (id,location) values 
    (1,'Hoodi');

    insert into roles (id,role_name,status) values 
    (1,'superAdmin','T'),
    (2,'admin','T'),
    (3,'manager','T'),
    (4,'blockIncharge','T'),
    (5,'floorIncharge','T');

    insert into rooms (id,floor_id,room_no) values 
    (1,1,'101A'),
    (2,1,'102A'),
    (3,1,'103A'),
    (4,2,'201A'),
    (5,2,'202A'),
    (6,2,'203A'),
    (7,3,'101B'),
    (8,3,'102B'),
    (9,3,'103B'),
    (10,4,'201B'),
    (11,4,'202B'),
    (12,4,'203B');

    insert into tenants (id,tenant_name,phone,emergency_phone,designation,address,bed_id,fee,joining_date) values 
    (1,'Rahul Sharma','9876543210','9123456780','Software Engineer','Bangalore, Karnataka',1,7500.00,'2026-01-15'),
    (2,'Priya Reddy','9988776655','9012345678','Data Analyst','Hyderabad, Telangana',2,8000.00,'2026-02-10'),
    (3,'Arjun Kumar','9871234567','9090909090','UI Developer','Chennai, Tamil Nadu',3,7000.00,'2026-03-05'),
    (4,'Sneha Patel','9811122233','9887766554','HR Executive','Pune, Maharashtra',4,6500.00,'2026-04-01'),
    (5,'Vikram Singh','9700011122','9665544332','Network Engineer','Delhi',5,8500.00,'2026-05-12'),
    (6,'Priyanshu','6725676988','8766756756','Devops Engineer','UP\r\n',6,8500.00,'2026-05-12'),
    (7,'Vinay','6725676988','8766756756','Backend Engineer','Andhra\r\n',7,8500.00,'2026-05-12'),
    (8,'Vinay','6725676988','8766756756','Backend Engineer','Andhra\r\n',9,8500.00,'2026-05-12'),
    (9,'Vinay','6725676988','8766756756','Backend Engineer','Andhra\r\n',10,8500.00,'2026-05-12');

    insert into users (user_id,user_name,contact_no,role_id,email_id,password,status) values 
    (1,'dwijesh','8500784889',1,'dwijesh@gmail.comm','123456','T'),
    (2,'rushika','8686867888',2,'rushikasriya.pendurthi@gmail.com','123456','T'),
    (3,'bhaskar','9876543212',3,'bhaskar@gmail.com','123456','T'),
    (5,'renu','8765212309',4,'renu@gmail.com','123456','T'),
    (6,'padma','8765212309',5,'padma@gmail.com','123456','T'),
    (7,'rama','8765212309',4,'rama@gmail.com','123456','T'),
    (8,'sudha','8765212309',5,'sudha@gmail.com','123456','T'),
    (9,'anuradha','8765212309',5,'anuradha@gmail.com','123456','T'),
    (10,'mallika','8765212309',5,'mallika@gmail.com','123456','T');
    """)

    conn.commit()
    conn.close()
    print("MySQL dump successfully migrated to SQLite: hostel_management.db")

if __name__ == '__main__':
    init_db()
