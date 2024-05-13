import { Entity, EntityRepositoryType, PrimaryKey, Property } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/sqlite'

import { CustomBaseEntity } from './BaseEntity'

@Entity({ customRepository: () => GuildSettingRepository })
export class GuildSetting extends CustomBaseEntity {

	[EntityRepositoryType]?: GuildSettingRepository

	@PrimaryKey({ autoincrement: false })
    id!: string

	@Property({ type: 'string' })
	setting!: string

	@Property({ type: 'string' })
	value!: string

}

export class GuildSettingRepository extends EntityRepository<GuildSetting> {

	async getGuildSettingByGuildId(setting: string, guildId: string): Promise<GuildSetting | null> {
		return this.findOne({ setting, id: guildId })
	}

	async updateGuildSettingByGuildId(setting: string, guildId: string, value: string): Promise<void> {
		const settingExists = await this.getGuildSettingByGuildId(setting, guildId)
		if (settingExists) {
			settingExists.value = value
			await this.persistAndFlush(settingExists)
		} else {
			const newSetting = new GuildSetting()
			newSetting.id = guildId
			newSetting.setting = setting
			newSetting.value = value
			await this.persistAndFlush(newSetting)
		}
	}

}