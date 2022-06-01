import { createApi } from 'unsplash-js'
import * as nodeFetch from 'node-fetch'
import { UnsplashPhoto } from '../models/UnsplashPhoto'

declare global {
    var fetch: typeof nodeFetch.default
    type RequestInit = nodeFetch.RequestInit
    type Response = nodeFetch.Response
}
global.fetch = nodeFetch.default

export const unsplashClient = createApi({
    accessKey: process.env.UNSPLASH_ACCESS_KEY,
    fetch: nodeFetch.default,
})

export function searchForPhoto(query: string): Promise<UnsplashPhoto[]> {
    return unsplashClient.search
        .getPhotos({
            query,
            orientation: 'landscape',
            perPage: 16,
        })
        .then((res) => {
            console.log(JSON.stringify(res.response.results[0]))
            return res.response.results as unknown as UnsplashPhoto[]
        })
        .catch((err) => {
            console.log(err)
            return Promise.resolve([])
        })
}
