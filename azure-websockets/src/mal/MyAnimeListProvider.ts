import { escape } from "querystring";
import { Inject, Service } from "typedi";

import { IOptionsMonitor } from "../configuration/IOptionsMonitor";

import { IMyAnimeListOptions } from "./IMyAnimeListOptions";
import { IAuthenticationPrincipal } from "./IAuthenticationPrincipal";
import { ITokenPrincipal } from "./ITokenPrincipal";
import { ISuggestionResponse } from "./ISuggestionResponse";

@Service("IMyAnimeListProvider")
export class MyAnimeListProvider {
  private static readonly v1BaseUri = "https://myanimelist.net/v1";
  private static readonly v2BaseUri = "https://myanimelist.net/v2";
  private static readonly tokenBaseUri = MyAnimeListProvider.v1BaseUri + "/oauth2/token";
  private static readonly suggestionsBaseUri = MyAnimeListProvider.v2BaseUri + "/anime/suggestions";

  @Inject("IOptionsMonitor<IMyAnimeListOptions>")
  private readonly optionsMonitor: IOptionsMonitor<IMyAnimeListOptions>;

  public getAskForUserPermissionsUri(state: string, codeChallenge: string) {
    const options = this.optionsMonitor.currentValue();

    const escapedState = escape(state);

    const redirectUri = escape(options.oauthRedirectUri);

    const oauthUri = `${MyAnimeListProvider.v1BaseUri}/oauth2/authorize?response_type=code&client_id=${options.clientId}&code_challenge=${codeChallenge}&redirect_uri=${redirectUri}&state=${escapedState}`;

    return oauthUri;
  }

  public async getAuthenticationPrincipal(code: string, verifier: string) {
    const options = this.optionsMonitor.currentValue();

    const body = new URLSearchParams({
      client_id: options.clientId,
      client_secret: options.clientSecret,
      redirect_uri: options.oauthRedirectUri,
      code: code,
      code_verifier: verifier,
      grant_type: "authorization_code",
    });

    const headers = { "Content-Type": "application/x-www-form-urlencoded" };

    const requestOptions = { method: "POST", headers: headers, body: body };

    const response = await fetch(MyAnimeListProvider.tokenBaseUri, requestOptions);

    const tokenPrincipal: ITokenPrincipal = await response.json();

    const { tokenValidUntil, refreshTokenValidUntil } = MyAnimeListProvider.calculateTokenValidity(
      tokenPrincipal.expires_in
    );

    const authenticationPrincipal: IAuthenticationPrincipal = {
      token: tokenPrincipal.access_token,
      refreshToken: tokenPrincipal.refresh_token,
      tokenValidUntil: tokenValidUntil,
      refreshTokenValidUntil: refreshTokenValidUntil,
    };

    return authenticationPrincipal;
  }

  public async refreshAuthenticationPrincipal(refreshToken: string) {
    const options = this.optionsMonitor.currentValue();

    const body = new URLSearchParams({
      client_id: options.clientId,
      client_secret: options.clientSecret,
      redirect_uri: options.oauthRedirectUri,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const headers = { "Content-Type": "application/x-www-form-urlencoded" };

    const requestOptions = { method: "POST", headers: headers, body: body };

    const response = await fetch(MyAnimeListProvider.tokenBaseUri, requestOptions);

    const tokenPrincipal: ITokenPrincipal = await response.json();

    const { tokenValidUntil, refreshTokenValidUntil } = MyAnimeListProvider.calculateTokenValidity(
      tokenPrincipal.expires_in
    );

    const authenticationPrincipal: IAuthenticationPrincipal = {
      token: tokenPrincipal.access_token,
      refreshToken: tokenPrincipal.refresh_token,
      tokenValidUntil: tokenValidUntil,
      refreshTokenValidUntil: refreshTokenValidUntil,
    };

    return authenticationPrincipal;
  }

  public async getListBasedSuggestions(token: string) {
    const options = this.optionsMonitor.currentValue();

    const uri = MyAnimeListProvider.suggestionsBaseUri + "?limit=" + options.suggestions.limit;

    const headers = { Authorization: `Bearer ${token}` };

    const requestOptions = { method: "GET", headers: headers };

    const response = await fetch(uri, requestOptions);

    const suggestions: ISuggestionResponse = await response.json();

    return suggestions;
  }

  private static calculateTokenValidity(expiresIn: number) {
    const now = new Date().getTime();

    // ExpiresIn is in seconds, now is in milliseconds
    const tokenValidUntil = now + expiresIn * 1000;

    // The refresh token is valid for 31 days.
    const refreshTokenValidUntil = now + 31 * 86400 * 1000;

    return { tokenValidUntil, refreshTokenValidUntil };
  }
}
