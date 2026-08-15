import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { actoresPublicosRouter } from './routes/actoresPublicos';
import { misActoresRouter } from './routes/misActores';
import { adminRouter } from './routes/admin';
import { convocatoriasRouter } from './routes/convocatorias';
import { usuarioRouter } from './routes/usuario';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use((req, _res, next) => {
	console.log(`[Mock Backend] ${req.method} ${req.url}`);
	next();
});

// Rutas de API
app.use('/api/auth', authRouter);
app.use('/api/publico/auth', authRouter);
app.use('/api/publico/actores', actoresPublicosRouter);
app.use('/api/mis-actores', misActoresRouter);
app.use('/api/usuario', usuarioRouter);
app.use('/api/admin', adminRouter);
app.use('/api/convocatorias', convocatoriasRouter);

// Health check
app.get('/health', (_req, res) => {
	res.json({ status: 'ok', server: 'Mosaico Cultural Standalone Mock Backend' });
});

app.listen(PORT, () => {
	console.log(`====================================================`);
	console.log(`🚀 Standalone Mock Backend listening on port ${PORT}`);
	console.log(`👉 http://localhost:${PORT}`);
	console.log(`====================================================`);
});
