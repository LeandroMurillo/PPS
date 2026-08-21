# Standalone Backend Mock (Mosaico Cultural)

Servidor HTTP de prueba independiente desarrollado en **Node.js + Express** para permitir el desarrollo, pruebas de rendimiento (stress test) y demostraciones del frontend sin necesidad de conectar una base de datos ni ejecutar el backend de producción.

---

## 🚀 Características principales

- **Servidor HTTP Independiente en Puerto 3000:** Totalmente desacoplado del frontend. El frontend simplemente ejecuta `npm run dev` y Vite redirige las llamadas `/api` a `http://localhost:3000`.
- **Datos Masivos de Prueba (500+ Actores):**
    - Actores culturales ubicados geográficamente en los 17 departamentos de Tucumán (_San Miguel, Yerba Buena, Tafí Viejo, Tafí del Valle, Monteros, Concepción, Lules, Simoca, etc._).
    - Categorías (`Música`, `Teatro`, `Danza`, `Artes Visuales`, `Audiovisual`, `Artesanía`).
    - Actividades officiales de ARCA.
    - Formularios, encuestas dinámicas, eventos y portafolios de prueba.

---

## 🔑 Cuentas Firebase de prueba

La autenticación se realiza en Firebase. El backend mock recibe el ID token y no almacena ni valida contraseñas.

| Rol                   | Email                 | Contraseña |
| --------------------- | --------------------- | ---------- |
| **Administrador**     | `admin@mosaico.com`   | `123456`   |
| **Moderador**         | `mod@mosaico.com`     | `123456`   |
| **Artista (Usuario)** | `artista@mosaico.com` | `123456`   |

---

## ⚙️ Cómo ejecutar

1. En una terminal, entra en la carpeta del backend mock y ejecuta:

    ```bash
    cd Codigo/backend-mock
    npm run dev
    ```

    El servidor se iniciará en `http://localhost:3000`.

2. En otra terminal, ejecuta el frontend normalmente:

    ```bash
    cd Codigo/frontend
    npm run dev
    ```

3. Abre tu navegador en `http://localhost:5173`.
