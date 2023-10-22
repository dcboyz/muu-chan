import { Inject, Service } from 'typedi'
import { Interaction, SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js'

import { createEmbed } from '../../common/discord'
import { generateSafeToken } from '../../common/crypto'

import { MyAnimeListProvider } from '../../mal/MyAnimeListProvider'

import { IOAuthKey } from '../../oauth/IOAuthModel'
import { OAuthRepository } from '../../oauth/OAuthRepository'

import { WaifuProvider } from '../../waifu/WaifuProvider'

import { ICommand } from './ICommand'
import { IInteraction } from './IInteraction'

@Service()
export class MyAnimeListLoginCommand implements ICommand {
  @Inject()
  private readonly oauthRepository: OAuthRepository

  @Inject()
  private readonly myAnimeListProvider: MyAnimeListProvider

  @Inject()
  private readonly waifuProvider: WaifuProvider

  public createCommand() {
    let command = new SlashCommandBuilder()

    command = command.setName('myanimelist-login')
    command = command.setDescription('Grant permissions to read your list in MyAnimeList!')

    return command
  }

  public async execute(interaction: Interaction): Promise<void> {
    const actualInteraction = interaction as IInteraction

    // Discord.js has a timeout of 3s so we defer the response and edit it later
    await actualInteraction.deferReply()

    const userId = interaction.user.id

    const guildId = interaction.guildId as string

    const state = { user: userId, guild: guildId }

    const stateSerialized = JSON.stringify(state)

    const codeChallenge = generateSafeToken()

    const oauthKey: IOAuthKey = { user_id: userId, guild_id: guildId }

    await this.oauthRepository.upsertOAuth(oauthKey, { oauth_verifier: codeChallenge })

    const askForPermissionsUri = this.myAnimeListProvider.getAskForUserPermissionsUri(stateSerialized, codeChallenge)

    const title = 'Log into MyAnimeList!'

    const background = await this.waifuProvider.getRandomWaifuImageOrGifUri()

    const description = 'To access MyAnimeList! capabilities, you have to grant Muu-chan permissions to read your list'

    const embed = createEmbed({
      title: title,
      link: askForPermissionsUri,
      backgroundUri: background,
      description: description,
    })

    await actualInteraction.editReply({ embeds: [embed] })
  }
}
