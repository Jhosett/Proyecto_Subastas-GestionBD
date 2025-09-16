# CONFIGURACIÓN E INSTALACIÓN DE LAS DEPENDENCIAS DE LA BASE DE DATOS


## Carpeta del proyecto /backend
Al momento de clonar el proyecto, lo primero que debes hacer para tener instalado todo lo necesario para que el proyecto pueda funcionar correctamente en la parte del backend es ejecutar lo siguiente:

´´´
cd backend

npm install
´´´

## Configuración de la conección a MongoDB Compass
Para que todo esté correctamente conectado hacia la base de datos de MongoDB, lo primero  que hay que hacer es dirigirse al apartado: ´backend/.env´ donde definirás en la variable **MONGODB_URI** la ruta hacia tu base de datos en MongoDB. Donde luego en el apartado de: ´backend/src/db.ts´ aplicarás dicha configuración también la variable del mismo nombre.

V.gr: ´mongodb://127.0.0.1:27017/auction_store´

Luego de eso deberás ingresar a la aplicación de Mongo para conectar el servidor y que todo este funcionando.

## Ejecutar la base de datos
Para ejecutar la base de datos hay que ejecutar el siguiente comando en la siguiente dirección:

´´´
cd backend

npm run dev
´´´

Luego de eso la terminal le notificará al usuario si todo se está ejecutando correctamente con el siguiente mensaje:
´´´
MongoDB connected successfully
Server is running on port 8000
Database connected successfully
´´´

## Dependencias utilizadas

# express:
framework de Node.js que permite crear un servidor y manejar rutas

# cors:
middleware que permite que el frontend de Angular pueda hacer peticiones http hacia el backend

# dotenv:
carga las variables de entorno de un archivo

# mongoose:
librería para trabajar con mongo en Node.js

# bcrypt:
librería para encriptar y comparar contraseñas