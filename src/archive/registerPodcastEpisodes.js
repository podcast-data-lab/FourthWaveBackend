const mongoose = require('mongoose')
const slug = require('slug')
const { getFrequency, getReleaseDay } = require('./functions')
require('./db/db')
const Podcast = mongoose.model('Podcast')
const Episode = mongoose.model('Episode')
const Topic = mongoose.model('Topic')
const Category = mongoose.model('Category')

// Loop through the podcast file and register the podcasts to the database

let podData = require('./podcasts.json')
const categories = []
const topics = []
const results = Promise.all(
    podData.map(async (pod) => {
        /**
         * Check when the podcast rss feed was last updated
         * If the field is not provided, use the latest episode
         */
        try {
            let lastRssbuild
            if (!pod.lastUpdate) {
                lastRssbuild = new Date(pod.episodes[0]['datePublished'])
            } else {
                lastRssbuild = new Date(pod.lastUpdate)
            }
            console.log(pod.title)
            const podcast = new Podcast({
                title: pod.title,
                publisher: pod.publisher,
                rssFeed: pod.rssFeed,
                link: pod.link,
                image: pod.image,
                palette: pod.palette || [],
                description: pod.description,
                shortDescription: pod.shortDescription,
                lastRssBuildDate: lastRssbuild,
                slug: pod.slug,
                topics: [],
                episodes: [],
                lastEpisodeDate: pod['episodes'][0].datePublished,
                frequency: getFrequency(pod['episodes'].slice(0, 22)),
                releaseDay: getReleaseDay(pod['episodes'].slice(0, 22)),
            })
            if (!!pod.categories) {
                console.log(pod.categories)
                pod.categories.map(async (category) => {
                    const _slug = slug(category)
                    let currCategory
                    let indx = categories.findIndex((cat) => cat.slug == _slug)
                    if (indx >= 0) {
                        currCategory = categories[indx]
                        currCategory.podcasts.push(podcast._id)
                        categories[indx] = currCategory
                    } else {
                        currCategory = new Category({
                            title: category,
                            slug: _slug,
                        })
                        currCategory.podcasts.push(podcast._id)
                        categories.push(currCategory)
                    }

                    podcast.categories.push(currCategory)
                })
            } else {
                console.log(`no categories here`)
            }

            for (let type in pod.topics) {
                pod.topics[type].map(async (topic) => {
                    const _slug = slug(topic)
                    let currTopic
                    const indx = topics.findIndex((tpc) => tpc.slug == _slug)

                    if (indx < 0) {
                        currTopic = new Topic({
                            type: type,
                            name: topic,
                            slug: _slug,
                        })
                        currTopic.podcasts.push(podcast._id)
                        topics.push(currTopic)
                    } else {
                        currTopic = topics[indx]
                        currTopic.podcasts.push(podcast._id)
                        topics[indx] = currTopic
                    }

                    podcast.topics.push(currTopic._id)
                })
            }

            pod['episodes'].map(async (ep) => {
                const thisEp = ep
                let newEp = new Episode({
                    title: thisEp.title,
                    datePublished: thisEp.datePublished,
                    description: thisEp.description,
                    duration: thisEp.duration || 0,
                    sourceUrl: thisEp.sourceUrl,
                    slug: thisEp.slug,
                    image: thisEp.image,
                    podcast: pod.slug,
                    likes: [],
                    comments: [],
                    people: [],
                    locations: [],
                    topics: [],
                })
                for (let type in ep.topics) {
                    ep.topics[type].map(async (topic) => {
                        const _slug = slug(topic)
                        let currTopic
                        const indx = topics.findIndex((tpc) => tpc.slug == _slug)

                        if (indx < 0) {
                            currTopic = new Topic({
                                type: type,
                                name: topic,
                                slug: _slug,
                            })
                            currTopic.episodes.push(newEp._id)
                            topics.push(currTopic)
                        } else {
                            currTopic = topics[indx]
                            currTopic.episodes.push(newEp._id)
                            topics[indx] = currTopic
                        }

                        newEp.topics.push(currTopic._id)
                    })
                }

                await newEp.save()
                podcast.episodes.push(newEp._id)
            })
            return podcast
        } catch (error) {
            ;(podcast) => {
                console.log(podcast)
                console.log('pod updated')
            }
            console.log(error.message)
        }
    }),
)

results.then((podcasts) => {
    const save = Promise.all([
        ...podcasts.map((podcast) => {
            try {
                console.log(`saved ${podcast.title}`)
                return podcast.save()
            } catch (error) {
                console.log(error.message)
            }
        }),
        ...categories.map((category) => {
            console.log(`  --> saved ${category.title}`)
            category.save()
        }),
        ...topics.map((topic) => {
            console.log(`    ==>saved ${topic.name}`)
            return topic.save()
        }),
    ])
    save.then(() => console.log('DONE DONE DONE'))
})
