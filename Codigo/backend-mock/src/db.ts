import type {
	ActividadArcaMock,
	UsuarioMock,
	CategoriaMock,
	SubcategoriaMock,
	ActorMock,
	PortafolioItemMock,
	EventoMock,
	IntegranteMock,
	PreguntaBancoMock,
	FormularioMock,
	CategoriaIcono,
} from './types';

const DEPARTAMENTOS_TUCUMAN = [
	{ departamento: 'Capital', localidad: 'San Miguel de Tucumán', lat: -26.8241, lng: -65.2226 },
	{ departamento: 'Yerba Buena', localidad: 'Yerba Buena', lat: -26.8167, lng: -65.3167 },
	{ departamento: 'Tafí Viejo', localidad: 'Tafí Viejo', lat: -26.7333, lng: -65.2667 },
	{ departamento: 'Tafí del Valle', localidad: 'Tafí del Valle', lat: -26.8522, lng: -65.7089 },
	{ departamento: 'Cruz Alta', localidad: 'Banda del Río Salí', lat: -26.8375, lng: -65.1611 },
	{ departamento: 'Lules', localidad: 'Lules', lat: -26.9244, lng: -65.3378 },
	{ departamento: 'Famaillá', localidad: 'Famaillá', lat: -26.8925, lng: -65.4022 },
	{ departamento: 'Monteros', localidad: 'Monteros', lat: -27.1678, lng: -65.4983 },
	{ departamento: 'Chicligasta', localidad: 'Concepción', lat: -27.3456, lng: -65.5928 },
	{ departamento: 'Río Chico', localidad: 'Aguilares', lat: -27.4339, lng: -65.6144 },
	{ departamento: 'Juan Bautista Alberdi', localidad: 'Alberdi', lat: -27.5861, lng: -65.62 },
	{ departamento: 'La Cocha', localidad: 'La Cocha', lat: -27.7711, lng: -65.5847 },
	{ departamento: 'Graneros', localidad: 'Graneros', lat: -27.6494, lng: -65.4383 },
	{ departamento: 'Simoca', localidad: 'Simoca', lat: -27.2611, lng: -65.3556 },
	{ departamento: 'Leales', localidad: 'Bella Vista', lat: -27.0333, lng: -65.3 },
	{ departamento: 'Burruyacú', localidad: 'Burruyacú', lat: -26.4989, lng: -64.7417 },
	{ departamento: 'Trancas', localidad: 'San Pedro de Colalao', lat: -26.2319, lng: -65.2817 },
];

const buildActorImageUrl = (actorName: string, index: number) => {
	// Picsum uses a seed to return the same image consistently
	return `https://picsum.photos/seed/${index}/800/800`;
};

const PREFIJOS_NOMBRES = [
	'Colectivo Cultural',
	'Ensamble',
	'Compañía de Artes',
	'Atelier',
	'Orquesta Popular',
	'Ballet',
	'Estudio Creativo',
	'Espacio de Arte',
	'Taller Cultural',
	'Asociación',
	'Grupo Independiente',
];

const SUSTANTIVOS_NOMBRES = [
	'del Pedemonte',
	'Norteño',
	'Aconquija',
	'del Valle',
	'Tucumano',
	'Sol del Norte',
	'Zamba y Canto',
	'Virla',
	'Cerro y Calandria',
	'Luna Tucumana',
	'Lules Creativo',
	'Simoca Tradición',
	'Trancas Raíces',
	'Jardín de la República',
];

class MockDatabase {
	actividadesArca: ActividadArcaMock[] = [];
	usuarios: UsuarioMock[] = [];
	categorias: CategoriaMock[] = [];
	subcategorias: SubcategoriaMock[] = [];
	actores: ActorMock[] = [];
	portafolioItems: PortafolioItemMock[] = [];
	eventos: EventoMock[] = [];
	integrantes: IntegranteMock[] = [];
	preguntasBanco: PreguntaBancoMock[] = [];
	formularios: FormularioMock[] = [];

	constructor() {
		this.initSeeds();
	}

	private initSeeds() {
		// 1. ARCA
		this.actividadesArca = [
			{ codigo: '900010', descripcion: 'Servicios de espectáculos artísticos y culturales' },
			{ codigo: '900020', descripcion: 'Creación artística y literaria' },
			{ codigo: '900030', descripcion: 'Servicios de composición y representación de obras musicales' },
			{ codigo: '900040', descripcion: 'Servicios teatrales, de danza y circo' },
			{ codigo: '900090', descripcion: 'Servicios de producción de espectáculos teatrales y musicales' },
			{ codigo: '910100', descripcion: 'Servicios de bibliotecas y archivos' },
			{ codigo: '910200', descripcion: 'Servicios de museos y preservación de lugares y edificios históricos' },
			{ codigo: '900099', descripcion: 'Otras actividades culturales y artísticas n.c.p.' },
		];

		// 2. Usuarios
		this.usuarios = [
			{
				id: 1,
				nombre: 'Carlos',
				apellido: 'Admin',
				email: 'admin@mosaico.com',
				genero: 'M',
				fechaNacimiento: '1985-05-12',
				nacionalidad: 'Argentina',
				cuil: '20301234567',
				actividadesArcaCodigo: '900010',
				actividadArca: 'Servicios de espectáculos artísticos y culturales',
				rol: 'ADMIN',
				estado: 'A',
				fechaRegistro: '2025-01-10T10:00:00Z',
				categoriasModeracion: [1, 2, 3, 4, 5, 6],
			},
			{
				id: 2,
				nombre: 'María',
				apellido: 'Moderadora',
				email: 'mod@mosaico.com',
				genero: 'F',
				fechaNacimiento: '1990-08-20',
				nacionalidad: 'Argentina',
				cuil: '27359876543',
				actividadesArcaCodigo: '900020',
				actividadArca: 'Creación artística y literaria',
				rol: 'MODERADOR',
				estado: 'A',
				fechaRegistro: '2025-02-01T14:30:00Z',
				categoriasModeracion: [1, 2],
			},
			{
				id: 3,
				nombre: 'Gonzalo',
				apellido: 'Pérez',
				email: 'artista@mosaico.com',
				genero: 'M',
				fechaNacimiento: '1995-11-15',
				nacionalidad: 'Argentina',
				cuil: '20389998887',
				actividadesArcaCodigo: '900030',
				actividadArca: 'Servicios de composición y representación de obras musicales',
				rol: 'USUARIO',
				estado: 'A',
				fechaRegistro: '2025-03-05T09:15:00Z',
				categoriasModeracion: [],
			},
			{
				id: 4,
				nombre: 'asd',
				apellido: 'asd',
				email: 'asd@asd.com',
				genero: 'M',
				fechaNacimiento: '1995-11-15',
				nacionalidad: 'Argentina',
				cuil: '20389998887',
				actividadesArcaCodigo: '900030',
				actividadArca: 'Servicios de composición y representación de obras musicales',
				rol: 'ADMIN',
				estado: 'A',
				fechaRegistro: '2025-03-05T09:15:00Z',
				categoriasModeracion: [],
			},
		];

		for (let u = 4; u <= 35; u++) {
			this.usuarios.push({
				id: u,
				nombre: `Usuario${u}`,
				apellido: `Apellido${u}`,
				email: `usuario${u}@mosaico.com`,
				genero: u % 2 === 0 ? 'F' : 'M',
				fechaNacimiento: '1993-06-15',
				nacionalidad: 'Argentina',
				cuil: `20${30000000 + u}8`,
				actividadesArcaCodigo: '900010',
				actividadArca: 'Servicios de espectáculos artísticos y culturales',
				rol: 'USUARIO',
				estado: 'A',
				fechaRegistro: '2025-02-15T10:00:00Z',
				categoriasModeracion: [],
			});
		}

		// 3. Categorías y Subcategorías
		const catDefinitions: { id: number; nombre: string; icono: CategoriaIcono; subs: string[] }[] = [
			{
				id: 1,
				nombre: 'Música',
				icono: 'MUSICA',
				subs: ['Bandas y Conjuntos', 'Solistas Vocalistas/Instrumentistas', 'Orquestas y Coros'],
			},
			{
				id: 2,
				nombre: 'Teatro y Artes Escénicas',
				icono: 'TEATRO',
				subs: ['Compañías Teatrales', 'Dirección y Dramaturgia', 'Circo y Títeres'],
			},
			{
				id: 3,
				nombre: 'Danza',
				icono: 'DANZA',
				subs: ['Ballet Folclórico', 'Danza Contemporánea', 'Tango y Danza Urbana'],
			},
			{
				id: 4,
				nombre: 'Artes Visuales',
				icono: 'ARTES_VISUALES',
				subs: ['Pintura y Escultura', 'Fotografía e Ilustración', 'Muralismo y Grabado'],
			},
			{
				id: 5,
				nombre: 'Audiovisual y Multimedia',
				icono: 'AUDIOVISUAL',
				subs: ['Cine y Cortometrajes', 'Producción de Sonido y Video', 'Arte Digital'],
			},
			{
				id: 6,
				nombre: 'Artesanía y Tradición',
				icono: 'ARTESANIA',
				subs: ['Tejido y Textiles Autóctonos', 'Cerámica y Alfarería', 'Orfebrería y Cuero'],
			},
		];

		const subMap: Record<number, SubcategoriaMock[]> = {};

		for (const cDef of catDefinitions) {
			this.categorias.push({
				id: cDef.id,
				nombre: cDef.nombre,
				icono: cDef.icono,
				estado: 'A',
			});

			subMap[cDef.id] = [];
			let subCounter = cDef.id * 10;
			for (const sName of cDef.subs) {
				subCounter++;
				const subObj: SubcategoriaMock = {
					id: subCounter,
					idCategoria: cDef.id,
					nombre: sName,
					estado: 'A',
				};
				this.subcategorias.push(subObj);
				subMap[cDef.id].push(subObj);
			}
		}

		// 4. Generación de 500 Actores
		const totalActores = 500;
		const tipos: ('INDIVIDUO' | 'COLECTIVO' | 'ESPACIO')[] = ['INDIVIDUO', 'COLECTIVO', 'ESPACIO'];
		const estados: ('A' | 'P' | 'I')[] = ['A', 'A', 'A', 'A', 'A', 'P', 'I'];

		for (let i = 1; i <= totalActores; i++) {
			const depInfo = DEPARTAMENTOS_TUCUMAN[i % DEPARTAMENTOS_TUCUMAN.length];
			const cDef = catDefinitions[i % catDefinitions.length];
			const subsOfCat = subMap[cDef.id];
			const subSel = subsOfCat[i % subsOfCat.length];
			const pref = PREFIJOS_NOMBRES[i % PREFIJOS_NOMBRES.length];
			const sust = SUSTANTIVOS_NOMBRES[(i * 3) % SUSTANTIVOS_NOMBRES.length];
			const tipo = tipos[i % tipos.length];
			const estado = estados[i % estados.length];
			const actorName = `${pref} ${sust} N°${i}`;
			const foto = buildActorImageUrl(actorName, i);

			const latJitter = Math.sin(i * 1.5) * 0.04 + Math.cos(i * 0.7) * 0.02;
			const lngJitter = Math.cos(i * 1.3) * 0.04 + Math.sin(i * 0.9) * 0.02;

			const lat = Number((depInfo.lat + latJitter).toFixed(6));
			const lng = Number((depInfo.lng + lngJitter).toFixed(6));

			this.actores.push({
				id: i,
				idUsuarioDueno: (i % 30) + 1,
				nombre: actorName,
				descripcion: `Espacio y agrupación artística de ${cDef.nombre} dedicada al desarrollo de propuestas culturales en el departamento de ${depInfo.departamento}, Tucumán.`,
				foto,
				cuit: `20${30000000 + i}4`,
				tipoActor: tipo,
				fechaCreacion: `2025-0${(i % 3) + 1}-15T12:00:00Z`,
				estado,
				idCategoria: cDef.id,
				idSubcategoria: subSel ? subSel.id : null,
				ubicacion: {
					provincia: 'Tucumán',
					departamento: depInfo.departamento,
					localidad: depInfo.localidad,
					direccion: `Calle Principal ${i * 12}`,
					latitud: lat,
					longitud: lng,
					esPublica: true,
				},
			});

			if (i <= 100) {
				this.portafolioItems.push({
					id: i * 2 - 1,
					idActor: i,
					tipo: 'LINK',
					descripcion: `Video oficial del actor ${i}`,
					url: 'https://youtube.com/watch?v=mock',
					fechaCreacion: '2025-01-20T10:00:00Z',
				});
				this.portafolioItems.push({
					id: i * 2,
					idActor: i,
					tipo: 'IMAGEN',
					descripcion: `Galería fotográfica de ${pref}`,
					url: foto,
					fechaCreacion: '2025-02-01T10:00:00Z',
				});
				this.eventos.push({
					id: i,
					idActor: i,
					nombre: `Festival Cultural de ${depInfo.departamento}`,
					descripcion: `Encuentro abierto de ${cDef.nombre} en ${depInfo.localidad}`,
					fecha: `2026-0${(i % 8) + 1}-20`,
				});
				this.integrantes.push({
					idActor: i,
					idUsuario: (i % 30) + 1,
					nombre: 'Integrante',
					apellido: `${i}`,
					email: `integrante${i}@mosaico.com`,
					rol: 'Director / Coordinador',
					esDueno: true,
				});
			}
		}

		// 5. Formularios y Preguntas
		this.preguntasBanco = [
			{
				id: 1,
				pregunta: '¿Cuenta con personería jurídica o registro fiscal activo?',
				tipoDato: 'BOOLEANO',
				opciones: null,
			},
			{
				id: 2,
				pregunta: '¿Años de trayectoria artística continua en Tucumán?',
				tipoDato: 'NUMERO',
				opciones: null,
			},
			{
				id: 3,
				pregunta: '¿Canales de difusión principales?',
				tipoDato: 'OPCION_MULTIPLE',
				opciones: ['Redes Sociales', 'Prensa / Radios', 'Afiches y boca a boca', 'Plataformas digitales'],
			},
		];

		this.formularios = [
			{
				id: 1,
				idCategoria: 1,
				categoria: 'Música',
				estadoCategoria: 'A',
				idSubcategoria: null,
				subcategoria: null,
				estadoSubcategoria: null,
				ambito: 'CATEGORIA',
				titulo: 'Formulario Específico del Sector Musical',
				descripcion: 'Relevamiento de necesidades técnicas, rider y trayectoria de grupos musicales tucumanos.',
				fechaCreacion: '2025-01-05T09:00:00Z',
				cantidadPreguntasHistoricas: 3,
				cantidadPreguntasActivas: 3,
				cantidadActoresConRespuestas: 150,
				preguntas: [
					{
						id: 1,
						pregunta: '¿Cuenta con personería jurídica o registro fiscal activo?',
						tipoDato: 'BOOLEANO',
						opciones: null,
						idPreguntaReemplazada: null,
						preguntaReemplazada: null,
						orden: 1,
						esObligatorio: false,
						esPublico: true,
						fechaIncorporacion: '2025-01-05T09:00:00Z',
						fechaDesactivacion: null,
						estado: 'A',
						cantidadActoresQueRespondieron: 120,
					},
					{
						id: 2,
						pregunta: '¿Años de trayectoria artística continua en Tucumán?',
						tipoDato: 'NUMERO',
						opciones: null,
						idPreguntaReemplazada: null,
						preguntaReemplazada: null,
						orden: 2,
						esObligatorio: true,
						esPublico: true,
						fechaIncorporacion: '2025-01-05T09:00:00Z',
						fechaDesactivacion: null,
						estado: 'A',
						cantidadActoresQueRespondieron: 150,
					},
					{
						id: 3,
						pregunta: '¿Canales de difusión principales?',
						tipoDato: 'OPCION_MULTIPLE',
						opciones: [
							'Redes Sociales',
							'Prensa / Radios',
							'Afiches y boca a boca',
							'Plataformas digitales',
						],
						idPreguntaReemplazada: null,
						preguntaReemplazada: null,
						orden: 3,
						esObligatorio: false,
						esPublico: true,
						fechaIncorporacion: '2025-01-05T09:00:00Z',
						fechaDesactivacion: null,
						estado: 'A',
						cantidadActoresQueRespondieron: 110,
					},
				],
			},
		];
	}
}

export const db = new MockDatabase();
