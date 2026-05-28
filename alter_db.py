from backend.application_properties import localhost

def alter_db():
    conn = localhost()
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN address TEXT;")
        conn.commit()
        print("Column address added to users table.")
    except Exception as e:
        print(f"Error altering table: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    alter_db()
