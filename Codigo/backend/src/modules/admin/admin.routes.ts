import { Router } from 'express';

import {
	asignarModeradorAdminController,
	asociarPreguntaFormularioAdminController,
	auditarIntegridadSistemaAdminController,
	cambiarEstadoUsuarioAdminController,
	crearCategoriaAdminController,
	crearFormularioCategoriaAdminController,
	crearFormularioSubcategoriaAdminController,
	crearPreguntaBancoAdminController,
	crearPreguntaFormularioAdminController,
	crearSubcategoriaAdminController,
	editarCategoriaAdminController,
	editarFormularioCategoriaAdminController,
	editarFormularioSubcategoriaAdminController,
	editarPreguntaAdminController,
	editarSubcategoriaAdminController,
	eliminarCategoriaAdminController,
	eliminarSubcategoriaAdminController,
	desactivarPreguntaFormularioAdminController,
	reemplazarPreguntaFormularioAdminController,
	cambiarEstadoActoresAdminController,
	listarActoresAdminController,
	listarCategoriasAdminController,
	listarPreguntasAdminController,
	listarSubcategoriasAdminController,
	listarUsuariosAdminController,
	obtenerCategoriaAdminController,
	obtenerFormularioCategoriaAdminController,
	obtenerFormularioSubcategoriaAdminController,
	obtenerSubcategoriaAdminController,
	obtenerActorAdminController,
	obtenerUsuarioAdminController,
	listarActividadesArcaAdminController,
	obtenerActividadArcaAdminController,
	crearActividadArcaAdminController,
	editarActividadArcaAdminController,
	eliminarActividadArcaAdminController,
	importarActividadesArcaAdminController,
} from './admin.controller.js';
import { requireRole, verifyToken } from '../../middleware/auth.middleware.js';

export const adminRouter = Router();

adminRouter.use(verifyToken);

adminRouter.get('/actividades-arca', requireRole('ADMIN'), listarActividadesArcaAdminController);
adminRouter.post('/actividades-arca', requireRole('ADMIN'), crearActividadArcaAdminController);
adminRouter.post('/actividades-arca/importar', requireRole('ADMIN'), importarActividadesArcaAdminController);
adminRouter.get('/actividades-arca/:codigo', requireRole('ADMIN'), obtenerActividadArcaAdminController);
adminRouter.put('/actividades-arca/:codigo', requireRole('ADMIN'), editarActividadArcaAdminController);
adminRouter.delete('/actividades-arca/:codigo', requireRole('ADMIN'), eliminarActividadArcaAdminController);

adminRouter.get('/usuarios', requireRole('ADMIN', 'MODERADOR'), listarUsuariosAdminController);
adminRouter.get('/usuarios/:id', requireRole('ADMIN', 'MODERADOR'), obtenerUsuarioAdminController);
adminRouter.patch('/usuarios/:id/estado', requireRole('ADMIN', 'MODERADOR'), cambiarEstadoUsuarioAdminController);
adminRouter.put('/usuarios/:id/moderacion', requireRole('ADMIN'), asignarModeradorAdminController);
adminRouter.get('/actores', requireRole('ADMIN', 'MODERADOR'), listarActoresAdminController);
adminRouter.patch('/actores/estado', requireRole('ADMIN', 'MODERADOR'), cambiarEstadoActoresAdminController);
adminRouter.get('/actores/:id', requireRole('ADMIN', 'MODERADOR'), obtenerActorAdminController);
adminRouter.get('/categorias', requireRole('ADMIN', 'MODERADOR'), listarCategoriasAdminController);
adminRouter.post('/categorias', requireRole('ADMIN'), crearCategoriaAdminController);
adminRouter.get('/categorias/:id', requireRole('ADMIN'), obtenerCategoriaAdminController);
adminRouter.put('/categorias/:id', requireRole('ADMIN'), editarCategoriaAdminController);
adminRouter.delete('/categorias/:id', requireRole('ADMIN'), eliminarCategoriaAdminController);
adminRouter.get('/categorias/:idCategoria/formulario', requireRole('ADMIN'), obtenerFormularioCategoriaAdminController);
adminRouter.post('/categorias/:idCategoria/formulario', requireRole('ADMIN'), crearFormularioCategoriaAdminController);
adminRouter.put('/categorias/:idCategoria/formulario', requireRole('ADMIN'), editarFormularioCategoriaAdminController);
adminRouter.get('/categorias/:idCategoria/subcategorias', requireRole('ADMIN'), listarSubcategoriasAdminController);
adminRouter.post('/categorias/:idCategoria/subcategorias', requireRole('ADMIN'), crearSubcategoriaAdminController);
adminRouter.get(
	'/categorias/:idCategoria/subcategorias/:idSubcategoria/formulario',
	requireRole('ADMIN'),
	obtenerFormularioSubcategoriaAdminController,
);
adminRouter.post(
	'/categorias/:idCategoria/subcategorias/:idSubcategoria/formulario',
	requireRole('ADMIN'),
	crearFormularioSubcategoriaAdminController,
);
adminRouter.put(
	'/categorias/:idCategoria/subcategorias/:idSubcategoria/formulario',
	requireRole('ADMIN'),
	editarFormularioSubcategoriaAdminController,
);
adminRouter.get('/categorias/:idCategoria/subcategorias/:id', requireRole('ADMIN'), obtenerSubcategoriaAdminController);
adminRouter.put('/categorias/:idCategoria/subcategorias/:id', requireRole('ADMIN'), editarSubcategoriaAdminController);
adminRouter.delete(
	'/categorias/:idCategoria/subcategorias/:id',
	requireRole('ADMIN'),
	eliminarSubcategoriaAdminController,
);
adminRouter.get('/preguntas', requireRole('ADMIN'), listarPreguntasAdminController);
adminRouter.post('/preguntas', requireRole('ADMIN'), crearPreguntaBancoAdminController);
adminRouter.put('/preguntas/:idPregunta', requireRole('ADMIN'), editarPreguntaAdminController);
adminRouter.post('/formularios/:idFormulario/preguntas', requireRole('ADMIN'), crearPreguntaFormularioAdminController);
adminRouter.post(
	'/formularios/:idFormulario/preguntas/existente',
	requireRole('ADMIN'),
	asociarPreguntaFormularioAdminController,
);
adminRouter.post(
	'/formularios/:idFormulario/preguntas/:idPregunta/reemplazar',
	requireRole('ADMIN'),
	reemplazarPreguntaFormularioAdminController,
);
adminRouter.delete(
	'/formularios/:idFormulario/preguntas/:idPregunta',
	requireRole('ADMIN'),
	desactivarPreguntaFormularioAdminController,
);
adminRouter.get('/auditoria/integridad', requireRole('ADMIN'), auditarIntegridadSistemaAdminController);
