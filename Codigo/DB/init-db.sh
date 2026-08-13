#!/bin/sh
set -e

echo "================================================================"
echo "🚀 MOSAICO CULTURAL -- INICIALIZADOR DE BASE DE DATOS"
echo "================================================================"
echo "📌 Parámetros de conexión:"
echo "   - Host:     ${DB_HOST:-localhost}"
echo "   - Puerto:   ${DB_PORT:-3306}"
echo "   - Usuario:  ${DB_USER:-root}"
echo "   - Base BD:  ${DB_NAME:-cultura}"
echo "================================================================"

echo "🔍 Paso 1: Verificando conectividad con MariaDB..."
MAX_TRIES=30
COUNT=0

until mariadb-admin ping -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" --silent; do
    COUNT=$((COUNT + 1))
    if [ "$COUNT" -ge "$MAX_TRIES" ]; then
        echo "❌ ERROR: No se pudo conectar a MariaDB en ${DB_HOST}:${DB_PORT} tras ${MAX_TRIES} intentos."
        exit 1
    fi
    echo "   [Intento ${COUNT}/${MAX_TRIES}] MariaDB no está lista. Reintentando en 2 segundos..."
    sleep 2
done

echo "✅ ¡Conexión establecida con éxito!"
echo "================================================================"

SQL_FILES="/DB/01_cultura.sql /DB/02_checks.sql /DB/03_sp.sql /DB/04_datos.sql /DB/05_exportar_listado_sp.sql"

for file in $SQL_FILES; do
    if [ -f "$file" ]; then
        echo "📜 Paso: Ejecutando script $(basename "$file")..."
        START_TIME=$(date +%s)
        
        mariadb -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" < "$file"
        
        END_TIME=$(date +%s)
        ELAPSED=$((END_TIME - START_TIME))
        echo "   ✅ ¡$(basename "$file") ejecutado con éxito en ${ELAPSED}s!"
        echo "----------------------------------------------------------------"
    else
        echo "⚠️ Omitiendo $(basename "$file") (archivo no encontrado)"
    fi
done

echo "================================================================"
echo "📊 VERIFICACIÓN DE TABLAS Y PROCEDIMIENTOS CREADOS"
echo "================================================================"
echo "📋 Tablas creadas en '${DB_NAME}':"
mariadb -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "SHOW TABLES;"
echo "----------------------------------------------------------------"
echo "⚙️ Cantidad de Procedimientos Almacenados:"
mariadb -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "SELECT COUNT(*) AS total_procedimientos FROM information_schema.routines WHERE routine_schema = '${DB_NAME}';"
echo "================================================================"
echo "🎉 ¡INICIALIZACIÓN DE LA BASE DE DATOS COMPLETADA CON ÉXITO!"
echo "================================================================"
