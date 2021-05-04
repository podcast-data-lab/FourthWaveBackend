"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAndSave = exports.getImagePalettes = void 0;
const Podcast_1 = require("../models/Podcast");
const imageToBase64 = require('image-to-base64');
const image2colors = require('image2colors');
const rgbHex = require('rgb-hex');
const models_1 = require("../models");
const getImagePalettes = async (podcast) => {
    console.log(`coloring:  ${podcast.title}...`);
    const imageBase64 = await imageToBase64(podcast.image);
    // console.log(imageBase64)
    const stuff = image2colors({
        image: `data:image/jpg;base64, ${imageBase64}`,
        colors: 5,
        sample: 1024,
        scaleSvg: false
    }, (err, colors) => {
        if (err) {
            console.log(err.message);
        }
        if (!!colors) {
            const palettes = colors.map(color => {
                return rgbHex(...color.color._rgb);
            });
            podcast.palette = palettes;
            podcast.setPalette(palettes);
            console.log(`set palettes for ${podcast.title}`);
        }
    });
};
exports.getImagePalettes = getImagePalettes;
var slug = require('slug');
const parseAndSave = async (feed, rss) => {
    var _a, _b, _c, _d, _e, _f;
    let imageBase64;
    try {
        imageBase64 = await imageToBase64(feed.itunes.image);
        console.log('processed to base 64');
    }
    catch (error) {
        console.log(error.message);
        imageBase64 = '';
    }
    const podcast = new Podcast_1.PodcastModel({
        title: feed.title,
        publisher: (_b = (_a = feed.itunes) === null || _a === void 0 ? void 0 : _a.owner) === null || _b === void 0 ? void 0 : _b.name,
        rssFeed: rss,
        link: rss,
        image: (_c = feed.itunes) === null || _c === void 0 ? void 0 : _c.image,
        base64image: imageBase64,
        description: feed.description,
        categories: (_d = feed.itunes) === null || _d === void 0 ? void 0 : _d.categories,
        slug: `${slug(((_f = (_e = feed === null || feed === void 0 ? void 0 : feed.itunes) === null || _e === void 0 ? void 0 : _e.owner) === null || _f === void 0 ? void 0 : _f.name) + '-' + (feed === null || feed === void 0 ? void 0 : feed.title))}`,
        lastRssBuildDate: Date.now()
    });
    const episodeList = [];
    feed.items.forEach(async (item) => {
        var _a, _b, _c, _d, _e, _f;
        let episode = new models_1.EpisodeModel({
            title: item.title,
            subtitle: (_a = item.itunes) === null || _a === void 0 ? void 0 : _a.subtitle,
            image: (_b = feed.itunes) === null || _b === void 0 ? void 0 : _b.image,
            datePublished: new Date(item === null || item === void 0 ? void 0 : item.pubDate),
            description: item.content,
            duration: (_c = item.itunes) === null || _c === void 0 ? void 0 : _c.duration,
            sourceUrl: (_d = item.enclosure) === null || _d === void 0 ? void 0 : _d.url,
            snNo: ((_e = item.itunes) === null || _e === void 0 ? void 0 : _e.season) || -1,
            epNo: ((_f = item.itunes) === null || _f === void 0 ? void 0 : _f.episode) || -1,
            podcast: podcast.slug,
            themes: [],
            slug: `${podcast.slug || ''}?episode=${new Date(item.pubDate)
                .toISOString()
                .substring(0, 10)}-${slug(item.title || '')}`
        });
        episodeList.push(episode._id);
        await episode.save();
        return episode;
    });
    podcast.episodes = episodeList;
    console.log(`Processed ${podcast.title}`);
    image2colors({
        image: `data:image/jpg;base64, ${imageBase64}`,
        colors: 5,
        sample: 1024,
        scaleSvg: false
    }, async (err, colors) => {
        if (err) {
            console.log(err.message);
        }
        if (!!colors) {
            const palettes = colors.map(color => {
                return rgbHex(...color.color._rgb);
            });
            podcast.palette = palettes;
            podcast.setPalette(palettes);
            await podcast.save();
            console.log(`set palettes for ${podcast.title}`);
        }
    });
    return podcast;
};
exports.parseAndSave = parseAndSave;
