import { Router } from 'express';

import { verifyToken } from '../../middleware/auth.middleware.js';
import {
	agregarEventoController,
	agregarIntegranteController,
	agregarItemPortafolioController,
	cambiarEstadoActorController,
	crearActorController,
	editarActorController,
	eliminarActorController,
	eliminarEventoController,
	eliminarIntegranteController,
	eliminarItemPortafolioController,
	listarEventosController,
	listarIntegrantesController,
	listarMisActoresController,
	listarPortafolioController,
	obtenerFormulariosAplicablesController,
	obtenerOpcionesRegistroController,
} from './mis-actores.controller.js';

export const misActoresRouter = Router();

misActoresRouter.use(verifyToken);

misActoresRouter.get('/opciones-registro', obtenerOpcionesRegistroController);
misActoresRouter.get('/formularios-aplicables', obtenerFormulariosAplicablesController);
misActoresRouter.get('/', listarMisActoresController);
misActoresRouter.post('/', crearActorController);
misActoresRouter.put('/:id', editarActorController);
misActoresRouter.patch('/:id/estado', cambiarEstadoActorController);
misActoresRouter.delete('/:id', eliminarActorController);

misActoresRouter.get('/:id/portafolio', listarPortafolioController);
misActoresRouter.post('/:id/portafolio', agregarItemPortafolioController);
misActoresRouter.delete('/:id/portafolio/:idItem', eliminarItemPortafolioController);

misActoresRouter.post('/:id/eventos', agregarEventoController);
misActoresRouter.get('/:id/eventos', listarEventosController);
misActoresRouter.delete('/:id/eventos/:idEvento', eliminarEventoController);

misActoresRouter.get('/:id/integrantes', listarIntegrantesController);
misActoresRouter.post('/:id/integrantes', agregarIntegranteController);
misActoresRouter.delete('/:id/integrantes/:idUsuario', eliminarIntegranteController);
