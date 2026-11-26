# Frontend Angular

Aplicación Angular para consumir la API FastAPI de usuarios hospitalarios.

## Iniciar en desarrollo

1. Inicia MySQL desde XAMPP.
2. Desde `backend/`, activa su entorno virtual e inicia la API:

   ```powershell
   uvicorn app.main:app --reload
   ```

3. Desde esta carpeta instala dependencias e inicia Angular:

   ```powershell
   npm install
   npm start
   ```

La interfaz usa controles HTML nativos y estilos del proyecto, por lo que no
requiere clave PrimeUI. Angular queda disponible en `http://localhost:4200`.
La URL de la API está configurada en `src/app/core/services/usuario.service.ts` como
`http://127.0.0.1:8000/api/usuarios`. El backend debe permitir el origen Angular
en su configuración CORS.

## Rutas

- `/login`: inicio de sesión.
- `/registro`: creación de una cuenta.
- `/usuarios`: gestión protegida por `authGuard`, con tabla, formulario de
  creación y edición, eliminación y alternancia de estado mediante la API.

La sesión del navegador se guarda en `sessionStorage` y se elimina al cerrar
sesión o cerrar la pestaña. El guard evita navegar a la vista de gestión desde
la interfaz sin una sesión guardada. **No sustituye autorización en el
servidor**: los endpoints CRUD del backend actualmente no requieren token ni
validan permisos.

El servicio no guarda la contraseña en el navegador; únicamente conserva los
datos del usuario devueltos por la API después del login.
