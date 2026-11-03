import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 3,
  tables: [
    tableSchema({name: 'cache_entries', columns: [
      {name:'owner',type:'string',isIndexed:true},
      {name:'cache_key',type:'string',isIndexed:true},
      {name:'value_json',type:'string'},
    ]}),
    tableSchema({
      name: 'publications',
      columns: [
        { name: 'snapshot_json', type: 'string' },
        { name: 'owner', type: 'string', isIndexed: true },
        { name: 'server_id', type: 'number', isOptional: true },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'type', type: 'string' }, // 'LOST' | 'FOUND'
        { name: 'category', type: 'string' },
        { name: 'barrio', type: 'string' },
        { name: 'address', type: 'string', isOptional: true },
        { name: 'latitude', type: 'number', isOptional: true },
        { name: 'longitude', type: 'number', isOptional: true },
        { name: 'event_date', type: 'number', isOptional: true },
        { name: 'status', type: 'string' }, // 'OPEN' | 'IN_CLAIM' | 'RESOLVED' | 'EXPIRED'
        { name: 'verification_question', type: 'string', isOptional: true },
        { name: 'verification_answer', type: 'string', isOptional: true },
        { name: 'publisher_id', type: 'number', isOptional: true },
        { name: 'publisher_name', type: 'string', isOptional: true },
        { name: 'publisher_phone', type: 'string', isOptional: true },
        { name: 'publisher_reputation', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'sync_status', type: 'string' }, // 'synced' | 'pending_create' | 'pending_update'
      ],
    }),



    tableSchema({
      name: 'pending_operations',
      columns: [
        { name: 'owner', type: 'string', isIndexed: true },
        { name: 'idempotency_key', type: 'string' },
        { name: 'operation_type', type: 'string' }, // 'CREATE_PUBLICATION' (los reclamos requieren conexión)
        { name: 'payload_json', type: 'string' },
        { name: 'publication_local_id', type: 'string' },
        { name: 'state', type: 'string' },
        { name: 'next_attempt_at', type: 'number' },
        { name: 'retry_count', type: 'number' },
        { name: 'last_error', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),



  ],
});
