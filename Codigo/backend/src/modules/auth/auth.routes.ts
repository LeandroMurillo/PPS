import { Router } from 'express';

import { loginController, registrarUsuarioController } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/registro', registrarUsuarioController);
authRouter.post('/login', loginController);

