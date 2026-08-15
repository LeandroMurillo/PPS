import { Router } from 'express';

import { verifyToken } from '../../middleware/auth.middleware.js';
import {
	agregarEventoController,
	agregarIntegranteController,
	agregarIntegranteNoRegistradoController,
	agregarItemPortafolioController,
	cambiarEstadoActorController,
	crearActorController,
	editarActorController,
	eliminarActorController,
	eliminarEventoController,
	eliminarIntegranteController,
	eliminarIntegranteNoRegistradoController,
	editarIntegranteController,
	editarIntegranteNoRegistradoController,
	eliminarItemPortafolioController,
	listarEventosController,
	listarIntegrantesController,
	listarMisActoresController,
	listarPortafolioController,
	obtenerFormulariosActorController,
	obtenerFormulariosAplicablesController,
	obtenerOpcionesRegistroController,
} from './mis-actores.controller.js';

export const misActoresRouter = Router();

misActoresRouter.use(verifyToken);

misActoresRouter.get('/opciones-registro', obtenerOpcionesRegistroController);
misActoresRouter.get('/formularios-aplicables', obtenerFormulariosAplicablesController);
misActoresRouter.get('/', listarMisActoresController);
misActoresRouter.post('/', crearActorController);
misActoresRouter.get('/:id/formularios', obtenerFormulariosActorController);
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
misActoresRouter.put('/:id/integrantes/:idUsuario', editarIntegranteController);
misActoresRouter.delete('/:id/integrantes/:idUsuario', eliminarIntegranteController);
misActoresRouter.post('/:id/integrantes-no-registrados', agregarIntegranteNoRegistradoController);
misActoresRouter.put(
	'/:id/integrantes-no-registrados/:idIntegranteNoRegistrado',
	editarIntegranteNoRegistradoController,
);
misActoresRouter.delete(
	'/:id/integrantes-no-registrados/:idIntegranteNoRegistrado',
	eliminarIntegranteNoRegistradoController,
);
