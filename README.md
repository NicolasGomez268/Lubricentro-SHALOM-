# Shalom Car Service - Sistema de Gestión

Sistema profesional de gestión para lubricentro y gomería.

## 📋 Stack Tecnológico

- **Backend**: Django 5.0 + Django Rest Framework + JWT
- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons
- **Base de Datos**: SQLite (desarrollo) / PostgreSQL (producción)

## 🎨 Paleta de Colores

- **Gris** (`#374151`): Fondos y profesionalismo
- **Rojo** (`#DC2626`): Acentos, botones de acción y alertas
- **Blanco** (`#FFFFFF`): Claridad y espacios de trabajo
- **Gris Claro** (`#F3F4F6`): Fondos secundarios

## 🚀 Instalación y Configuración

### Backend (Django)

```powershell
# Navegar a la carpeta del backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
.\venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Copiar archivo de configuración
cp .env.example .env

# Aplicar migraciones
python manage.py makemigrations
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar servidor de desarrollo
python manage.py runserver
```

El backend estará disponible en: `http://localhost:8000`

### Frontend (React)

```powershell
# Abrir nueva terminal y navegar a la carpeta del frontend
cd frontend

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Ejecutar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 👤 Usuarios de Prueba

Después de crear el superusuario, puedes crear usuarios adicionales desde:
- Django Admin: `http://localhost:8000/admin`
- API Endpoint: `POST http://localhost:8000/api/auth/register/`

### Roles del Sistema

1. **ADMIN (Administrador)**
   - Gestión completa de stock
   - Edición de precios
   - Métricas de balance mensual
   - Visualización de todas las órdenes

2. **EMPLOYEE (Empleado)**
   - Registro rápido de clientes
   - Búsqueda por patente
   - Carga de servicios
   - Impresión de órdenes

## 📁 Estructura del Proyecto

```
Shalom Car Service/
├── backend/
│   ├── shalom_backend/       # Configuración principal
│   ├── accounts/              # Gestión de usuarios y autenticación
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/        # Componentes reutilizables
    │   ├── context/           # Contextos de React
    │   ├── pages/             # Páginas principales
    │   ├── services/          # Servicios API
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js     # Configuración de Tailwind
    └── package.json
```

## 🔐 API Endpoints (Fase 1)

### Autenticación

- `POST /api/auth/login/` - Iniciar sesión
- `POST /api/auth/refresh/` - Refrescar token
- `POST /api/auth/register/` - Registrar usuario
- `GET /api/auth/profile/` - Obtener perfil
- `PATCH /api/auth/profile/` - Actualizar perfil
- `GET /api/auth/check/` - Verificar autenticación
- `GET /api/auth/users/` - Lista de usuarios (Admin)

## 📝 Estado Actual - Fase 1 ✅

### Completado

- ✅ Configuración de VS Code
- ✅ Modelo CustomUser con roles (Admin/Employee)
- ✅ Sistema de autenticación JWT
- ✅ Layout de React con Tailwind
- ✅ Paleta de colores implementada (Gris, Rojo, Blanco)
- ✅ Sistema de login funcional
- ✅ Dashboard básico para Admin y Empleado
- ✅ Protección de rutas por roles

## 🎯 Próximas Fases

### Fase 2: Inventario
- Gestión de productos (Aceites, Filtros)
- Admin gestiona stock
- Empleado consulta productos

### Fase 3: CRM & Vehículos
- Registro de Clientes y Autos
- Buscador por Patente
- Historial de servicios

### Fase 4: Órdenes de Trabajo
- Formulario de servicio completo
- Descuento automático de stock
- Sistema de impresión Wi-Fi

### Fase 5: Dashboard & Métricas
- Métricas financieras
- Reportes mensuales
- Gráficos de rendimiento

## 🛠️ Tecnologías y Librerías

### Backend
- Django 5.0
- Django Rest Framework 3.14
- Simple JWT 5.3
- Django CORS Headers 4.3
- Python Decouple 3.8

### Frontend
- React 18.2
- React Router DOM 6.21
- Axios 1.6
- Lucide React 0.309
- JWT Decode 4.0
- Tailwind CSS 3.4

## 📞 Soporte

Para cualquier consulta sobre el desarrollo del sistema, consulta la documentación de las fases siguientes.

---

**© 2026 Shalom Car Service - Sistema de Gestión Profesional**
