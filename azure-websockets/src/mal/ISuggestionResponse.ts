export interface ISuggestionResponse {
  data: ISuggestion[]

  paging: { next: string }
}

interface ISuggestion {
  node: Anime
}

interface Anime {
  id: number
  title: string
  main_picture: MainPicture
  synopsis: string
  mean: number
  num_episodes: number
}

interface MainPicture {
  medium: string
  large: string
}
