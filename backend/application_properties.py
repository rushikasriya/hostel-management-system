import psycopg2
import psycopg2.extras
import os
from dotenv import load_dotenv

# Load environment variables
base_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(base_dir, ".env"))

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

def localhost():
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        conn = psycopg2.connect(db_url)
    else:
        host = os.getenv("DB_HOST")
        database = os.getenv("DB_NAME")
        user = os.getenv("DB_USER")
        password = os.getenv("DB_PASSWORD")
        port = int(os.getenv("DB_PORT", "5432"))
        
        try:
            conn = psycopg2.connect(
                host=host,
                database=database,
                user=user,
                password=password,
                port=port
            )
        except psycopg2.OperationalError as e:
            # Fallback to internal host if configured
            internal_host = os.getenv("DB_HOST_INTERNAL")
            if internal_host:
                conn = psycopg2.connect(
                    host=internal_host,
                    database=database,
                    user=user,
                    password=password,
                    port=port
                )
            else:
                raise e
    
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
