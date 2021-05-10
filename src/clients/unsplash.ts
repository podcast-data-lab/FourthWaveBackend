import nodeFetch from 'node-fetch'
import { createApi } from 'unsplash-js'

// on your node server
export const unsplashClient = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
  //@ts-ignore
  fetch: nodeFetch
})
