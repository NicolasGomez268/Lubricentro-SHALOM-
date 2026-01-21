# Vercel deployment instructions

1. Ve a https://vercel.com y crea una cuenta si no tienes una.
2. Haz clic en "New Project" y conecta tu cuenta de GitHub/GitLab/Bitbucket.
3. Selecciona el repositorio de tu proyecto.
4. En la configuración del proyecto, selecciona la carpeta `frontend` como root.
5. Configura los siguientes comandos:
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Si usas variables de entorno, agrégalas en la sección "Environment Variables".
7. Haz clic en "Deploy".

Tu frontend estará disponible en una URL pública de Vercel.

## Backend
Vercel no soporta directamente el despliegue de backends Django/Python. Para el backend, considera opciones como:
- [Render](https://render.com)
- [Railway](https://railway.app)
- [Heroku](https://heroku.com)
- Azure, AWS, Google Cloud

Luego, configura el frontend para consumir el backend desplegado.
