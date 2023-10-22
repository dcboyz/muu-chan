import { Service, Inject } from 'typedi'
import { SlashCommandSubcommandBuilder, Interaction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'

import { createEmbed } from '../../common/discord'

import { MyAnimeListProvider } from '../../mal/MyAnimeListProvider'
import { IAuthenticationPrincipal } from '../../mal/IAuthenticationPrincipal'

import { OAuthRepository } from '../../oauth/OAuthRepository'

import { ICommand } from './ICommand'
import { IInteraction } from './IInteraction'

@Service()
export class MyAnimeListSuggestionCommand implements ICommand {
  @Inject()
  private readonly oauthRepository: OAuthRepository

  @Inject()
  private readonly myAnimeListProvider: MyAnimeListProvider

  public createCommand() {
    let command = new SlashCommandBuilder()

    command = command.setName('myanimelist-suggestion')
    command = command.setDescription('Grant permissions to read your list in MyAnimeList!')

    return command
  }

  public async execute(interaction: Interaction): Promise<void> {
    const actualInteraction = interaction as IInteraction

    // Discord.js has a timeout of 3s so we defer the response and edit it later
    await actualInteraction.deferReply()

    const userId = interaction.user.id

    const guildId = interaction.guildId as string

    const authPrincipal = await this.oauthRepository.getOAuth({ user_id: userId, guild_id: guildId })

    const notAuthenticated = !authPrincipal || !authPrincipal.token || !authPrincipal.refresh_token

    if (notAuthenticated) {
      await actualInteraction.editReply(
        'You have not grant permissions to read your list. Please log in again to MyAnimeList!',
      )
      return
    }

    const now = new Date()

    const tokenExpired = new Date(authPrincipal.token_valid_until) < now

    let refreshedPrincipal: IAuthenticationPrincipal | undefined
    if (tokenExpired) {
      const refreshTokenExpired = new Date(authPrincipal.refresh_token_valid_until) < now

      if (refreshTokenExpired) {
        await actualInteraction.editReply('Your authentication expired. Please log in again to MyAnimeList!')
        return
      }

      refreshedPrincipal = await this.myAnimeListProvider.refreshAuthenticationPrincipal(authPrincipal.refresh_token)
    }

    const token = refreshedPrincipal ? refreshedPrincipal.token : authPrincipal.token

    const suggestions = await this.myAnimeListProvider.getListBasedSuggestions(token)

    const embeds: EmbedBuilder[] = []

    for (const { node } of suggestions.data) {
      const title = node.title
      const description = `Muu-chan thinks that you'd like ${node.title} based on your list!`
      const link = `https://myanimelist.net/anime/${node.id}`
      const background = node.main_picture.large

      const embed = createEmbed({ title, link, description, backgroundUri: background })

      embeds.push(embed)

      await actualInteraction.editReply({ embeds })
    }
  }
}
