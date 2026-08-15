import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware.js';
import {
	actualizarPerfilUsuarioController,
	cambiarContraseñaUsuarioController,
	eliminarCuentaUsuarioController,
	obtenerPerfilUsuarioController,
} from './usuario.controller.js';

export const usuarioRouter = Router();

usuarioRouter.use(verifyToken);

usuarioRouter.get('/perfil', obtenerPerfilUsuarioController);
usuarioRouter.put('/perfil', actualizarPerfilUsuarioController);
usuarioRouter.put('/contrasena', cambiarContraseñaUsuarioController);
usuarioRouter.delete('/cuenta', eliminarCuentaUsuarioController);
