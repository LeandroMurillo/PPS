import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware.js';
import {
	actualizarPerfilUsuarioController,
	eliminarCuentaUsuarioController,
	obtenerPerfilUsuarioController,
} from './usuario.controller.js';

export const usuarioRouter = Router();

usuarioRouter.use(verifyToken);

usuarioRouter.get('/perfil', obtenerPerfilUsuarioController);
usuarioRouter.put('/perfil', actualizarPerfilUsuarioController);
usuarioRouter.delete('/cuenta', eliminarCuentaUsuarioController);
