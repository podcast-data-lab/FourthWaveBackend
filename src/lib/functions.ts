import Parser from 'rss-parser'
import { Episode } from '../models/Episode'
import { Podcast, PodcastModel } from '../models/Podcast'
const imageToBase64 = require('image-to-base64')
const image2colors = require('image2colors')
const rgbHex = require('rgb-hex')
import mongoose from 'mongoose'
import { ObjectId } from 'mongodb'
import { Ref } from '@typegoose/typegoose'
import { EpisodeModel } from '../models'
export const getImagePalettes = async podcast => {
  console.log(`coloring:  ${podcast.title}...`)

  const imageBase64 = await imageToBase64(podcast.image)
  // console.log(imageBase64)
  const stuff = image2colors(
    {
      image: `data:image/jpg;base64, ${imageBase64}`,
      colors: 5,
      sample: 1024,
      scaleSvg: false
    },
    (err, colors) => {
      if (err) {
        console.log(err.message)
      }
      if (!!colors) {
        const palettes = colors.map(color => {
          return rgbHex(...color.color._rgb)
        })
        podcast.palette = palettes
        podcast.setPalette(palettes)
        console.log(`set palettes for ${podcast.title}`)
      }
    }
  )
}

var slug = require('slug')
export const parseAndSave = async (
  feed: { [key: string]: any } & Parser.Output<{ [key: string]: any }>,
  rss: string
) => {
  let imageBase64
  try {
    imageBase64 = await imageToBase64(feed.itunes.image)
    console.log('processed to base 64')
  } catch (error) {
    console.log(error.message)
    imageBase64 = ''
  }

  const podcast = new PodcastModel({
    title: feed.title,
    publisher: feed.itunes?.owner?.name,
    rssFeed: rss,
    link: rss,
    image: feed.itunes?.image,
    base64image: imageBase64,
    description: feed.description,
    categories: feed.itunes?.categories,
    slug: `${slug(feed?.itunes?.owner?.name + '-' + feed?.title)}`,
    lastRssBuildDate: Date.now()
  })
  const episodeList = []
  feed.items.forEach(async item => {
    let episode = new EpisodeModel({
      title: item.title,
      subtitle: item.itunes?.subtitle,
      image: feed.itunes?.image,
      datePublished: new Date(item?.pubDate),
      description: item.content,
      duration: item.itunes?.duration as number,
      sourceUrl: item.enclosure?.url,
      snNo: (item.itunes?.season as number) || -1,
      epNo: (item.itunes?.episode as number) || -1,
      podcast: podcast.slug,
      themes: [],
      slug: `${podcast.slug || ''}?episode=${new Date(item.pubDate)
        .toISOString()
        .substring(0, 10)}-${slug(item.title || '')}`
    })
    episodeList.push(episode._id)

    await episode.save()
    return episode
  })
  podcast.episodes = episodeList
  console.log(`Processed ${podcast.title}`)
  image2colors(
    {
      image: `data:image/jpg;base64, ${imageBase64}`,
      colors: 5,
      sample: 1024,
      scaleSvg: false
    },
    async (err, colors) => {
      if (err) {
        console.log(err.message)
      }
      if (!!colors) {
        const palettes = colors.map(color => {
          return rgbHex(...color.color._rgb)
        })
        podcast.palette = palettes
        podcast.setPalette(palettes)
        await podcast.save()

        console.log(`set palettes for ${podcast.title}`)
      }
    }
  )

  return podcast
}
