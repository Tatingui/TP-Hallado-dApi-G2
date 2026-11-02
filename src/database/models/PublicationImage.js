import { Model } from '@nozbe/watermelondb';
import { text, date, relation } from '@nozbe/watermelondb/decorators';

export default class PublicationImage extends Model {
  static table = 'publication_images';
  @text('owner') owner;

  static associations = {
    publications: { type: 'belongs_to', key: 'publication_id' },
  };

  @text('publication_id') publicationId;
  @text('local_uri') localUri;
  @text('remote_url') remoteUrl;
  @text('upload_status') uploadStatus;
  @date('created_at') createdAt;

  @relation('publications', 'publication_id') publication;
}
