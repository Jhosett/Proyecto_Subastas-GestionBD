# Changelog - Correcciones de Autenticación y Pujas

## Fecha: 12 de noviembre de 2025

### 🔧 Problemas Resueltos

#### 1. **Error en Pujas: "Usuario no autenticado"**
- **Síntoma**: Al hacer puja recibía error 400 "Usuario no autenticado"
- **Causa Raíz**: 
  - `product.service.ts` no estaba enviando `userId` en la petición POST
  - Backend esperaba `{ amount, userId }` pero recibía solo `{ amount }`
  
- **Solución Implementada**:
  - Inyectar `UsersService` en `ProductService`
  - Modificar método `bid()` para enviar `userId` junto con `amount`
  - Agregar validación en backend para rechazar pujas sin autenticación

**Archivo Modificado**: `frontend/src/app/services/product.service.ts`
```typescript
bid(id: string, amount: number): Observable<Product> {
  const userId = this.usersService.userId;
  if (!userId) {
    throw new Error('Usuario no autenticado');
  }
  return this.http.post<Product>(`${this.apiUrl}/${id}/bid`, { 
    amount, 
    userId 
  });
}
```

---

#### 2. **Header Desaparecía Rápidamente (Parpadeos)**
- **Síntoma**: Botones de "Dashboard" y "Cerrar Sesión" parpadeaban y no se podían hacer click
- **Causa Raíz**:
  - Interval de 500ms ejecutando `checkLoginStatus()` constantemente
  - Cada ejecución reseteaba `showUserMenu = false`
  - Lógica no reactiva causaba re-renders innecesarios

- **Solución Implementada**:
  - Convertir a `computed()` signals reactivos
  - Eliminar polling innecesario
  - Usar `effect()` solo para resetear menú al desloguear

**Archivo Modificado**: `frontend/src/app/components/header/header.component.ts`
```typescript
// Antes: propiedades normales + polling
username = '';
isAdmin = false;
private checkInterval: any;

// Después: computed signals reactivos
username = computed(() => {
  if (!this.isLoggedIn()) return '';
  const userData = localStorage.getItem('userData');
  if (userData) {
    const user = JSON.parse(userData);
    return user.nombre || 'Usuario';
  }
  return 'Usuario';
});

isAdmin = computed(() => {
  if (!this.isLoggedIn()) return false;
  const userData = localStorage.getItem('userData');
  if (userData) {
    const user = JSON.parse(userData);
    return user.isAdmin || false;
  }
  return false;
});
```

---

#### 3. **Backend: Error de Campos No Existentes en `placeBid()`**
- **Síntoma**: TypeScript error en `product.controller.ts` línea 111
- **Causa Raíz**: Función intentaba actualizar campos `precioActual` y `pujas` que no existen en modelo `Product`
- **Solución Implementada**:
  - Refactorizar `placeBid()` para usar modelo `Bid` separado
  - Seguir arquitectura consistente con `bid.controller.ts` existente
  - Obtener puja máxima anterior correctamente

**Archivo Modificado**: `backend/src/controllers/product.controller.ts`
```typescript
// Ahora usa el modelo Bid en lugar de intentar actualizar Product
const highestBid = await Bid.findOne({ productoId: productoId }).sort({ valorPuja: -1 });
const precioMinimo = highestBid ? highestBid.valorPuja : product.precioInicial;
const newBid = await Bid.create({ productoId, compradorId, valorPuja });
```

---

#### 4. **Backend tsconfig.json: Incluía Archivos del Frontend**
- **Síntoma**: Error de compilación TypeScript
- **Causa Raíz**: `backend/tsconfig.json` incluía ruta `../frontend/src/app/models/analytics-session.model.ts`
- **Solución**: Remover inclusión de archivos frontend

**Archivo Modificado**: `backend/tsconfig.json`
```json
"include": ["src"]  // Antes incluía archivos del frontend
```

---

#### 5. **Frontend: Estilos Tailwind Incorrectos**
- **Síntoma**: Error de compilación: "Could not resolve tailwindcss"
- **Causa Raíz**: Importación incorrecta de Tailwind en estilos
- **Solución**: Usar directivas `@tailwind` correctas y eliminar duplicados

**Archivos Modificados**:
- `frontend/src/styles.css`: Cambiar `@import "tailwindcss"` a directivas `@tailwind`
- `frontend/src/app/app.component.css`: Eliminar importación duplicada

---

### ✅ Estado Actual del Proyecto

**Servidores Activos:**
- Backend: ✅ Escuchando en `http://localhost:8000`
- Frontend: ✅ Escuchando en `http://localhost:4200`
- Base de Datos: ✅ MongoDB conectado

**Compilación:**
- Backend: ✅ Sin errores de TypeScript
- Frontend: ✅ Compilado exitosamente (warnings sobre presupuesto CSS solo)

**Funcionalidades Probadas:**
- ✅ Login/Registro funcionando
- ✅ Autenticación persistente en header
- ✅ Botones Dashboard/Logout visibles cuando autenticado
- ✅ Sistema de pujas funcionando con `userId`
- ✅ Analytics registrando intentos de subasta

---

### 📋 Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/controllers/product.controller.ts` | Refactorizar `placeBid()` para usar modelo Bid |
| `backend/src/controllers/product.controller.ts` | Agregar import de Bid model |
| `backend/tsconfig.json` | Remover inclusión de archivos frontend |
| `frontend/src/app/services/product.service.ts` | Agregar inyección de UsersService y enviar userId |
| `frontend/src/app/components/header/header.component.ts` | Refactorizar a computed() signals reactivos |
| `frontend/src/app/components/home/home.component.ts` | Agregar validación de autenticación en onPlaceBid() |
| `frontend/src/styles.css` | Corregir directivas @tailwind |
| `frontend/src/app/app.component.css` | Eliminar importación duplicada de Tailwind |

---

### 🚀 Próximos Pasos Opcionales

- [ ] Optimizar bundle size (warnings sobre presupuesto CSS)
- [ ] Implementar guards de rutas para proteger Dashboard
- [ ] Agregar testing e2e para flujo de autenticación
- [ ] Mejorar feedback visual durante login/logout
