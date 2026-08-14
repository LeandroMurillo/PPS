import type { ChipProps } from '@mui/material';

export const ESTADO_LABELS = {
	A: 'Activo',
	P: 'Pendiente',
	I: 'Inactivo',
} as const;

export type EstadoCodigo = keyof typeof ESTADO_LABELS;

export const ESTADO_CATEGORIA_LABELS = {
	A: 'Activa',
	I: 'Inactiva',
} as const;

export const ESTADO_COLORS: Record<string, ChipProps['color']> = {
	A: 'success',
	P: 'warning',
	I: 'default',
};

export const TIPO_ACTOR_LABELS = {
	INDIVIDUO: 'Individuo',
	COLECTIVO: 'Colectivo',
	ESPACIO: 'Espacio',
} as const;

export type TipoActorCodigo = keyof typeof TIPO_ACTOR_LABELS;

export const ROL_LABELS = {
	USUARIO: 'Usuario',
	MODERADOR: 'Moderador',
	ADMIN: 'Administrador',
} as const;

export type RolCodigo = keyof typeof ROL_LABELS;

export function getEstadoEtiqueta(estado?: string | null): string {
	if (!estado) return '—';
	return (ESTADO_LABELS as Record<string, string>)[estado] ?? estado;
}

export function getTipoActorEtiqueta(tipo?: string | null): string {
	if (!tipo) return '—';
	return (TIPO_ACTOR_LABELS as Record<string, string>)[tipo] ?? tipo;
}

export function getRolEtiqueta(rol?: string | null): string {
	if (!rol) return '—';
	return (ROL_LABELS as Record<string, string>)[rol] ?? rol;
}
