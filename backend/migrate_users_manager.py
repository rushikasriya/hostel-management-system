import psycopg2
from application_properties import localhost

conn = localhost()
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE users ADD COLUMN manager_id INTEGER DEFAULT NULL;")
    print("Added manager_id to users.")
except Exception as e:
    print(f"Error adding manager_id to users (maybe it exists?): {e}")

conn.commit()
conn.close()
