"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPodcasts = exports.work = void 0;
const rss_parser_1 = __importDefault(require("rss-parser"));
const Episode_1 = require("../models/Episode");
const Podcast_1 = require("../models/Podcast");
const Topic_1 = require("../models/Topic");
const feeds_1 = require("./feeds");
const functions_1 = require("./functions");
const fs = require('fs');
const ner = require('ner-promise');
//@ts-ignore
const nerParser = new ner({
    install_path: '../stanford-ner-2018-10-16'
});
const findNamedEntities = async (text) => {
    return await nerParser.process(text);
};
const parser = new rss_parser_1.default();
/**
 * Generates a list of podcast json files from the rss feed
 * @param podcastList - a list of podcasts
 */
const parseRsstoJSON = (rssFeed) => {
    const feed$ = parser.parseURL(rssFeed);
    return feed$;
};
const generatedPodcasts = (podcast_list) => {
    podcast_list.forEach(async (rss) => {
        try {
            const feed = await parser.parseURL(rss);
            // console.log(feed)
            functions_1.parseAndSave(feed, rss);
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
        }
        catch (error) {
            console.log(`error processing: ${rss}. Error: ${error.message}`);
        }
    });
};
function work() {
    generatedPodcasts(feeds_1.feeds);
}
exports.work = work;
function registerPodcasts(podcasts) {
    console.log(podcasts);
    podcasts.forEach(pod => {
        const podcast = new Podcast_1.PodcastModel({
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
        });
        const topicsList = [];
        pod.topics.map(topic => {
            topic.map(name => {
                const newTopic = new Topic_1.TopicModel({
                    type: topic,
                    name: name
                });
                newTopic.save();
                podcast.topics.push(newTopic);
            });
        });
        const episodeList = [];
        pod.episodes.forEach(async (item) => {
            let episode = new Episode_1.EpisodeModel({
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
            });
            episodeList.push(episode._id);
            item.topics.map(topic => {
                topic.map(name => {
                    const newTopic = new Topic_1.TopicModel({
                        type: topic,
                        name: name
                    });
                    newTopic.save();
                    episode.topics.push(newTopic);
                });
            });
            console.log(`...saved ${episode.title}`);
            await episode.save();
            return episode;
        });
        podcast.episodes = episodeList;
        console.log(`${podcast.title} saved.`);
        podcast.save();
    });
}
exports.registerPodcasts = registerPodcasts;
