import sqlite3
import os

def localhost():
    db_path = os.path.join(os.path.dirname(__file__), 'hostel_management.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = lambda c, r: dict(zip([col[0] for col in c.description], r))
    return conn
