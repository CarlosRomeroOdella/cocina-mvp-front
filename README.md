# Cocina MVP — Frontend

Interfaz web para el sistema de gestión de cocina/restaurante de Odella. Permite a los clientes hacer pedidos en tiempo real y a los administradores gestionar el menú, pedidos, usuarios y reportes.

## Tecnologías

- **React 19** con **React Router 7**
- **Tailwind CSS** + **Framer Motion** para estilos y animaciones
- **Vite** como bundler
- **Axios** para comunicación con la API
- **MSAL (Azure AD)** para autenticación con Microsoft
- **Microsoft Teams JS SDK** para integración con Teams
- Deploy en **Vercel**

---

## Requisitos

- Node.js 18+
- Backend corriendo (ver [cocina-mvp-back](https://github.com/CarlosRomeroOdella/cocina-mvp-back))

---

## Instalación y configuración

```bash
# 1. Clonar el repositorio
git clone git@github.com:CarlosRomeroOdella/cocina-mvp-front.git
cd cocina-mvp-front

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear archivo .env en la raíz:
VITE_API_URL=http://localhost:3000/api

# 4. Iniciar en desarrollo
npm run dev
```

---

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL base del backend | `http://{hostname}:3000/api` |
| `VITE_USE_MOCK` | Usar datos mockados (sin backend) | `false` |

---

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Build para producción |
| `npm run preview` | Preview del build de producción |
| `npm run lint` | Ejecutar ESLint |

---

## Estructura del proyecto

```
cocina-mvp-front/
├── src/
│   ├── components/
│   │   ├── PrivateRoute.jsx      # Protección de rutas por rol
│   │   ├── ProductToggleCard.jsx # Tarjeta de platillo con toggle
│   │   ├── Sidebar.jsx           # Menú lateral admin
│   │   ├── YoutubePlayer.jsx     # Mini reproductor de YouTube
│   │   └── ...
│   ├── context/
│   │   ├── AuthContext.jsx       # Sesión del usuario
│   │   ├── ProductsContext.jsx   # Catálogo (platillos, ingredientes, extras)
│   │   └── ThemeContext.jsx      # Modo oscuro/claro
│   ├── lib/
│   │   └── msalConfig.js         # Configuración Azure MSAL
│   ├── pages/
│   │   ├── Login.jsx             # Login (email/contraseña + Microsoft)
│   │   ├── AdminDashboard.jsx    # Panel de administración
│   │   ├── ClientMenu.jsx        # Menú del cliente
│   │   ├── Layout.jsx            # Layout base
│   │   └── Unauthorized.jsx      # Página 403
│   ├── router/
│   │   └── index.jsx             # Definición de rutas
│   ├── services/
│   │   ├── api.js                # Instancia de axios con interceptores
│   │   ├── authService.js        # Endpoints de autenticación
│   │   ├── pedidosService.js     # Endpoints de pedidos y configuración
│   │   ├── productsService.js    # Endpoints de productos, ingredientes, extras
│   │   └── usuariosService.js    # Endpoints de usuarios
│   └── main.jsx                  # Punto de entrada
├── public/
├── vercel.json
├── vite.config.js
└── tailwind.config.js
```

---

## Rutas de la aplicación

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | Público | Pantalla de inicio de sesión |
| `/admin` | Solo admin | Panel de administración |
| `/menu` | Admin y cliente | Menú para hacer pedidos |
| `/unauthorized` | Público | Página de acceso denegado (403) |
| `*` | — | Redirige a `/login` |

---

## Módulo de Administración (`/admin`)

El panel de administración tiene las siguientes pestañas:

### Pedidos
- Lista de pedidos activos en tiempo real
- Cambio de status: `en_espera → en_preparacion → listo`
- Marcar pedido como pagado
- Agregar notas al pedido
- Eliminar ítems individuales

### Reportes
- Ingresos del día, semana, mes y total histórico
- Pedidos pendientes de pago
- Top 10 ítems más vendidos
- Últimas 15 transacciones

### Platillos
- Crear, editar y eliminar platillos
- Toggle de disponibilidad
- Asignar ingredientes (requeridos u opcionales)
- Asignar extras disponibles (bebidas, postres)
- Configurar precio e ingredientes gratis

### Ingredientes
- Crear, editar y eliminar ingredientes
- Asignar categoría, precio e imagen
- Toggle de disponibilidad

### Extras (bebidas y postres)
- Crear, editar y eliminar extras
- Soporte para tamaños con precio diferenciado
- Soporte para sabores

### Usuarios
- Crear, editar y eliminar usuarios
- Asignar roles: `admin` o `cliente`
- Resetear contraseñas

### Ajustes
- Abrir o cerrar la cocina
- Configurar URL de YouTube (música ambiente para clientes)

---

## Módulo de Cliente (`/menu`)

El menú del cliente permite:

1. **Explorar el catálogo** — pestañas de Platillos, Bebidas y Postres
2. **Personalizar platillos** — seleccionar ingredientes opcionales (con precio extra)
3. **Agregar bebidas/postres** — con selector de tamaño y sabor
4. **Carrito flotante** — resumen del pedido con totales en tiempo real
5. **Confirmar pedido** — con nota opcional y opción de "para llevar"
6. **Tracking en tiempo real** — el estado del pedido se actualiza cada 3 segundos
7. **Notificaciones del navegador** — alerta cuando el pedido está listo
8. **Historial de pedidos** — sincronizado entre localStorage y API
9. **YouTube player** — música ambiente en la esquina inferior si está configurada

---

## Autenticación

El sistema soporta tres métodos de login:

### Email y contraseña
```
POST /api/auth/login
{ email, password }
```

### Login con Microsoft (MSAL)
- Usa Azure AD con popup o redirect
- Envía el `id_token` al backend
- Funciona tanto en navegador como embebido en Teams

### SSO en Microsoft Teams
- Detecta automáticamente si corre dentro de Teams
- Intenta autenticación silenciosa al cargar la app
- Sin intervención del usuario si ya tiene sesión en Teams

El token JWT recibido se guarda en `localStorage` bajo la clave `app_user` y se adjunta automáticamente en cada petición al backend mediante un interceptor de axios.

---

## Contextos (estado global)

### `AuthContext`
Gestiona la sesión del usuario:
- `user` — datos del usuario autenticado (`id, correo, nombre, role, token`)
- `login(userData)` — guarda sesión y configura header de autorización
- `logout()` — limpia sesión y redirige a login

### `ProductsContext`
Gestiona el catálogo completo:
- `platillos`, `ingredientes`, `extras` — listas con sus datos
- Métodos CRUD para cada recurso
- Se carga automáticamente al autenticarse

### `ThemeContext`
- `dark` — estado del modo oscuro
- `toggle()` — alterna el modo
- Persiste la preferencia en `localStorage`

---

## Deploy en Vercel

El proyecto está configurado para desplegarse en Vercel:

- `vercel.json` reescribe todas las rutas a `index.html` (SPA)
- Headers CSP configurados para permitir embed en Microsoft Teams, Office y SharePoint
- La variable `VITE_API_URL` debe apuntar al backend en producción

```json
// Configurar en Vercel Dashboard > Environment Variables
VITE_API_URL=https://tu-backend.onrender.com/api
```
