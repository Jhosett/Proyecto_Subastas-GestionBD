# Guía de Integración - Sistema de Analíticas BidUp

## 1. Checklist de Validación del Proyecto

### Requisitos del Proyecto de Aula ✅

```
☑ Ubicación
   ├─ País: Capturado en analytics.ubicacion.pais
   ├─ Departamento: Capturado en analytics.ubicacion.departamento
   └─ Ciudad: Capturado en analytics.ubicacion.ciudad

☑ Tiempo dentro de la página
   ├─ Capturado en: analytics.tiempoTotalEnPagina (segundos)
   ├─ Cálculo: (Hora salida - Hora entrada) / 1000
   └─ Método: Automático al cierre de sesión

☑ Categorías clickeadas
   ├─ Capturado en: analytics.categoriasClickeadas (array)
   ├─ Sin duplicados: Usando $addToSet en MongoDB
   └─ Endpoint: POST /api/analytics/click

☑ Hora de ingreso (día, mes, año)
   ├─ Capturado en: analytics.fecha (ISO 8601 Date)
   ├─ Formato: YYYY-MM-DDTHH:mm:ss.SSSZ
   └─ Automático: Date.now() al crear sesión

☑ Intento de subastar
   ├─ Capturado en: analytics.intentoSubastar (boolean)
   ├─ Valor: true/false
   └─ Endpoint: POST /api/analytics/attempt
```

---

## 2. Arquitectura MongoDB

### Colección: analytics

**Esquema Validado**:
```javascript
{
  _id: ObjectId,                    // ID de sesión único
  userId: String,                   // Referencia al usuario (requerido)
  fecha: Date,                      // Fecha-hora de inicio (requerido)
  ubicacion: {
    pais: String,                  // Requerido
    departamento: String,          // Requerido
    ciudad: String                 // Requerido
  },
  tiempoTotalEnPagina: Number,     // Segundos (requerido, default 0)
  categoriasClickeadas: [String],  // Array sin duplicados
  intentoSubastar: Boolean         // Requerido, default false
}
```

**Validaciones en Mongoose**:
- ✅ `userId` es requerido y validado contra User
- ✅ `fecha` se asigna automáticamente
- ✅ `ubicacion` campos todos requeridos
- ✅ `tiempoTotalEnPagina` solo números ≥ 0
- ✅ `categoriasClickeadas` no permite duplicados
- ✅ `intentoSubastar` es booleano

---

## 3. Endpoints Implementados

| Método | Endpoint | Descripción | Status |
|--------|----------|-------------|--------|
| POST | `/api/analytics/entry` | Registrar inicio de sesión | ✅ Implementado |
| POST | `/api/analytics/click` | Registrar clic en categoría | ✅ Implementado |
| POST | `/api/analytics/attempt` | Registrar intento de subasta | ✅ Implementado |
| POST | `/api/analytics/exit` | Registrar fin de sesión | ✅ Implementado |
| GET | `/api/analytics/report` | Obtener reporte general | ✅ Implementado |
| GET | `/api/analytics/user/:userId` | Estadísticas por usuario | ✅ Implementado |

---

## 4. Flujo de Uso (Frontend → Backend)

### Paso 1: Iniciar Sesión (MainLayout carga)

**Frontend**:
```typescript
// main-layout.component.ts
ngOnInit() {
  const userId = this.userService.getCurrentUserId();
  this.analyticsService.registerEntry(userId).subscribe(response => {
    this.sessionId = response.sessionId;
    localStorage.setItem('sessionId', this.sessionId);
  });
}
```

**Backend**:
```
POST /api/analytics/entry
{
  "userId": "user_123"
}

Response:
{
  "sessionId": "session_abc123"
}
```

### Paso 2: Hacer Clic en Categoría (Home carga)

**Frontend**:
```typescript
// home.component.ts
filterByCategory(categoryName: string) {
  const sessionId = localStorage.getItem('sessionId');
  this.analyticsService.registerCategoryClick(sessionId, categoryName).subscribe();
  // Aplicar filtro...
}
```

**Backend**:
```
POST /api/analytics/click
{
  "sessionId": "session_abc123",
  "categoryName": "Electrónica"
}
```

### Paso 3: Intentar Subastar (Auction Card)

**Frontend**:
```typescript
// auction-card.component.ts
makeBid() {
  const sessionId = localStorage.getItem('sessionId');
  this.analyticsService.registerAuctionAttempt(sessionId).subscribe();
  // Proceder con puja...
}
```

**Backend**:
```
POST /api/analytics/attempt
{
  "sessionId": "session_abc123"
}
```

### Paso 4: Cerrar Sesión (MainLayout destruido)

**Frontend**:
```typescript
// main-layout.component.ts
ngOnDestroy() {
  const sessionId = localStorage.getItem('sessionId');
  this.analyticsService.registerExit(sessionId).subscribe();
  localStorage.removeItem('sessionId');
}
```

**Backend**:
```
POST /api/analytics/exit
{
  "sessionId": "session_abc123"
}

Response:
{
  "message": "Salida registrada correctamente",
  "timeSpent": 3600
}
```

---

## 5. Obtener Reportes

### Reporte General
```bash
curl -X GET http://localhost:8000/api/analytics/report
```

### Reporte con Filtros de Fecha
```bash
curl -X GET "http://localhost:8000/api/analytics/report?startDate=2025-11-01&endDate=2025-11-30"
```

### Reporte por Usuario
```bash
curl -X GET http://localhost:8000/api/analytics/user/user_123
```

---

## 6. Datos de Ejemplo Generados

### Sesión 1: Usuario explorando
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "userId": "user_123",
  "fecha": ISODate("2025-11-12T10:30:00Z"),
  "ubicacion": {
    "pais": "Colombia",
    "departamento": "Cundinamarca",
    "ciudad": "Bogotá"
  },
  "tiempoTotalEnPagina": 2400,
  "categoriasClickeadas": ["Electrónica", "Deportes"],
  "intentoSubastar": false
}
```

### Sesión 2: Usuario pujador activo
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "userId": "user_456",
  "fecha": ISODate("2025-11-12T14:15:00Z"),
  "ubicacion": {
    "pais": "Colombia",
    "departamento": "Antioquia",
    "ciudad": "Medellín"
  },
  "tiempoTotalEnPagina": 5400,
  "categoriasClickeadas": ["Electrónica", "Deportes", "Libros", "Joyería"],
  "intentoSubastar": true
}
```

---

## 7. Estadísticas Agregadas Disponibles

El endpoint `/api/analytics/report` proporciona:

### Métricas Globales
- ✅ Total de sesiones
- ✅ Usuarios únicos
- ✅ Tiempo promedio por página (segundos)
- ✅ Usuarios que intentaron subastar
- ✅ Porcentaje de conversión
- ✅ Top 10 categorías más vistas
- ✅ Distribución geográfica (Top 10)

### Detalles de Sesiones
- Información completa de cada sesión
- Itinerario de usuario
- Duración y ubicación

---

## 8. Consideraciones de Seguridad

### Implementadas ✅
- Validación de userId
- Validación de sessionId
- Manejo seguro de errores
- Logging de errores

### Por Implementar ⚠️
- Autenticación con JWT
- Rate limiting
- Encriptación de datos sensibles
- Auditoría de cambios

---

## 9. Troubleshooting

### Error: "Usuario no encontrado"
**Causa**: userId no existe en la colección User
**Solución**: Verificar que el usuario esté registrado

### Error: "Sesión de analíticas no encontrada"
**Causa**: sessionId inválido o expirado
**Solución**: Llamar a `/entry` antes de otras operaciones

### Datos no se guardan
**Causa**: Servidor no conectado o ruta no registrada
**Solución**: Verificar que analyticsRoutes está en server.ts

---

## 10. Ejemplos de Reportes

### Reporte de Sesión del 12 de Noviembre
```json
{
  "message": "Reporte de analíticas generado correctamente",
  "totalSessions": 42,
  "statistics": {
    "totalUsers": 15,
    "avgTimePerPage": 1842,
    "usersAttemptedAuction": 28,
    "percentageAttemptedAuction": 66.7,
    "topCategories": [
      {"name": "Electrónica", "count": 34},
      {"name": "Deportes", "count": 28},
      {"name": "Libros", "count": 18}
    ],
    "locationDistribution": [
      {"location": "Colombia - Cundinamarca - Bogotá", "count": 28},
      {"location": "Colombia - Antioquia - Medellín", "count": 14}
    ]
  }
}
```

---

## 11. Validación Final

✅ **Todos los requisitos cumplidos**:

1. ✅ Ubicación: País, Departamento, Ciudad
2. ✅ Tiempo dentro de la página: En segundos
3. ✅ Captura de categorías clickeadas: Array con $addToSet
4. ✅ Hora de ingreso: ISO 8601 Date
5. ✅ Intento de subastar: Boolean flag

✅ **Base de datos**: MongoDB con esquema validado
✅ **API**: 6 endpoints implementados y funcionales
✅ **Integración**: Frontend ↔ Backend completamente conectada

---

**Status**: ✅ PROYECTO COMPLETAMENTE IMPLEMENTADO

**Última validación**: 12 de noviembre de 2025  
**Responsable del qa**: Sistema de Analíticas BidUp
