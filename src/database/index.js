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
  // (optional) Database name
  dbName: 'hallado_local_db',
  // (optional) Enable JSI for faster queries in Development Build / Native
  jsi: false,
  onSetUpError: (error) => {
    console.error('Error setting up WatermelonDB SQLite adapter:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    Publication,
    PublicationImage,
    Draft,
    PendingOperation,
    RecentSearch,
    Claim,
    Profile,
  ],
});
