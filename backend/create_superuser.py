import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalom_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Crear superusuario
email = 'admin@shalom.com'
password = 'admin123'
first_name = 'Admin'
last_name = 'Shalom'

if not User.objects.filter(email=email).exists():
    user = User.objects.create_superuser(
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )
    print(f"✅ Superusuario creado exitosamente!")
    print(f"   Email: {email}")
    print(f"   Password: {password}")
    print(f"   Rol: {user.get_role_display()}")
else:
    print("⚠️ El usuario ya existe")
