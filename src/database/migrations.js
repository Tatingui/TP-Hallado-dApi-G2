import { schemaMigrations, addColumns, createTable, unsafeExecuteSql } from '@nozbe/watermelondb/Schema/migrations';

// Tablas del diseño inicial que nunca se usaron: borradores, búsquedas recientes y
// últimos resultados se guardan en cache_entries; reclamos y perfiles requieren conexión.
const UNUSED_TABLES = ['publication_images', 'drafts', 'recent_searches', 'claims', 'profiles'];
export default schemaMigrations({migrations:[{toVersion:2,steps:[
addColumns({table:'publications',columns:[{name:'owner',type:'string',isIndexed:true}]}),
addColumns({table:'publication_images',columns:[{name:'owner',type:'string',isIndexed:true}]}),
addColumns({table:'drafts',columns:[{name:'owner',type:'string',isIndexed:true}]}),
addColumns({table:'pending_operations',columns:[{name:'owner',type:'string',isIndexed:true}]}),
addColumns({table:'recent_searches',columns:[{name:'owner',type:'string',isIndexed:true}]}),
addColumns({table:'claims',columns:[{name:'owner',type:'string',isIndexed:true}]}),
addColumns({table:'profiles',columns:[{name:'owner',type:'string',isIndexed:true}]}),
...['publications','claims'].map(table=>addColumns({table,columns:[{name:'snapshot_json',type:'string'}]})),
addColumns({table:'pending_operations',columns:[{name:'publication_local_id',type:'string'},{name:'state',type:'string'},{name:'next_attempt_at',type:'number'}]}),
createTable({name:'cache_entries',columns:[{name:'owner',type:'string',isIndexed:true},{name:'cache_key',type:'string',isIndexed:true},{name:'value_json',type:'string'}]})
]},
{toVersion:3,steps:UNUSED_TABLES.map(table => unsafeExecuteSql(`DROP TABLE IF EXISTS ${table};`))},
]});
