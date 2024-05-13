import { Entity, EntityRepositoryType, PrimaryKey, Property } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/sqlite'

import { CustomBaseEntity } from './BaseEntity'

// ===========================================
// ================= Entity ==================
// ===========================================

@Entity({ customRepository: () => VoiceChannelMessageRepository })
export class VoiceChannelMessage extends CustomBaseEntity {

	[EntityRepositoryType]?: VoiceChannelMessageRepository

	@PrimaryKey({ autoincrement: false })
    id!: string

	@Property({ nullable: false, type: 'string' })
    guildId: string

	@Property({ nullable: false, type: 'string' })
    channelId: string

}

// ===========================================
// =========== Custom Repository =============
// ===========================================

export class VoiceChannelMessageRepository extends EntityRepository<VoiceChannelMessage> {

	async getVoiceChannelMessageByGuildId(guildId: string): Promise<VoiceChannelMessage | null> {
		return this.findOne({ guildId })
	}

}