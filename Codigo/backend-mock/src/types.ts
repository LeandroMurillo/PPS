export type GeneroCodigo = 'M' | 'F' | 'MF' | 'FM' | 'B' | 'O' | 'N';

export type CategoriaIcono =
	| 'Category'
	| 'MusicNote'
	| 'Handyman'
	| 'TheaterComedy'
	| 'Movie'
	| 'MenuBook'
	| 'Palette'
	| 'AccountBalance'
	| 'Museum'
	| 'DirectionsRun'
	| 'CameraAlt'
	| 'DesignServices'
	| 'Restaurant'
	| 'Architecture'
	| 'School'
	| 'Celebration'
	| 'Storefront'
	| 'SportsEsports'
	| 'Radio'
	| 'Checkroom'
	| 'Park'
	| 'LocalLibrary'
	| 'TEATRO'
	| 'MUSICA'
	| 'DANZA'
	| 'ARTES_VISUALES'
	| 'AUDIOVISUAL'
	| 'LITERATURA'
	| 'ARTESANIA'
	| 'PATRIMONIO'
	| 'GESTION_CULTURAL'
	| 'OTRO';

export type UsuarioMock = {
	id: number;
	nombre: string;
	apellido: string;
	email: string;
	genero: GeneroCodigo;
	fechaNacimiento: string;
	nacionalidad: string;
	cuil: string;
	actividadesArcaCodigo: string | null;
	actividadArca?: string | null;
	fotoDniUrl?: string | null;
	rol: 'USUARIO' | 'MODERADOR' | 'ADMIN';
	estado: 'A' | 'P' | 'I';
	fechaRegistro: string;
	categoriasModeracion?: number[];
};

export type CategoriaMock = {
	id: number;
	nombre: string;
	icono: CategoriaIcono;
	estado: 'A' | 'I';
};

export type SubcategoriaMock = {
	id: number;
	idCategoria: number;
	nombre: string;
	estado: 'A' | 'I';
};

export type UbicacionMock = {
	id?: number;
	provincia: string;
	departamento: string;
	localidad: string;
	direccion: string;
	latitud: number;
	longitud: number;
	esPublica: boolean;
};

export type PortafolioItemMock = {
	id: number;
	idActor: number;
	tipo: 'IMAGEN' | 'LINK' | 'RRSS';
	descripcion: string;
	url: string;
	fechaCreacion: string;
};

export type EventoMock = {
	id: number;
	idActor: number;
	nombre: string;
	descripcion: string;
	fecha: string;
};

export type IntegranteMock = {
	tipo: 'REGISTRADO' | 'NO_REGISTRADO';
	idActor: number;
	idUsuario: number | null;
	idIntegranteNoRegistrado: number | null;
	nombre: string;
	apellido: string;
	email: string | null;
	rol: string;
	esDueno: boolean;
};

export type ActorMock = {
	id: number;
	idUsuarioDueno: number;
	nombre: string;
	descripcion: string;
	foto: string | null;
	cuit: string | null;
	tipoActor: 'INDIVIDUO' | 'COLECTIVO' | 'ESPACIO';
	fechaCreacion: string;
	estado: 'A' | 'P' | 'I';
	idCategoria: number;
	idSubcategoria: number | null;
	ubicacion: UbicacionMock;
	respuestasFormulario?: Record<number, string | number | boolean | string[]>;
};

export type PreguntaBancoMock = {
	id: number;
	pregunta: string;
	tipoDato:
		'TEXTO' | 'NUMERO' | 'BOOLEANO' | 'FECHA' | 'URL' | 'EMAIL' | 'TELEFONO' | 'OPCION_UNICA' | 'OPCION_MULTIPLE';
	opciones: string[] | null;
};

export type PreguntaFormularioMock = PreguntaBancoMock & {
	idPreguntaReemplazada: number | null;
	preguntaReemplazada: string | null;
	orden: number;
	esObligatorio: boolean;
	esPublico: boolean;
	fechaIncorporacion: string;
	fechaDesactivacion: string | null;
	estado: 'A' | 'I';
	cantidadActoresQueRespondieron: number;
};

export type FormularioMock = {
	id: number;
	idCategoria: number;
	categoria: string;
	estadoCategoria: 'A' | 'I';
	idSubcategoria: number | null;
	subcategoria: string | null;
	estadoSubcategoria: 'A' | 'I' | null;
	ambito: 'CATEGORIA' | 'SUBCATEGORIA';
	titulo: string;
	descripcion: string | null;
	fechaCreacion: string;
	cantidadPreguntasHistoricas: number;
	cantidadPreguntasActivas: number;
	cantidadActoresConRespuestas: number;
	preguntas: PreguntaFormularioMock[];
};

export type ActividadArcaMock = {
	codigo: string;
	descripcion: string;
};

export type ConvocatoriaMock = {
	id: number;
	titulo: string;
	descripcion: string;
	requisitos?: string;
	fechaInicio: string;
	fechaCierre: string;
	estado: 'ABIERTA' | 'CERRADA' | 'EVALUACION' | 'FINALIZADA';
	idCategoria?: number | null;
	categoria?: string | null;
};

export type PostulacionMock = {
	id: number;
	idConvocatoria: number;
	idActor: number;
	idUsuario: number;
	fechaPostulacion: string;
	estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
	notas?: string | null;
};
