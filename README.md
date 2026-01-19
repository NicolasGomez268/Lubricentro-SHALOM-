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

## 🔐 API Endpoints

### Autenticación

- `POST /api/auth/login/` - Iniciar sesión
- `POST /api/auth/refresh/` - Refrescar token
- `POST /api/auth/register/` - Registrar usuario
- `GET /api/auth/profile/` - Obtener perfil
- `PATCH /api/auth/profile/` - Actualizar perfil
- `GET /api/auth/check/` - Verificar autenticación
- `GET /api/auth/users/` - Lista de usuarios (Admin)

### Inventario

- `GET /api/inventory/products/` - Listar productos (con paginación)
- `POST /api/inventory/products/` - Crear producto (Admin)
- `GET /api/inventory/products/{id}/` - Obtener producto
- `PATCH /api/inventory/products/{id}/` - Actualizar producto (Admin)
- `DELETE /api/inventory/products/{id}/` - Eliminar producto (Admin)
- `GET /api/inventory/products/low_stock/` - Productos con stock bajo
- `GET /api/inventory/products/categories/` - Listar categorías
- `POST /api/inventory/products/{id}/adjust_stock/` - Ajustar stock (Admin)
- `GET /api/inventory/movements/` - Historial de movimientos

### CRM

- `GET /api/crm/customers/` - Listar clientes (con paginación)
- `POST /api/crm/customers/` - Crear cliente
- `GET /api/crm/customers/{id}/` - Obtener cliente
- `PATCH /api/crm/customers/{id}/` - Actualizar cliente
- `DELETE /api/crm/customers/{id}/` - Eliminar cliente
- `GET /api/crm/vehicles/` - Listar vehículos (con paginación)
- `POST /api/crm/vehicles/` - Crear vehículo
- `GET /api/crm/vehicles/{id}/` - Obtener vehículo
- `PATCH /api/crm/vehicles/{id}/` - Actualizar vehículo
- `DELETE /api/crm/vehicles/{id}/` - Eliminar vehículo
- `GET /api/crm/vehicles/search_by_plate/` - Buscar por patente
- `POST /api/crm/vehicles/{id}/update_mileage/` - Actualizar kilometraje

### Órdenes de Servicio

- `GET /api/services/orders/` - Listar órdenes (con paginación y filtros)
- `POST /api/services/orders/` - Crear orden
- `GET /api/services/orders/{id}/` - Obtener orden
- `PATCH /api/services/orders/{id}/` - Actualizar orden
- `DELETE /api/services/orders/{id}/` - Eliminar orden
- `POST /api/services/orders/{id}/complete/` - Completar orden y descontar stock
- `POST /api/services/orders/{id}/cancel/` - Cancelar orden
- `GET /api/services/orders/statistics/` - Estadísticas de órdenes

## 📝 Estado Actual del Proyecto

### ✅ Fase 1: Autenticación y Base (COMPLETADA)

- ✅ Configuración de VS Code
- ✅ Modelo CustomUser con roles (Admin/Employee)
- ✅ Sistema de autenticación JWT
- ✅ Layout de React con Tailwind
- ✅ Paleta de colores implementada (Gris, Rojo, Blanco)
- ✅ Sistema de login funcional
- ✅ Dashboard básico para Admin y Empleado
- ✅ Protección de rutas por roles

### ✅ Fase 2: Inventario (COMPLETADA + MEJORAS)

**Backend:**
- ✅ Modelo de Productos (código, nombre, categoría, marca, stock, precios)
- ✅ Modelo de Movimientos de Stock (entradas, salidas, ajustes)
- ✅ Validaciones de stock negativo
- ✅ Transacciones atómicas para evitar inconsistencias
- ✅ Paginación automática (20 items por página)
- ✅ Filtros y búsqueda avanzada
- ✅ Cálculo automático de margen de ganancia
- ✅ Alertas de stock bajo

**Frontend:**
- ✅ Gestión completa de productos (CRUD)
- ✅ Búsqueda en tiempo real por código, nombre y marca
- ✅ Filtros por categoría y estado de stock
- ✅ Validaciones de formularios (cliente y servidor)
- ✅ Ajuste de stock con validaciones
- ✅ Historial de movimientos con filtros
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Alertas visuales de stock bajo
- ✅ Rankings de productos más valiosos y mejor margen
- ✅ Interfaz responsive

### ✅ Fase 3: CRM & Vehículos (COMPLETADA)

**Backend:**
- ✅ Modelo de Clientes con validaciones (teléfono, email)
- ✅ Modelo de Vehículos con validación de patente argentina
- ✅ Relaciones Cliente-Vehículo (1 a muchos)
- ✅ Búsqueda por patente optimizada
- ✅ Actualización de kilometraje
- ✅ Estadísticas de clientes y vehículos

**Frontend:**
- ✅ Gestión de clientes (CRUD) con búsqueda
- ✅ Gestión de vehículos (CRUD) con filtros
- ✅ Página de búsqueda por patente para empleados
- ✅ Modales de confirmación personalizados (ConfirmDialog)
- ✅ Validaciones de patente y teléfono
- ✅ Interfaz responsive y profesional

### ✅ Fase 4: Órdenes de Servicio (COMPLETADA)

**Backend:**
- ✅ Modelo ServiceOrder con numeración automática (OS-00001)
- ✅ Modelo ServiceItem (productos y servicios)
- ✅ Estados: PENDING, COMPLETED, CANCELLED
- ✅ Descuento automático de stock al completar
- ✅ Registro de movimientos de stock
- ✅ Validación de stock suficiente
- ✅ Cálculo automático de totales
- ✅ Filtros por estado, patente y cliente
- ✅ Estadísticas de órdenes e ingresos

**Frontend:**
- ✅ Página de creación de orden (ServiceOrderPage)
  * Búsqueda de vehículo por patente
  * Agregar productos y servicios
  * Cálculo automático de totales
  * Vista previa e impresión
- ✅ Página de historial (ServiceOrderListPage)
  * Lista de todas las órdenes
  * Filtros por estado y patente
  * Modal de detalle completo
  * Acciones: completar, cancelar, imprimir
- ✅ Integración en Dashboard con estadísticas
- ✅ Menú de navegación actualizado
- ✅ Sistema de impresión para órdenes

## 🎯 Próximas Fases

### Fase 5: Dashboard & Métricas Avanzadas
- Métricas financieras detalladas
- Reportes mensuales exportables
- Gráficos de rendimiento
- Análisis de productos más vendidos

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
