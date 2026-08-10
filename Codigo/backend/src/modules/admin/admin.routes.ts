import { Router } from 'express';

import {
	asignarModeradorAdminController,
	cambiarEstadoUsuarioAdminController,
	crearCategoriaAdminController,
	editarCategoriaAdminController,
	eliminarCategoriaAdminController,
	cambiarEstadoActoresAdminController,
	listarActoresAdminController,
	listarCategoriasAdminController,
	listarUsuariosAdminController,
	obtenerCategoriaAdminController,
	obtenerActorAdminController,
	obtenerUsuarioAdminController,
} from './admin.controller.js';

export const adminRouter = Router();

adminRouter.get('/usuarios', listarUsuariosAdminController);
adminRouter.get('/usuarios/:id', obtenerUsuarioAdminController);
adminRouter.patch('/usuarios/:id/estado', cambiarEstadoUsuarioAdminController);
adminRouter.put('/usuarios/:id/moderacion', asignarModeradorAdminController);
adminRouter.get('/actores', listarActoresAdminController);
adminRouter.patch('/actores/estado', cambiarEstadoActoresAdminController);
adminRouter.get('/actores/:id', obtenerActorAdminController);
adminRouter.get('/categorias', listarCategoriasAdminController);
adminRouter.get('/categorias/:id', obtenerCategoriaAdminController);
adminRouter.post('/categorias', crearCategoriaAdminController);
adminRouter.put('/categorias/:id', editarCategoriaAdminController);
adminRouter.delete('/categorias/:id', eliminarCategoriaAdminController);
