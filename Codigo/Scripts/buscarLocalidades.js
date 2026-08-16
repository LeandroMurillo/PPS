import fs from "node:fs/promises";

async function main() {
	const departamentos = {};
	const centroides = {};

	const getSet = (depto) => {
		if (!departamentos[depto]) {
			departamentos[depto] = new Set();
		}
		return departamentos[depto];
	};

	// 1. Consultar Departamentos y Centroides
	console.log("1. Consultando Departamentos y sus centroides...");
	const urlDept = "https://apis.datos.gob.ar/georef/api/departamentos?provincia=tucuman&max=100";
	const resDept = await fetch(urlDept);

	if (resDept.ok) {
		const dataDept = await resDept.json();
		for (const dept of dataDept.departamentos || []) {
			if (dept.nombre && dept.centroide) {
				centroides[dept.nombre] = {
					lat: dept.centroide.lat,
					lon: dept.centroide.lon,
				};
			}
		}
	}

	// 2. Consultar Localidades
	console.log("2. Consultando Localidades...");
	const urlLoc = "https://apis.datos.gob.ar/georef/api/localidades?provincia=tucuman&max=1000";
	const resLoc = await fetch(urlLoc);

	if (resLoc.ok) {
		const dataLoc = await resLoc.json();
		for (const loc of dataLoc.localidades || []) {
			if (loc.departamento?.nombre && loc.nombre) {
				getSet(loc.departamento.nombre).add(loc.nombre);
			}
		}
	}

	// 3. Consultar Municipios y resolver departamentos por coordenadas
	console.log("3. Consultando Municipios y resolviendo departamentos por coordenadas...");
	const urlMun = "https://apis.datos.gob.ar/georef/api/municipios?provincia=tucuman&max=1000";
	const resMun = await fetch(urlMun);

	if (resMun.ok) {
		const dataMun = await resMun.json();
		const municipios = dataMun.municipios || [];
		const totalMun = municipios.length;

		for (let i = 0; i < totalMun; i++) {
			const mun = municipios[i];
			const { lat, lon } = mun.centroide;

			try {
				const urlUbi = `https://apis.datos.gob.ar/georef/api/ubicacion?lat=${lat}&lon=${lon}`;
				const resUbi = await fetch(urlUbi);
				const dataUbi = await resUbi.json();

				const nombreDepto = dataUbi.ubicacion?.departamento?.nombre;
				if (nombreDepto) {
					getSet(nombreDepto).add(mun.nombre);
				} else {
					getSet("Sin clasificar").add(mun.nombre);
				}
			} catch (err) {
				getSet("Sin clasificar").add(mun.nombre);
			}

			if ((i + 1) % 20 === 0 || i + 1 === totalMun) {
				console.log(`   Procesados ${i + 1} de ${totalMun} municipios...`);
			}
		}
	}

	// 4. Formatear y guardar JSON
	console.log("4. Formateando y guardando el JSON...");
	const resultadoFinal = {};
	const sortedDeptos = Object.keys(departamentos).sort((a, b) => a.localeCompare(b, "es"));

	for (const depto of sortedDeptos) {
		resultadoFinal[depto] = {
			centroide: centroides[depto] || { lat: -26.8241, lon: -65.2226 },
			localidades: Array.from(departamentos[depto]).sort((a, b) => a.localeCompare(b, "es")),
		};
	}

	const nombreArchivo = "tucuman_departamentos.json";
	await fs.writeFile(nombreArchivo, JSON.stringify(resultadoFinal, null, 2), "utf-8");

	console.log(`¡Éxito total! Archivo generado: ${nombreArchivo}`);
}

main().catch(console.error);
