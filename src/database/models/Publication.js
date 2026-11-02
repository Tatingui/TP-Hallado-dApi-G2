import { Model } from '@nozbe/watermelondb';
import { field, text, date, children } from '@nozbe/watermelondb/decorators';

export default class Publication extends Model {
  static table = 'publications';
  @text('owner') owner;
  @text('snapshot_json') snapshotJson;

  static associations = {
    publication_images: { type: 'has_many', foreignKey: 'publication_id' },
  };

  @field('server_id') serverId;
  @text('title') title;
  @text('description') description;
  @text('type') type;
  @text('category') category;
  @text('barrio') barrio;
  @text('address') address;
  @field('latitude') latitude;
  @field('longitude') longitude;
  @date('event_date') eventDate;
  @text('status') status;
  @text('verification_question') verificationQuestion;
  @text('verification_answer') verificationAnswer;
  @field('publisher_id') publisherId;
  @text('publisher_name') publisherName;
  @text('publisher_phone') publisherPhone;
  @field('publisher_reputation') publisherReputation;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;
  @text('sync_status') syncStatus;

  @children('publication_images') images;
}
