import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 2,
  tables: [
    tableSchema({name: 'cache_entries', columns: [
      {name:'owner',type:'string',isIndexed:true},
      {name:'cache_key',type:'string',isIndexed:true},
      {name:'value_json',type:'string'},
    ]}),
    tableSchema({
      name: 'publications',
      columns: [
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
      name: 'publication_images',
      columns: [
        { name: 'owner', type: 'string', isIndexed: true },
        { name: 'publication_id', type: 'string' },
        { name: 'local_uri', type: 'string', isOptional: true },
        { name: 'remote_url', type: 'string', isOptional: true },
        { name: 'upload_status', type: 'string' }, // 'pending' | 'uploaded' | 'failed'
        { name: 'created_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'drafts',
      columns: [
        { name: 'owner', type: 'string', isIndexed: true },
        { name: 'form_json', type: 'string' },
        { name: 'current_step', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'pending_operations',
      columns: [
        { name: 'owner', type: 'string', isIndexed: true },
        { name: 'idempotency_key', type: 'string' },
        { name: 'operation_type', type: 'string' }, // 'CREATE_PUBLICATION' | 'CREATE_CLAIM' | 'RESPOND_CLAIM'
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

    tableSchema({
      name: 'recent_searches',
      columns: [
        { name: 'owner', type: 'string', isIndexed: true },
        { name: 'type', type: 'string' },
        { name: 'category', type: 'string', isOptional: true },
        { name: 'query', type: 'string', isOptional: true },
        { name: 'barrio', type: 'string', isOptional: true },
        { name: 'date_filter', type: 'string', isOptional: true },
        { name: 'timestamp', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'claims',
      columns: [
        { name: 'owner', type: 'string', isIndexed: true },
        { name: 'server_id', type: 'number', isOptional: true },
        { name: 'publication_id', type: 'number' },
        { name: 'publication_title', type: 'string' },
        { name: 'publication_type', type: 'string' },
        { name: 'publication_barrio', type: 'string' },
        { name: 'claimant_name', type: 'string' },
        { name: 'claimant_phone', type: 'string', isOptional: true },
        { name: 'publisher_name', type: 'string' },
        { name: 'publisher_phone', type: 'string', isOptional: true },
        { name: 'exact_address', type: 'string', isOptional: true },
        { name: 'proof_message', type: 'string', isOptional: true },
        { name: 'proof_image_url', type: 'string', isOptional: true },
        { name: 'status', type: 'string' }, // 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
        { name: 'is_received', type: 'boolean' },
        { name: 'claim_date', type: 'number' },
        { name: 'sync_status', type: 'string' },
      ],
    }),

    tableSchema({
      name: 'profiles',
      columns: [
        { name: 'owner', type: 'string', isIndexed: true },
        { name: 'server_id', type: 'number' },
        { name: 'nombre', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'telefono', type: 'string', isOptional: true },
        { name: 'telefono_visible', type: 'boolean' },
        { name: 'barrio', type: 'string', isOptional: true },
        { name: 'profile_image_url', type: 'string', isOptional: true },
        { name: 'devoluciones_concretadas', type: 'number' },
        { name: 'valoraciones_positivas', type: 'number' },
        { name: 'valoraciones_negativas', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
