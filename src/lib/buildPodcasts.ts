import Parser from 'rss-parser'
import { EpisodeModel } from '../models'
import { PodcastModel } from '../models/Podcast'
import { TopicModel } from '../models/Topic'

const fs = require('fs')
const ner = require('ner-promise')
//@ts-ignore

export function registerPodcasts (podcasts) {
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
        podcast.topics.push(newTopic._id)
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
