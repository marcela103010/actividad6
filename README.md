# TaskFlow

Aplicación web de gestión de tareas desarrollada con React + Vite y Firebase Authentication/Cloud Firestore.

## Requisitos
- Node.js 20.19+ o 22.12+
- npm
- Cuenta de Firebase y un proyecto creado

## Instalación local
1. Descomprime el proyecto y abre la carpeta `taskflow` en Visual Studio Code.
2. Abre Terminal > New Terminal.
3. Ejecuta `npm install`.
4. Copia `.env.example` y crea un archivo llamado `.env` en la raíz.
5. Completa las variables `VITE_FIREBASE_*` con la configuración de tu aplicación web de Firebase.
6. En Firebase Console activa Authentication > Sign-in method > Email/Password.
7. Crea una base de datos Firestore en modo producción y publica el contenido de `firestore.rules` en la pestaña Rules.
8. Ejecuta `npm run dev` y abre la dirección local que aparece en la terminal.

## Funcionalidades
- Registro e inicio/cierre de sesión mediante Firebase Authentication.
- Tareas privadas por usuario almacenadas en Cloud Firestore.
- Crear, editar, eliminar y marcar tareas como completadas.
- Estados: Pendiente, En progreso y Completada.
- Prioridades: Baja, Media y Alta.
- Búsqueda por título o descripción y filtros por estado/prioridad.
- Resumen de tareas y diseño adaptable a móviles.

## Publicación en Vercel
1. Sube el contenido del proyecto a un repositorio GitHub.
2. Entra a https://vercel.com/ e importa el repositorio.
3. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
4. En Settings > Environment Variables agrega todas las variables `VITE_FIREBASE_*` que están en `.env`.
5. Despliega el proyecto.
6. En Firebase Authentication > Settings > Authorized domains agrega el dominio de Vercel.

## Importante
No subas el archivo `.env` a GitHub. El archivo `.env.example` solo contiene los nombres de las variables, no secretos. La aplicación requiere configurar Firebase para que el registro, la autenticación y la persistencia en la nube funcionen en producción.
