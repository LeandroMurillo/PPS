import { Router } from 'express';

import {
	listarActoresController,
	obtenerActoresMapaController,
	obtenerActorController,
	obtenerFiltrosListadoActoresController,
	obtenerFiltrosMapaController,
} from './actores.controller.js';

export const actoresPublicosRouter = Router();

actoresPublicosRouter.get('/filtros', obtenerFiltrosListadoActoresController);
actoresPublicosRouter.get('/mapa/filtros', obtenerFiltrosMapaController);
actoresPublicosRouter.get('/mapa', obtenerActoresMapaController);
actoresPublicosRouter.get('/', listarActoresController);
actoresPublicosRouter.get('/:id', obtenerActorController);
