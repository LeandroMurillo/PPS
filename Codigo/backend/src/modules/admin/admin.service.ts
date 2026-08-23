import {
	asignarModeradorAdminRepository,
	asociarPreguntaFormularioAdminRepository,
	buscarFormularioAdminRepository,
	cambiarEstadoActoresAdminRepository,
	cambiarEstadoUsuarioAdminRepository,
	crearCategoriaAdminRepository,
	crearFormularioAdminRepository,
	crearPreguntaFormularioAdminRepository,
	crearSubcategoriaAdminRepository,
	editarCategoriaAdminRepository,
	editarFormularioAdminRepository,
	editarPreguntaAdminRepository,
	editarSubcategoriaAdminRepository,
	eliminarCategoriaAdminRepository,
	eliminarSubcategoriaAdminRepository,
	desactivarPreguntaFormularioAdminRepository,
	reemplazarPreguntaFormularioAdminRepository,
	crearPreguntaBancoAdminRepository,
	listarActoresAdminRepository,
	listarCategoriasAdminRepository,
	listarPreguntasAdminRepository,
	listarSubcategoriasAdminRepository,
	listarUsuariosAdminRepository,
	obtenerActorAdminRepository,
	obtenerCategoriaAdminRepository,
	obtenerSubcategoriaAdminRepository,
	obtenerFormularioAdminRepository,
	obtenerUsuarioAdminRepository,
	auditarIntegridadSistemaAdminRepository,
	listarActividadesArcaAdminRepository,
	obtenerActividadArcaAdminRepository,
	crearActividadArcaAdminRepository,
	editarActividadArcaAdminRepository,
	eliminarActividadArcaAdminRepository,
	importarActividadesArcaBatchRepository,
} from './admin.repository.js';

import type {
	AsociarPreguntaFormularioAdminBody,
	AuditarIntegridadSistemaAdminResponse,
	ListarActoresAdminQuery,
	ListarActoresAdminResponse,
	ListarCategoriasAdminQuery,
	ListarCategoriasAdminResponse,
	ListarPreguntasAdminQuery,
	ListarPreguntasAdminResponse,
	ListarSubcategoriasAdminQuery,
	ListarSubcategoriasAdminResponse,
	ListarUsuariosAdminQuery,
	ListarUsuariosAdminResponse,
	ObtenerUsuarioAdminResponse,
	ObtenerActorAdminResponse,
	ObtenerCategoriaAdminResponse,
	ObtenerSubcategoriaAdminResponse,
	CambiarEstadoActoresAdminResponse,
	BuscarFormularioAdminResponse,
	CrearPreguntaFormularioAdminBody,
	EditarPreguntaAdminBody,
	GuardarFormularioAdminBody,
	ObtenerFormularioAdminResponse,
	PreguntaBancoAdmin,
	ReemplazarPreguntaFormularioAdminBody,
	EditarActividadArcaAdminBody,
	GuardarActividadArcaAdminBody,
	ImportarActividadesArcaAdminResponse,
	ImportarActividadesArcaError,
	ListarActividadesArcaAdminQuery,
	ListarActividadesArcaAdminResponse,
	ObtenerActividadArcaAdminResponse,
} from './admin.schemas.js';

function pagination(total: number, count: number, limit: number, offset: number) {
	return {
		total,
		count,
		limit,
		offset,
		hasNext: offset + count < total,
	};
}

export async function listarUsuariosAdminService(
	query: ListarUsuariosAdminQuery,
): Promise<ListarUsuariosAdminResponse> {
	const result = await listarUsuariosAdminRepository(query);

	return {
		data: result.usuarios,
		pagination: pagination(result.total, result.usuarios.length, query.limit, query.offset),
	};
}

export async function obtenerUsuarioAdminService(id: number): Promise<ObtenerUsuarioAdminResponse | null> {
	const usuario = await obtenerUsuarioAdminRepository(id);

	return usuario ? { data: usuario } : null;
}

export async function cambiarEstadoUsuarioAdminService(
	idUsuarioSolicitante: number,
	id: number,
	estado: 'A' | 'I',
): Promise<ObtenerUsuarioAdminResponse | null> {
	const usuario = await cambiarEstadoUsuarioAdminRepository(idUsuarioSolicitante, id, estado);

	return usuario ? { data: usuario } : null;
}

export async function asignarModeradorAdminService(
	id: number,
	idCategorias: number[],
): Promise<ObtenerUsuarioAdminResponse | null> {
	const usuario = await asignarModeradorAdminRepository(id, idCategorias);

	return usuario ? { data: usuario } : null;
}

export async function listarActoresAdminService(
	idUsuarioSolicitante: number,
	query: ListarActoresAdminQuery,
): Promise<ListarActoresAdminResponse> {
	const result = await listarActoresAdminRepository(idUsuarioSolicitante, query);

	return {
		data: result.actores,
		pagination: pagination(result.total, result.actores.length, query.limit, query.offset),
	};
}

export async function obtenerActorAdminService(
	idUsuarioSolicitante: number,
	id: number,
): Promise<ObtenerActorAdminResponse | null> {
	const actor = await obtenerActorAdminRepository(idUsuarioSolicitante, id);

	return actor ? { data: actor } : null;
}

export async function cambiarEstadoActoresAdminService(
	idUsuarioSolicitante: number,
	ids: number[],
	estado: 'A' | 'I',
): Promise<CambiarEstadoActoresAdminResponse> {
	return {
		data: { actualizados: await cambiarEstadoActoresAdminRepository(idUsuarioSolicitante, ids, estado) },
	};
}

export async function listarCategoriasAdminService(
	idUsuarioSolicitante: number,
	query: ListarCategoriasAdminQuery,
): Promise<ListarCategoriasAdminResponse> {
	const result = await listarCategoriasAdminRepository(idUsuarioSolicitante, query);

	return {
		data: result.categorias,
		pagination: pagination(result.total, result.categorias.length, query.limit, query.offset),
	};
}

export async function obtenerCategoriaAdminService(id: number): Promise<ObtenerCategoriaAdminResponse | null> {
	const categoria = await obtenerCategoriaAdminRepository(id);

	return categoria ? { data: categoria } : null;
}

export async function crearCategoriaAdminService(
	nombre: string,
	icono: string,
	estado: 'A' | 'I',
): Promise<ObtenerCategoriaAdminResponse> {
	return { data: await crearCategoriaAdminRepository(nombre, icono, estado) };
}

export async function editarCategoriaAdminService(
	id: number,
	nombre: string,
	icono: string,
	estado: 'A' | 'I',
): Promise<ObtenerCategoriaAdminResponse> {
	return { data: await editarCategoriaAdminRepository(id, nombre, icono, estado) };
}

export async function eliminarCategoriaAdminService(id: number): Promise<ObtenerCategoriaAdminResponse> {
	return { data: await eliminarCategoriaAdminRepository(id) };
}

export async function listarSubcategoriasAdminService(
	idCategoria: number,
	query: ListarSubcategoriasAdminQuery,
): Promise<ListarSubcategoriasAdminResponse> {
	const result = await listarSubcategoriasAdminRepository(idCategoria, query);

	return {
		data: result.subcategorias,
		pagination: pagination(result.total, result.subcategorias.length, query.limit, query.offset),
	};
}

export async function obtenerSubcategoriaAdminService(
	idCategoria: number,
	idSubcategoria: number,
): Promise<ObtenerSubcategoriaAdminResponse | null> {
	const subcategoria = await obtenerSubcategoriaAdminRepository(idCategoria, idSubcategoria);

	return subcategoria ? { data: subcategoria } : null;
}

export async function crearSubcategoriaAdminService(
	idCategoria: number,
	nombre: string,
	estado: 'A' | 'I',
): Promise<ObtenerSubcategoriaAdminResponse> {
	return { data: await crearSubcategoriaAdminRepository(idCategoria, nombre, estado) };
}

export async function editarSubcategoriaAdminService(
	idCategoria: number,
	idSubcategoria: number,
	nombre: string,
	estado: 'A' | 'I',
): Promise<ObtenerSubcategoriaAdminResponse> {
	return { data: await editarSubcategoriaAdminRepository(idCategoria, idSubcategoria, nombre, estado) };
}

export async function eliminarSubcategoriaAdminService(
	idCategoria: number,
	idSubcategoria: number,
): Promise<ObtenerSubcategoriaAdminResponse> {
	return { data: await eliminarSubcategoriaAdminRepository(idCategoria, idSubcategoria) };
}

export async function buscarFormularioAdminService(
	idCategoria: number,
	idSubcategoria: number | null,
): Promise<BuscarFormularioAdminResponse> {
	return { data: await buscarFormularioAdminRepository(idCategoria, idSubcategoria) };
}

export async function obtenerFormularioAdminService(
	idFormulario: number,
): Promise<ObtenerFormularioAdminResponse | null> {
	const formulario = await obtenerFormularioAdminRepository(idFormulario);

	return formulario ? { data: formulario } : null;
}

export async function crearFormularioAdminService(
	idCategoria: number,
	idSubcategoria: number | null,
	data: GuardarFormularioAdminBody,
): Promise<ObtenerFormularioAdminResponse> {
	return { data: await crearFormularioAdminRepository(idCategoria, idSubcategoria, data) };
}

export async function editarFormularioAdminService(
	idFormulario: number,
	data: GuardarFormularioAdminBody,
): Promise<ObtenerFormularioAdminResponse> {
	return { data: await editarFormularioAdminRepository(idFormulario, data) };
}

export async function crearPreguntaFormularioAdminService(
	idFormulario: number,
	data: CrearPreguntaFormularioAdminBody,
): Promise<ObtenerFormularioAdminResponse> {
	return { data: await crearPreguntaFormularioAdminRepository(idFormulario, data) };
}

export async function desactivarPreguntaFormularioAdminService(
	idFormulario: number,
	idPregunta: number,
): Promise<ObtenerFormularioAdminResponse> {
	return { data: await desactivarPreguntaFormularioAdminRepository(idFormulario, idPregunta) };
}

export async function asociarPreguntaFormularioAdminService(
	idFormulario: number,
	data: AsociarPreguntaFormularioAdminBody,
): Promise<ObtenerFormularioAdminResponse> {
	return { data: await asociarPreguntaFormularioAdminRepository(idFormulario, data) };
}

export async function editarPreguntaAdminService(
	idPregunta: number,
	data: EditarPreguntaAdminBody,
): Promise<{ data: PreguntaBancoAdmin }> {
	return { data: await editarPreguntaAdminRepository(idPregunta, data) };
}

export async function reemplazarPreguntaFormularioAdminService(
	idFormulario: number,
	idPreguntaAnterior: number,
	data: ReemplazarPreguntaFormularioAdminBody,
): Promise<ObtenerFormularioAdminResponse> {
	return {
		data: await reemplazarPreguntaFormularioAdminRepository(idFormulario, idPreguntaAnterior, data),
	};
}

export async function crearPreguntaBancoAdminService(
	data: CrearPreguntaFormularioAdminBody,
): Promise<{ data: PreguntaBancoAdmin }> {
	return { data: await crearPreguntaBancoAdminRepository(data) };
}

export async function listarPreguntasAdminService(
	query: ListarPreguntasAdminQuery,
): Promise<ListarPreguntasAdminResponse> {
	return { data: await listarPreguntasAdminRepository(query) };
}

export async function auditarIntegridadSistemaAdminService(
	idUsuarioSolicitante: number,
): Promise<AuditarIntegridadSistemaAdminResponse> {
	const data = await auditarIntegridadSistemaAdminRepository(idUsuarioSolicitante);
	return { data };
}

// ---------------------------------------------------------------------------
// Actividades ARCA
// ---------------------------------------------------------------------------

export async function listarActividadesArcaAdminService(
	query: ListarActividadesArcaAdminQuery,
): Promise<ListarActividadesArcaAdminResponse> {
	const result = await listarActividadesArcaAdminRepository(query);

	return {
		data: result.actividades,
		pagination: pagination(result.total, result.actividades.length, query.limit, query.offset),
	};
}

export async function obtenerActividadArcaAdminService(
	codigo: string,
): Promise<ObtenerActividadArcaAdminResponse | null> {
	const data = await obtenerActividadArcaAdminRepository(codigo);

	return data ? { data } : null;
}

export async function crearActividadArcaAdminService(
	data: GuardarActividadArcaAdminBody,
): Promise<ObtenerActividadArcaAdminResponse> {
	const creada = await crearActividadArcaAdminRepository(data.codigo, data.descripcion);

	return { data: creada };
}

export async function editarActividadArcaAdminService(
	codigo: string,
	data: EditarActividadArcaAdminBody,
): Promise<ObtenerActividadArcaAdminResponse> {
	const editada = await editarActividadArcaAdminRepository(codigo, data.descripcion);

	return { data: editada };
}

export async function eliminarActividadArcaAdminService(codigo: string): Promise<ObtenerActividadArcaAdminResponse> {
	const eliminada = await eliminarActividadArcaAdminRepository(codigo);

	return { data: eliminada };
}

export async function importarActividadesArcaAdminService(
	contenido: string,
): Promise<ImportarActividadesArcaAdminResponse> {
	// Limpieza de caracteres BOM (\uFEFF)
	const cleanContent = contenido.replace(/^\uFEFF/, '');
	const lines = cleanContent.split(/\r?\n/);

	const validItems: { linea: number; codigo: string; descripcion: string }[] = [];
	const errores: ImportarActividadesArcaError[] = [];

	let startIndex = 0;

	// Detectar cabecera opcional
	if (lines.length > 0) {
		const firstLine = lines[0]!.trim();
		if (/^COD_|^"COD_|^CODIGO|COD_ACTIVIDAD/i.test(firstLine)) {
			startIndex = 1;
		}
	}

	for (let i = startIndex; i < lines.length; i++) {
		const lineNumber = i + 1;
		const line = lines[i]!.trim();

		if (!line) {
			continue;
		}

		// Separar por delimitador ';'
		const parts = line.split(';').map((p) => p.trim().replace(/^["']|["']$/g, ''));
		const rawCodigo = parts[0] ?? '';
		const rawDesc = parts[1] ?? '';
		const rawDescLarga = parts[2] ?? '';

		if (!/^\d{6}$/.test(rawCodigo)) {
			errores.push({
				linea: lineNumber,
				codigo: rawCodigo || undefined,
				motivo: 'El código ARCA debe contener exactamente 6 dígitos numéricos',
			});
			continue;
		}

		const chosenDesc = (rawDesc || rawDescLarga).trim().slice(0, 255);

		if (!chosenDesc) {
			errores.push({
				linea: lineNumber,
				codigo: rawCodigo,
				motivo: 'La descripción de la actividad no puede estar vacía',
			});
			continue;
		}

		validItems.push({
			linea: lineNumber,
			codigo: rawCodigo,
			descripcion: chosenDesc,
		});
	}

	let creados = 0;
	let actualizados = 0;
	let sinCambios = 0;

	if (validItems.length > 0) {
		const batchResult = await importarActividadesArcaBatchRepository(validItems);
		creados = batchResult.creados;
		actualizados = batchResult.actualizados;
		sinCambios = batchResult.sinCambios;
		if (batchResult.erroresAdicionales?.length) {
			errores.push(...batchResult.erroresAdicionales);
		}
	}

	errores.sort((a, b) => a.linea - b.linea);

	return {
		data: {
			totalProcesados:
				validItems.length + errores.filter((e) => !validItems.some((v) => v.linea === e.linea)).length,
			creados,
			actualizados,
			sinCambios,
			errores,
		},
	};
}
