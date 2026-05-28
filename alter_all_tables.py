from backend.application_properties import localhost

def alter_all_tables():
    conn = localhost()
    cursor = conn.cursor()
    tables = ["hostels", "blocks", "floors", "rooms", "beds", "tenants"]
    for table in tables:
        try:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN photo_url TEXT;")
            conn.commit()
            print(f"Added photo_url to {table}")
        except Exception as e:
            print(f"Error for {table}: {e}")
            conn.rollback()
    conn.close()

if __name__ == '__main__':
    alter_all_tables()
