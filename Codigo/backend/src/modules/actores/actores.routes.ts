import { Router } from 'express';

import { optionalToken } from '../../middleware/auth.middleware.js';
import {
	listarActoresController,
	listarEventosPublicosController,
	obtenerActoresMapaController,
	obtenerActorController,
	obtenerEstadisticasPublicasController,
	obtenerFiltrosListadoActoresController,
	obtenerFiltrosMapaController,
} from './actores.controller.js';

export const actoresPublicosRouter = Router();

actoresPublicosRouter.get('/filtros', obtenerFiltrosListadoActoresController);
actoresPublicosRouter.get('/mapa/filtros', obtenerFiltrosMapaController);
actoresPublicosRouter.get('/mapa', obtenerActoresMapaController);
actoresPublicosRouter.get('/eventos', listarEventosPublicosController);
actoresPublicosRouter.get('/estadisticas', obtenerEstadisticasPublicasController);
actoresPublicosRouter.get('/', listarActoresController);
actoresPublicosRouter.get('/:id', optionalToken, obtenerActorController);
