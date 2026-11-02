import { Model } from '@nozbe/watermelondb';
import { text, field, date } from '@nozbe/watermelondb/decorators';

export default class Draft extends Model {
  static table = 'drafts';
  @text('owner') owner;

  @text('form_json') formJson;
  @field('current_step') currentStep;
  @date('updated_at') updatedAt;
}
