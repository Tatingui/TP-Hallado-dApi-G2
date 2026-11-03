import { NativeModules } from 'react-native';
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import schema from './schema';
import migrations from './migrations';

import CacheEntry from './models/CacheEntry';
import Publication from './models/Publication';
import PendingOperation from './models/PendingOperation';

const isNativeBridgeAvailable = !!(
  NativeModules.WMDatabaseBridge ||
  NativeModules.DatabaseBridge ||
  NativeModules.WMDatabaseBridgeManager
);

let adapter;

if (isNativeBridgeAvailable) {
  adapter = new SQLiteAdapter({
    schema,
    migrations,
    dbName: 'hallado_local_db',
    jsi: false,
    onSetUpError: (error) => {
      console.warn('No se pudo inicializar SQLiteAdapter de WatermelonDB:', error);
    },
  });
} else {
  // Fallback para Expo Go cuando no se usa un Development Build compilado
  adapter = new LokiJSAdapter({
    schema,
    migrations,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
    onSetUpError: (error) => {
      console.warn('No se pudo inicializar LokiJSAdapter de WatermelonDB:', error);
    },
  });
}

export const database = new Database({
  adapter,
  modelClasses: [
    CacheEntry,
    Publication,
    PendingOperation,
  ],
});
