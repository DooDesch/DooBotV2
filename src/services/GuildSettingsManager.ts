import { EntityRepository } from '@mikro-orm/core'

import { Service } from '@/decorators'
import { GuildSetting as GuildSettingEntity, GuildSettingRepository } from '@/entities'

import { Database } from '.'

// ===========================================
// ================= Service =================
// ===========================================
@Service({
	keepInstanceAfterHmr: true,
})
export class GuildSettingsManager {

	private guildSettingsRepo: EntityRepository<GuildSettingEntity>

	constructor(
		private db: Database
	) {}

	/**
	 * Get a setting by guildId and setting name.
	 * @param setting
	 * @param guildId
	 */
	async getGuildSettingByGuildId(guildId: string, setting: GuildSettingType) {
		return await this.guildSettingsRepo.findOne({ setting, id: guildId })
	}

	/**
	 * Update a setting by guildId and setting name.
	 * @param setting
	 * @param guildId
	 * @param value
	 */
	async updateGuildSettingByGuildId(guildId: string, setting: GuildSettingType, value: string) {
		const settingExists = await this.getGuildSettingByGuildId(guildId, setting)
		if (settingExists) {
			settingExists.value = value
			await this.guildSettingsRepo.persistAndFlush(settingExists)
		} else {
			const newSetting = new GuildSettingEntity()
			newSetting.id = guildId
			newSetting.setting = setting
			newSetting.value = value
			await this.guildSettingsRepo.persistAndFlush(newSetting)
		}
	}

	/**
	 * Delete a setting by guildId and setting name.
	 */
	async deleteGuildSettingByGuildId(guildId: string, setting: GuildSettingType) {
		const settingExists = await this.getGuildSettingByGuildId(guildId, setting)
		if (settingExists) {
			await this.guildSettingsRepo.removeAndFlush(settingExists)
		}
	}

}