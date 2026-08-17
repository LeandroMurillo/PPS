import { Router } from 'express';

import { optionalToken, requireRole, verifyToken } from '../../middleware/auth.middleware.js';
import {
	cancelarPostulacionController,
	crearConvocatoriaController,
	editarConvocatoriaController,
	eliminarConvocatoriaController,
	listarConvocatoriasActivasController,
	listarConvocatoriasAdminController,
	obtenerConvocatoriaDetalleController,
	postularActorController,
} from './convocatorias.controller.js';

export const convocatoriasRouter = Router();
export const convocatoriasAdminRouter = Router();

// Rutas de Usuario / Públicas
convocatoriasRouter.get('/', optionalToken, listarConvocatoriasActivasController);
convocatoriasRouter.get('/:id', optionalToken, obtenerConvocatoriaDetalleController);
convocatoriasRouter.post('/:id/postular', verifyToken, postularActorController);
convocatoriasRouter.delete('/:id/postulaciones/:idActor', verifyToken, cancelarPostulacionController);

// Rutas de Administración
convocatoriasAdminRouter.use(verifyToken, requireRole('ADMIN', 'MODERADOR'));
convocatoriasAdminRouter.get('/', listarConvocatoriasAdminController);
convocatoriasAdminRouter.post('/', crearConvocatoriaController);
convocatoriasAdminRouter.get('/:id', obtenerConvocatoriaDetalleController);
convocatoriasAdminRouter.put('/:id', editarConvocatoriaController);
convocatoriasAdminRouter.delete('/:id', eliminarConvocatoriaController);
