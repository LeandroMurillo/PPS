import { Router } from 'express';

import {
	asignarModeradorAdminController,
	cambiarEstadoUsuarioAdminController,
	crearCategoriaAdminController,
	crearSubcategoriaAdminController,
	editarCategoriaAdminController,
	editarSubcategoriaAdminController,
	eliminarCategoriaAdminController,
	eliminarSubcategoriaAdminController,
	cambiarEstadoActoresAdminController,
	listarActoresAdminController,
	listarCategoriasAdminController,
	listarSubcategoriasAdminController,
	listarUsuariosAdminController,
	obtenerCategoriaAdminController,
	obtenerSubcategoriaAdminController,
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
adminRouter.get('/categorias/:idCategoria/subcategorias', listarSubcategoriasAdminController);
adminRouter.post('/categorias/:idCategoria/subcategorias', crearSubcategoriaAdminController);
adminRouter.get('/categorias/:idCategoria/subcategorias/:id', obtenerSubcategoriaAdminController);
adminRouter.put('/categorias/:idCategoria/subcategorias/:id', editarSubcategoriaAdminController);
adminRouter.delete('/categorias/:idCategoria/subcategorias/:id', eliminarSubcategoriaAdminController);
