const mongoose = require("mongoose");

require("./db/db");
const Podcast = mongoose.model("Podcast");
const Episode = mongoose.model("Episode");
const Topic = mongoose.model("Topic");

// Loop through the podcast file and register the podcasts to the database

let podData = require("./podcasts.json");

podData.map((pod) => {
  /**
   * Check when the podcast rss feed was last updated
   * If the field is not provided, use the latest episode
   */
  try {
    let lastRssbuild;
    if (!pod.lastUpdate) {
      lastRssbuild = new Date(pod.episodes[0]["datePublished"]);
    } else {
      lastRssbuild = new Date(pod.lastUpdate);
    }
    const podcast = new Podcast({
      title: pod.title,
      publisher: pod.publisher,
      rssFeed: pod.rssFeed,
      link: pod.link,
      image: pod.image,
      palette: pod.palette || [],
      description: pod.description,
      shortDescription: pod.shortDescription,
      categories: pod.categories,
      lastRssBuildDate: lastRssbuild,
      slug: pod.slug,
      topics: [],
      episodes: [],
    });
    for (let type in pod.topics) {
      // console.log(type);
      pod.topics[type].map((topic) => {
        const newTopic = new Topic({
          type: type,
          name: topic,
        });
        podcast.topics.push(newTopic);
        newTopic.save();
      });
    }
    podcast
      .save()
      .then(console.log("saved podcast"))
      .catch((error) => console.log(`err in saving pod: ${error.message}`));
    pod["episodes"].map((ep) => {
      const thisEp = ep;
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
      });
      for (let type in ep.topics) {
        ep.topics[type].map((topic) => {
          const newTopic = new Topic({
            type: type,
            name: topic,
          });
          newEp.topics.push(newTopic);
          newTopic.save();
        });
      }
      newEp.save((err) => {
        if (err) console.log(err);
        else {
          podcast.episodes.push(newEp._id);
          console.log(`...saved: ${newEp.title}`);
        }
      });
    });
  } catch (error) {
    (podcast) => {
      console.log(podcast);
      console.log("pod updated");
    };
    console.log(error.message);
  }
});
