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


