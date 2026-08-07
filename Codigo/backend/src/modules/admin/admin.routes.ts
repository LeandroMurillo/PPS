import { Router } from 'express';

import {
	asignarModeradorAdminController,
	cambiarEstadoUsuarioAdminController,
	crearCategoriaAdminController,
	editarCategoriaAdminController,
	eliminarCategoriaAdminController,
	listarActoresAdminController,
	listarCategoriasAdminController,
	listarUsuariosAdminController,
	obtenerCategoriaAdminController,
	obtenerUsuarioAdminController,
} from './admin.controller.js';

export const adminRouter = Router();

adminRouter.get('/usuarios', listarUsuariosAdminController);
adminRouter.get('/usuarios/:id', obtenerUsuarioAdminController);
adminRouter.patch('/usuarios/:id/estado', cambiarEstadoUsuarioAdminController);
adminRouter.put('/usuarios/:id/moderacion', asignarModeradorAdminController);
adminRouter.get('/actores', listarActoresAdminController);
adminRouter.get('/categorias', listarCategoriasAdminController);
adminRouter.get('/categorias/:id', obtenerCategoriaAdminController);
adminRouter.post('/categorias', crearCategoriaAdminController);
adminRouter.put('/categorias/:id', editarCategoriaAdminController);
adminRouter.delete('/categorias/:id', eliminarCategoriaAdminController);
