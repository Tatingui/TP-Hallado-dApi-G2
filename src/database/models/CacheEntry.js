import { Model } from '@nozbe/watermelondb';
import { text } from '@nozbe/watermelondb/decorators';

export default class CacheEntry extends Model {
  static table = 'cache_entries';
  @text('owner') owner;
  @text('cache_key') cacheKey;
  @text('value_json') valueJson;
}
