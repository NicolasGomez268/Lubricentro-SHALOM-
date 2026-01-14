import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Crear tabla accounts_user
cursor.execute("""
CREATE TABLE IF NOT EXISTS accounts_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    password VARCHAR(128) NOT NULL,
    last_login DATETIME NULL,
    is_superuser BOOLEAN NOT NULL DEFAULT 0,
    email VARCHAR(254) NOT NULL UNIQUE,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    is_staff BOOLEAN NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    date_joined DATETIME NOT NULL DEFAULT (datetime('now')),
    role VARCHAR(10) NOT NULL DEFAULT 'EMPLOYEE',
    phone VARCHAR(20) NULL,
    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
)
""")

# Crear tabla de grupos de usuarios
cursor.execute("""
CREATE TABLE IF NOT EXISTS accounts_user_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES accounts_user(id),
    FOREIGN KEY (group_id) REFERENCES auth_group(id),
    UNIQUE(user_id, group_id)
)
""")

# Crear tabla de permisos de usuarios
cursor.execute("""
CREATE TABLE IF NOT EXISTS accounts_user_user_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES accounts_user(id),
    FOREIGN KEY (permission_id) REFERENCES auth_permission(id),
    UNIQUE(user_id, permission_id)
)
""")

conn.commit()
conn.close()

print("✅ Tablas creadas correctamente")
