import Parser from 'rss-parser'
import { feeds } from './feeds'
import { parseAndSave } from './functions'
const fs = require('fs')

const ner = require('ner-promise')

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
