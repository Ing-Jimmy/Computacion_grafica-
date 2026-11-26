# Backend de usuarios hospitalarios

Backend inicial con FastAPI, SQLAlchemy y MariaDB/MySQL. El modelo `Usuario`
se mapea a la tabla `usuarios` existente; la aplicación no crea ni elimina
tablas automáticamente.

## Preparación

Desde esta carpeta, crea un entorno virtual e instala dependencias:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edita `.env` con las credenciales locales de MySQL/XAMPP. El ejemplo usa
`root` sin contraseña; cambia ese valor si tu instalación tiene otra clave.

## Iniciar

Con MySQL en ejecución y `db_jimmyalpala.usuarios` creada:

```powershell
uvicorn app.main:app --reload
```

La API queda disponible en `http://127.0.0.1:8000`, la documentación en
`http://127.0.0.1:8000/docs` y la comprobación de proceso en
`http://127.0.0.1:8000/health`.

Los orígenes permitidos para Angular se configuran mediante `CORS_ORIGINS`,
separados por comas. Por defecto se permiten `localhost:4200` y
`127.0.0.1:4200`.

## Endpoints de usuarios

- `POST /api/usuarios/registro`: crea una cuenta activada y detecta
  identificaciones, correos y nombres de usuario duplicados.
- `POST /api/usuarios/login`: recibe `identificacion` y `contrasena`;
  rechaza credenciales inválidas y cuentas desactivadas.
- `GET /api/usuarios/`: lista las cuentas.
- `PUT /api/usuarios/{identificacion}`: actualiza uno o más campos enviados
  entre nombre, apellido, email, cargo, teléfono, nombre de usuario y
  contraseña. No permite campos nulos ni cuerpos vacíos.
- `DELETE /api/usuarios/{identificacion}`: elimina la cuenta.
- `PATCH /api/usuarios/{identificacion}/estado`: recibe
  `{"estado": "Activado"}` o `{"estado": "Desactivado"}`.

Las contraseñas nuevas se guardan usando PBKDF2-HMAC-SHA256. Los hashes SHA-256
de los registros de prueba existentes se aceptan al iniciar sesión y se migran
al formato PBKDF2 después de una autenticación correcta.
