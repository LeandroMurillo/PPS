import { Router } from 'express';

import {
	crearSesionFirebaseController,
	listarActividadesArcaController,
	registrarUsuarioController,
} from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/registro', registrarUsuarioController);
authRouter.post('/firebase/session', crearSesionFirebaseController);
authRouter.get('/actividades-arca', listarActividadesArcaController);
