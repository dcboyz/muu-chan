import { Inject, Service } from 'typedi'
import { FastifyReply, FastifyRequest } from 'fastify'

import { MyAnimeListProvider } from '../mal/MyAnimeListProvider'

import { OAuthRepository } from '../oauth/OAuthRepository'
import { IOAuthKey } from '../oauth/IOAuthModel'

import { successOAuthResponseHTML } from './templates/SuccessOAuthResponseHTML'

import { IOAuthState } from './IOAuthState'

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

    const { user, guild }: IOAuthState = JSON.parse(state)

    const authKey: IOAuthKey = { user_id: user, guild_id: guild }

    const authRecord = await this.oauthRepository.getOAuth(authKey)

    const authPrincipal = await this.myAnimeListProvider.getAuthenticationPrincipal(code, authRecord!.oauth_verifier)

    await this.oauthRepository.upsertOAuth(authKey, {
      oauth_code: code,
      token: authPrincipal.token,
      refresh_token: authPrincipal.refreshToken,
      token_valid_until: authPrincipal.tokenValidUntil,
      refresh_token_valid_until: authPrincipal.refreshTokenValidUntil,
    })

    response.type('text/html').send(successOAuthResponseHTML)
  }
}
