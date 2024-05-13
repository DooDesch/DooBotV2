'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20240513005843 extends Migration {

  async up() {
    this.addSql('create table `guild_settings` (`id` text not null, `created_at` datetime not null, `updated_at` datetime not null, `voice_channel_message_id` text not null default \'\', primary key (`id`));');
  }

}
exports.Migration20240513005843 = Migration20240513005843;
