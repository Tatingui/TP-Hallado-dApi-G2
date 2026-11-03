/**
 * Prepara el proyecto antes de compilar la app Android (`npm run android`).
 *
 * 1. Crea .env.local a partir de .env.example si todavía no existe.
 * 2. Ubica el Android SDK (ANDROID_HOME, ANDROID_SDK_ROOT o la ruta por defecto).
 * 3. Genera la carpeta android/ con `expo prebuild` si no existe.
 * 4. Escribe android/local.properties con la ruta del SDK y, en Windows,
 *    con una CMake 3.31 o superior (su ninja admite rutas de más de 260 caracteres).
 * 5. En Windows, avisa si las rutas largas no están habilitadas.
 *
 * Así nadie tiene que configurar variables de entorno ni editar archivos a mano.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const CARPETA_ANDROID = path.join(RAIZ, 'android');
const LOCAL_PROPERTIES = path.join(CARPETA_ANDROID, 'local.properties');
const ES_WINDOWS = process.platform === 'win32';
const CMAKE_MINIMA = [3, 31, 0];

function log(mensaje) {
  console.log(`[prepare-android] ${mensaje}`);
}

function abortar(mensaje) {
  console.error(`\n[prepare-android] ERROR: ${mensaje}\n`);
  process.exit(1);
}

function asegurarEnvLocal() {
  const envLocal = path.join(RAIZ, '.env.local');
  const ejemplo = path.join(RAIZ, '.env.example');
  if (!fs.existsSync(envLocal) && fs.existsSync(ejemplo)) {
    fs.copyFileSync(ejemplo, envLocal);
    log('.env.local creado a partir de .env.example (URL del emulador).');
  }
}

function ubicarSdk() {
  const candidatos = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    ES_WINDOWS && process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk'),
    process.platform === 'darwin' && path.join(os.homedir(), 'Library', 'Android', 'sdk'),
    process.platform === 'linux' && path.join(os.homedir(), 'Android', 'Sdk'),
  ].filter(Boolean);

  const sdk = candidatos.find((ruta) => fs.existsSync(path.join(ruta, 'platform-tools')));
  if (!sdk) {
    abortar(
      'No se encontró el Android SDK. Instalá Android Studio y, desde el SDK Manager, ' +
      'el Android SDK. Si lo instalaste en otra carpeta, definí la variable ANDROID_HOME.'
    );
  }
  return sdk;
}

function compararVersiones(a, b) {
  for (let i = 0; i < 3; i += 1) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) - (b[i] || 0);
  }
  return 0;
}

function ubicarCmake(sdk) {
  const carpeta = path.join(sdk, 'cmake');
  if (!fs.existsSync(carpeta)) return null;

  const versiones = fs.readdirSync(carpeta)
    .map((nombre) => ({ nombre, partes: nombre.split('.').map(Number) }))
    .filter(({ partes }) => partes.every(Number.isFinite))
    .sort((a, b) => compararVersiones(b.partes, a.partes));

  const elegida = versiones[0];
  if (!elegida || compararVersiones(elegida.partes, CMAKE_MINIMA) < 0) return null;
  return path.join(carpeta, elegida.nombre);
}

function rutasLargasHabilitadas() {
  const consulta = spawnSync(
    'reg',
    ['query', 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\FileSystem', '/v', 'LongPathsEnabled'],
    { encoding: 'utf8' }
  );
  return consulta.status === 0 && /0x1\b/.test(consulta.stdout);
}

function generarCarpetaAndroid() {
  if (fs.existsSync(path.join(CARPETA_ANDROID, 'app'))) return;
  log('Generando la carpeta android/ con expo prebuild...');
  const resultado = spawnSync('npx', ['expo', 'prebuild', '--platform', 'android', '--no-install'], {
    cwd: RAIZ,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, EXPO_NO_GIT_STATUS: '1' },
  });
  if (resultado.status !== 0) abortar('Falló expo prebuild. Revisá el mensaje anterior.');
}

function escaparPropiedad(ruta) {
  return ruta.replace(/\\/g, '\\\\').replace(/:/g, '\\:');
}

function escribirLocalProperties(propiedades) {
  const lineas = fs.existsSync(LOCAL_PROPERTIES)
    ? fs.readFileSync(LOCAL_PROPERTIES, 'utf8').split(/\r?\n/).filter(Boolean)
    : [];
  const claves = Object.keys(propiedades);
  const conservadas = lineas.filter((linea) => !claves.some((clave) => linea.startsWith(`${clave}=`)));
  const nuevas = claves.map((clave) => `${clave}=${escaparPropiedad(propiedades[clave])}`);
  fs.writeFileSync(LOCAL_PROPERTIES, [...conservadas, ...nuevas].join(os.EOL) + os.EOL);
}

function main() {
  asegurarEnvLocal();

  const sdk = ubicarSdk();
  log(`Android SDK: ${sdk}`);

  const propiedades = { 'sdk.dir': sdk };

  if (ES_WINDOWS) {
    if (!rutasLargasHabilitadas()) {
      abortar(
        'Windows no tiene habilitadas las rutas largas y la compilación nativa va a fallar ' +
        '("Filename longer than 260 characters"). Seguí el paso "Habilitar rutas largas" de docs/INSTALACION.md.'
      );
    }
    const cmake = ubicarCmake(sdk);
    if (!cmake) {
      abortar(
        'Falta CMake 3.31 o superior. En Android Studio: Settings > Languages & Frameworks > Android SDK > ' +
        'SDK Tools > tildar CMake > Apply.'
      );
    }
    propiedades['cmake.dir'] = cmake;
    log(`CMake: ${cmake}`);
  }

  generarCarpetaAndroid();
  escribirLocalProperties(propiedades);
  log('android/local.properties actualizado. Listo para compilar.');
}

main();
