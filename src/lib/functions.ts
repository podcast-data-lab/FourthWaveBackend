import Parser from 'rss-parser'
import { PodcastModel } from '../models/Podcast'
import imageToBase64 from 'image-to-base64'
import { EpisodeModel } from '../models'
import slug from 'slugify'

export const parseAndSave = async (feed: { [key: string]: any } & Parser.Output<{ [key: string]: any }>, rss: string) => {
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
        lastRssBuildDate: Date.now(),
        palette: feed.palette,
    })
    const episodeList = []
    feed.items.forEach(async (item) => {
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
            slug: `${podcast.slug || ''}?episode=${new Date(item.pubDate).toISOString().substring(0, 10)}-${slug(
                item.title || '',
            )}`,
        })
        episodeList.push(episode._id)

        await episode.save()
        return episode
    })
    podcast.episodes = episodeList
    console.log(`Processed ${podcast.title}`)

    return podcast
}

export function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}
