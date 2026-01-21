import sys
import os

# Añade la ruta del proyecto
sys.path.append('/home/ShalomCarService/Shalom-Car-Service/backend')

# Establece la variable de entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalom_backend.settings')

# Activa el entorno virtual
activate_this = '/home/ShalomCarService/Shalom-Car-Service/venv/bin/activate_this.py'
with open(activate_this) as file_:
    exec(file_.read(), dict(__file__=activate_this))

# Importa la aplicación WSGI
def application(environ, start_response):
    from django.core.wsgi import get_wsgi_application
    return get_wsgi_application()(environ, start_response)
