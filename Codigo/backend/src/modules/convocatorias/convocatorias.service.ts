import {
	cancelarPostulacionRepository,
	crearConvocatoriaRepository,
	editarConvocatoriaRepository,
	eliminarConvocatoriaRepository,
	listarConvocatoriasActivasRepository,
	listarConvocatoriasAdminRepository,
	obtenerConvocatoriaDetalleRepository,
	postularActorRepository,
} from './convocatorias.repository.js';

export async function listarConvocatoriasActivasService(idUsuario: number | null) {
	return await listarConvocatoriasActivasRepository(idUsuario);
}

export async function listarConvocatoriasAdminService(
	busqueda: string | undefined,
	estado: string | undefined,
	limit: number,
	offset: number,
) {
	return await listarConvocatoriasAdminRepository(busqueda, estado, limit, offset);
}

export async function obtenerConvocatoriaDetalleService(idConvocatoria: number) {
	const res = await obtenerConvocatoriaDetalleRepository(idConvocatoria);
	if (!res) {
		throw new Error('La convocatoria solicitada no existe.');
	}
	return res;
}

export async function crearConvocatoriaService(titulo: string, descripcion: string, fechaCierre: string) {
	return await crearConvocatoriaRepository(titulo, descripcion, fechaCierre);
}

export async function editarConvocatoriaService(
	idConvocatoria: number,
	titulo: string,
	descripcion: string,
	fechaCierre: string,
) {
	return await editarConvocatoriaRepository(idConvocatoria, titulo, descripcion, fechaCierre);
}

export async function eliminarConvocatoriaService(idConvocatoria: number) {
	await eliminarConvocatoriaRepository(idConvocatoria);
}

export async function postularActorService(idConvocatoria: number, idActor: number, idUsuario: number) {
	await postularActorRepository(idConvocatoria, idActor, idUsuario);
}

export async function cancelarPostulacionService(idConvocatoria: number, idActor: number, idUsuario: number) {
	await cancelarPostulacionRepository(idConvocatoria, idActor, idUsuario);
}
