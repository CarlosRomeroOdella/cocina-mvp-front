# Cocina MVP — Frontend

Interfaz web para el sistema de gestión de cocina/restaurante de Odella. Permite a los clientes explorar el menú, hacer pedidos y hacer seguimiento en tiempo real; y a los administradores gestionar el catálogo, pedidos, usuarios, reportes y configuración general.

---

## Tecnologías

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19.2 | Framework UI |
| React Router | 7.12 | Enrutamiento SPA |
| Tailwind CSS | 3.4 | Estilos utilitarios |
| Framer Motion | 12.35 | Animaciones |
| Vite | 6+ | Bundler y servidor de desarrollo |
| Axios | 1.13 | Cliente HTTP con interceptores |
| MSAL Browser | 5.11 | Autenticación Microsoft (Azure AD) |
| Teams JS SDK | 2.53 | Integración con Microsoft Teams |
| Vercel | — | Deploy y hosting |

---

## Requisitos previos

- Node.js 18 o superior
- Backend de Cocina MVP corriendo ([cocina-mvp-back](https://github.com/CarlosRomeroOdella/cocina-mvp-back))

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone git@github.com:CarlosRomeroOdella/cocina-mvp-front.git
cd cocina-mvp-front

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear archivo .env en la raíz:
VITE_API_URL=http://localhost:3000/api

# 4. Iniciar en modo desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL base del backend | `http://{hostname}:3000/api` |
| `VITE_USE_MOCK` | Usar datos mockados sin backend | `false` |

En producción (Vercel), configurar en el Dashboard de Vercel → Environment Variables:
```
VITE_API_URL=https://tu-backend.onrender.com/api
```

---

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Build optimizado para producción |
| `npm run preview` | Preview local del build de producción |
| `npm run lint` | Ejecutar ESLint |

---

## Estructura del proyecto

```
cocina-mvp-front/
├── public/
│   └── blank.html                     # Página en blanco usada por MSAL durante redirect
│
├── src/
│   ├── main.jsx                       # Punto de entrada: monta providers y router
│   │
│   ├── router/
│   │   └── index.jsx                  # Definición de todas las rutas con React Router
│   │
│   ├── pages/                         # Pantallas principales de la app
│   │   ├── Login.jsx                  # Autenticación (email/contraseña + Microsoft)
│   │   ├── AdminDashboard.jsx         # Panel completo de administración (7 pestañas)
│   │   ├── ClientMenu.jsx             # Menú interactivo para clientes
│   │   ├── Layout.jsx                 # Contenedor base con <Outlet>
│   │   ├── Unauthorized.jsx           # Página 403 — acceso denegado
│   │   ├── Home.jsx                   # Página inicial (sin uso activo)
│   │   ├── ProductDetail.jsx          # Detalle de un producto
│   │   └── ProductForm.jsx            # Formulario de producto
│   │
│   ├── components/                    # Componentes reutilizables
│   │   ├── PrivateRoute.jsx           # Guard: verifica sesión y rol antes de renderizar
│   │   ├── ProductToggleCard.jsx      # Tarjeta de platillo con toggle de disponibilidad
│   │   ├── Sidebar.jsx                # Menú lateral del panel admin
│   │   └── YoutubePlayer.jsx          # Mini reproductor flotante de YouTube
│   │
│   ├── context/                       # Estado global con React Context API
│   │   ├── AuthContext.jsx            # Sesión del usuario (login, logout, persistencia)
│   │   ├── ProductsContext.jsx        # Catálogo completo y operaciones CRUD
│   │   └── ThemeContext.jsx           # Modo oscuro/claro con persistencia
│   │
│   ├── services/                      # Capa de comunicación con la API
│   │   ├── api.js                     # Instancia de axios con interceptores JWT y 401
│   │   ├── apiFetch.js                # Wrapper de fetch nativo (alternativa a axios)
│   │   ├── authService.js             # Login, Microsoft, Teams
│   │   ├── productsService.js         # Platillos, ingredientes, extras, relaciones
│   │   ├── pedidosService.js          # Pedidos y configuración de cocina/youtube
│   │   └── usuariosService.js         # CRUD de usuarios
│   │
│   ├── lib/
│   │   └── msalConfig.js              # Configuración Azure AD (MSAL)
│   │
│   ├── data/                          # Datos estáticos para desarrollo sin backend
│   │   ├── platillos.js
│   │   ├── ingredientes.js
│   │   ├── extras.js
│   │   └── relaciones.js
│   │
│   ├── mocks/                         # Funciones mock para modo sin backend
│   │   ├── auth.mock.js
│   │   └── products.mock.js
│   │
│   └── index.css                      # Estilos globales y directivas de Tailwind
│
├── index.html
├── vite.config.js
├── vercel.json
├── tailwind.config.js
└── postcss.config.js
```

---

## Rutas de la aplicación

| Ruta | Componente | Acceso | Descripción |
|------|-----------|--------|-------------|
| `/login` | `Login` | Público | Pantalla de inicio de sesión |
| `/admin` | `AdminDashboard` | Solo `admin` | Panel de administración completo |
| `/menu` | `ClientMenu` | `admin` y `cliente` | Menú interactivo para pedidos |
| `/unauthorized` | `Unauthorized` | Público | Página de acceso denegado |
| `*` | — | — | Redirige a `/login` |

Las rutas `/admin` y `/menu` están protegidas con el componente `<PrivateRoute>` que valida que haya sesión activa y que el rol sea el correcto. Si la validación falla, redirige a `/unauthorized`.

---

## Providers (orden de montaje)

```jsx
// src/main.jsx
<MsalProvider instance={msalInstance}>       // Azure AD
  <ThemeProvider>                            // modo oscuro/claro
    <AuthProvider>                           // sesión del usuario
      <ProductsProvider>                     // catálogo de productos
        <RouterProvider router={router} />   // rutas
      </ProductsProvider>
    </AuthProvider>
  </ThemeProvider>
</MsalProvider>
```

---

## Autenticación

El sistema soporta tres métodos de inicio de sesión:

### 1. Email y contraseña
El método estándar. Llama a `POST /api/auth/login` con correo y contraseña. El token JWT recibido se almacena en `localStorage` bajo la clave `app_user`.

### 2. Login con Microsoft (MSAL)
Al hacer clic en "Entrar con Microsoft":
- Si está embebido en un iframe (Teams), abre un **popup** hacia `blank.html` para completar el flujo OAuth
- Si está en navegador normal, realiza un **redirect**
- Al recibir el `id_token` de Azure, lo envía al backend en `POST /api/auth/login-microsoft`
- El backend valida el token contra Azure AD y devuelve el usuario con JWT

### 3. SSO en Microsoft Teams
Al cargar la app dentro de Teams:
- Detecta el contexto de Teams con `@microsoft/teams-js`
- Intenta autenticación silenciosa automática
- Si el usuario ya tiene sesión en Teams, el login ocurre sin intervención
- Usa `POST /api/auth/login-teams` para validar el token de Teams en el backend

### Persistencia de sesión
El token JWT se guarda en `localStorage["app_user"]` y se adjunta automáticamente a todas las peticiones de axios mediante un interceptor. Si el backend devuelve un error 401, el interceptor limpia la sesión y redirige a `/login`.

---

## Contextos (estado global)

### `AuthContext`

Gestiona la sesión del usuario en toda la aplicación.

```jsx
const { user, login, logout, loading } = useAuth()

// user:
{
  id: 5,
  correo: "usuario@odella.com",
  nombre: "Juan",
  role: "admin",  // "admin" | "cliente"
  token: "eyJhbGciOiJIUzI1NiJ9..."
}
```

- Al montar, recupera automáticamente la sesión de `localStorage`
- `login(userData)` guarda la sesión y configura el header `Authorization` en axios
- `logout()` limpia `localStorage` y el header

---

### `ProductsContext`

Gestiona el catálogo completo y expone métodos CRUD para cada recurso.

```jsx
const {
  platillos, ingredientes, extras,
  loading, error,
  toggleDisponible,
  guardarPlatillo, eliminarPlatillo,
  crearIngrediente, actualizarIngrediente, eliminarIngrediente,
  crearExtra, actualizarExtra, eliminarExtra,
} = useProducts()
```

- Se carga automáticamente cuando el usuario se autentica
- Los métodos de escritura hacen actualizaciones optimistas en el estado local antes de confirmar con la API
- Si la API falla, el estado se revierte

---

### `ThemeContext`

```jsx
const { dark, toggle } = useTheme()
```

- Persiste la preferencia en `localStorage`
- Al activar el modo oscuro, añade la clase `dark` al elemento `<html>`
- El modo oscuro **solo se activa si el usuario lo eligió explícitamente** (no sigue la preferencia del sistema)

---

## Panel de administración (`/admin`)

El panel tiene 7 pestañas:

### Pedidos
- Lista en tiempo real de todos los pedidos activos
- Filtros por status y estado de pago
- **Cambiar status:** `en_espera → en_preparacion → listo`
- **Marcar como pagado:** toggle por pedido
- **Agregar nota:** campo editable por pedido
- **Eliminar ítem:** quitar un producto individual del pedido

### Reportes
- Ingresos del día, semana, mes y total histórico
- Número de pedidos pendientes de pago
- Top 10 ítems más vendidos (por cantidad)
- Tabla de últimas 15 transacciones

### Platillos
- Lista de platillos con imagen, precio y estado de disponibilidad
- **Crear platillo:** nombre, descripción, precio, imagen, ingredientes gratis
- **Editar platillo:** modificar todos sus campos
- **Asignar ingredientes:** seleccionar cuáles son requeridos (no se pueden quitar) y cuáles son opcionales
- **Asignar extras:** bebidas y postres disponibles para ese platillo
- **Toggle disponibilidad:** activar/desactivar sin eliminar

### Ingredientes
- Lista con categoría, precio y estado
- **Crear/Editar/Eliminar** ingredientes
- **Asignar categoría:** para agruparlos en el menú del cliente
- **Precio:** costo extra cuando el cliente lo agrega sobre el límite de ingredientes gratis

### Extras (bebidas y postres)
- Lista de bebidas, postres y otros extras
- **Crear/Editar/Eliminar** extras
- **Tamaños con precio diferenciado:** ej. Pequeño $30, Grande $50
- **Sabores disponibles:** lista de opciones (Coca-Cola, Sprite, etc.)

### Usuarios
- Lista de todos los usuarios registrados
- **Crear usuario:** correo, nombre, contraseña temporal, rol
- **Editar usuario:** nombre, rol (`admin`/`cliente`), estado activo
- **Resetear contraseña:** el admin asigna una contraseña nueva
- **Eliminar usuario**

### Ajustes
- **Estado de la cocina:** botón para abrir o cerrar (cuando está cerrada, los clientes no pueden hacer pedidos)
- **URL de YouTube:** el admin pega una URL de YouTube que los clientes ven como música ambiente mientras esperan su pedido

---

## Menú del cliente (`/menu`)

### Flujo completo de un pedido

```
1. Seleccionar platillo
       ↓
2. Elegir ingredientes opcionales
   (los primeros N son gratis, el resto tiene costo)
       ↓
3. (Opcional) Agregar bebidas o postres
   con selector de tamaño y sabor
       ↓
4. Revisar carrito flotante con total desglosado
       ↓
5. Confirmar pedido
   - Agregar nota (ej: "sin cebolla")
   - Elegir modalidad: comer en cocina o para llevar
       ↓
6. Tracking en tiempo real
   (polling cada 3 segundos al backend)
       ↓
7. Notificación del navegador cuando el pedido está listo
```

### Pestañas del menú
- **Platillos** — con imagen, descripción, precio y selector de ingredientes
- **Bebidas** — con selector de tamaño y sabor
- **Postres** — con selector de tamaño y sabor

### Funcionalidades adicionales
- **Carrito flotante:** resumen siempre visible con subtotales y total
- **Historial de pedidos:** almacenado en `localStorage` y sincronizado con la API
- **Pedido en revisión:** si el admin lo devuelve, el cliente puede editarlo y reenviarlo
- **YouTube player:** reproductor flotante en la esquina inferior si el admin configuró una URL
- **Modo oscuro/claro:** toggle disponible para el cliente

---

## Servicios (comunicación con API)

### `api.js`
Instancia configurada de axios:
- `baseURL` desde `VITE_API_URL` o detectada automáticamente por hostname
- **Interceptor de request:** adjunta `Authorization: Bearer <token>` desde `localStorage`
- **Interceptor de response:** si recibe 401, limpia la sesión y redirige a `/login`

### `authService.js`
```js
login({ email, password })           // POST /auth/login
loginMicrosoft({ idToken })          // POST /auth/login-microsoft
loginTeams({ teamsToken })           // POST /auth/login-teams
logout()                             // POST /auth/logout
```

### `productsService.js`
```js
// Platillos
getProducts()
createProduct(data)
updateProduct(id, data)
deleteProduct(id)

// Ingredientes
getIngredientes()
createIngrediente(data)
updateIngrediente(id, data)
deleteIngrediente(id)

// Extras
getExtras()
createExtra(data)
updateExtra(id, data)
deleteExtra(id)

// Relaciones
getRelaciones()
```

### `pedidosService.js`
```js
crearPedido(data)
getPedidos(statusFilter)
getPedido(id)
getMisPedidos()
actualizarStatusPedido(id, status)
marcarPagado(id, pagado)
reenviarPedido(id, items)
cancelarPedido(id)
actualizarNota(id, nota)
eliminarItemPedido(pedidoId, itemId)
getResumen()                          // estadísticas admin

// Configuración
getCocinaEstado()
setCocinaEstado(abierta)
getYoutubeUrl()
setYoutubeUrl(url)
```

### `usuariosService.js`
```js
getUsuarios()
crearUsuario(data)
actualizarUsuario(id, data)
resetPassword(id, contrasena)
eliminarUsuario(id)
changeMyPassword(actual, nueva)
```

---

## Configuración de Microsoft Azure (MSAL)

El archivo `src/lib/msalConfig.js` contiene la configuración para autenticación con Azure AD:

```js
{
  auth: {
    clientId: "...",              // ID de la app registrada en Azure
    authority: "https://login.microsoftonline.com/{tenantId}",
    redirectUri: window.location.origin,  // funciona en localhost y producción
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  }
}
```

El scope solicitado es `["openid", "profile", "email"]`. La inicialización de MSAL y el manejo del redirect se completan **antes de montar React**, para evitar condiciones de carrera.

---

## Deploy en Vercel

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "frame-ancestors 'self' https://*.teams.microsoft.com https://*.office.com ..."
        }
      ]
    }
  ]
}
```

- Todas las rutas se reescriben a `index.html` para que funcione el enrutamiento SPA
- Los headers CSP permiten que la app sea embebida en Teams, Office y SharePoint
- El archivo `public/blank.html` se usa como redirect URI de MSAL para flujos dentro de iframes

