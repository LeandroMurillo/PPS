import { Router } from 'express';

import { listarActoresAdminController, listarUsuariosAdminController } from './admin.controller.js';

export const adminRouter = Router();

adminRouter.get('/usuarios', listarUsuariosAdminController);
adminRouter.get('/actores', listarActoresAdminController);
