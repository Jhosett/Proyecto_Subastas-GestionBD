# 🚀 GUÍA DE EJECUCIÓN Y DEMOSTRACIÓN

## Sistema de Analíticas BidUp - Versión 1.0

---

## INICIO RÁPIDO (5 minutos)

### Paso 1: Iniciar Base de Datos y Backend

```bash
# Terminal 1
cd "c:\Users\jairo\OneDrive\Escritorio\Proyecto_Subastas-GestionBD\backend"
npm run dev
```

**Esperado**:
```
✅ Conectado a MongoDB
Servidor corriendo en http://localhost:8000
```

### Paso 2: Iniciar Frontend (Opcional)

```bash
# Terminal 2
cd "c:\Users\jairo\OneDrive\Escritorio\Proyecto_Subastas-GestionBD\frontend"
ng serve
```

**Esperado**:
```
✔ Compiled successfully
Application bundle generation complete
```

### Paso 3: Probar Endpoints de Analíticas

**Opción A: Con REST Client (VS Code)**
1. Abrir archivo: `backend/analytics.http`
2. Hacer clic en "Send Request" en cada sección
3. Ver respuestas en panel de la derecha

**Opción B: Con cURL en Terminal**
```bash
# Terminal 3
curl -X GET http://localhost:8000/api/analytics/report
```

---

## DEMOSTRACIÓN COMPLETA (10 minutos)

### Escenario: Usuario explorando subastas

#### 1️⃣ Usuario inicia sesión (Minuto 0)

```bash
curl -X POST http://localhost:8000/api/analytics/entry \
  -H "Content-Type: application/json" \
  -d '{"userId":"507f1f77bcf86cd79943900d"}'
```

**Respuesta**:
```json
{
  "sessionId": "507f191e810c19729de860ea"
}
```

📌 **Guardar este sessionId para los siguientes pasos**

#### 2️⃣ Usuario hace clic en categoría "Electrónica" (Minuto 1)

```bash
curl -X POST http://localhost:8000/api/analytics/click \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "507f191e810c19729de860ea",
    "categoryName": "Electrónica"
  }'
```

**Respuesta**:
```json
{
  "message": "Click registrado correctamente"
}
```

#### 3️⃣ Usuario hace clic en "Deportes" (Minuto 2)

```bash
curl -X POST http://localhost:8000/api/analytics/click \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "507f191e810c19729de860ea",
    "categoryName": "Deportes"
  }'
```

#### 4️⃣ Usuario intenta hacer una puja (Minuto 5)

```bash
curl -X POST http://localhost:8000/api/analytics/attempt \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "507f191e810c19729de860ea"}'
```

**Respuesta**:
```json
{
  "message": "Intento de subasta registrado"
}
```

#### 5️⃣ Usuario cierra la aplicación (Minuto 15)

```bash
curl -X POST http://localhost:8000/api/analytics/exit \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "507f191e810c19729de860ea"}'
```

**Respuesta**:
```json
{
  "message": "Salida registrada correctamente",
  "timeSpent": 900
}
```

#### 6️⃣ Obtener reporte de la sesión

```bash
curl -X GET http://localhost:8000/api/analytics/report
```

**Respuesta (parcial)**:
```json
{
  "message": "Reporte de analíticas generado correctamente",
  "totalSessions": 1,
  "statistics": {
    "totalUsers": 1,
    "avgTimePerPage": 900,
    "usersAttemptedAuction": 1,
    "percentageAttemptedAuction": 100,
    "topCategories": [
      {
        "name": "Electrónica",
        "count": 1
      },
      {
        "name": "Deportes",
        "count": 1
      }
    ],
    "locationDistribution": [
      {
        "location": "Colombia, Cundinamarca, Bogotá",
        "count": 1
      }
    ]
  },
  "sessionDetails": [
    {
      "sessionId": "507f191e810c19729de860ea",
      "userId": "507f1f77bcf86cd79943900d",
      "date": "2025-11-12T10:30:00Z",
      "timeOnPage": 900,
      "categoriesClicked": ["Electrónica", "Deportes"],
      "attemptedAuction": true,
      "location": "Colombia, Cundinamarca, Bogotá"
    }
  ]
}
```

---

## CASOS DE USO AVANZADOS

### Caso 1: Filtrar por Usuario Específico

```bash
curl -X GET "http://localhost:8000/api/analytics/user/507f1f77bcf86cd79943900d"
```

**Respuesta**: Estadísticas consolidadas del usuario

### Caso 2: Filtrar por Rango de Fechas

```bash
curl -X GET "http://localhost:8000/api/analytics/report?startDate=2025-11-01&endDate=2025-11-30"
```

### Caso 3: Análisis de Conversión

```bash
# Calcular tasa de conversión manualmente
# Usuarios que intentaron subastar / Total de sesiones * 100
# Ejemplo: 28 usuarios / 42 sesiones = 66.7%
```

---

## VERIFICACIÓN DE DATOS EN MONGODB

### Conectarse a MongoDB

```bash
mongosh
```

### Ver todas las sesiones

```bash
use subastas-bd
db.analytics.find().pretty()
```

### Ver por usuario

```bash
db.analytics.find({ userId: "507f1f77bcf86cd79943900d" }).pretty()
```

### Estadísticas rápidas

```bash
# Total de sesiones
db.analytics.countDocuments()

# Usuarios únicos
db.analytics.distinct("userId").length

# Top 5 categorías
db.analytics.aggregate([
  { $unwind: "$categoriasClickeadas" },
  { $group: { _id: "$categoriasClickeadas", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 5 }
])
```

---

## SOLUCIÓN DE PROBLEMAS

### ❌ Error: "Usuario no encontrado"

**Causa**: El userId no existe en la base de datos
**Solución**: 
1. Usar un userId válido
2. O crear un usuario primero:
```bash
# En la aplicación frontend, registrarse como usuario
```

### ❌ Error: "Sesión no encontrada"

**Causa**: SessionId inválido o expirado
**Solución**: 
1. Usar el sessionId correcto de la respuesta /entry
2. No reutilizar sessionIds antiguos

### ❌ Backend no responde

**Causa**: Servidor no está corriendo
**Solución**:
```bash
cd backend
npm run dev
```

### ❌ Error: "Cannot GET /api/analytics/report"

**Causa**: Rutas no registradas en server.ts
**Solución**: Verificar que analyticsRoutes está importado en server.ts

---

## ARCHIVO DE PRUEBA

**Ubicación**: `backend/analytics.http`

**Uso en VS Code**:
1. Instalar extensión "REST Client" (Huachao Mao)
2. Abrir archivo analytics.http
3. Hacer clic en "Send Request" en cada sección

---

## MONITOREO EN TIEMPO REAL

### Ver logs del servidor

Terminal 1 (Backend) mostrará:
```
[nodemon] restarting due to changes...
[nodemon] starting `ts-node index.ts`
Error al registrar la entrada de analíticas...
Buscando subastas expiradas...
```

### Ver cambios en MongoDB

```bash
# Terminal separada
watch -n 2 'mongosh --eval "db.subastas-bd.analytics.countDocuments()"'
```

---

## DEMOSTRACIÓN ANTE PROFESORES

### Puntos Clave a Mostrar

1. ✅ **Modelo de Datos**
   - Archivo: `backend/src/models/analytics.model.ts`
   - Mostrar: 7 campos requeridos

2. ✅ **Endpoints Funcionales**
   - 6 endpoints implementados (4 POST, 2 GET)
   - Todos respondiendo correctamente

3. ✅ **Base de Datos**
   - Documentos guardados en MongoDB
   - Datos correctamente almacenados

4. ✅ **Validaciones**
   - Usuario existe
   - Sesión existe
   - Campos requeridos

5. ✅ **Reportes**
   - Estadísticas agregadas
   - Top categorías
   - Distribución geográfica

### Script de Demostración (5 min)

```bash
# 1. Mostrar backend corriendo
echo "✅ Backend en ejecución"
curl -X GET http://localhost:8000/api/analytics/report | jq .

# 2. Registrar nueva sesión
RESPONSE=$(curl -s -X POST http://localhost:8000/api/analytics/entry \
  -H "Content-Type: application/json" \
  -d '{"userId":"507f1f77bcf86cd79943900d"}')
SESSION_ID=$(echo $RESPONSE | jq -r '.sessionId')
echo "✅ Sesión creada: $SESSION_ID"

# 3. Registrar eventos
curl -s -X POST http://localhost:8000/api/analytics/click \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"categoryName\":\"Electrónica\"}" | jq .

# 4. Ver en MongoDB
mongosh --eval "db.subastas-bd.analytics.findOne()" 2>/dev/null | head -20

# 5. Mostrar reporte
curl -s -X GET http://localhost:8000/api/analytics/report | jq .

echo "✅ DEMOSTRACIÓN COMPLETA"
```

---

## CHECKLIST FINAL

Antes de presentar:

- [ ] Backend compila sin errores
- [ ] MongoDB está conectado
- [ ] Endpoints responden correctamente
- [ ] Datos se guardan en BD
- [ ] Reportes muestran datos agregados
- [ ] Documentación está completa
- [ ] Todos los requisitos cumplidos

---

## CONTACTO Y SOPORTE

**Sistema**: BidUp Analytics v1.0  
**Fecha**: 12 de noviembre de 2025  
**Status**: 🚀 Listo para demostración

---

### 📋 Archivos Importantes

```
├── backend/
│   ├── src/
│   │   ├── models/analytics.model.ts
│   │   ├── controllers/analytics.controller.ts
│   │   ├── routes/analytics.router.ts
│   │   └── server.ts
│   └── analytics.http
├── frontend/
│   └── src/app/services/analytics.service.ts
├── docs/
│   ├── ANALYTICS_SPECIFICATION.md
│   └── ANALYTICS_INTEGRATION_GUIDE.md
└── IMPLEMENTACION_ANALYTICS_RESUMEN.md
```

**¡Éxito en la presentación! 🎉**
