import psycopg2
import psycopg2.extras
import os

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME = "dfpvrqwqf"
CLOUDINARY_API_KEY = "572918385877734"
CLOUDINARY_API_SECRET = "HBWYY"

def localhost():
    # External connection for local development, internal logic for Render
    # Note: dpg-d8aqq76l51nc73f6601g-a is the internal hostname. 
    # For local testing, we need the external connection string if available, 
    # but we will try the provided credentials which might work if running in Render.
    
    # We will use the provided DB details directly.
    # Note: If running locally, this may fail if the hostname is internal-only.
    # We can handle local testing by falling back to SQLite if needed, but the user explicitly requested this database.
    try:
        conn = psycopg2.connect(
            host="dpg-d8aqq76l51nc73f6601g-a.oregon-postgres.render.com", # Added suffix for external access just in case
            database="hostel_management_16ke",
            user="admin",
            password="tTcunYPYcoc8AASwHka0wv1rx6ku6xva",
            port=5432
        )
    except psycopg2.OperationalError:
        # Fallback to internal hostname if external fails (e.g. running inside Render)
        conn = psycopg2.connect(
            host="dpg-d8aqq76l51nc73f6601g-a",
            database="hostel_management_16ke",
            user="admin",
            password="tTcunYPYcoc8AASwHka0wv1rx6ku6xva",
            port=5432
        )
    
    class PostgresConnectionWrapper:
        def __init__(self, conn):
            self.conn = conn
        def cursor(self, *args, **kwargs):
            if 'cursor_factory' not in kwargs:
                kwargs['cursor_factory'] = psycopg2.extras.RealDictCursor
            return self.conn.cursor(*args, **kwargs)
        def commit(self):
            self.conn.commit()
        def close(self):
            self.conn.close()
    
    return PostgresConnectionWrapper(conn)
