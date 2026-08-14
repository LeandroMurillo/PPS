import { describe, expect, it } from 'vitest';

import { getPublicErrorMessage } from '../src/shared/public-error.js';

describe('getPublicErrorMessage', () => {
	it('extrae únicamente el mensaje funcional de un SIGNAL de MariaDB', () => {
		const error = new Error(
			"(conn:15, no: 1644, SQLState: 45000) No se encontró ningún usuario registrado con ese correo electrónico. sql: CALL sp_actor_agregar_integrante(?, ?, ?, ?) - parameters:[13,57,'persona@example.com','Manager']",
		);

		expect(getPublicErrorMessage(error, 'No se pudo agregar el integrante.')).toBe(
			'No se encontró ningún usuario registrado con ese correo electrónico.',
		);
	});

	it('prioriza sqlMessage cuando el procedimiento devuelve un error de negocio', () => {
		const error = Object.assign(new Error('Error interno del driver'), {
			errno: 1644,
			sqlState: '45000',
			sqlMessage: 'No tenés permisos para modificar integrantes de este actor.',
		});

		expect(getPublicErrorMessage(error, 'No se pudo modificar el integrante.')).toBe(
			'No tenés permisos para modificar integrantes de este actor.',
		);
	});

	it('oculta errores técnicos de base de datos', () => {
		const error = new Error('SQLState: 42000 sql: SELECT secreto FROM tabla - parameters:[123]');

		expect(getPublicErrorMessage(error, 'No se pudo completar la operación.')).toBe(
			'No se pudo completar la operación.',
		);
	});

	it('conserva errores funcionales de la aplicación', () => {
		const error = new Error('El rol es obligatorio.');

		expect(getPublicErrorMessage(error, 'No se pudo completar la operación.')).toBe('El rol es obligatorio.');
	});
});
