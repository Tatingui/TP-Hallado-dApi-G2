import { Model } from '@nozbe/watermelondb';
import { text, field, date } from '@nozbe/watermelondb/decorators';

export default class PendingOperation extends Model {
  static table = 'pending_operations';

  @text('idempotency_key') idempotencyKey;
  @text('operation_type') operationType;
  @text('payload_json') payloadJson;
  @field('retry_count') retryCount;
  @text('last_error') lastError;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;
}
