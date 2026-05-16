# Good Vibes Citadel

Frontend privado para gestionar la comunidad/clan **Good Vibes Citadel**. La aplicación funciona como un panel interno donde los usuarios pueden iniciar sesión, consultar miembros, ver y crear eventos, y donde los administradores pueden gestionar usuarios, personajes y roles.

## Funcionalidades

- Inicio de sesión contra un backend externo mediante JWT.
- Persistencia de sesión en `localStorage`.
- Detección de roles desde el token para controlar qué pantallas puede ver cada usuario.
- Estado `Waiting` para usuarios autenticados que todavía no tienen roles asignados.
- Panel principal con acceso rápido a miembros del clan y calendario de próximos eventos.
- Página de eventos con listado, filtros por tipo y creación de nuevos eventos.
- Página de miembros con usuarios registrados y personajes asociados.
- Panel de administración para registrar usuarios, eliminar usuarios, asignar roles y editar personajes.
- Gestión de roles para crear y eliminar roles disponibles en la aplicación.
- Flujo de actualización de contraseña temporal tras el primer acceso.

## Roles y permisos

La aplicación tiene rutas protegidas:

- Cualquier usuario autenticado puede entrar al panel principal.
- Los usuarios sin roles quedan marcados como `Waiting` y no pueden acceder a eventos ni miembros.
- Los usuarios con al menos un rol pueden acceder a `Eventos` y `Miembros`.
- Los roles `CP Admin` y `Admin` habilitan el panel de administración.

## Backend esperado

El frontend necesita una API configurada mediante la variable de entorno:

```env
VITE_BACKEND_BASE_URL=https://tu-backend.com
```

Endpoints usados por la aplicación:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/updatePassword`
- `POST /api/auth/verifyTemporaryPassword`
- `GET /api/users/getAll`
- `DELETE /api/users/{username}/delete`
- `POST /api/users/{username}/roles/assignMultiple`
- `POST /api/users/{username}/character/updateCharacterList`
- `GET /api/roles/getAll`
- `POST /api/roles/create/{roleName}`
- `DELETE /api/roles/delete/{roleName}`
- `GET /api/event/getAll`
- `POST /api/event/create`

## Tecnologías

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- JWT Decode
- pnpm

## Desarrollo local

Instala las dependencias:

```bash
pnpm install
```

Crea un archivo `.env.local` con la URL del backend:

```env
VITE_BACKEND_BASE_URL=http://localhost:5000
```

Arranca el servidor de desarrollo:

```bash
pnpm dev
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm preview
```

## Despliegue

El proyecto está preparado para desplegarse como aplicación frontend en Vercel. En Vercel hay que configurar `VITE_BACKEND_BASE_URL` con la URL pública del backend antes de construir la aplicación.
