import { EpisodeModel } from '../models'
import { PodcastModel } from '../models/Podcast'
import { EntityModel } from '../models/Entity'
import slugify from 'slugify'
import fs from 'fs'
import path from 'path'
import { CategoryModel } from '../models/Category'
import chalk from 'chalk'
import unique from 'just-unique';

const mongoose = require('mongoose')
const {MONGO_DB} = require('dotenv').config('../../').parsed

mongoose.connect(MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

export async function registerPodcast (_podcast, totalNo, currentNo) {
  let podcast = await PodcastModel.findOne({slug: slugify(_podcast.title)})
  if(!podcast) {
    podcast = new PodcastModel({
      title: _podcast.title,
      publisher: _podcast.creator,
      rssFeed: _podcast.feedUrl,
      link: _podcast.link,
      image: _podcast?.image?.url ?? '',
      description: _podcast.description,
      categories: [],
      slug: slugify(_podcast.title),
      lastRssBuildDate: new Date(_podcast?.lastBuildDate?? new Date()),
      palettes: _podcast.palettes
    })
  }
    for (let _category of _podcast?.itunes?.categories ?? []) {
      let category = await CategoryModel.findOne({title: _category})
      if (!category) {
        category = new CategoryModel({
          title: _category,
          slug: slugify(_category),
          podcasts: [podcast._id]
        })
      } else {
        category.podcasts.push(podcast)
      }
      await category.save()
      podcast.categories.push(category)
    }
    const entities = []
    for (let [type, list] of Object.entries(_podcast.entities)){
      if(!Array.isArray(list)){
          list = []
           return
        } 
      list = unique(list)
      for (let name of list as []) {
        let entity = await EntityModel.findOne({type, name})
        if (entity){
          entity.podcasts.push(podcast.id)
          entity.name = name
          await entity.save()
        } else {
          entity = new EntityModel({
            type,
            name,
            podcasts: [podcast]
          })
          await entity.save()
        }
        entities.push(entity)
      }
    }
    podcast.entities = entities
    await podcast.save()

    const episodeList = []
    const epTotal = _podcast.items.length
    let epCurrent = 0
    for (let _episode of _podcast.items){
      epCurrent++
      let episode = await EpisodeModel.findOne({slug:`${podcast.slug}/${slugify(_episode.title ?? (_episode?.itunes?.season + '-' + _episode?.itunes?.episode) ?? _episode?.link)}`})
      if(!episode) {
        episode = new EpisodeModel({
          title: _episode.title,
          subtitle: _episode.contentSnippet,
          image: _episode?.itunes?.image,
          datePublished: new Date(_episode?.pubDate ?? new Date()),
          description: _episode.content,
          duration: _episode?.itunes?.length,
          sourceUrl: _episode?.enclosure?.url,
          snNo: _episode?.itunes?.season,
          epNo: _episode?.itunes?.episode,
          podcast: podcast._id,
          slug: `${podcast.slug}/${slugify(_episode?.title ?? (_episode?.itunes?.season + '-' + _episode?.itunes?.episode) ?? _episode?.link ?? '')}`,
        })
      }
      const entities = []
      for (let [type, list] of Object.entries(_episode.entities)){
        if(!Array.isArray(list)){
            list = []
            return
          } 
        list = unique(list)
        for (let name of list as []) {
          let entity = await EntityModel.findOne({type, name})
          if (entity){
            entity.episodes.push(episode.id)
            entity.name = name
            await entity.save()
          } else {
            entity = new EntityModel({
              type,
              name,
              episodes: [episode]
            })
            await entity.save()
          }
          entities.push(entity)
        }
      }
      episode.entities = entities

      episodeList.push(episode)
      await episode.save()

      console.log(`· ${chalk.hex('#D0CFCF')(((epCurrent/epTotal)*100).toFixed(2) + `%`)} - ${chalk.hex('#86BBD8')(episode.title)} saved. `)
    }
    podcast.episodes = episodeList
    await podcast.save()

    console.log(`${chalk.yellow.bold(podcast.title)} registered ${chalk.green('✔')}\n${chalk.hex('#DCC9B6')(((currentNo/totalNo)*100).toFixed(2) + `%`)}\n`)
}



(async ()=>{

  const podcastFolderPath = path.join(process.cwd(), `temp/entity-extraction-${process.argv[2]}/podcasts-with-entities`)
  const podcasts: string[] = fs.readdirSync(podcastFolderPath);

  const totalNo = podcasts.length
  let currentNo = 0
  try {
    for(const filename of podcasts.slice(0,1)) {
      currentNo++
      const podcastPath = path.join(podcastFolderPath, filename)
      const data = JSON.parse(fs.readFileSync(podcastPath, 'utf8'))
      await registerPodcast(data, totalNo, currentNo)
    }
  } catch (error) {
    console.log(`${chalk.red('An error occured')}: `, error.message)
  }
  mongoose.disconnect()
})();
