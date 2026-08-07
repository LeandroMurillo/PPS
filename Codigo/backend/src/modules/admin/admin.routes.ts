import { Router } from 'express';

import {
	asignarModeradorAdminController,
	cambiarEstadoUsuarioAdminController,
	listarActoresAdminController,
	listarUsuariosAdminController,
	obtenerUsuarioAdminController,
} from './admin.controller.js';

export const adminRouter = Router();

adminRouter.get('/usuarios', listarUsuariosAdminController);
adminRouter.get('/usuarios/:id', obtenerUsuarioAdminController);
adminRouter.patch('/usuarios/:id/estado', cambiarEstadoUsuarioAdminController);
adminRouter.put('/usuarios/:id/moderacion', asignarModeradorAdminController);
adminRouter.get('/actores', listarActoresAdminController);
