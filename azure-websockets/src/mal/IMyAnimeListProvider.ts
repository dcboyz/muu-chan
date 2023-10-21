import { IAuthenticationPrincipal } from "./IAuthenticationPrincipal";
import { ISuggestionResponse } from "./ISuggestionResponse";

interface IMyAnimeListProvider {
  getAuthenticationPrincipal(code: string, verifier: string): Promise<IAuthenticationPrincipal>;

  refreshAuthenticationPrincipal(refreshToken: string): Promise<IAuthenticationPrincipal>;

  getListBasedSuggestions(token: string): Promise<ISuggestionResponse>;
}
