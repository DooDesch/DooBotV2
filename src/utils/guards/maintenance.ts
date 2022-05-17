import { GuardFunction, SimpleCommandMessage } from 'discordx'
import { DatabaseStore } from '@core/stores'
import { ButtonInteraction, CommandInteraction, ContextMenuInteraction, SelectMenuInteraction } from 'discord.js'
import { getInteractionType, getUserFromInteraction } from '@utils/functions/interaction'

import config from '../../../config.json'

const isMaintenance = true

export const maintenance: GuardFunction<
    | CommandInteraction
    | ContextMenuInteraction
    | SelectMenuInteraction
    | ButtonInteraction
    | SimpleCommandMessage
> = async (rawArg, _, next) => {
    
    const arg = rawArg instanceof Array ? rawArg[0] : rawArg,
          user = getUserFromInteraction(arg)

    if (!(
        ['CommandInteraction', 'ContextMenuInteraction', 'SelectMenuInteraction', 'ButtonInteraction'].includes(getInteractionType(arg))
        && isMaintenance
        && user?.id
        && !config.devs.includes(user.id)
    )) {

        await next()
    }
}