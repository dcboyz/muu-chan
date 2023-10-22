import { Inject, Service } from 'typedi'
import { FastifyReply, FastifyRequest } from 'fastify'

import { MyAnimeListProvider } from '../mal/MyAnimeListProvider'

import { OAuthRepository } from '../oauth/OAuthRepository'
import { IOAuthKey } from '../oauth/IOAuthModel'

import { successOAuthResponseHTML } from './templates/SuccessOAuthResponseHTML'

import { IMyAnimeListOAuthState } from './IMyAnimeListOAuthState'

@Service()
export class MyAnimeListRequestHandler {
  @Inject()
  public readonly myAnimeListProvider: MyAnimeListProvider

  @Inject()
  public readonly oauthRepository: OAuthRepository

  handleOAuthCallback = async (request: FastifyRequest, response: FastifyReply) => {
    const query = request.query as { [key: string]: string }

    const code = query['code']
    const state = query['state']

    const { user, guild }: IMyAnimeListOAuthState = JSON.parse(state)

    const authKey: IOAuthKey = { id: user, partitionKey: guild }

    const authRecord = await this.oauthRepository.getOAuth(authKey)

    const authPrincipal = await this.myAnimeListProvider.getAuthenticationPrincipal(code, authRecord!.oauthVerifier)

    await this.oauthRepository.upsertOAuth(authKey, {
      oauthCode: code,
      token: authPrincipal.token,
      refreshToken: authPrincipal.refreshToken,
      tokenValidUntil: authPrincipal.tokenValidUntil,
      refreshTokenValidUntil: authPrincipal.refreshTokenValidUntil,
    })

    response.type('text/html').send(successOAuthResponseHTML)
  }
}
