# Gestión de usuarios hospitalarios

Aplicación de examen con Angular, FastAPI y MySQL/MariaDB.

## Estructura

- `Frontend/`: aplicación Angular con controles HTML/CSS nativos.
- `backend/`: API FastAPI, modelos SQLAlchemy y servicios.
- `DB/hospital_usuarios.sql`: creación no destructiva de la base, tabla y datos
  sintéticos de demostración.

## Preparación local

1. Inicia MySQL desde XAMPP.
2. Desde el monitor de MariaDB, ejecuta el script SQL:

   ```sql
   SOURCE C:/ruta/al/proyecto/DB/hospital_usuarios.sql;
   ```

   El script usa `CREATE ... IF NOT EXISTS` e `INSERT IGNORE`; no borra tablas
   ni elimina datos existentes.

3. En una terminal, configura e inicia FastAPI:

   ```powershell
   cd .\backend
   ```

   Si ya existía un entorno virtual creado antes del cambio de carpeta,
   renómbralo y crea uno nuevo para actualizar sus rutas internas:

   ```powershell
   Rename-Item .venv .venv-anterior
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   Copy-Item .env.example .env
   ```

   Edita `.env` con las credenciales locales de MySQL y ejecuta:

   ```powershell
   uvicorn app.main:app --reload
   ```

4. En otra terminal, configura Angular:

   ```powershell
   cd .\Frontend
   npm install
   ```

   Luego inicia Angular:

   ```powershell
   npm start
   ```

Abre `http://localhost:4200/login`. La API está en `http://127.0.0.1:8000` y su
documentación en `http://127.0.0.1:8000/docs`.

## Pruebas de integración

- [ ] XAMPP muestra MySQL/MariaDB en ejecución y escucha en el puerto configurado.
- [ ] `GET /health` responde `200`.
- [ ] `GET /api/usuarios/` responde `200` y lista datos desde `usuarios`.
- [ ] Registro válido crea una cuenta con estado `Activado`; verificarla en MySQL.
- [ ] Registro con identificación, email o nombre de usuario duplicado devuelve
      `409`.
- [ ] Login válido permite acceder a `/usuarios`; credenciales incorrectas se
      rechazan.
- [ ] Usuario desactivado no puede iniciar sesión; el API responde `403`.
- [ ] En la tabla, editar actualiza campos, cambiar estado persiste el nuevo
      valor y eliminar devuelve `204`; confirmar cada cambio en MySQL.
- [ ] Angular puede llamar al API desde `http://localhost:4200` sin errores CORS.
- [ ] Ejecutar `npm run build` desde `Frontend/`.

La interfaz usa controles HTML nativos y ya no requiere PrimeUI. Esta lista
sirve para validar el flujo en cada instalación; marca los pasos solo después
de comprobarlos en tu entorno local.

## Publicación

Rama de examen: `Examen-2-JimmyAlpala-Dolmer-Solarte`. Se usa guion porque Git
no admite espacios en los nombres de ramas.

El proyecto no debe incluir entornos virtuales, `node_modules`, compilados,
ni archivos `.env`.
