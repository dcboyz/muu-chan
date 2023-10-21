interface ISuggestionOptions {
  limit: string
}

export interface IMyAnimeListOptions {
  oauthRedirectUri: string
  clientId: string
  clientSecret: string
  suggestions: ISuggestionOptions
}
