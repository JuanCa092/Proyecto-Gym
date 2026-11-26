# PROYECTO EN REACT SISTEMA DE INVENTARIO
Elaborado con React + BOotstrap y MySQL

EL sistema de inventario contara con inicio de sesion con base de datos en MySQL con contraseña encriptada y JWT

El dashboar contara con gestion CRUD de **Usuarios, categorias, subcategorias, productos** usando datos simulados en JavaScript

## Stack Usado
Frontend = react 19 + vite + Bootstrap 5 + react Router
Backend (solo para login) = node.js + express + jwt
Base de datos = MySQL (XAMPP) + inventario_react
Encriptacion de contraseña = bcrypt (bcryptjs)
Gestiones = Usuario, categorias, subcategorias, productos / datos simulados en JS (useStage + localStorege)
Automatixacion npm scripts + concurrently

Pre Requisitos
 # 1
 instalar node.js verificar desde cmd con "node -v"

 # 2
 Tener XAMPP intalado con MySQL en puerto 3306

 # 3
 Tener un medidor de codigo


 # Conocimientos previos
 **Componente**
 La pantalla se divide en piezas pequeñas y reutilizables
 (Un boton, una tabla, un formulario, un menu) cada componente es una funcion de JavaScript que devuelve lo que tiene que mpstrar
 **JSX** una sintaxis que permite escribir algo parecido a html dentro de JavaScript por eso los archivos terminan con extension .jsx, ejemplo:

```jsx
funtion Saludo () {
    return <h1 className="text-primary">Hola, React</h1>
}

```
- ** Estado (stage)** cada componente puede guardar datos que cambian por ejemplo, lo que el usuario escribe en un input, cuando el estado cambia React vuelve a dibujar automaticamente
solo lo necesario sin recargar la pagina

**SPA** la aplicacion se carga una sola vez en el navegador y luego cambia de pagina sin recargar para esto usamos `react-router-dom`

React solo se encarga de la interfaz grafica para el resto utilizaremos:
**vite** para crear y correr el proyecto
**Bootstrap** par los estilos
**axios** para hablar entre frontend y backend
**react-router-dom** para las rutas

# Pasos para crear el proyecto
- 1 verifique que tengas node.js (node -v)cmd
- 2 Desde la raiz del proyecto crea el proyecto con react y vite
`npm create vite@latest frontend -- --template react`
- 3 Entre a la carpeta frontend con `cd frontend` e instale npm `npm install`
- 4 instale las librerias: `npm install bootstrap bootstrap-icons react-router-dom axios`
- 5  empaquetador optimiza y junta todo el css en un solo archivo al hacer `npm run build`
- 6 instalar las dependencias del backend y frontend al tiempo `npm run install:all`
--------------------------------------------------------------------------------------------
- 7 ingresara la carpeta backend `npm init -y`

- 8 instalar dependencias
- 8.1 `npm install express mysql2 bcryptjs jsonwebtoken cors dotenv`
- 8.2 crea .env dentro de backendpara las variables de entorno
- 8.3 crea src/config/db.js conexion con DB
- 8.4 crea src/middlewares/verificarToken.js valida el token JWT en rutas protegidas
- 8.5 crea src/controllers/auth.controller.js es la logica de inicio de sesion
- 8.6 crea src/routes/auth.routes.js
- 8.7 crea src/server.js
- 8.8 crea en Backend seed.js

- 9 crear las siguientes carpetas en frontend
- 9.1 src/api/axiosClient.js
- 9.2 src/api/authService.js
- 9.3 src/context/authContext.jsx
- 9.3 src/page/LoginPage.jsx

- 10 Construir el esqueleto de visual del panel de administracion ( sedebar + barra superior ) y proteger las rutas
del dashboard para que solo se puedan ver si hay sesion activa
- 10.2 archivos a crear
 * frontend/src/routes/ProtectedRoutes.jsx
 * frontend/src/layoust/DashboardLayout.jsx
 * frontend/src/components/common/Sidebar.jsx
 * frontend/src/components/common/Topbar.jsx
 * frontend/src/pages/DashboardHome.jsx
 * frontend/src/NotFoundPage.jsx
 * editar frontend/src/App.jsx


- 11 Crear la pantalla de gestion de usuarios con CRUD y A/D se usan datos simulados en javaScript
- 11.1 se crean estos archivos
 * frontend/src/data/mockUsuarios.jsx
 * frontend/src/hooks/useCrudSimulado.jsx
 * frontend/src/components/common/EstadoBadge.jsx
 * frontend/src/components/common/ComfirmModal.jsx
 * frontend/src/components/UsuarioFormModal.jsx
 * frontend/src/pages/usuarios/UsuarioPage.jsx