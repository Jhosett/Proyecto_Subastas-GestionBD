# Especificación del Sistema de Analíticas - BidUp

## 1. Resumen Ejecutivo

El sistema de analíticas de **BidUp** captura y almacena en MongoDB información detallada sobre el comportamiento de los usuarios en la plataforma de subastas. Este sistema permite analizar patrones de uso, preferencias de categorías y comportamiento de compra para tomar decisiones informadas sobre la plataforma.

---

## 2. Requisitos Funcionales Implementados

### 2.1 Datos Capturados por Sesión

El sistema captura los siguientes datos cada vez que un usuario accede a la plataforma:

| Campo | Tipo | Descripción | Validación |
|-------|------|-------------|-----------|
| `userId` | String | ID único del usuario autenticado | Requerido, referencia a User |
| `fecha` | Date | Fecha y hora de ingreso (ISO 8601) | Automática (Date.now()) |
| `ubicacion.pais` | String | País del usuario | Requerido, obtenido del perfil |
| `ubicacion.departamento` | String | Departamento/Región del usuario | Requerido, obtenido del perfil |
| `ubicacion.ciudad` | String | Ciudad del usuario | Requerido, obtenido del perfil |
| `tiempoTotalEnPagina` | Number | Segundos totales en la plataforma | Calculado al cierre |
| `categoriasClickeadas` | Array<String> | Categorías en las que hizo clic | Acumulativa, sin duplicados |
| `intentoSubastar` | Boolean | ¿Intentó subastar un producto? | Sí/No |

### 2.2 Desglose de Requisitos del Proyecto

✅ **Ubicación**: Capturada en `ubicacion` (país, departamento, ciudad)
✅ **Tiempo dentro de la página**: Guardado en `tiempoTotalEnPagina` (en segundos)
✅ **Categorías clickeadas**: Array `categoriasClickeadas`
✅ **Hora de ingreso (día, mes, año)**: Timestamp en `fecha`
✅ **Intento de subastar**: Flag booleano `intentoSubastar`

---

## 3. Arquitectura del Sistema

### 3.1 Modelo de Datos (MongoDB)

**Colección**: `analytics`

```javascript
{
  "_id": ObjectId,
  "userId": "user_id_123",
  "fecha": ISODate("2025-11-12T15:30:00Z"),
  "ubicacion": {
    "pais": "Colombia",
    "departamento": "Cundinamarca",
    "ciudad": "Bogotá"
  },
  "tiempoTotalEnPagina": 3600,        // En segundos
  "categoriasClickeadas": ["Electrónica", "Libros", "Deportes"],
  "intentoSubastar": true
}
```

**Índices recomendados**:
- `userId` (para búsquedas rápidas por usuario)
- `fecha` (para filtros temporales)
- `intentoSubastar` (para análisis de conversión)

---

## 4. Endpoints de la API

### 4.1 Registrar Entrada (Inicio de Sesión)

**Endpoint**: `POST /api/analytics/entry`

**Descripción**: Registra el inicio de una sesión de usuario.

**Request Body**:
```json
{
  "userId": "user_id_123"
}
```

**Response** (201 Created):
```json
{
  "sessionId": "session_id_abc123"
}
```

**Casos de Error**:
- 404: Usuario no encontrado
- 500: Error interno del servidor

---

### 4.2 Registrar Clic en Categoría

**Endpoint**: `POST /api/analytics/click`

**Descripción**: Registra cuando el usuario hace clic en una categoría.

**Request Body**:
```json
{
  "sessionId": "session_id_abc123",
  "categoryName": "Electrónica"
}
```

**Response** (200 OK):
```json
{
  "message": "Click registrado correctamente"
}
```

**Notas**: 
- Usa operador `$addToSet` para evitar duplicados
- Registra múltiples clics en la misma sesión

---

### 4.3 Registrar Intento de Subastar

**Endpoint**: `POST /api/analytics/attempt`

**Descripción**: Registra cuando el usuario intenta hacer una puja.

**Request Body**:
```json
{
  "sessionId": "session_id_abc123"
}
```

**Response** (200 OK):
```json
{
  "message": "Intento de subasta registrado"
}
```

---

### 4.4 Registrar Salida (Cierre de Sesión)

**Endpoint**: `POST /api/analytics/exit`

**Descripción**: Finaliza la sesión y calcula el tiempo total.

**Request Body**:
```json
{
  "sessionId": "session_id_abc123"
}
```

**Response** (200 OK):
```json
{
  "message": "Salida registrada correctamente",
  "timeSpent": 3600
}
```

**Notas**:
- Calcula `tiempoTotalEnPagina` = (Hora actual - Hora de ingreso) en segundos
- No falla si la sesión no existe (para no bloquear cierre del usuario)

---

### 4.5 Obtener Reporte de Analíticas

**Endpoint**: `GET /api/analytics/report`

**Descripción**: Obtiene un reporte general de analíticas con estadísticas agregadas.

**Query Parameters**:
- `userId` (opcional): Filtrar por usuario específico
- `startDate` (opcional): Fecha de inicio (ISO 8601)
- `endDate` (opcional): Fecha de fin (ISO 8601)

**Ejemplo**:
```
GET /api/analytics/report?startDate=2025-11-01&endDate=2025-11-30
```

**Response** (200 OK):
```json
{
  "message": "Reporte de analíticas generado correctamente",
  "totalSessions": 150,
  "statistics": {
    "totalUsers": 45,
    "avgTimePerPage": 1845,
    "usersAttemptedAuction": 38,
    "percentageAttemptedAuction": 25.3,
    "topCategories": [
      { "name": "Electrónica", "count": 87 },
      { "name": "Deportes", "count": 65 },
      { "name": "Libros", "count": 42 }
    ],
    "locationDistribution": [
      { "location": "Colombia - Cundinamarca - Bogotá", "count": 89 },
      { "location": "Colombia - Antioquia - Medellín", "count": 45 }
    ]
  },
  "sessionDetails": [
    {
      "sessionId": "...",
      "userId": "user_123",
      "date": "2025-11-12T15:30:00Z",
      "timeOnPage": 3600,
      "categoriesClicked": ["Electrónica", "Deportes"],
      "attemptedAuction": true,
      "location": "Colombia, Cundinamarca, Bogotá"
    }
  ]
}
```

---

### 4.6 Obtener Analíticas de Usuario

**Endpoint**: `GET /api/analytics/user/:userId`

**Descripción**: Obtiene estadísticas completas de un usuario específico.

**Response** (200 OK):
```json
{
  "userId": "user_123",
  "totalSessions": 5,
  "totalTimeSpent": 18200,
  "averageTimePerSession": 3640,
  "categoriesExplored": ["Electrónica", "Deportes", "Libros"],
  "attemptedAuction": true,
  "sessions": [
    {
      "sessionId": "session_abc",
      "date": "2025-11-12T15:30:00Z",
      "timeOnPage": 3600,
      "categoriesClicked": ["Electrónica"],
      "attemptedAuction": true,
      "location": "Colombia, Cundinamarca, Bogotá"
    }
  ]
}
```

---

## 5. Integración Frontend-Backend

### 5.1 Flujo de Captura de Datos

```
┌─────────────────────────────────────────────┐
│  1. Usuario carga MainLayout                 │
│  2. Llamar: AnalyticsService.registerEntry() │
│  ├─ Enviar: userId                          │
│  ├─ Recibir: sessionId                      │
│  └─ Guardar: sessionId en localStorage      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  3. Usuario navega en Home                   │
│  4. Al hacer clic en categoría:              │
│  └─ Llamar: AnalyticsService.registerCategoryClick(sessionId, categoryName)
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  5. Usuario intenta subastar                 │
│  6. Llamar: AnalyticsService.registerAuctionAttempt(sessionId)
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  7. Usuario cierra aplicación                │
│  8. OnDestroy: AnalyticsService.registerExit(sessionId)
│  ├─ Se calcula tiempo total                 │
│  └─ Sesión se cierra                        │
└─────────────────────────────────────────────┘
```

### 5.2 Implementación en AnalyticsService

**Archivo**: `frontend/src/app/services/analytics.service.ts`

```typescript
export class AnalyticsService {
  private sessionId: string | null = null;

  registerEntry(userId: string): void {
    this.analyticsService.registerEntry(userId).subscribe({
      next: (response) => {
        this.sessionId = response.sessionId;
        localStorage.setItem('sessionId', this.sessionId);
      }
    });
  }

  registerCategoryClick(categoryName: string): void {
    const sessionId = this.sessionId || localStorage.getItem('sessionId');
    if (sessionId) {
      this.analyticsService.registerCategoryClick(sessionId, categoryName).subscribe();
    }
  }

  registerAuctionAttempt(): void {
    const sessionId = this.sessionId || localStorage.getItem('sessionId');
    if (sessionId) {
      this.analyticsService.registerAuctionAttempt(sessionId).subscribe();
    }
  }

  registerExit(): void {
    const sessionId = this.sessionId || localStorage.getItem('sessionId');
    if (sessionId) {
      this.analyticsService.registerExit(sessionId).subscribe({
        complete: () => localStorage.removeItem('sessionId')
      });
    }
  }
}
```

---

## 6. Validaciones y Controles

### 6.1 Validación de Entrada

| Validación | Implementación |
|-----------|----------------|
| UserId debe existir en BD | ✅ `User.findById()` en registerEntry |
| SessionId debe ser válido | ✅ `Analytics.findById()` en updates |
| Categorías no duplicadas | ✅ Operador `$addToSet` |
| Rango de fechas válido | ✅ Validación en query params |

### 6.2 Manejo de Errores

- **404 Not Found**: Usuario o sesión no encontrados
- **500 Internal Server Error**: Errores de base de datos o servidor
- **Fallback graceful**: Si analytics falla, no bloquea la experiencia del usuario

---

## 7. Consultas Analíticas Comunes

### 7.1 Top 10 Categorías Más Vistas
```javascript
db.analytics.aggregate([
  { $unwind: "$categoriasClickeadas" },
  { $group: { _id: "$categoriasClickeadas", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
])
```

### 7.2 Tasa de Conversión (Intentos de Subasta)
```javascript
db.analytics.aggregate([
  {
    $group: {
      _id: null,
      totalSessions: { $sum: 1 },
      attemptedAuction: { $sum: { $cond: ["$intentoSubastar", 1, 0] } }
    }
  },
  {
    $project: {
      conversionRate: {
        $multiply: [
          { $divide: ["$attemptedAuction", "$totalSessions"] },
          100
        ]
      }
    }
  }
])
```

### 7.3 Usuarios Más Activos
```javascript
db.analytics.aggregate([
  { $group: { _id: "$userId", sessions: { $sum: 1 }, avgTime: { $avg: "$tiempoTotalEnPagina" } } },
  { $sort: { sessions: -1 } },
  { $limit: 20 }
])
```

---

## 8. Consideraciones de Privacidad y RGPD

⚠️ **Importante**: Implementar las siguientes medidas de seguridad:

1. ✅ **Autenticación**: Validar token de usuario antes de registrar analíticas
2. ⚠️ **Anonimización**: Considerar hash de userId para reportes públicos
3. ⚠️ **Retención**: Definir política de eliminación de datos (ej: 12 meses)
4. ⚠️ **Consentimiento**: Mostrar aviso de cookies/analíticas al usuario

---

## 9. Roadmap Futuro

- [ ] Dashboard de analíticas en tiempo real (WebSockets)
- [ ] Exportación de reportes (CSV, PDF)
- [ ] Machine Learning para predicción de comportamiento
- [ ] Alertas automáticas para anomalías
- [ ] Integración con Google Analytics

---

## 10. Archivos Modificados

### Backend
- ✅ `src/models/analytics.model.ts` - Modelo de datos
- ✅ `src/controllers/analytics.controller.ts` - Controlador con 6 funciones
- ✅ `src/routes/analytics.router.ts` - Rutas API
- ✅ `src/server.ts` - Integración de rutas

### Frontend
- ✅ `src/app/services/analytics.service.ts` - Servicio HTTP
- ✅ `src/app/models/analytics-session.model.ts` - Modelo de sesión
- ✅ `src/app/layouts/main-layout/main-layout.component.ts` - Integración
- ✅ `src/app/components/home/home.component.ts` - Captura de clics

---

## 11. Testing Recomendado

### Endpoint de Entrada
```bash
curl -X POST http://localhost:8000/api/analytics/entry \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_123"}'
```

### Endpoint de Reporte
```bash
curl -X GET "http://localhost:8000/api/analytics/report?startDate=2025-11-01&endDate=2025-11-30"
```

---

**Versión**: 1.0  
**Última actualización**: 12 de noviembre de 2025  
**Responsable**: Equipo de Desarrollo
