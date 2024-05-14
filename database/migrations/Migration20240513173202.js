'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const { Migration } = require('@mikro-orm/migrations')

class Migration20240513173202 extends Migration {

	async up() {
		this.addSql('create table `guild_setting` (`id` text not null, `created_at` datetime not null, `updated_at` datetime not null, `setting` text not null, `value` text not null, primary key (`id`));')

		this.addSql('drop table if exists `guild_settings`;')
	}

}
exports.Migration20240513173202 = Migration20240513173202
