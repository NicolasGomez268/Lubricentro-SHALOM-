import sqlite3
import os

# Conectar a la base de datos
db_path = 'db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Insertar la migración de accounts si no existe
try:
    cursor.execute("""
        INSERT INTO django_migrations (app, name, applied)
        VALUES ('accounts', '0001_initial', datetime('now'))
    """)
    conn.commit()
    print("✅ Migración de accounts agregada correctamente")
except sqlite3.IntegrityError:
    print("ℹ️ La migración ya existe")

conn.close()
print("✅ Base de datos actualizada")
