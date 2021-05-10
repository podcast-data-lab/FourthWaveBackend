import { unsplashClient } from '../clients/unsplash'

export const getCoverPhoto = async (query: string) => {
  return await unsplashClient.search.getPhotos({
    query: query,
    page: 1,
    perPage: 10
  })
}
