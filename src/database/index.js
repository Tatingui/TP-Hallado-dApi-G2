import migrations from './migrations';
import CacheEntry from './models/CacheEntry';
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';

import Publication from './models/Publication';
import PublicationImage from './models/PublicationImage';
import Draft from './models/Draft';
import PendingOperation from './models/PendingOperation';
import RecentSearch from './models/RecentSearch';
import Claim from './models/Claim';
import Profile from './models/Profile';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  // Nombre del archivo SQLite
  dbName: 'hallado_local_db',
  // JSI desactivado: requiere configuración nativa adicional de WatermelonDB
  jsi: false,
  onSetUpError: (error) => {
    console.error('No se pudo inicializar la base local (WatermelonDB):', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    CacheEntry,
    Publication,
    PublicationImage,
    Draft,
    PendingOperation,
    RecentSearch,
    Claim,
    Profile,
  ],
});
