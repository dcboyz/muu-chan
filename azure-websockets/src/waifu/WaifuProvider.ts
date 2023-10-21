import { Service } from "typedi";

import { chooseRandom } from "../common/arrays";

import { IWaifuProvider } from "./IWaifuProvider";

@Service("IWaifuProvider")
export class WaifuProvider implements IWaifuProvider {
  private static readonly baseUri = "https://api.waifu.pics/sfw/";

  private static readonly categories = [
    "waifu",
    "bully",
    "cuddle",
    "hug",
    "awoo",
    "pat",
    "smug",
    "bonk",
    "yeet",
    "blush",
    "smile",
    "wave",
    "nom",
    "glomp",
    "slap",
    "happy",
    "wink",
    "poke",
    "cringe",
  ];

  public async getRandomWaifuImageOrGifUri(): Promise<string> {
    const category = chooseRandom(WaifuProvider.categories);

    const response = await fetch(WaifuProvider.baseUri + category);

    const { url } = await response.json();

    return url;
  }
}
