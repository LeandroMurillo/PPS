import { describe, expect, it } from 'vitest';
import { saveDniImage } from '../src/modules/auth/auth.service.js';

describe('validación y seguridad en subida de DNI', () => {
	it('guarda exitosamente una imagen válida en formato PNG', () => {
		// 1x1 transparent PNG base64
		const pngBase64 =
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
		const result = saveDniImage(pngBase64);

		expect(result).not.toBeNull();
		expect(result).toMatch(/^\/uploads\/dni\/dni_\d+_[a-f0-9]{8}\.png$/);
	});

	it('guarda exitosamente una imagen válida en formato JPEG', () => {
		const jpegBase64 =
			'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
		const result = saveDniImage(jpegBase64);

		expect(result).not.toBeNull();
		expect(result).toMatch(/^\/uploads\/dni\/dni_\d+_[a-f0-9]{8}\.jpg$/);
	});

	it('rechaza formatos peligrosos como SVG o HTML', () => {
		const svgBase64 = 'data:image/svg+xml;base64,PHN2Zz48c2NyaXB0PmFsZXJ0KDEpPC9zY3JpcHQ+PC9zdmc+';
		const htmlBase64 = 'data:text/html;base64,PGgxPkhlbGxvPC9oMT4=';

		expect(saveDniImage(svgBase64)).toBeNull();
		expect(saveDniImage(htmlBase64)).toBeNull();
	});

	it('rechaza datos malformados o no base64', () => {
		expect(saveDniImage('data:image/png;base64,')).toBeNull();
		expect(saveDniImage('texto_plano_invalido')).toBeNull();
	});
});
