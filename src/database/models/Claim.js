import { Model } from '@nozbe/watermelondb';
import { field, text, field as numField, field as boolField, date } from '@nozbe/watermelondb/decorators';

export default class Claim extends Model {
  static table = 'claims';

  @field('server_id') serverId;
  @field('publication_id') publicationId;
  @text('publication_title') publicationTitle;
  @text('publication_type') publicationType;
  @text('publication_barrio') publicationBarrio;
  @text('claimant_name') claimantName;
  @text('claimant_phone') claimantPhone;
  @text('publisher_name') publisherName;
  @text('publisher_phone') publisherPhone;
  @text('exact_address') exactAddress;
  @text('proof_message') proofMessage;
  @text('proof_image_url') proofImageUrl;
  @text('status') status;
  @field('is_received') isReceived;
  @date('claim_date') claimDate;
  @text('sync_status') syncStatus;
}
