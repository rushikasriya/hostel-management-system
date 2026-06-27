import psycopg2
from application_properties import localhost

def wipe_data():
    conn = localhost()
    cursor = conn.cursor()
    
    tables_to_wipe = [
        'hostels',
        'blocks',
        'floors',
        'rooms',
        'beds',
        'tenants',
        'locations',
        'bed_history',
        'attendance'
    ]
    
    for table in tables_to_wipe:
        try:
            cursor.execute(f"DELETE FROM {table};")
            print(f"Cleared table: {table}")
        except Exception as e:
            conn.rollback() # Rollback transaction if table doesn't exist
            print(f"Skipping table {table} (maybe doesn't exist): {e}")

    # Optionally, we should also clear references from users to these deleted blocks/hostels?
    # Wait, users table only has role_id and manager_id. So users are completely independent.
    
    conn.commit()
    conn.close()
    print("Data wiped successfully! (Users intact)")

if __name__ == '__main__':
    wipe_data()
