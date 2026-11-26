# Frontend Angular

Aplicación Angular para consumir la API FastAPI de usuarios hospitalarios.

## Licencia de PrimeNG

Esta versión de PrimeNG requiere una clave PrimeUI válida. Las personas,
incluidos estudiantes que desarrollan proyectos individuales, pueden solicitar
la Community License gratuita en
<https://primeui.dev/licenses/community>.

Después de obtenerla, abre `public/primeui-license.js` y asigna la clave:

```js
window.__PRIMEUI_LICENSE__ = 'TU_CLAVE_COMMUNITY';
```

En una copia limpia del proyecto, crea primero el archivo local desde la
plantilla:

```powershell
Copy-Item public\primeui-license.example.js public\primeui-license.js
```

Ese archivo está excluido de Git para no incluir la clave en el repositorio. La
aplicación la lee antes de iniciar Angular. No compartas la clave en chats ni la
subas a un repositorio público.

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

Angular queda disponible en `http://localhost:4200`. La URL de la API está
configurada en `src/app/core/services/usuario.service.ts` como
`http://127.0.0.1:8000/api/usuarios`. El backend debe permitir el origen Angular
en su configuración CORS.

## Rutas

- `/login`: inicio de sesión.
- `/registro`: creación de una cuenta.
- `/usuarios`: gestión protegida por `authGuard`, con tabla PrimeNG, creación y
  edición en diálogo, eliminación y alternancia de estado mediante la API.

La sesión del navegador se guarda en `sessionStorage` y se elimina al cerrar
sesión o cerrar la pestaña. El guard evita navegar a la vista de gestión desde
la interfaz sin una sesión guardada. **No sustituye autorización en el
servidor**: los endpoints CRUD del backend actualmente no requieren token ni
validan permisos.

El servicio no guarda la contraseña en el navegador; únicamente conserva los
datos del usuario devueltos por la API después del login.
