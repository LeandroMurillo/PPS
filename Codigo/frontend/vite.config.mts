import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	envDir: path.resolve(__dirname, '..'),
	server: {
		proxy: {
			'/api': {
				target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000',
				changeOrigin: true,
			},
		},
	},
	build: {
		chunkSizeWarningLimit: 2600, // Silences the warning for chunks
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						return 'vendor';
					}
				},
			},
		},
	},
});
