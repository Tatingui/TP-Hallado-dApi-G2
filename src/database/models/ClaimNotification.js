import { Model } from '@nozbe/watermelondb';
import { date, field, text } from '@nozbe/watermelondb/decorators';

export default class ClaimNotification extends Model {
  static table = 'claim_notifications';

  @text('owner') owner;
  @field('claim_id') claimId;
  @field('publication_id') publicationId;
  @text('type') type;
  @text('event_key') eventKey;
  @text('title') title;
  @text('message') message;
  @text('payload_json') payloadJson;
  @date('received_at') receivedAt;
  @date('read_at') readAt;
}
