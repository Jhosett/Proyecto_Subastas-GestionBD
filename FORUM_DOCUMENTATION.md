# Documentación del Foro de Discusión

## Descripción General
Sistema de foro de discusión para la plataforma de subastas que permite la comunicación entre administradores, vendedores y compradores mediante posts y comentarios con sistema de reacciones.

## Características Implementadas

### 1. Modelos de Base de Datos (MongoDB)

#### ForumPost
- **autor**: Referencia al usuario que crea el post
- **titulo**: Título del post (máx. 200 caracteres)
- **contenido**: Contenido del post (máx. 2000 caracteres)
- **fechaCreacion/fechaActualizacion**: Timestamps automáticos
- **reacciones**: Objeto con arrays de usuarios por tipo de reacción
- **totalComentarios**: Contador de comentarios

#### ForumComment
- **postId**: Referencia al post padre
- **autor**: Referencia al usuario que comenta
- **contenido**: Contenido del comentario (máx. 1000 caracteres)
- **fechaCreacion**: Timestamp automático
- **reacciones**: Objeto con arrays de usuarios por tipo de reacción

### 2. Sistema de Reacciones
Cuatro tipos de reacciones disponibles:
- **bien** (👍): Aprobación/Me gusta
- **contento** (😊): Felicidad/Satisfacción
- **enojado** (😠): Desacuerdo/Molestia
- **triste** (😢): Tristeza/Decepción

### 3. API Endpoints

#### Posts
- `POST /api/forum/posts` - Crear nuevo post (requiere autenticación)
- `GET /api/forum/posts` - Obtener posts con paginación
- `POST /api/forum/posts/:postId/reactions` - Agregar reacción a post

#### Comentarios
- `POST /api/forum/posts/:postId/comments` - Crear comentario (requiere autenticación)
- `GET /api/forum/posts/:postId/comments` - Obtener comentarios de un post
- `POST /api/forum/comments/:commentId/reactions` - Agregar reacción a comentario

### 4. Funcionalidades Frontend

#### Interfaz de Usuario
- Lista de posts con paginación
- Formulario para crear nuevos posts
- Sistema de comentarios anidados
- Botones de reacción interactivos
- Indicadores de rol de usuario (Admin/Vendedor/Comprador)
- Diseño responsive con Tailwind CSS

#### Características de Interacción
- Solo usuarios autenticados pueden crear posts y comentarios
- Sistema de reacciones en tiempo real
- Contadores de reacciones y comentarios
- Identificación visual de roles de usuario

## Estructura de Archivos

### Backend
```
backend/src/
├── models/forum.model.ts          # Modelos de MongoDB
├── controllers/forum.controller.ts # Lógica de negocio
├── routes/forum.router.ts         # Rutas de la API
├── middleware/auth.middleware.ts  # Middleware de autenticación
└── server.ts                      # Configuración del servidor
```

### Frontend
```
frontend/src/app/
├── models/forum.model.ts          # Interfaces TypeScript
├── services/forum.service.ts      # Servicio HTTP
├── components/forum/              # Componente principal
│   ├── forum.component.ts
│   ├── forum.component.html
│   └── forum.component.css
└── app.routes.ts                  # Configuración de rutas
```

## Requisitos de Instalación

### Backend
```bash
cd backend
npm install jsonwebtoken @types/jsonwebtoken
```

### Frontend
No se requieren dependencias adicionales (usa Angular standalone components)

## Configuración

### Variables de Entorno
Asegurar que el archivo `.env` del backend contenga:
```
JWT_SECRET=tu_clave_secreta_jwt
MONGODB_URI=mongodb://127.0.0.1:27017/auction_store
```

### Base de Datos
Las colecciones se crean automáticamente:
- `forumposts`: Almacena los posts del foro
- `forumcomments`: Almacena los comentarios

## Uso del Sistema

### Para Usuarios
1. **Acceder al foro**: Navegar a `/forum` desde el menú principal
2. **Crear post**: Completar título y contenido (requiere login)
3. **Reaccionar**: Hacer clic en los emojis de reacción
4. **Comentar**: Escribir en el área de comentarios de cada post
5. **Ver roles**: Los usuarios aparecen identificados como Admin/Vendedor/Comprador

### Para Desarrolladores
1. **Extender reacciones**: Modificar el enum en los modelos y agregar emojis
2. **Agregar funcionalidades**: Usar los servicios existentes como base
3. **Personalizar UI**: Modificar los estilos CSS según necesidades

## Seguridad Implementada

- Autenticación JWT requerida para crear contenido
- Validación de longitud de contenido
- Sanitización automática de datos de entrada
- Middleware de autenticación en rutas protegidas

## Consideraciones de Rendimiento

- Paginación implementada en posts y comentarios
- Índices automáticos en campos de referencia (MongoDB)
- Lazy loading de comentarios (se cargan al expandir)
- Optimización de consultas con populate selectivo

## Próximas Mejoras Sugeridas

1. **Notificaciones**: Sistema de notificaciones para nuevos comentarios
2. **Moderación**: Herramientas para que admins moderen contenido
3. **Búsqueda**: Funcionalidad de búsqueda en posts
4. **Archivos**: Soporte para imágenes en posts
5. **Hilos**: Sistema de respuestas anidadas en comentarios