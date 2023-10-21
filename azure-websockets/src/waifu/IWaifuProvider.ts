export interface IWaifuProvider {
  getRandomWaifuImageOrGifUri(): Promise<string>;
}
