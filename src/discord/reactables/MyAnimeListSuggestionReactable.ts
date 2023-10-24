import { Service, Inject } from 'typedi'
import { EmbedBuilder, MessageReaction, PartialMessageReaction } from 'discord.js'

import { createEmbed } from '../../common/discord'

import { MyAnimeListProvider } from '../../mal/MyAnimeListProvider'
import { IAuthenticationPrincipal } from '../../mal/IAuthenticationPrincipal'

import { OAuthRepository } from '../../oauth/OAuthRepository'

import { ReactableRepository } from '../../reactables/ReactableRepository'

@Service()
export class MyAnimeListSuggestionReactable {
  @Inject()
  private readonly oauthRepository: OAuthRepository

  @Inject()
  private readonly reactableRepository: ReactableRepository

  @Inject()
  private readonly myAnimeListProvider: MyAnimeListProvider

  // TODO: refactor this
  public async execute(reaction: MessageReaction | PartialMessageReaction, userId: string): Promise<void> {
    const message = reaction.message

    const guildId = message.guildId as string

    const authPrincipal = await this.oauthRepository.getOAuth({ id: userId, partitionKey: guildId })

    const notAuthenticated = !authPrincipal || !authPrincipal.token || !authPrincipal.refreshToken

    if (notAuthenticated) {
      await message.edit('You have not grant permissions to read your list. Please log in to MyAnimeList!')
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
      await message.edit('Your authentication expired. Please log in again to MyAnimeList!')
      return
    }

    const reactableKey = { id: message.interaction!.id, partitionKey: guildId }

    const reactable = await this.reactableRepository.getReactable(reactableKey)

    const { page }: { page: number } = JSON.parse(reactable!.metadata)

    const currentPage = page + 1

    const reactableRecord = { caller: userId, metadata: JSON.stringify({ page: currentPage }) }

    await this.reactableRepository.upsertReactable(reactableKey, reactableRecord)

    const suggestions = await this.myAnimeListProvider.getListBasedSuggestions(token, currentPage)

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

      await message.edit({ options: { fetchReply: true }, embeds })
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
