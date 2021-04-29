import Parser from 'rss-parser'
import { EpisodeModel } from '../models/Episode'
import { PodcastModel } from '../models/Podcast'
import { TopicModel } from '../models/Topic'
import { feeds } from './feeds'
import { parseAndSave } from './functions'

const fs = require('fs')
const ner = require('ner-promise')
//@ts-ignore

const nerParser = new ner({
  install_path: '../stanford-ner-2018-10-16'
})

const findNamedEntities = async (text: string) => {
  return await nerParser.process(text)
}
const parser = new Parser()

/**
 * Generates a list of podcast json files from the rss feed
 * @param podcastList - a list of podcasts
 */
const parseRsstoJSON = (rssFeed: string) => {
  const feed$ = parser.parseURL(rssFeed)
  return feed$
}

const generatedPodcasts = (podcast_list: string[]) => {
  podcast_list.forEach(async (rss: string) => {
    try {
      const feed = await parser.parseURL(rss)
      // console.log(feed)
      parseAndSave(feed, rss)
      // const topics = await findNamedEntities(podcast.description)
      // // console.log(topics)
      // let topicList = []
      // for (let topic in topics) {
      //   const newTopic = {
      //     type: topic,
      //     list: topics[topic]
      //   }
      //   topicList.push(newTopic)
      // }
      // podcast.topics = topicList
      // console.log(`Processed ${podcast.title}`)
    } catch (error) {
      console.log(`error processing: ${rss}. Error: ${error.message}`)
    }
  })
}

export function work () {
  generatedPodcasts(feeds)
}
export function registerPodcasts (podcasts) {
  console.log(podcasts)
  podcasts.forEach(pod => {
    const podcast = new PodcastModel({
      title: pod.title,
      publisher: pod.publisher,
      rssFeed: pod.rssFeed,
      link: pod.link,
      image: pod.image,
      description: pod.description,
      categories: pod.categories,
      slug: pod.slug,
      lastRssBuildDate: new Date(pod.lastUpdate),
      palettes: pod.palettes
    })
    const topicsList = []
    pod.topics.map(topic => {
      topic.map(name => {
        const newTopic = new TopicModel({
          type: topic,
          name: name
        })
        newTopic.save()
        podcast.topics.push(newTopic)
      })
    })

    const episodeList = []
    pod.episodes.forEach(async item => {
      let episode = new EpisodeModel({
        title: item.title,
        subtitle: item.subtitle,
        image: item.image,
        datePublished: item.datePublished,
        description: item.content,
        duration: item.duration,
        sourceUrl: item.sourceUrl,
        snNo: +item.snNo || 0,
        epNo: +item.epNo || 0,
        podcast: item.podcast,
        themes: [],
        slug: item.slug
      })
      episodeList.push(episode._id)

      item.topics.map(topic => {
        topic.map(name => {
          const newTopic = new TopicModel({
            type: topic,
            name: name
          })
          newTopic.save()
          episode.topics.push(newTopic)
        })
      })

      console.log(`...saved ${episode.title}`)
      await episode.save()
      return episode
    })
    podcast.episodes = episodeList
    console.log(`${podcast.title} saved.`)
    podcast.save()
  })
}
