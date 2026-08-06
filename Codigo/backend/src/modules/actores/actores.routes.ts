import { Router } from 'express';

import { listarActoresController } from './actores.controller.js';

export const actoresPublicosRouter = Router();

actoresPublicosRouter.get('/', listarActoresController);
