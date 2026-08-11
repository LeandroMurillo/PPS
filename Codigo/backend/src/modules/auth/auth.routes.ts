import { Router } from 'express';

import { registrarUsuarioController } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/registro', registrarUsuarioController);
