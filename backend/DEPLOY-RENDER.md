# Render deployment instructions for Django backend

1. Ve a https://render.com y crea una cuenta.
2. Haz clic en "New Web Service" y conecta tu repositorio de GitHub.
3. Selecciona la carpeta `backend` como root.
4. Configura los siguientes parámetros:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn shalom_backend.wsgi`
5. Variables de entorno recomendadas:
   - `DJANGO_SETTINGS_MODULE=shalom_backend.settings`
   - `SECRET_KEY=tu_clave_secreta`
   - `DEBUG=False`
   - Configura la base de datos (Render ofrece PostgreSQL gratis, ajusta settings.py para usarla)
6. Para archivos estáticos y media:
   - Usa WhiteNoise o configura almacenamiento externo (S3, Azure Blob, etc.)
7. Render detecta automáticamente el puerto.
8. Haz clic en "Create Web Service" y espera el despliegue.

## Recomendaciones extra
- No subas `db.sqlite3` al repositorio.
- Usa PostgreSQL en producción.
- Revisa la documentación oficial de Render para Django: https://render.com/docs/deploy-django
