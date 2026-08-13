import { Router } from 'express';

import { listarActividadesArcaController, loginController, registrarUsuarioController } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/registro', registrarUsuarioController);
authRouter.post('/login', loginController);
authRouter.get('/actividades-arca', listarActividadesArcaController);
