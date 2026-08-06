import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
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
