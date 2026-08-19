# Mosaico Cultural

## Firebase Authentication (desarrollo)

La aplicación usa Firebase Authentication para Google y email/contraseña. MariaDB conserva los perfiles, roles y estados de aprobación; Express emite la sesión interna solamente después de validar un ID token de Firebase.

1. Copiar `.env.firebase.example` a `.env` dentro de `Codigo` si se usa Docker Compose.
2. Completar las variables `VITE_FIREBASE_*` con la configuración de la aplicación web `mosaico-cultural-dev`.
3. En Firebase Console, generar una clave privada desde **Configuración del proyecto > Cuentas de servicio**.
4. Cargar `project_id`, `client_email` y `private_key` como `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY`. La clave privada debe conservar `\n` en una sola línea en archivos `.env`.
5. No versionar el JSON de la cuenta de servicio ni copiarlo al frontend.

Para ejecutar con Docker:

```powershell
docker compose --env-file .env -f compose.yml up --build
```

Si la base local ya existía antes de Firebase, ejecutar una vez `DB/06_migracion_firebase_auth.sql`. Una base nueva recibe la estructura actualizada desde `01_cultura.sql`, `02_checks.sql` y `03_sp.sql`.

Las cuentas nuevas quedan activadas automáticamente tras verificar el correo.

### Acciones de Correo y Redirección en la Aplicación

Opcionalmente, se puede personalizar la URL base del controlador de acciones desde [Firebase Console](https://console.firebase.google.com/) (**Authentication > Templates > Personalizar URL de acción**).

## Coolify

Las variables `VITE_FIREBASE_*` son argumentos de compilación del frontend. Las variables `FIREBASE_*` son secretos de ejecución exclusivos del backend. En producción se deben usar valores del proyecto Firebase de producción, nunca los de `mosaico-cultural-dev`.
