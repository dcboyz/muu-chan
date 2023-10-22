import { Service, Inject } from 'typedi'
import { EmbedBuilder, SlashCommandBuilder, CacheType, ChatInputCommandInteraction } from 'discord.js'

import { createEmbed } from '../../common/discord'

import { MyAnimeListProvider } from '../../mal/MyAnimeListProvider'
import { IAuthenticationPrincipal } from '../../mal/IAuthenticationPrincipal'

import { OAuthRepository } from '../../oauth/OAuthRepository'

import { ICommand } from './ICommand'

@Service()
export class MyAnimeListSuggestionCommand implements ICommand {
  @Inject()
  private readonly oauthRepository: OAuthRepository

  @Inject()
  private readonly myAnimeListProvider: MyAnimeListProvider

  public createCommand() {
    let command = new SlashCommandBuilder()

    command = command.setName('myanimelist-suggestion')
    command = command.setDescription('Get an anime suggestion based in your MyAnimeList!')

    return command
  }

  public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    // Discord.js has a timeout of 3s so we defer the response and edit it later
    await interaction.deferReply()

    const userId = interaction.user.id

    const guildId = interaction.guildId as string

    const authPrincipal = await this.oauthRepository.getOAuth({ id: userId, partitionKey: guildId })

    const notAuthenticated = !authPrincipal || !authPrincipal.token || !authPrincipal.refreshToken

    if (notAuthenticated) {
      await interaction.editReply('You have not grant permissions to read your list. Please log in to MyAnimeList!')
      return
    }

    let token: string

    if (!this.isTokenExpired(authPrincipal)) {
      token = authPrincipal.token
    } else if (this.isPrincipalRefreshable(authPrincipal)) {
      const refreshedPrincipal = await this.myAnimeListProvider.refreshAuthenticationPrincipal(authPrincipal.refreshToken)

      token = refreshedPrincipal.token

      await this.oauthRepository.upsertOAuth({ id: userId, partitionKey: guildId }, refreshedPrincipal)
    } else {
      await interaction.editReply('Your authentication expired. Please log in again to MyAnimeList!')
      return
    }

    const suggestions = await this.myAnimeListProvider.getListBasedSuggestions(token)

    const embeds: EmbedBuilder[] = []

    for (const { node } of suggestions.data) {
      const title = node.title
      const link = `https://myanimelist.net/anime/${node.id}`
      const background = node.main_picture.large

      const description = `
      ${node.synopsis}

      **Rating**: ${node.mean}

      **Number of episodes**: ${node.num_episodes}
      `

      const embed = createEmbed({ title, link, description, backgroundUri: background })

      embeds.push(embed)

      const message = await interaction.editReply({ options: { fetchReply: true }, embeds })

      await message.react('🔜')
    }
  }

  private isTokenExpired(authenticationPrincipal: IAuthenticationPrincipal) {
    const now = new Date()

    const tokenExpired = new Date(authenticationPrincipal.tokenValidUntil) < now

    return tokenExpired
  }

  private isPrincipalRefreshable(authenticationPrincipal: IAuthenticationPrincipal) {
    const now = new Date()

    const refreshTokenExpired = new Date(authenticationPrincipal.refreshTokenValidUntil) < now

    return refreshTokenExpired
  }
}
