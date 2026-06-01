import psycopg2
from application_properties import localhost

conn = localhost()
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    attendance_date DATE NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, attendance_date)
);
""")
conn.commit()
conn.close()
print("Attendance table created successfully!")
