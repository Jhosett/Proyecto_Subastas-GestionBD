# Documentación del Servicio PQRS

## Descripción General

El servicio PQRS (Peticiones, Quejas, Reclamos y Sugerencias) es un sistema completo implementado en el proyecto de subastas que permite a los usuarios enviar diferentes tipos de solicitudes y recibir respuestas del equipo administrativo.

## Arquitectura del Sistema

### Backend (Node.js + TypeScript + Express)

#### 1. Modelo de Datos (`pqrs.model.ts`)

```typescript
interface IPQRS {
  type: 'peticion' | 'queja' | 'reclamo' | 'sugerencia';
  subject: string;
  description: string;
  productId?: string;
  relatedUserId?: string;
  isAnonymous: boolean;
  userId: string;
  status: 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado';
  response?: string;
  responseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Características del modelo:**
- Soporte para 4 tipos de solicitudes
- Campos opcionales para relacionar con productos o usuarios
- Sistema de estados para seguimiento
- Soporte para solicitudes anónimas
- Timestamps automáticos

#### 2. Controlador (`pqrs.controller.ts`)

**Endpoints implementados:**

- `POST /api/pqrs` - Crear nueva PQRS
- `GET /api/pqrs/all` - Obtener todas las PQRS (admin)
- `GET /api/pqrs/user` - Obtener PQRS del usuario
- `GET /api/pqrs/:id` - Obtener PQRS por ID
- `PUT /api/pqrs/:id/status` - Actualizar estado de PQRS (admin)

**Funcionalidades principales:**
- Autenticación mediante header `x-user-id`
- Validación de datos de entrada
- Manejo de errores robusto
- Integración con servicio de email

#### 3. Rutas (`pqrs.router.ts`)

Sistema de rutas RESTful con binding correcto de métodos del controlador.

#### 4. Servicio de Email (`pqrs-email.service.ts`)

**Características:**
- Notificaciones automáticas al crear PQRS
- Emails de respuesta a usuarios
- Soporte para PQRS anónimas
- Templates HTML responsivos
- Manejo de errores en envío

**Tipos de emails:**
1. **Notificación de nueva PQRS**: Enviado al admin o usuario relacionado
2. **Respuesta de PQRS**: Enviado al usuario cuando se responde su solicitud

### Frontend (Angular)

#### 1. Servicio (`pqrs.service.ts`)

**Métodos implementados:**
- `createPQRS()` - Crear nueva PQRS
- `getUserPQRS()` - Obtener PQRS del usuario
- `getAllPQRS()` - Obtener todas las PQRS (admin)
- `getPQRSById()` - Obtener PQRS específica
- `updatePQRSStatus()` - Actualizar estado

**Características:**
- Headers de autenticación automáticos
- Tipado TypeScript completo
- Manejo de observables RxJS

#### 2. Componente de Formulario (`pqrs-form.component.ts`)

**Funcionalidades:**
- Formulario reactivo con validación
- Selección de tipo de PQRS
- Relación opcional con productos o usuarios
- Opción de envío anónimo
- Integración con SweetAlert2 para notificaciones
- Carga dinámica de productos y usuarios

## Flujo de Funcionamiento

### 1. Creación de PQRS

1. Usuario completa formulario en frontend
2. Validación de campos obligatorios
3. Envío de datos al backend
4. Creación de registro en base de datos
5. Envío automático de email de notificación
6. Confirmación al usuario

### 2. Gestión Administrativa

1. Admin recibe notificación por email
2. Admin puede ver todas las PQRS
3. Admin actualiza estado y añade respuesta
4. Sistema envía email de respuesta al usuario
5. Usuario recibe notificación de respuesta

## Configuración Requerida

### Variables de Entorno

```env
ADMIN_EMAIL=admin@bidup.com
# Configuración de email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Dependencias Backend

```json
{
  "express": "^4.x.x",
  "mongoose": "^7.x.x",
  "nodemailer": "^6.x.x",
  "cors": "^2.x.x",
  "dotenv": "^16.x.x"
}
```

### Dependencias Frontend

```json
{
  "@angular/core": "^17.x.x",
  "@angular/common": "^17.x.x",
  "@angular/forms": "^17.x.x",
  "sweetalert2": "^11.x.x"
}
```

## Integración con el Sistema Principal

### 1. Servidor Principal (`server.ts`)

```typescript
import pqrsRoutes from "./routes/pqrs.router";
app.use("/api/pqrs", pqrsRoutes);
```

### 2. Base de Datos

- Colección MongoDB: `pqrs`
- Índices automáticos en `createdAt` para ordenamiento
- Relaciones opcionales con `products` y `users`

## Características de Seguridad

1. **Autenticación**: Validación de usuario mediante headers
2. **Autorización**: Endpoints admin protegidos
3. **Validación**: Sanitización de datos de entrada
4. **Anonimato**: Soporte para PQRS anónimas
5. **Logs**: Registro de errores y actividades

## Tipos de PQRS Soportados

1. **Petición**: Solicitudes de información o servicios
2. **Queja**: Expresión de insatisfacción
3. **Reclamo**: Solicitud de solución a problemas
4. **Sugerencia**: Propuestas de mejora

## Estados del Sistema

1. **Pendiente**: Estado inicial
2. **En Proceso**: PQRS siendo atendida
3. **Resuelto**: PQRS solucionada
4. **Cerrado**: PQRS finalizada

## Funcionalidades Adicionales

### Email Templates

- **HTML responsivo** con estilos inline
- **Branding consistente** con colores del sistema
- **Información completa** de la PQRS
- **Manejo de contenido anónimo**

### Validaciones

- Campos obligatorios: tipo, asunto, descripción
- Validación de tipos de PQRS
- Validación de estados
- Sanitización de contenido

### Manejo de Errores

- Logs detallados en servidor
- Mensajes de error amigables en frontend
- Fallbacks para servicios externos
- Validación de datos en múltiples capas

## Pruebas y Debugging

### Logs del Sistema

```typescript
console.log(`PQRS notification sent to ${recipientEmail}`);
console.error('Error sending PQRS notification:', error);
```

### Endpoints de Prueba

- `GET /api/pqrs/all` - Verificar todas las PQRS
- `GET /api/pqrs/user` - Verificar PQRS del usuario
- `POST /api/pqrs` - Crear PQRS de prueba

## Mantenimiento

### Monitoreo

- Logs de emails enviados
- Seguimiento de estados de PQRS
- Métricas de respuesta

### Actualizaciones

- Nuevos tipos de PQRS fácilmente agregables
- Estados personalizables
- Templates de email modificables

## Conclusión

El servicio PQRS está completamente implementado y funcional, proporcionando:

- ✅ Sistema completo de gestión de solicitudes
- ✅ Notificaciones automáticas por email
- ✅ Interface de usuario intuitiva
- ✅ Gestión administrativa completa
- ✅ Soporte para solicitudes anónimas
- ✅ Integración completa con el sistema de subastas

El sistema está listo para producción y puede manejar el flujo completo de PQRS desde la creación hasta la resolución.