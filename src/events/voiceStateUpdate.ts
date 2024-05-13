import { Channel, channelMention, ChannelType, EmbedBuilder, EmbedField, EmbedFooterOptions, Guild, GuildMember, Role, TextChannel, User } from 'discord.js'
import { ArgsOf } from 'discordx'
import { GuildSettingsManager } from 'src/services/GuildSettingsManager'

import { Discord, Injectable, On } from '@/decorators'
import { VoiceChannelMessage } from '@/entities'
import { Database, Logger, Stats } from '@/services'

@Discord()
@Injectable()
export default class VoiceStateUpdateEvent {

	constructor(
		private stats: Stats,
		private logger: Logger,
		private db: Database,
		private guildSettingsManager: GuildSettingsManager
	) {}

	@On('voiceStateUpdate')
	async voiceStateUpdateHandler(
		[, newState]: ArgsOf<'voiceStateUpdate'>
	) {
		const member = newState.member
		const guild = newState.guild

		if (!member) return

		const embed = this.createVoiceChannelEmbed(guild)
		this.updateVoiceChannelActivityEmbed(guild, embed)

		this.stats.registerVoiceStateUpdate(member)
	}

	// Create an embed message that contains all users in their respective voice channels
	// This will be sent to a specific channel called "voice-activity"
	// The embed message will be updated every time a user joins, leaves or updates their voice state in any way in a voice channel
	private createVoiceChannelEmbed(guild: Guild): EmbedBuilder {
		const embed = new EmbedBuilder()
		const rolesChannel = guild.channels.cache.find(ch => ch.name === 'roles')
		embed.setTitle(':speaking_head: User in Voice-Channel')
		if (rolesChannel)
		    embed.setDescription(`${channelMention(rolesChannel.id)} <- hier findest du alle Rollen.\n\n_____`)
		embed.setColor('#0099ff')
		embed.setTimestamp()
		const footerOptions: EmbedFooterOptions = {
			text: 'Füge dir Rollen hinzu, um Zugriff auf die Channel zu bekommen',
		}
		embed.setFooter(footerOptions)

		// Get all users in voice channels
		// For each voice channel, add the users to the embed message
		const fields: EmbedField[] = []
		guild.channels.cache.forEach((channel: Channel) => {
			if (channel.type === ChannelType.GuildVoice) {
				if (channel.members.size === 0) return

				const channelCategoryName = channel.parent?.name || ''
				const users = channel.members.map(member => this.createUserInfoForEmbedField(member)).join('\n')

				fields.push({
					name: channelCategoryName,
					value: users,
					inline: true,
				})
			}
		})

		if (fields.length === 0) {
			fields.push({
				name: 'Niemand da :frowning:',
				value: this.createEmptyInfoForEmbedField(guild),
				inline: true,
			})
		}

		embed.addFields(fields)

		return embed
	}

	private createUserInfoForEmbedField(member: GuildMember): string {
		const emojis = [':mute:', ':video_camera:']

		const user = member.user
		const memberVoice = member.voice

		const userMention = this.nicknameMention(user)
		const deafenedOrMuted = memberVoice.deaf || memberVoice.mute ? emojis[0] : ''
		const streaming = memberVoice.streaming || memberVoice.selfVideo ? emojis[1] : ''

		return `${userMention} ${deafenedOrMuted} ${streaming}`
	}

	private createEmptyInfoForEmbedField(guild: Guild): string {
		let text = 'Ich werd immer so melancholisch wenn niemand da ist :frowning:'

		try {
			const randomUser = guild.members.cache.filter(
				(member: GuildMember) =>
					!member?.user?.bot
					&& member.presence
					&& member.presence.status !== 'offline'
					&& member.roles.cache.size > 0
			).random()

			if (randomUser) {
				const randomUserRole = randomUser.roles.cache.filter(
					(role: Role) => role.name !== '@everyone'
				).random()

				if (randomUserRole) {
					text = `Frag doch mal ${this.nicknameMention(randomUser.user)}, ob er/sie Lust hat \`${randomUserRole.name}\` zu zocken.`
				}
			}
		} catch (error: any) {
			this.logger.log(error, 'error')
		}

		return text
	}

	private nicknameMention(user: User): string {
		return `<@${user.id}>`
	}

	private async updateVoiceChannelActivityEmbed(guild: Guild, embed: EmbedBuilder) {
		let voiceChannelMessage = await this.db.get(VoiceChannelMessage).getVoiceChannelMessageByGuildId(guild.id)

		if (voiceChannelMessage !== null) {
			const channel = guild.channels.cache.get(voiceChannelMessage.channelId) as TextChannel
			if (!channel) return

			const messages = await channel.messages.fetch()
			const message = messages.get(voiceChannelMessage.id)

			if (message) {
				message.edit({ embeds: [embed] })

				return
			} else {
				this.logger.log('VoiceChannelMessage not found, removing from database', 'warn')
				await this.db.get(VoiceChannelMessage).removeAndFlush(voiceChannelMessage)
			}
		}

		const guildSettings = await this.guildSettingsManager.getGuildSettingByGuildId(guild.id, 'voiceChannelMessageChannelId')
		let channel: TextChannel | null
                = guildSettings?.value ? guild.channels.cache.get(guildSettings.value) as TextChannel : null

		if (!channel) {
			channel = guild.channels.cache.find(ch => ch.name === 'wer-wo-was') as TextChannel

			if (!channel) return
		}

		const message = await channel.send({ embeds: [embed] })

		voiceChannelMessage = new VoiceChannelMessage()
		voiceChannelMessage.id = message.id
		voiceChannelMessage.guildId = guild.id
		voiceChannelMessage.channelId = channel.id

		await this.db.get(VoiceChannelMessage).persistAndFlush(voiceChannelMessage)
	}

}