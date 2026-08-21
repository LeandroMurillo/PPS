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
	PreguntaFormularioMock,
	FormularioMock,
	CategoriaIcono,
	ConvocatoriaMock,
	PostulacionMock,
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
	'Centro Artístico',
	'Laboratorio Escénico',
	'Fundación Cultural',
	'Cooperativa de Arte',
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
	'Calchaquí',
	'de la Quebrada',
	'del Bicentenario',
	'de la Caña',
	'de los Naranjos',
	'Selva y Monte',
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
	convocatorias: ConvocatoriaMock[] = [];
	postulaciones: PostulacionMock[] = [];

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
				idFirebase: 'mock-firebase-admin',
				genero: 'M',
				fechaNacimiento: '1985-05-12',
				nacionalidad: 'Argentina',
				cuil: '20301234567',
				actividadesArcaCodigo: '900010',
				actividadArca: 'Servicios de espectáculos artísticos y culturales',
				rol: 'ADMIN',
				estado: 'A',
				fechaRegistro: '2025-01-10T10:00:00Z',
				categoriasModeracion: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			},
			{
				id: 2,
				nombre: 'María',
				apellido: 'Moderadora',
				email: 'mod@mosaico.com',
				idFirebase: 'mock-firebase-moderadora',
				genero: 'F',
				fechaNacimiento: '1990-08-20',
				nacionalidad: 'Argentina',
				cuil: '27359876543',
				actividadesArcaCodigo: '900020',
				actividadArca: 'Creación artística y literaria',
				rol: 'MODERADOR',
				estado: 'A',
				fechaRegistro: '2025-02-01T14:30:00Z',
				categoriasModeracion: [1, 2, 3],
			},
			{
				id: 3,
				nombre: 'Gonzalo',
				apellido: 'Pérez',
				email: 'artista@mosaico.com',
				idFirebase: 'mock-firebase-artista',
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
				idFirebase: 'mock-firebase-asd',
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

		for (let u = 5; u <= 40; u++) {
			this.usuarios.push({
				id: u,
				nombre: `Gestor${u}`,
				apellido: `Tucumano${u}`,
				email: `usuario${u}@mosaico.com`,
				idFirebase: `mock-firebase-usuario-${u}`,
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
				icono: 'MusicNote',
				subs: [
					'Folklore y Fusión',
					'Rock y Pop',
					'Cumbia y Cuarteto',
					'Música Clásica y Coral',
					'Jazz y Blues',
				],
			},
			{
				id: 2,
				nombre: 'Teatro y Artes Escénicas',
				icono: 'TheaterComedy',
				subs: ['Compañías Teatrales', 'Dirección y Dramaturgia', 'Circo y Títeres', 'Comedia Musical'],
			},
			{
				id: 3,
				nombre: 'Danza',
				icono: 'DirectionsRun',
				subs: ['Ballet Folclórico', 'Danza Contemporánea', 'Tango y Danza Urbana', 'Danzas Tradicionales'],
			},
			{
				id: 4,
				nombre: 'Artes Visuales',
				icono: 'Palette',
				subs: [
					'Pintura y Escultura',
					'Fotografía e Ilustración',
					'Muralismo y Grabado',
					'Instalaciones y Arte Conceptual',
				],
			},
			{
				id: 5,
				nombre: 'Audiovisual y Multimedia',
				icono: 'Movie',
				subs: ['Cine y Cortometrajes', 'Producción de Sonido y Video', 'Animación y Arte Digital'],
			},
			{
				id: 6,
				nombre: 'Artesanía y Tradición',
				icono: 'Handyman',
				subs: [
					'Tejido y Textiles Autóctonos',
					'Cerámica y Alfarería',
					'Orfebrería, Platería y Cuero',
					'Madera y Luthería',
				],
			},
			{
				id: 7,
				nombre: 'Literatura y Editorial',
				icono: 'MenuBook',
				subs: ['Poesía y Narrativa', 'Editoriales Independientes', 'Dramaturgia y Ensayos'],
			},
			{
				id: 8,
				nombre: 'Patrimonio y Museos',
				icono: 'AccountBalance',
				subs: ['Museos y Colecciones', 'Archivos Históricos', 'Monumentos y Sitios Arqueológicos'],
			},
			{
				id: 9,
				nombre: 'Diseño y Nuevas Tecnologías',
				icono: 'DesignServices',
				subs: ['Diseño Gráfico', 'Diseño de Indumentaria', 'Videojuegos y Multimedia'],
			},
			{
				id: 10,
				nombre: 'Gastronomía y Fiestas Populares',
				icono: 'Celebration',
				subs: [
					'Cocina Tradicional y Regional',
					'Ferias y Festivales Populares',
					'Producción Artesanal de Alimentos',
				],
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

		// 4. Generación de 500 Actores (incluyendo activos 'A', pendientes 'P' para moderación e inactivos 'I')
		const totalActores = 500;
		const tipos: ('INDIVIDUO' | 'COLECTIVO' | 'ESPACIO')[] = ['INDIVIDUO', 'COLECTIVO', 'ESPACIO'];
		const estados: ('A' | 'P' | 'I')[] = ['A', 'A', 'A', 'P', 'P', 'A', 'I', 'P'];

		for (let i = 1; i <= totalActores; i++) {
			const depInfo = DEPARTAMENTOS_TUCUMAN[i % DEPARTAMENTOS_TUCUMAN.length];
			const cDef = catDefinitions[i % catDefinitions.length];
			const subsOfCat = subMap[cDef.id];
			const subSel = subsOfCat[i % subsOfCat.length];
			const pref = PREFIJOS_NOMBRES[i % PREFIJOS_NOMBRES.length];
			const sust = SUSTANTIVOS_NOMBRES[(i * 3) % SUSTANTIVOS_NOMBRES.length];
			const tipo = tipos[i % tipos.length];
			const estado = estados[i % estados.length];
			const actorName = `${pref} ${sust} ${i > 10 ? `N°${i}` : ''}`.trim();
			const foto = buildActorImageUrl(actorName, i);

			const latJitter = Math.sin(i * 1.5) * 0.04 + Math.cos(i * 0.7) * 0.02;
			const lngJitter = Math.cos(i * 1.3) * 0.04 + Math.sin(i * 0.9) * 0.02;

			const lat = Number((depInfo.lat + latJitter).toFixed(6));
			const lng = Number((depInfo.lng + lngJitter).toFixed(6));

			const fechaCreacion = `2025-0${(i % 5) + 1}-${String((i % 27) + 1).padStart(2, '0')}T14:20:00Z`;

			this.actores.push({
				id: i,
				idUsuarioDueno: (i % 30) + 1,
				nombre: actorName,
				descripcion: `Propuesta artística y cultural de ${cDef.nombre} (${subSel ? subSel.nombre : 'General'}) con base en ${depInfo.localidad}, departamento de ${depInfo.departamento}, Tucumán. Promueve la identidad y la participación comunitaria.`,
				foto,
				cuit: `20${30000000 + i}4`,
				tipoActor: tipo,
				fechaCreacion,
				estado,
				idCategoria: cDef.id,
				idSubcategoria: subSel ? subSel.id : null,
				ubicacion: {
					provincia: 'Tucumán',
					departamento: depInfo.departamento,
					localidad: depInfo.localidad,
					direccion: `Av. San Martín ${100 + i * 15}`,
					latitud: lat,
					longitud: lng,
					esPublica: i % 5 !== 0, // Algunos actores tienen dirección privada
				},
				respuestasFormulario: {
					1: i % 2 === 0,
					2: (i % 15) + 1,
					3: ['Redes Sociales', 'Afiches y boca a boca'],
				},
			});

			// Portafolio para los primeros 150 actores
			if (i <= 150) {
				this.portafolioItems.push({
					id: i * 2 - 1,
					idActor: i,
					tipo: 'LINK',
					descripcion: `Video oficial y muestra de ${actorName}`,
					url: 'https://www.youtube.com/watch?v=nAwCcBMQBrc',
					fechaCreacion,
				});
				this.portafolioItems.push({
					id: i * 2,
					idActor: i,
					tipo: 'IMAGEN',
					descripcion: `Fotografía representativa de la obra de ${actorName}`,
					url: foto,
					fechaCreacion,
				});

				this.eventos.push({
					id: i,
					idActor: i,
					nombre: `Encuentro Cultural en ${depInfo.localidad}`,
					descripcion: `Presentación abierta de ${cDef.nombre} en ${depInfo.departamento}`,
					fecha: `2026-0${(i % 8) + 1}-18`,
				});

				this.integrantes.push({
					tipo: 'REGISTRADO',
					idActor: i,
					idUsuario: (i % 30) + 1,
					idIntegranteNoRegistrado: null,
					nombre: 'Referente',
					apellido: `Cultural ${i}`,
					email: `referente${i}@mosaico.com`,
					rol: 'Director / Coordinador General',
					esDueno: true,
				});
			}
		}

		this.integrantes.push(
			{
				tipo: 'NO_REGISTRADO',
				idActor: 2,
				idUsuario: null,
				idIntegranteNoRegistrado: 1,
				nombre: 'Lucía',
				apellido: 'Figueroa',
				email: 'lucia.figueroa@example.com',
				rol: 'Violín',
				esDueno: false,
			},
			{
				tipo: 'NO_REGISTRADO',
				idActor: 2,
				idUsuario: null,
				idIntegranteNoRegistrado: 2,
				nombre: 'Ramiro',
				apellido: 'Paz',
				email: null,
				rol: 'Acordeón',
				esDueno: false,
			},
			{
				tipo: 'NO_REGISTRADO',
				idActor: 4,
				idUsuario: null,
				idIntegranteNoRegistrado: 3,
				nombre: 'Martina',
				apellido: 'Sosa',
				email: 'martina.sosa@example.com',
				rol: 'Teclados',
				esDueno: false,
			},
			{
				tipo: 'NO_REGISTRADO',
				idActor: 6,
				idUsuario: null,
				idIntegranteNoRegistrado: 4,
				nombre: 'Bruno',
				apellido: 'Medina',
				email: null,
				rol: 'Malabarista',
				esDueno: false,
			},
			{
				tipo: 'NO_REGISTRADO',
				idActor: 6,
				idUsuario: null,
				idIntegranteNoRegistrado: 5,
				nombre: 'Camila',
				apellido: 'Roldán',
				email: 'camila.roldan@example.com',
				rol: 'Vestuario',
				esDueno: false,
			},
		);

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
			{
				id: 4,
				pregunta: '¿Posee espacio propio o alquilado para ensayos y talleres?',
				tipoDato: 'BOOLEANO',
				opciones: null,
			},
			{
				id: 5,
				pregunta: '¿Ha participado en festivales provinciales o nacionales?',
				tipoDato: 'TEXTO',
				opciones: null,
			},
		];

		const sectorQuestionsConfig: Record<
			number,
			{
				titulo: string;
				descripcion: string;
				preguntas: Array<{
					pregunta: string;
					tipoDato:
						| 'TEXTO'
						| 'NUMERO'
						| 'BOOLEANO'
						| 'FECHA'
						| 'URL'
						| 'EMAIL'
						| 'TELEFONO'
						| 'OPCION_UNICA'
						| 'OPCION_MULTIPLE'
						| 'OPCION_MULTIPLE_CHIPS'
						| 'TAGS';
					opciones: string[] | null;
					esObligatorio: boolean;
					esPublico: boolean;
				}>;
			}
		> = {
			1: {
				titulo: 'Relevamiento del Sector Musical Tucumano',
				descripcion: 'Relevamiento de necesidades técnicas, rider, trayectoria y equipamiento.',
				preguntas: [
					{
						pregunta: '¿Cuenta con personería jurídica o registro fiscal activo?',
						tipoDato: 'BOOLEANO',
						opciones: null,
						esObligatorio: false,
						esPublico: false,
					},
					{
						pregunta: '¿Años de trayectoria artística continua en Tucumán?',
						tipoDato: 'NUMERO',
						opciones: null,
						esObligatorio: true,
						esPublico: true,
					},
					{
						pregunta: '¿Canales de difusión principales?',
						tipoDato: 'OPCION_MULTIPLE',
						opciones: [
							'Redes Sociales',
							'Prensa / Radios',
							'Afiches y boca a boca',
							'Plataformas digitales',
						],
						esObligatorio: false,
						esPublico: false,
					},
				],
			},
			2: {
				titulo: 'Relevamiento del Sector de Teatro y Artes Escénicas',
				descripcion: 'Relevamiento de salas, elencos, equipamiento escénico y trayectoria teatral.',
				preguntas: [
					{
						pregunta: '¿Cuenta con espacio propio o sala de ensayo?',
						tipoDato: 'BOOLEANO',
						opciones: null,
						esObligatorio: false,
						esPublico: true,
					},
					{
						pregunta: '¿Años de trayectoria escénica continua?',
						tipoDato: 'NUMERO',
						opciones: null,
						esObligatorio: true,
						esPublico: true,
					},
					{
						pregunta: '¿Espacios donde se presentan habitualmente?',
						tipoDato: 'OPCION_MULTIPLE',
						opciones: [
							'Salas independientes',
							'Teatros oficiales',
							'Espacios no convencionales o vía pública',
							'Centros culturales',
						],
						esObligatorio: false,
						esPublico: true,
					},
					{
						pregunta: '¿Formato principal de las producciones?',
						tipoDato: 'OPCION_UNICA',
						opciones: [
							'Obras de sala',
							'Teatro callejero / itinerante',
							'Microteatro / performances',
							'Títeres y animación',
						],
						esObligatorio: false,
						esPublico: true,
					},
				],
			},
			3: {
				titulo: 'Relevamiento del Sector Danza',
				descripcion: 'Relevamiento de estilos, cuerpos de baile y espacios de formación.',
				preguntas: [
					{
						pregunta: '¿Cuenta con sala de ensayo o academia propia?',
						tipoDato: 'BOOLEANO',
						opciones: null,
						esObligatorio: false,
						esPublico: true,
					},
					{
						pregunta: '¿Años de trayectoria del elenco o compañía?',
						tipoDato: 'NUMERO',
						opciones: null,
						esObligatorio: true,
						esPublico: true,
					},
					{
						pregunta: '¿Modalidades o estilos desarrollados?',
						tipoDato: 'OPCION_MULTIPLE',
						opciones: ['Folclore', 'Contemporáneo', 'Clásico / Neoclásico', 'Tango / Danza Urbana'],
						esObligatorio: false,
						esPublico: true,
					},
				],
			},
			4: {
				titulo: 'Relevamiento de Artes Visuales',
				descripcion: 'Relevamiento de talleres, técnicas y espacios de exhibición.',
				preguntas: [
					{
						pregunta: '¿Cuenta con taller o espacio de exhibición propio?',
						tipoDato: 'BOOLEANO',
						opciones: null,
						esObligatorio: false,
						esPublico: true,
					},
					{
						pregunta: '¿Años de producción artística?',
						tipoDato: 'NUMERO',
						opciones: null,
						esObligatorio: true,
						esPublico: true,
					},
					{
						pregunta: '¿Técnicas o disciplinas principales?',
						tipoDato: 'OPCION_MULTIPLE',
						opciones: ['Pintura / Dibujo', 'Escultura / Cerámica', 'Fotografía', 'Muralismo / Grabado'],
						esObligatorio: false,
						esPublico: true,
					},
				],
			},
			5: {
				titulo: 'Relevamiento del Sector Audiovisual',
				descripcion: 'Relevamiento de productoras, realizadores y equipamiento técnico.',
				preguntas: [
					{
						pregunta: '¿Dispone de equipamiento de rodaje / edición propio?',
						tipoDato: 'BOOLEANO',
						opciones: null,
						esObligatorio: false,
						esPublico: false,
					},
					{
						pregunta: '¿Cantidad de producciones realizadas?',
						tipoDato: 'NUMERO',
						opciones: null,
						esObligatorio: true,
						esPublico: true,
					},
					{
						pregunta: '¿Etapa principal de especialización?',
						tipoDato: 'OPCION_UNICA',
						opciones: [
							'Preproducción y Guión',
							'Rodaje y Dirección',
							'Postproducción y Sonido',
							'Animación y VFX',
						],
						esObligatorio: false,
						esPublico: true,
					},
				],
			},
			6: {
				titulo: 'Relevamiento del Sector Artesanal',
				descripcion: 'Relevamiento de materias primas, técnicas autóctonas y oficios.',
				preguntas: [
					{
						pregunta: '¿Cuenta con carnet o registro oficial de artesano/a?',
						tipoDato: 'BOOLEANO',
						opciones: null,
						esObligatorio: false,
						esPublico: false,
					},
					{
						pregunta: '¿Años de oficio artesanal continuo?',
						tipoDato: 'NUMERO',
						opciones: null,
						esObligatorio: true,
						esPublico: true,
					},
					{
						pregunta: '¿Materiales principales que trabaja?',
						tipoDato: 'OPCION_MULTIPLE',
						opciones: ['Madera', 'Cuero', 'Tejidos y Lana', 'Arcilla y Cerámica', 'Metales / Platería'],
						esObligatorio: false,
						esPublico: true,
					},
				],
			},
			7: {
				titulo: 'Relevamiento del Sector Editorial y Literatura',
				descripcion: 'Relevamiento de autores, editoriales independientes y publicaciones.',
				preguntas: [
					{
						pregunta: '¿Cantidad de títulos o publicaciones editadas?',
						tipoDato: 'NUMERO',
						opciones: null,
						esObligatorio: true,
						esPublico: true,
					},
					{
						pregunta: '¿Géneros literarios principales?',
						tipoDato: 'OPCION_MULTIPLE',
						opciones: ['Poesía', 'Narrativa / Novela', 'Ensayo / Crónica', 'Infantil y Juvenil'],
						esObligatorio: false,
						esPublico: true,
					},
				],
			},
			8: {
				titulo: 'Relevamiento de Patrimonio y Museos',
				descripcion: 'Relevamiento de sitios históricos, colecciones y archivos.',
				preguntas: [
					{
						pregunta: '¿El espacio cuenta con acceso al público general?',
						tipoDato: 'BOOLEANO',
						opciones: null,
						esObligatorio: false,
						esPublico: true,
					},
					{
						pregunta: '¿Días y horarios de atención al público?',
						tipoDato: 'TEXTO',
						opciones: null,
						esObligatorio: true,
						esPublico: true,
					},
				],
			},
			9: {
				titulo: 'Relevamiento de Diseño y Nuevas Tecnologías',
				descripcion: 'Relevamiento de estudios de diseño, multimedia y desarrollo.',
				preguntas: [
					{
						pregunta: '¿Años de actividad profesional?',
						tipoDato: 'NUMERO',
						opciones: null,
						esObligatorio: true,
						esPublico: true,
					},
					{
						pregunta: '¿Servicios principales ofrecidos?',
						tipoDato: 'OPCION_MULTIPLE',
						opciones: ['Identidad Visual', 'Diseño Web / UX', 'Diseño de Indumentaria', 'Videojuegos y 3D'],
						esObligatorio: false,
						esPublico: true,
					},
				],
			},
			10: {
				titulo: 'Relevamiento de Gastronomía y Fiestas Populares',
				descripcion: 'Relevamiento de tradiciones culinarias y organizadores de festividades.',
				preguntas: [
					{
						pregunta: '¿Cuenta con habilitación bromatológica o comercial vigente?',
						tipoDato: 'BOOLEANO',
						opciones: null,
						esObligatorio: false,
						esPublico: false,
					},
					{
						pregunta: '¿Años de participación en festividades y ferias provinciales?',
						tipoDato: 'NUMERO',
						opciones: null,
						esObligatorio: true,
						esPublico: true,
					},
				],
			},
		};

		this.formularios = catDefinitions.map((cat) => {
			const config = sectorQuestionsConfig[cat.id] ?? {
				titulo: `Relevamiento del Sector ${cat.nombre}`,
				descripcion: `Relevamiento sectorial de ${cat.nombre}.`,
				preguntas: [
					{
						pregunta: '¿Años de trayectoria artística en Tucumán?',
						tipoDato: 'NUMERO',
						opciones: null,
						esObligatorio: true,
						esPublico: true,
					},
					{
						pregunta: '¿Cuenta con personería jurídica o registro fiscal?',
						tipoDato: 'BOOLEANO',
						opciones: null,
						esObligatorio: false,
						esPublico: false,
					},
				],
			};

			const preguntas: PreguntaFormularioMock[] = config.preguntas.map((q, pIdx) => ({
				id: cat.id * 100 + pIdx + 1,
				pregunta: q.pregunta,
				tipoDato: q.tipoDato,
				opciones: q.opciones,
				idPreguntaReemplazada: null,
				preguntaReemplazada: null,
				orden: pIdx + 1,
				esObligatorio: q.esObligatorio,
				esPublico: q.esPublico,
				fechaIncorporacion: '2025-01-05T09:00:00Z',
				fechaDesactivacion: null,
				estado: 'A',
				cantidadActoresQueRespondieron: 80,
			}));

			return {
				id: cat.id,
				idCategoria: cat.id,
				categoria: cat.nombre,
				estadoCategoria: 'A',
				idSubcategoria: null,
				subcategoria: null,
				estadoSubcategoria: null,
				ambito: 'CATEGORIA',
				titulo: config.titulo,
				descripcion: config.descripcion,
				fechaCreacion: '2025-01-05T09:00:00Z',
				cantidadPreguntasHistoricas: preguntas.length,
				cantidadPreguntasActivas: preguntas.length,
				cantidadActoresConRespuestas: 80,
				preguntas,
			};
		});

		// 6. Convocatorias Mock
		this.convocatorias = [
			{
				id: 1,
				titulo: 'Festival Nacional del Limón 2026',
				descripcion:
					'Convocatoria oficial para artistas musicales, solistas y ballets de Tafí Viejo y toda la provincia.',
				requisitos: 'Estar registrado en el Registro Provincial de Actores Culturales con estado Activo.',
				fechaInicio: '2026-06-01',
				fechaCierre: '2026-08-30',
				estado: 'ABIERTA',
				idCategoria: 1,
				categoria: 'Música',
			},
			{
				id: 2,
				titulo: 'Mercado Artesanal Calchaquí - Edición Invierno',
				descripcion:
					'Espacio de exposición, exhibición y venta para artesanos, tejedores y ceramistas de la ruta 307 y los valles.',
				requisitos: 'Certificado de artesano o ficha técnica de producción local.',
				fechaInicio: '2026-05-15',
				fechaCierre: '2026-07-05',
				estado: 'ABIERTA',
				idCategoria: 6,
				categoria: 'Artesanía y Tradición',
			},
			{
				id: 3,
				titulo: 'Fomento a la Producción Audiovisual Independiente',
				descripcion:
					'Subsidio y estímulo provincial para el desarrollo y postproducción de cortometrajes y documentales regionales.',
				requisitos: 'Guión preliminar y plan de rodaje en locaciones tucumanas.',
				fechaInicio: '2026-07-01',
				fechaCierre: '2026-10-15',
				estado: 'ABIERTA',
				idCategoria: 5,
				categoria: 'Audiovisual y Multimedia',
			},
			{
				id: 4,
				titulo: 'Fiesta Provincial del Teatro Tucumán 2026',
				descripcion: 'Selección de obras teatrales independientes para la muestra anual de artes escénicas.',
				requisitos: 'Elenco radicado en la provincia de Tucumán con al menos 6 meses de estreno.',
				fechaInicio: '2026-08-01',
				fechaCierre: '2026-11-20',
				estado: 'ABIERTA',
				idCategoria: 2,
				categoria: 'Teatro y Artes Escénicas',
			},
		];

		this.postulaciones = [
			{
				id: 1,
				idConvocatoria: 1,
				idActor: 1,
				idUsuario: 3,
				fechaPostulacion: '2026-06-15T11:00:00Z',
				estado: 'PENDIENTE',
			},
		];
	}
}

export const db = new MockDatabase();
