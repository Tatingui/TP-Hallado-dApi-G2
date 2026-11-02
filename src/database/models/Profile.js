import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

export default class Profile extends Model {
  static table = 'profiles';

  @field('server_id') serverId;
  @text('nombre') nombre;
  @text('email') email;
  @text('telefono') telefono;
  @field('telefono_visible') telefonoVisible;
  @text('barrio') barrio;
  @text('profile_image_url') profileImageUrl;
  @field('devoluciones_concretadas') devolucionesConcretadas;
  @field('valoraciones_positivas') valoracionesPositivas;
  @field('valoraciones_negativas') valoracionesNegativas;
  @date('updated_at') updatedAt;
}
