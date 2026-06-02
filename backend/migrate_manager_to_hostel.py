import psycopg2
from application_properties import localhost

conn = localhost()
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE hostels ADD COLUMN manager_id INTEGER DEFAULT NULL;")
    print("Added manager_id to hostels.")
except Exception as e:
    print(f"Error adding manager_id to hostels: {e}")

try:
    cursor.execute("""
    UPDATE hostels
    SET manager_id = (
        SELECT manager_id FROM blocks 
        WHERE blocks.hostel_id = hostels.id AND manager_id IS NOT NULL 
        LIMIT 1
    )
    WHERE manager_id IS NULL;
    """)
    print("Migrated existing manager_ids from blocks to hostels.")
except Exception as e:
    print(f"Error migrating data: {e}")

try:
    cursor.execute("ALTER TABLE blocks DROP COLUMN manager_id;")
    print("Dropped manager_id from blocks.")
except Exception as e:
    print(f"Error dropping manager_id from blocks: {e}")

conn.commit()
conn.close()
