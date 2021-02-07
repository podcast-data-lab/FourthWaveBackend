const mongoose = require("mongoose");
const slug = require("slug");

require("./lib/db");
const Podcast = mongoose.model("Podcast");
const Episode = mongoose.model("Episode");

const dbFuncs = {
  addPod: function (pod, feedUrl) {
    console.log(pod);
    try {
      Podcast.insertMany(
        new Podcast({
          title: pod.title,
          publisher: pod["itunes"]["owner"]["name"],
          link: pod.link,
          rssFeed: feedUrl,
          image: pod["itunes"]["image"],
          description: pod["description"],
          shortDescription: pod["itunes"]["subtitle"],
          categories: pod["itunes"]["categories"],
          slug: `${slug(pod["itunes"]["owner"]["name"] + "-" + pod.title)}`,
          lastUpdate: pod["lastBuildDate"],
        })
      ).then(console.log("saved new podcast"));
      const addEpisodes = Promise.all(
        pod["items"].map(async (ep) => {
          let newEp = new Episode({
            title: ep["title"],
            subtitle: ep["itunes"]["subtitle"],
            image: pod["itunes"]["image"],
            datePublished: ep["pubDate"],
            description: ep["content"],
            duration: ep["itunes"]["duration"],
            sourceUrl: ep["enclosure"]["url"],
            snNo: ep["itunes"]["season"],
            epNo: ep["itunes"]["episode"],
            podcast: slug(pod.title),
            slug: `${slug(
              pod["itunes"]["owner"]["name"] + "-" + pod.title
            )}?episode=${new Date(ep["pubDate"])
              .toISOString()
              .substring(0, 10)}-${slug(ep["title"])}`,
          });
          newEp.save((err) => {
            if (err) console.log(err);
            else {
              Podcast.updateOne(
                {
                  slug: slug(pod["itunes"]["owner"]["name"] + "-" + pod.title),
                },
                {
                  $push: {
                    episodes: newEp._id,
                  },
                }
              )
                .then(console.log("saved ep..."))
                .then(() => {
                  return {
                    saved: true,
                    slug: slug(
                      pod["itunes"]["owner"]["name"] + "-" + pod.title
                    ),
                  };
                });
            }
          });
        })
      );
      addEpisodes.then((result) => {
        console.log("here");
      });
      return { slug: slug(pod["itunes"]["owner"]["name"] + "-" + pod.title) };
    } catch (error) {
      console.log("unable to save your podcast");
      console.log(error);
      return { saved: false };
    }
  },
};
module.exports = dbFuncs;
