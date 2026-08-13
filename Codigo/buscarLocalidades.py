import requests
import json
from collections import defaultdict

departamentos = defaultdict(set)
centroides = {}

print("1. Consultando Departamentos y sus centroides...")
url_dept = "https://apis.datos.gob.ar/georef/api/departamentos?provincia=tucuman&max=100"
response_dept = requests.get(url_dept)

if response_dept.status_code == 200:
    for dept in response_dept.json().get("departamentos", []):
        nombre_dept = dept.get("nombre")
        centroide = dept.get("centroide")
        if nombre_dept and centroide:
            centroides[nombre_dept] = {
                "lat": centroide.get("lat"),
                "lon": centroide.get("lon")
            }

print("2. Consultando Localidades...")
url_loc = "https://apis.datos.gob.ar/georef/api/localidades?provincia=tucuman&max=1000"
response_loc = requests.get(url_loc)

if response_loc.status_code == 200:
    for loc in response_loc.json().get("localidades", []):
        if "departamento" in loc and "nombre" in loc["departamento"]:
            departamentos[loc["departamento"]["nombre"]].add(loc["nombre"])

print("3. Consultando Municipios y resolviendo departamentos por coordenadas...")
url_mun = "https://apis.datos.gob.ar/georef/api/municipios?provincia=tucuman&max=1000"
response_mun = requests.get(url_mun)

if response_mun.status_code == 200:
    municipios = response_mun.json().get("municipios", [])
    total_mun = len(municipios)

    for i, mun in enumerate(municipios):
        nombre_mun = mun["nombre"]
        lat = mun["centroide"]["lat"]
        lon = mun["centroide"]["lon"]

        url_ubi = f"https://apis.datos.gob.ar/georef/api/ubicacion?lat={lat}&lon={lon}"
        res_ubi = requests.get(url_ubi).json()

        if "ubicacion" in res_ubi and res_ubi["ubicacion"].get("departamento") and res_ubi["ubicacion"]["departamento"].get("nombre"):
            nombre_depto = res_ubi["ubicacion"]["departamento"]["nombre"]
            departamentos[nombre_depto].add(nombre_mun)
        else:
            departamentos["Sin clasificar"].add(nombre_mun)

        if (i + 1) % 20 == 0 or (i + 1) == total_mun:
            print(f"   Procesados {i + 1} de {total_mun} municipios...")

print("4. Formateando y guardando el JSON...")
resultado_final = {}
for depto in sorted(departamentos.keys()):
    resultado_final[depto] = {
        "centroide": centroides.get(depto, {"lat": -26.8241, "lon": -65.2226}),
        "localidades": sorted(list(departamentos[depto]))
    }

nombre_archivo = 'tucuman_departamentos.json'
with open(nombre_archivo, 'w', encoding='utf-8') as f:
    json.dump(resultado_final, f, ensure_ascii=False, indent=2)

print(f"¡Éxito total! Archivo generado: {nombre_archivo}")
