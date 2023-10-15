export async function getWaifuImageOrGif(category: string) {
  const response = await fetch(`https://api.waifu.pics/sfw/${category}`);

  const { url } = await response.json();

  return url;
}
