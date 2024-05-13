'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20240513003000 extends Migration {

  async up() {
    this.addSql('create table `voice_channel_message` (`id` text not null, `created_at` datetime not null, `updated_at` datetime not null, `guild_id` text not null, `channel_id` text not null, primary key (`id`));');
  }

}
exports.Migration20240513003000 = Migration20240513003000;
