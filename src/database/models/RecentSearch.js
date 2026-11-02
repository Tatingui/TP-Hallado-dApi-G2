import { Model } from '@nozbe/watermelondb';
import { text, date } from '@nozbe/watermelondb/decorators';

export default class RecentSearch extends Model {
  static table = 'recent_searches';
  @text('owner') owner;

  @text('type') type;
  @text('category') category;
  @text('query') query;
  @text('barrio') barrio;
  @text('date_filter') dateFilter;
  @date('timestamp') timestamp;
}
