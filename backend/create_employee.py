import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalom_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Crear empleado
email = 'empleado@shalom.com'
password = 'empleado123'
first_name = 'Empleado'
last_name = 'Shalom'

if not User.objects.filter(email=email).exists():
    user = User.objects.create_user(
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        role='EMPLOYEE'
    )
    print(f"✅ Empleado creado exitosamente!")
    print(f"   Email: {email}")
    print(f"   Password: {password}")
    print(f"   Nombre: {user.full_name}")
    print(f"   Rol: {user.get_role_display()}")
else:
    print("⚠️ El usuario ya existe")
