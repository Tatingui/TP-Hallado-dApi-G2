/**
 * Se ejecuta automáticamente después de cada `npm install` / `npm ci`.
 *
 * Corrige @nozbe/watermelondb 0.28 para que compile con Android Gradle Plugin 9
 * (el que trae Expo 58). Desde AGP 9 las librerías no generan la clase
 * BuildConfig salvo que lo pidan explícitamente, y el código Java de
 * WatermelonDB usa BuildConfig.DEBUG. Sin este ajuste la build falla con
 * "cannot find symbol: variable BuildConfig".
 *
 * Es idempotente: si el ajuste ya está aplicado no hace nada.
 */
const fs = require('fs');
const path = require('path');

const MARCA = 'buildConfig true';

function rutaBuildGradleWatermelon() {
  try {
    const paquete = require.resolve('@nozbe/watermelondb/package.json');
    return path.join(path.dirname(paquete), 'native', 'android', 'build.gradle');
  } catch {
    return null;
  }
}

function habilitarBuildConfig(archivo) {
  const contenido = fs.readFileSync(archivo, 'utf8');
  if (contenido.includes(MARCA)) {
    console.log('[postinstall] WatermelonDB: BuildConfig ya habilitado.');
    return;
  }

  const eol = contenido.includes('\r\n') ? '\r\n' : '\n';
  const namespace = /^([ \t]*)namespace[ \t]+"com\.nozbe\.watermelondb".*$/m;
  if (!namespace.test(contenido)) {
    console.warn(
      '[postinstall] AVISO: no se encontró dónde habilitar BuildConfig en WatermelonDB. ' +
      'Si la build de Android falla con "cannot find symbol BuildConfig", revisar scripts/postinstall.js.'
    );
    return;
  }

  const bloque = (indent) =>
    `${eol}${eol}${indent}buildFeatures {${eol}${indent}    ${MARCA}${eol}${indent}}`;
  const corregido = contenido.replace(namespace, (linea, indent) => linea + bloque(indent));
  fs.writeFileSync(archivo, corregido);
  console.log('[postinstall] WatermelonDB: BuildConfig habilitado para AGP 9.');
}

const archivo = rutaBuildGradleWatermelon();
if (archivo && fs.existsSync(archivo)) {
  habilitarBuildConfig(archivo);
} else {
  console.warn('[postinstall] WatermelonDB no está instalado; no se aplicó ningún ajuste.');
}
